from django.db import models
from django.conf import settings


class Video(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("script_generating", "Script Generating"),
        ("script_ready", "Script Ready"),
        ("voice_generating", "Voice Generating"),
        ("video_generating", "Video Generating"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    title = models.CharField(max_length=255)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="videos",
    )

    topic = models.TextField()

    script = models.TextField(blank=True, null=True)

    scenes = models.JSONField(default=list, blank=True)

    voice_url = models.URLField(blank=True, null=True)

    video_url = models.URLField(blank=True, null=True)

    kie_task_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="pending",
    )

    error_message = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
