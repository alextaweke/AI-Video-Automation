from django.db import models
from django.conf import settings
from django.utils import timezone


class UserProfile(models.Model):
    PLAN_CHOICES = [
        ("free", "Free"),
        ("pro", "Pro"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="video_profile")
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="free")
    credit_limit = models.PositiveIntegerField(default=10)
    credits_remaining = models.PositiveIntegerField(default=10)
    monthly_video_limit = models.PositiveIntegerField(default=3)
    videos_created_this_month = models.PositiveIntegerField(default=0)
    minutes_generated = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    usage_period_start = models.DateField(default=timezone.localdate)
    preferred_voice = models.CharField(max_length=50, default="Sarah")
    preferred_voice_settings = models.JSONField(default=dict, blank=True)

    def refresh_usage_period(self):
        today = timezone.localdate()
        if (self.usage_period_start.year, self.usage_period_start.month) != (today.year, today.month):
            self.usage_period_start = today.replace(day=1)
            self.credits_remaining = 100 if self.plan == "pro" else 10
            self.credit_limit = 100 if self.plan == "pro" else 10
            self.monthly_video_limit = 100 if self.plan == "pro" else 3
            self.videos_created_this_month = 0

    def __str__(self):
        return f"{self.user.username} ({self.plan})"


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

    template = models.CharField(max_length=50, default="youtube_shorts")

    template_settings = models.JSONField(default=dict, blank=True)

    visual_style = models.CharField(max_length=50, default="Cinematic")

    voice = models.CharField(max_length=50, default="Sarah")

    voice_settings = models.JSONField(default=dict, blank=True)

    background_music = models.CharField(max_length=50, default="None")

    script = models.TextField(blank=True, null=True)

    scenes = models.JSONField(default=list, blank=True)

    voice_url = models.URLField(blank=True, null=True)

    captions_url = models.URLField(blank=True, null=True)

    thumbnail_url = models.URLField(blank=True, null=True)

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
