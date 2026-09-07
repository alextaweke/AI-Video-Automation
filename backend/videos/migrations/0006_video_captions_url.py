from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("videos", "0005_video_voice_and_style")]

    operations = [
        migrations.AddField(model_name="video", name="captions_url", field=models.URLField(blank=True, null=True)),
    ]
