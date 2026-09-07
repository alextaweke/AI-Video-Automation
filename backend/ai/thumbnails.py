from pathlib import Path

from django.conf import settings

from .llm import client


def generate_thumbnail(video):
    prompt = f"""
Create a high-impact YouTube thumbnail for a video titled: {video.title}.
Topic: {video.topic}.
Visual style: {video.visual_style}.

Use a bold, uncluttered 16:9 composition, an expressive central visual, and room for a short headline.
Do not include logos, watermarks, UI elements, or tiny unreadable text.
"""
    response = client.models.generate_content(
        model=settings.THUMBNAIL_MODEL,
        contents=prompt,
    )
    for part in response.parts or []:
        if part.inline_data and part.inline_data.data:
            output_path = Path(settings.MEDIA_ROOT) / "thumbnails" / f"video_{video.id}.png"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_bytes(part.inline_data.data)
            return f"/media/thumbnails/video_{video.id}.png"
    raise RuntimeError("Gemini did not return a thumbnail image")
