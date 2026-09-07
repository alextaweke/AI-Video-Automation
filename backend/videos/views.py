import json
import os

from django.http import JsonResponse
from django.conf import settings
from django.db import transaction
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.authtoken.models import Token

from .models import UserProfile, Video
from .templates import get_template
from ai.kie import download_video

VISUAL_STYLES = {"Cinematic", "Realistic", "Documentary", "Anime", "3D", "Cartoon", "Futuristic", "News", "Luxury"}
VOICE_OPTIONS = {"Sarah", "Adam", "Rachel", "Michael", "Custom Voice"}
BACKGROUND_MUSIC_OPTIONS = {"None", "Cinematic", "Dramatic", "Motivational", "Technology", "Documentary"}


def serialize_video(video):
    return {
        "id": video.id,
        "title": video.title,
        "topic": video.topic,
        "template": video.template,
        "template_settings": video.template_settings,
        "visual_style": video.visual_style,
        "voice": video.voice,
        "voice_settings": video.voice_settings,
        "background_music": video.background_music,
        "script": video.script,
        "scenes": video.scenes,
        "voice_url": video.voice_url,
        "captions_url": video.captions_url,
        "thumbnail_url": video.thumbnail_url,
        "video_url": video.video_url,
        "kie_task_id": video.kie_task_id,
        "status": video.status,
        "error_message": video.error_message,
        "created_at": video.created_at,
        "updated_at": video.updated_at,
        "progress": video_progress(video),
    }


def get_owned_video(request, pk):
    user, error_response = require_token_user(request)
    if error_response:
        return None, error_response
    try:
        return Video.objects.get(pk=pk, user=user), None
    except Video.DoesNotExist:
        return None, JsonResponse({"error": "Video not found"}, status=404)


def rebuild_script(video):
    video.script = "\n\n".join(scene.get("narration", "") for scene in video.scenes or [])


def video_progress(video):
    scenes = video.scenes or []
    stage_complete = {"script": bool(video.script), "voice": bool(video.voice_url), "final": video.status == "completed"}
    scene_progress = []
    for scene in scenes:
        status = scene.get("status", "draft")
        percent = 100 if status == "completed" else 60 if status == "processing" else 25 if status == "retrying" else 0
        scene_progress.append({"scene_number": scene.get("scene_number"), "percent": percent, "status": status, "retry_count": scene.get("retry_count", 0)})
    return {
        "script": 100 if stage_complete["script"] else 50 if video.status == "script_generating" else 0,
        "voice": 100 if stage_complete["voice"] else 50 if video.status == "voice_generating" else 0,
        "scenes": scene_progress,
        "final": 100 if stage_complete["final"] else 50 if video.status == "processing" else 0,
    }


def get_token_user(request):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Token "):
        return None

    token_key = auth_header.removeprefix("Token ").strip()

    try:
        return Token.objects.select_related("user").get(key=token_key).user
    except Token.DoesNotExist:
        return None


def require_token_user(request):
    user = get_token_user(request)

    if not user or not user.is_authenticated:
        return None, JsonResponse({"error": "Authentication required"}, status=401)

    return user, None

# =========================================================
# VIDEO LIST
# =========================================================


class VideoListView(View):

    def get(self, request):
        user, error_response = require_token_user(request)

        if error_response:
            return error_response

        videos = Video.objects.filter(user=user).order_by("-created_at")

        return JsonResponse([serialize_video(video) for video in videos], safe=False)


# =========================================================
# CREATE VIDEO
# =========================================================


@method_decorator(csrf_exempt, name="dispatch")
class CreateVideoView(View):

    def post(self, request):
        user, error_response = require_token_user(request)

        if error_response:
            return error_response

        try:

            data = json.loads(request.body)

            title = data.get("title", "Untitled Video")

            topic = data.get("topic")
            template_key = data.get("template", "youtube_shorts")
            visual_style = data.get("visual_style", "Cinematic")
            voice = data.get("voice", "Sarah")
            voice_settings = data.get("voice_settings", {})
            background_music = data.get("background_music", "None")

            if not topic:

                return JsonResponse({"error": "Topic is required"}, status=400)

            if template_key not in {"tiktok", "youtube_shorts", "instagram_reels", "youtube_landscape", "educational", "motivational", "news", "storytelling", "product_advertisement"}:
                return JsonResponse({"error": "Invalid template"}, status=400)
            if visual_style not in VISUAL_STYLES:
                return JsonResponse({"error": "Invalid visual style"}, status=400)
            if voice not in VOICE_OPTIONS or not isinstance(voice_settings, dict):
                return JsonResponse({"error": "Invalid voice settings"}, status=400)
            if voice == "Custom Voice" and not isinstance(voice_settings.get("custom_voice_id"), str):
                return JsonResponse({"error": "A custom voice ID is required"}, status=400)
            if background_music not in BACKGROUND_MUSIC_OPTIONS:
                return JsonResponse({"error": "Invalid background music option"}, status=400)

            normalized_voice_settings = {
                "speed": min(2.0, max(0.5, float(voice_settings.get("speed", 1.0)))),
                "stability": min(100, max(0, int(voice_settings.get("stability", 50)))),
                "similarity": min(100, max(0, int(voice_settings.get("similarity", 75)))),
            }
            if voice == "Custom Voice":
                normalized_voice_settings["custom_voice_id"] = voice_settings["custom_voice_id"].strip()

            from .tasks import generate_script_draft

            with transaction.atomic():
                profile, _ = UserProfile.objects.select_for_update().get_or_create(user=user)
                profile.refresh_usage_period()
                if profile.credits_remaining < 1:
                    return JsonResponse({"error": "You have no credits remaining this month"}, status=402)
                if profile.videos_created_this_month >= profile.monthly_video_limit:
                    return JsonResponse({"error": "You have reached this month's video limit"}, status=402)

                template_settings = get_template(template_key)
                video = Video.objects.create(
                    title=title,
                    topic=topic,
                    user=user,
                    template=template_key,
                    template_settings=template_settings,
                    visual_style=visual_style,
                    voice=voice,
                    voice_settings=normalized_voice_settings,
                    background_music=background_music,
                    status="script_generating",
                )
                profile.credits_remaining -= 1
                profile.videos_created_this_month += 1
                profile.save(update_fields=["usage_period_start", "credit_limit", "credits_remaining", "monthly_video_limit", "videos_created_this_month"])
                transaction.on_commit(lambda: generate_script_draft.delay(video.id))

            return JsonResponse(
                {
                    **serialize_video(video),
                },
                status=201,
            )

        except json.JSONDecodeError:

            return JsonResponse({"error": "Invalid JSON"}, status=400)

        except Exception as error:

            return JsonResponse({"error": str(error)}, status=500)


# =========================================================
# VIDEO DETAIL
# =========================================================


class VideoDetailView(View):

    def get(self, request, pk):
        user, error_response = require_token_user(request)

        if error_response:
            return error_response

        try:
            video = Video.objects.get(pk=pk, user=user)
        except Video.DoesNotExist:
            return JsonResponse({"error": "Video not found"}, status=404)
        return JsonResponse(serialize_video(video))


@method_decorator(csrf_exempt, name="dispatch")
class VideoScenesView(View):
    def post(self, request, pk):
        video, error_response = get_owned_video(request, pk)
        if error_response:
            return error_response
        if video.status not in {"script_ready", "failed"}:
            return JsonResponse({"error": "Wait for the script before changing scenes"}, status=409)
        try:
            data = json.loads(request.body or "{}")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        scenes = video.scenes or []
        scenes.append({"scene_number": len(scenes) + 1, "narration": data.get("narration", "New narration"), "visual_prompt": data.get("visual_prompt", "Describe the visual for this scene"), "status": "draft"})
        video.scenes = scenes
        rebuild_script(video)
        video.status = "script_ready"
        video.save(update_fields=["scenes", "script", "status"])
        return JsonResponse(serialize_video(video), status=201)


@method_decorator(csrf_exempt, name="dispatch")
class VideoSceneDetailView(View):
    def patch(self, request, pk, scene_number):
        video, error_response = get_owned_video(request, pk)
        if error_response:
            return error_response
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        scene = next((item for item in video.scenes or [] if item.get("scene_number") == scene_number), None)
        if not scene:
            return JsonResponse({"error": "Scene not found"}, status=404)
        for field in ("narration", "visual_prompt"):
            if field in data and isinstance(data[field], str) and data[field].strip():
                scene[field] = data[field].strip()
        scene["status"] = "draft"
        rebuild_script(video)
        video.status = "script_ready"
        video.save(update_fields=["scenes", "script", "status"])
        return JsonResponse(serialize_video(video))

    def delete(self, request, pk, scene_number):
        video, error_response = get_owned_video(request, pk)
        if error_response:
            return error_response
        scenes = [item for item in video.scenes or [] if item.get("scene_number") != scene_number]
        if len(scenes) == len(video.scenes or []):
            return JsonResponse({"error": "Scene not found"}, status=404)
        for index, scene in enumerate(scenes):
            scene["scene_number"] = index + 1
        video.scenes = scenes
        rebuild_script(video)
        video.status = "script_ready"
        video.save(update_fields=["scenes", "script", "status"])
        return JsonResponse(serialize_video(video))


@method_decorator(csrf_exempt, name="dispatch")
class RegenerateSceneView(View):
    def post(self, request, pk, scene_number):
        video, error_response = get_owned_video(request, pk)
        if error_response:
            return error_response
        if not any(item.get("scene_number") == scene_number for item in video.scenes or []):
            return JsonResponse({"error": "Scene not found"}, status=404)
        for scene in video.scenes:
            if scene.get("scene_number") == scene_number:
                scene["status"] = "regenerating"
                break
        video.status = "script_generating"
        video.save(update_fields=["scenes", "status"])
        from .tasks import regenerate_video_scene
        regenerate_video_scene.delay(video.id, scene_number)
        return JsonResponse(serialize_video(video), status=202)


@method_decorator(csrf_exempt, name="dispatch")
class GenerateVideoView(View):
    def post(self, request, pk):
        video, error_response = get_owned_video(request, pk)
        if error_response:
            return error_response
        if not video.scenes:
            return JsonResponse({"error": "Add at least one scene before generating the video"}, status=400)
        if video.status != "script_ready":
            return JsonResponse({"error": "The script is not ready for video generation"}, status=409)
        video.status = "voice_generating"
        video.error_message = None
        video.save(update_fields=["status", "error_message"])
        from .tasks import generate_video_pipeline
        generate_video_pipeline.delay(video.id)
        return JsonResponse(serialize_video(video), status=202)


@method_decorator(csrf_exempt, name="dispatch")
class GenerateThumbnailView(View):
    def post(self, request, pk):
        video, error_response = get_owned_video(request, pk)
        if error_response:
            return error_response
        if video.status != "completed":
            return JsonResponse({"error": "Finish video generation before creating a thumbnail"}, status=409)
        from .tasks import generate_thumbnail
        generate_thumbnail.delay(video.id)
        return JsonResponse({"status": "thumbnail_generating"}, status=202)


# =========================================================
# KIE WEBHOOK
# =========================================================


@csrf_exempt
def kie_webhook(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST required"},
            status=405,
        )

    try:

        data = json.loads(request.body)

        print("================================")
        print("KIE WEBHOOK RECEIVED")
        print(json.dumps(data, indent=2))
        print("================================")

        # -----------------------------------------
        # Get task ID
        # -----------------------------------------

        task_id = data.get("taskId")

        if not task_id:
            return JsonResponse(
                {"error": "taskId missing"},
                status=400,
            )

        print(f"KIE TASK ID: {task_id}")

        # -----------------------------------------
        # Find video by scene KIE task ID
        # -----------------------------------------

        video = None
        scene_index = None

        videos = Video.objects.exclude(scenes=[])

        for candidate in videos:

            scenes = candidate.scenes or []

            for index, scene in enumerate(scenes):

                if scene.get("kie_task_id") == task_id:

                    video = candidate
                    scene_index = index

                    break

            if video:
                break

        # -----------------------------------------
        # Video not found
        # -----------------------------------------

        if not video:

            print(f"No video found for KIE task: {task_id}")

            return JsonResponse(
                {
                    "error": "Video not found",
                    "task_id": task_id,
                },
                status=404,
            )

        print(f"VIDEO ID: {video.id}")

        print(f"SCENE INDEX: {scene_index}")

        # -----------------------------------------
        # Get state
        # -----------------------------------------

        state = data.get("state")

        print(f"KIE STATE: {state}")

        # =================================================
        # FAILED
        # =================================================

        if state in ["fail", "failed"]:

            error_message = (
                data.get("failMsg")
                or data.get("message")
                or "KIE video generation failed"
            )

            scenes = video.scenes
            scene = scenes[scene_index]
            retry_count = scene.get("retry_count", 0)
            max_retries = settings.KIE_MAX_RETRIES
            scene["error_message"] = error_message
            if retry_count < max_retries:
                scene["retry_count"] = retry_count + 1
                scene["status"] = "retrying"
                video.scenes = scenes
                video.status = "video_generating"
                video.error_message = None
                video.save(update_fields=["scenes", "status", "error_message"])
                from .tasks import retry_kie_scene
                retry_kie_scene.apply_async(args=[video.id, scene.get("scene_number", scene_index + 1)], countdown=10)
                return JsonResponse({"status": "retrying", "scene_number": scene_index + 1, "retry_count": scene["retry_count"], "max_retries": max_retries}, status=202)
            scene["status"] = "failed"
            video.scenes = scenes
            video.status = "failed"
            video.error_message = f"Scene {scene_index + 1} failed after {max_retries} retries: {error_message}"
            video.save(update_fields=["scenes", "status", "error_message"])
            return JsonResponse({"status": "failed", "scene_number": scene_index + 1, "retry_count": retry_count})

        # =================================================
        # SUCCESS
        # =================================================

        if state == "success":

            result_json = data.get("resultJson")

            if not result_json:

                return JsonResponse(
                    {"error": "resultJson missing"},
                    status=400,
                )

            # KIE may return resultJson as a string
            if isinstance(result_json, str):

                result_json = json.loads(result_json)

            result_urls = result_json.get(
                "resultUrls",
                [],
            )

            if not result_urls:

                scenes = video.scenes

                scenes[scene_index]["status"] = "failed"

                scenes[scene_index]["error_message"] = "KIE returned no video URL"

                video.scenes = scenes
                video.status = "failed"
                video.error_message = "KIE completed but returned no video URL"

                video.save(
                    update_fields=[
                        "scenes",
                        "status",
                        "error_message",
                    ]
                )

                return JsonResponse(
                    {"error": "No video URL"},
                    status=400,
                )

            # -----------------------------------------
            # Get generated video URL
            # -----------------------------------------

            kie_video_url = result_urls[0]

            print(f"KIE VIDEO URL: {kie_video_url}")

            # -----------------------------------------
            # Download scene
            # -----------------------------------------

            os.makedirs(
                "media/videos",
                exist_ok=True,
            )

            scene_number = video.scenes[scene_index].get(
                "scene_number",
                scene_index + 1,
            )

            output_path = (
                f"media/videos/" f"video_{video.id}_" f"scene_{scene_number}.mp4"
            )

            download_video(
                kie_video_url,
                output_path,
            )

            print(f"SCENE DOWNLOADED: {output_path}")

            # -----------------------------------------
            # Update scene
            # -----------------------------------------

            scenes = video.scenes

            scenes[scene_index]["status"] = "completed"

            scenes[scene_index]["video_url"] = (
                f"/media/videos/" f"video_{video.id}_" f"scene_{scene_number}.mp4"
            )

            scenes[scene_index]["kie_video_url"] = kie_video_url

            video.scenes = scenes

            # -----------------------------------------
            # Check whether ALL scenes are completed
            # -----------------------------------------

            all_completed = all(scene.get("status") == "completed" for scene in scenes)

            any_failed = any(scene.get("status") == "failed" for scene in scenes)

            if any_failed:

                video.status = "failed"

                video.error_message = "One or more scenes failed"

                video.save(
                    update_fields=[
                        "scenes",
                        "status",
                        "error_message",
                    ]
                )

            elif all_completed:

                # -------------------------------------
                # All scenes ready
                # -------------------------------------

                video.status = "processing"

                video.save(
                    update_fields=[
                        "scenes",
                        "status",
                    ]
                )

                from .tasks import finalize_video
                finalize_video.delay(video.id)

            else:

                # -------------------------------------
                # Some scenes still processing
                # -------------------------------------

                video.status = "video_generating"

                video.save(
                    update_fields=[
                        "scenes",
                        "status",
                    ]
                )

                completed_count = sum(
                    1 for scene in scenes if scene.get("status") == "completed"
                )

                print(f"SCENES READY: " f"{completed_count}/" f"{len(scenes)}")

            return JsonResponse(
                {
                    "status": "success",
                    "scene_number": scene_number,
                    "scene_status": "completed",
                    "all_completed": all_completed,
                    "video_id": video.id,
                }
            )

        # =================================================
        # PROCESSING / WAITING
        # =================================================

        print(f"KIE EVENT RECEIVED: {state}")

        return JsonResponse(
            {
                "status": "received",
                "state": state,
                "task_id": task_id,
            }
        )

    except json.JSONDecodeError:

        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400,
        )

    except Exception as error:

        print(
            "KIE WEBHOOK ERROR:",
            str(error),
        )

        return JsonResponse(
            {"error": str(error)},
            status=500,
        )
