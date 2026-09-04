from celery import shared_task

from .models import Video
from ai.llm import generate_script
from ai.elevenlabs import generate_voice
from ai.kie import create_video


@shared_task
def generate_video_pipeline(video_id):

    try:

        video = Video.objects.get(id=video_id)

        # -------------------------
        # 1. Generate script
        # -------------------------

        video.status = "script_generating"
        video.save(update_fields=["status"])

        script = generate_script(video.topic)

        video.script = script
        video.status = "script_ready"

        video.save(update_fields=["script", "status"])

        # -------------------------
        # 2. Generate voice
        # -------------------------

        video.status = "voice_generating"
        video.save(update_fields=["status"])

        audio = generate_voice(script)

        audio_path = f"media/voices/video_{video.id}.mp3"

        import os

        os.makedirs("media/voices", exist_ok=True)

        with open(audio_path, "wb") as file:

            file.write(audio)

        video.voice_url = f"/media/voices/video_{video.id}.mp3"

        video.save(update_fields=["voice_url"])

        # -------------------------
        # 3. Generate video
        # -------------------------

        video.status = "video_generating"
        video.save(update_fields=["status"])

        result = create_video(prompt=script)

        task_id = result.get("data", {}).get("taskId")

        video.kie_task_id = task_id

        video.save(update_fields=["kie_task_id"])

        return {
            "video_id": video.id,
            "kie_task_id": task_id,
            "status": "video_generating",
        }

    except Exception as error:

        video.status = "failed"

        video.error_message = str(error)

        video.save(update_fields=["status", "error_message"])

        raise
