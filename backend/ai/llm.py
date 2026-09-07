import os
import json

from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")


client = genai.Client(api_key=GEMINI_API_KEY)


def generate_script(topic: str, template: dict | None = None, visual_style: str = "Cinematic") -> dict:

    template = template or {}
    scene_count = template.get("scenes", 5)

    prompt = f"""
You are an expert AI video script writer.

Create a short-form faceless video about:

{topic}

Create exactly {scene_count} scenes.

Use these production settings:
- Aspect ratio: {template.get("aspect_ratio", "9:16")}
- Target duration: {template.get("duration", "30-60 sec")}
- Voice style: {template.get("voice", "Professional")}
- Captions: {"enabled" if template.get("captions", True) else "disabled"}
- Music: {"enabled" if template.get("music", True) else "disabled"}
- Visual style: {visual_style}

For each scene provide:

1. narration
2. visual_prompt

The narration should be suitable for voice-over.

The visual prompt should describe exactly what an AI video generator
should create.

Every visual_prompt must explicitly reflect the selected {visual_style} visual style.

Return ONLY valid JSON.

Use this exact format:

{{
  "title": "{topic}",
  "scenes": [
    {{
      "scene_number": 1,
      "narration": "...",
      "visual_prompt": "..."
    }}
  ]
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=3000,
            response_mime_type="application/json",
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response")

    try:
        return json.loads(response.text)

    except json.JSONDecodeError as error:

        raise RuntimeError(f"Gemini returned invalid JSON: {error}")


def regenerate_scene(topic: str, scene_number: int, template: dict, narration: str, visual_prompt: str, visual_style: str = "Cinematic") -> dict:
    prompt = f"""
You are revising scene {scene_number} of a {template.get("name", "short-form")} video about: {topic}

Current narration: {narration}
Current visual: {visual_prompt}

Return ONLY valid JSON in this exact format:
{{"scene_number": {scene_number}, "narration": "...", "visual_prompt": "..."}}

Make the revised narration fresh, concise, and suitable for a {template.get("voice", "Professional")} voiceover. Make the visual prompt explicitly {visual_style} in style, specific, and designed for {template.get("aspect_ratio", "9:16")}. Do not repeat the current wording.
"""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.8,
            max_output_tokens=1000,
            response_mime_type="application/json",
        ),
    )
    if not response.text:
        raise RuntimeError("Gemini returned an empty scene")
    try:
        return json.loads(response.text)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Gemini returned invalid scene JSON: {error}")
