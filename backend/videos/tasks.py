import os

from celery import shared_task

from .models import Video

from ai.llm import generate_script
from ai.elevenlabs import generate_voice
from ai.kie import create_video


@shared_task
def generate_video_pipeline(video_id):

    video = None

    try:
        video = Video.objects.get(id=video_id)

        # ==========================================
        # 1. Generate script + scenes
        # ==========================================

        video.status = "script_generating"
        video.save(update_fields=["status"])

        result = generate_script(video.topic)

        scenes = result.get("scenes", [])

        if not scenes:
            raise RuntimeError("Gemini returned no scenes")

        script = "\n\n".join(scene["narration"] for scene in scenes)

        video.script = script
        video.scenes = scenes
        video.status = "script_ready"

        video.save(
            update_fields=[
                "script",
                "scenes",
                "status",
            ]
        )

        # ==========================================
        # 2. Generate voice
        # ==========================================

        video.status = "voice_generating"
        video.save(update_fields=["status"])

        audio = generate_voice(script)

        os.makedirs("media/voices", exist_ok=True)

        audio_path = f"media/voices/video_{video.id}.mp3"

        with open(audio_path, "wb") as file:
            file.write(audio)

        video.voice_url = f"/media/voices/video_{video.id}.mp3"

        video.save(update_fields=["voice_url"])

        # ==========================================
        # 3. Generate ALL KIE scenes
        # ==========================================

        video.status = "video_generating"
        video.save(update_fields=["status"])

        updated_scenes = []

        for index, scene in enumerate(scenes):

            print(f"Creating KIE task for scene " f"{index + 1}/{len(scenes)}")

            kie_result = create_video(prompt=scene["visual_prompt"])

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
