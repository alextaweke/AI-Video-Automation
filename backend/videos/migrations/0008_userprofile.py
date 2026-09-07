from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("videos", "0007_video_music_and_thumbnail"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("plan", models.CharField(choices=[("free", "Free"), ("pro", "Pro")], default="free", max_length=20)),
                ("credit_limit", models.PositiveIntegerField(default=10)),
                ("credits_remaining", models.PositiveIntegerField(default=10)),
                ("monthly_video_limit", models.PositiveIntegerField(default=3)),
                ("videos_created_this_month", models.PositiveIntegerField(default=0)),
                ("minutes_generated", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("usage_period_start", models.DateField(default=django.utils.timezone.localdate)),
                ("preferred_voice", models.CharField(default="Sarah", max_length=50)),
                ("preferred_voice_settings", models.JSONField(blank=True, default=dict)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="video_profile", to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
