import os
import json

from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")


client = genai.Client(api_key=GEMINI_API_KEY)


def generate_script(topic: str) -> dict:

    prompt = f"""
You are an expert AI video script writer.

Create a short-form faceless video about:

{topic}

Create 5 scenes.

For each scene provide:

1. narration
2. visual_prompt

The narration should be suitable for voice-over.

The visual prompt should describe exactly what an AI video generator
should create.

Make the visuals cinematic, realistic and engaging.

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
