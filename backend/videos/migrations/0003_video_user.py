from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("videos", "0002_video_scenes"),
    ]

    operations = [
        migrations.AddField(
            model_name="video",
            name="user",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="videos",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
