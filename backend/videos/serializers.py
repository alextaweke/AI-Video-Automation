from rest_framework import serializers
from .models import Video


class VideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Video
        fields = [
            "id",
            "title",
            "topic",
            "script",
            "voice_url",
            "video_url",
            "kie_task_id",
            "status",
            "error_message",
            "created_at",
            "updated_at",
        ]
