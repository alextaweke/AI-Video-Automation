import json
import os

from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.authtoken.models import Token

from .models import Video
from ai.kie import download_video


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

        data = []

        for video in videos:

            data.append(
                {
                    "id": video.id,
                    "title": video.title,
                    "topic": video.topic,
                    "script": video.script,
                    "voice_url": video.voice_url,
                    "video_url": video.video_url,
                    "kie_task_id": video.kie_task_id,
                    "status": video.status,
                    "error_message": video.error_message,
                    "created_at": video.created_at,
                    "updated_at": video.updated_at,
                }
            )

        return JsonResponse(data, safe=False)


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

            if not topic:

                return JsonResponse({"error": "Topic is required"}, status=400)

            video = Video.objects.create(
                title=title,
                topic=topic,
                user=user,
                status="pending",
            )

            # Start Celery pipeline

            from .tasks import generate_video_pipeline

            generate_video_pipeline.delay(video.id)

            return JsonResponse(
                {
                    "id": video.id,
                    "title": video.title,
                    "topic": video.topic,
                    "status": video.status,
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

        return JsonResponse(
            {
                "id": video.id,
                "title": video.title,
                "topic": video.topic,
                "script": video.script,
                "voice_url": video.voice_url,
                "video_url": video.video_url,
                "kie_task_id": video.kie_task_id,
                "status": video.status,
                "error_message": video.error_message,
                "created_at": video.created_at,
                "updated_at": video.updated_at,
            }
        )


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

            scenes[scene_index]["status"] = "failed"

            scenes[scene_index]["error_message"] = error_message

            video.scenes = scenes
            video.status = "failed"
            video.error_message = error_message

            video.save(
                update_fields=[
                    "scenes",
                    "status",
                    "error_message",
                ]
            )

            print(f"SCENE {scene_index + 1} FAILED")

            return JsonResponse(
                {
                    "status": "failed",
                    "scene_number": scene_index + 1,
                }
            )

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

                print("================================")

                print(f"ALL {len(scenes)} SCENES READY")

                print("NEXT STEP: FFMPEG PROCESSING")

                print("================================")

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
