from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("videos", "0003_video_user")]

    operations = [
        migrations.AddField(model_name="video", name="template", field=models.CharField(default="youtube_shorts", max_length=50)),
        migrations.AddField(model_name="video", name="template_settings", field=models.JSONField(blank=True, default=dict)),
    ]
