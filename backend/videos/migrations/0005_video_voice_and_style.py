from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("videos", "0004_video_template")]

    operations = [
        migrations.AddField(model_name="video", name="visual_style", field=models.CharField(default="Cinematic", max_length=50)),
        migrations.AddField(model_name="video", name="voice", field=models.CharField(default="Sarah", max_length=50)),
        migrations.AddField(model_name="video", name="voice_settings", field=models.JSONField(blank=True, default=dict)),
    ]
