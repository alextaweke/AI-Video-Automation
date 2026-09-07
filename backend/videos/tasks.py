import os
import shutil
import subprocess
from decimal import Decimal
from pathlib import Path

from celery import shared_task
from django.conf import settings

from .models import UserProfile, Video
from .captions import write_srt

from ai.llm import generate_script, regenerate_scene
from ai.elevenlabs import generate_voice
from ai.kie import create_video
from ai.thumbnails import generate_thumbnail as generate_thumbnail_image


def build_script(scenes):
    return "\n\n".join(scene.get("narration", "") for scene in scenes)


@shared_task
def generate_script_draft(video_id):
    video = None
    try:
        video = Video.objects.get(id=video_id)
        video.status = "script_generating"
        video.error_message = None
        video.save(update_fields=["status", "error_message"])

        result = generate_script(video.topic, video.template_settings, video.visual_style)
        scenes = result.get("scenes", [])
        if not scenes:
            raise RuntimeError("Gemini returned no scenes")

        for index, scene in enumerate(scenes):
            scene["scene_number"] = index + 1
            scene["status"] = "draft"
            scene["retry_count"] = 0

        video.script = build_script(scenes)
        video.scenes = scenes
        video.status = "script_ready"
        video.save(update_fields=["script", "scenes", "status"])
        return {"video_id": video.id, "scene_count": len(scenes), "status": "script_ready"}
    except Exception as error:
        if video:
            video.status = "failed"
            video.error_message = str(error)
            video.save(update_fields=["status", "error_message"])
        raise


@shared_task
def regenerate_video_scene(video_id, scene_number):
    video = None
    try:
        video = Video.objects.get(id=video_id)
        scenes = video.scenes or []
        scene = next((item for item in scenes if item.get("scene_number") == scene_number), None)
        if not scene:
            raise RuntimeError("Scene not found")
        scene["status"] = "regenerating"
        video.status = "script_generating"
        video.scenes = scenes
        video.save(update_fields=["scenes", "status"])

        replacement = regenerate_scene(video.topic, scene_number, video.template_settings, scene.get("narration", ""), scene.get("visual_prompt", ""), video.visual_style)
        scene.update({"narration": replacement.get("narration", scene.get("narration", "")), "visual_prompt": replacement.get("visual_prompt", scene.get("visual_prompt", "")), "status": "draft"})
        video.script = build_script(scenes)
        video.scenes = scenes
        video.status = "script_ready"
        video.save(update_fields=["script", "scenes", "status"])
    except Exception as error:
        if video:
            video.status = "script_ready"
            video.error_message = str(error)
            video.save(update_fields=["status", "error_message"])
        raise


@shared_task
def generate_video_pipeline(video_id):

    video = None

    try:
        video = Video.objects.get(id=video_id)

        # ==========================================
        # 1. Use the approved script and scenes
        # ==========================================

        scenes = video.scenes or []

        if not scenes:
            raise RuntimeError("Gemini returned no scenes")

        script = build_script(scenes)

        # ==========================================
        # 2. Generate voice
        # ==========================================

        video.status = "voice_generating"
        video.save(update_fields=["status"])

        audio, alignment = generate_voice(script, video.voice, video.voice_settings)

        audio_directory = Path(settings.MEDIA_ROOT) / "voices"
        audio_directory.mkdir(parents=True, exist_ok=True)
        audio_path = audio_directory / f"video_{video.id}.mp3"

        with open(audio_path, "wb") as file:
            file.write(audio)

        video.voice_url = f"/media/voices/video_{video.id}.mp3"
        if video.template_settings.get("captions", True):
            captions_path = Path(settings.MEDIA_ROOT) / "captions" / f"video_{video.id}.srt"
            write_srt(alignment, captions_path)
            video.captions_url = f"/media/captions/video_{video.id}.srt"

        video.save(update_fields=["voice_url", "captions_url"])

        # ==========================================
        # 3. Generate ALL KIE scenes
        # ==========================================

        video.status = "video_generating"
        video.save(update_fields=["status"])

        updated_scenes = []

        for index, scene in enumerate(scenes):

            print(f"Creating KIE task for scene " f"{index + 1}/{len(scenes)}")

            kie_result = create_video(
                prompt=scene["visual_prompt"],
                aspect_ratio=video.template_settings.get("aspect_ratio", "9:16"),
            )

            task_id = kie_result.get("data", {}).get("taskId")

            if not task_id:
                raise RuntimeError(
                    f"KIE did not return taskId "
                    f"for scene {index + 1}: "
                    f"{kie_result}"
                )

            updated_scene = {
                **scene,
                "scene_number": scene.get(
                    "scene_number",
                    index + 1,
                ),
                "kie_task_id": task_id,
                "status": "processing",
                "video_url": None,
                "retry_count": scene.get("retry_count", 0),
            }

            updated_scenes.append(updated_scene)

            print(f"Scene {index + 1} KIE task: " f"{task_id}")

        # ==========================================
        # 4. Save all KIE task IDs
        # ==========================================

        video.scenes = updated_scenes

        # Keep this temporarily for compatibility
        # with your existing database field.
        video.kie_task_id = updated_scenes[0]["kie_task_id"]

        video.save(
            update_fields=[
                "scenes",
                "kie_task_id",
            ]
        )

        print(f"Created {len(updated_scenes)} " f"KIE tasks for video {video.id}")

        return {
            "video_id": video.id,
            "scene_count": len(updated_scenes),
            "status": "video_generating",
        }

    except Exception as error:

        if video:
            video.status = "failed"
            video.error_message = str(error)

            video.save(
                update_fields=[
                    "status",
                    "error_message",
                ]
            )

        raise


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 2})
def retry_kie_scene(self, video_id, scene_number):
    video = Video.objects.get(id=video_id)
    scenes = video.scenes or []
    scene = next((item for item in scenes if item.get("scene_number") == scene_number), None)
    if not scene or scene.get("status") == "completed":
        return {"video_id": video_id, "scene_number": scene_number, "status": "skipped"}

    scene["status"] = "retrying"
    video.scenes = scenes
    video.status = "video_generating"
    video.save(update_fields=["scenes", "status"])

    kie_result = create_video(
        prompt=scene["visual_prompt"],
        aspect_ratio=video.template_settings.get("aspect_ratio", "9:16"),
    )
    task_id = kie_result.get("data", {}).get("taskId")
    if not task_id:
        raise RuntimeError(f"KIE did not return taskId for retried scene {scene_number}")

    scene["kie_task_id"] = task_id
    scene["status"] = "processing"
    scene.pop("error_message", None)
    video.scenes = scenes
    video.kie_task_id = next((item.get("kie_task_id") for item in scenes if item.get("kie_task_id")), None)
    video.save(update_fields=["scenes", "kie_task_id"])
    return {"video_id": video_id, "scene_number": scene_number, "status": "processing"}


@shared_task
def generate_thumbnail(video_id):
    try:
        video = Video.objects.get(id=video_id)
        if not video.video_url:
            return {"video_id": video_id, "status": "skipped"}
        video.thumbnail_url = generate_thumbnail_image(video)
        video.save(update_fields=["thumbnail_url"])
        return {"video_id": video.id, "thumbnail_url": video.thumbnail_url}
    except Exception as error:
        # A thumbnail is an enhancement, never a reason to invalidate a completed video.
        print(f"THUMBNAIL GENERATION FAILED: {error}")
        return {"video_id": video_id, "status": "failed", "error": str(error)}


def resolve_binary(binary):
    return shutil.which(binary) or (binary if Path(binary).exists() else None)


def find_music_track(style):
    if style == "None":
        return None
    name = style.lower().replace(" ", "_")
    for suffix in (".mp3", ".m4a", ".wav"):
        candidate = Path(settings.BACKGROUND_MUSIC_DIR) / f"{name}{suffix}"
        if candidate.exists():
            return candidate
    return None


def media_duration(path, ffprobe):
    if not ffprobe:
        return None
    result = subprocess.run(
        [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


@shared_task
def finalize_video(video_id):
    video = None
    try:
        video = Video.objects.get(id=video_id)
        scene_paths = []
        for scene in video.scenes or []:
            relative_path = (scene.get("video_url") or "").removeprefix("/media/")
            path = Path(settings.MEDIA_ROOT) / relative_path
            if not path.exists():
                raise RuntimeError(f"Completed scene {scene.get('scene_number')} is unavailable for final processing")
            scene_paths.append(path)
        if not scene_paths:
            raise RuntimeError("No completed scenes are available for final processing")

        ffmpeg = resolve_binary(settings.FFMPEG_BINARY)
        if not ffmpeg:
            raise RuntimeError("FFmpeg is required for final processing. Set FFMPEG_BINARY to its executable path.")

        output_directory = Path(settings.MEDIA_ROOT) / "videos"
        output_directory.mkdir(parents=True, exist_ok=True)
        work_directory = Path(settings.MEDIA_ROOT) / "processing" / f"video_{video.id}"
        work_directory.mkdir(parents=True, exist_ok=True)
        concat_file = work_directory / "scenes.txt"
        concat_file.write_text("\n".join(f"file '{path.as_posix().replace("'", "\\\\'")}'" for path in scene_paths), encoding="utf-8")

        voice_path = Path(settings.MEDIA_ROOT) / "voices" / f"video_{video.id}.mp3"
        output_path = output_directory / f"video_{video.id}.mp4"
        command = [ffmpeg, "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file), "-i", str(voice_path)]
        music_track = find_music_track(video.background_music)
        if music_track:
            command.extend(["-stream_loop", "-1", "-i", str(music_track)])

        audio_filter = "[1:a]loudnorm=I=-16:LRA=11:TP=-1.5[voice]"
        if music_track:
            duration = media_duration(voice_path, resolve_binary(settings.FFPROBE_BINARY))
            music_filter = "[2:a]volume=0.15,afade=t=in:st=0:d=0.8"
            if duration and duration > 1.6:
                music_filter += f",afade=t=out:st={duration - 0.8:.3f}:d=0.8,atrim=duration={duration:.3f}"
            audio_filter += f";{music_filter}[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[mixed]"
        else:
            audio_filter += ";[voice]anull[mixed]"
        command.extend(["-filter_complex", audio_filter, "-map", "0:v:0", "-map", "[mixed]", "-shortest"])
        captions_path = Path(settings.MEDIA_ROOT) / "captions" / f"video_{video.id}.srt"
        if video.template_settings.get("captions", True) and captions_path.exists():
            subtitle_path = captions_path.as_posix().replace(":", "\\:").replace("'", "\\'")
            command.extend(["-vf", f"subtitles='{subtitle_path}':force_style='FontName=Arial,FontSize=22,Bold=1,Alignment=2,MarginV=60'", "-c:v", "libx264"])
        else:
            command.extend(["-c:v", "libx264"])
        command.extend(["-c:a", "aac", "-movflags", "+faststart", str(output_path)])
        subprocess.run(command, check=True, capture_output=True, text=True)

        video.video_url = f"/media/videos/video_{video.id}.mp4"
        video.status = "completed"
        video.error_message = None
        video.save(update_fields=["video_url", "status", "error_message"])
        if video.user_id:
            profile, _ = UserProfile.objects.get_or_create(user=video.user)
            profile.minutes_generated += Decimal(len(video.scenes or []) * 5) / Decimal(60)
            profile.save(update_fields=["minutes_generated"])
        generate_thumbnail.delay(video.id)
        return {"video_id": video.id, "status": "completed"}
    except Exception as error:
        if video:
            video.status = "failed"
            video.error_message = str(error)
            video.save(update_fields=["status", "error_message"])
        raise
