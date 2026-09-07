from rest_framework import serializers
from .models import Video, UserProfile


class VideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Video
        fields = [
            "id",
            "user",
            "title",
            "scenes",
            "topic",
            "template",
            "template_settings",
            "visual_style",
            "voice",
            "voice_settings",
            "background_music",
            "script",
            "voice_url",
            "captions_url",
            "thumbnail_url",
            "video_url",
            "kie_task_id",
            "status",
            "error_message",
            "created_at",
            "updated_at",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "plan",
            "credit_limit",
            "credits_remaining",
            "monthly_video_limit",
            "videos_created_this_month",
            "minutes_generated",
            "usage_period_start",
            "preferred_voice",
            "preferred_voice_settings",
        ]
