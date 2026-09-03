import os

from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")


client = genai.Client(api_key=GEMINI_API_KEY)


def generate_script(topic: str) -> str:

    prompt = f"""
You are an expert short-form video script writer.

Create an engaging faceless video script.

Topic:
{topic}

Requirements:
- Approximately 60 seconds
- Strong hook in the first sentence
- Conversational language
- 5 to 8 short paragraphs
- Suitable for voice narration
- No camera directions
- No markdown
- Make the content interesting and factual

Return only the script.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=1500,
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response")

    return response.text
