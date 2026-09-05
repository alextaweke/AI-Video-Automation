import os
import requests

API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")


if not API_KEY:
    raise RuntimeError("ELEVENLABS_API_KEY is not configured")

if not VOICE_ID:
    raise RuntimeError("ELEVENLABS_VOICE_ID is not configured")


def generate_voice(text: str):

    url = f"https://api.elevenlabs.io/v1/" f"text-to-speech/{VOICE_ID}"

    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=120,
    )

    print("ELEVENLABS STATUS:", response.status_code)

    print(
        "ELEVENLABS RESPONSE:",
        (
            response.text
            if response.status_code != 200
            else "Audio generated successfully"
        ),
    )

    response.raise_for_status()

    return response.content
