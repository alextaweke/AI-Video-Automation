from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("videos", "0006_video_captions_url")]

    operations = [
        migrations.AddField(model_name="video", name="background_music", field=models.CharField(default="None", max_length=50)),
        migrations.AddField(model_name="video", name="thumbnail_url", field=models.URLField(blank=True, null=True)),
    ]
