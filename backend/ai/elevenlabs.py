import os
import base64
import requests

API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")


if not API_KEY:
    raise RuntimeError("ELEVENLABS_API_KEY is not configured")

if not VOICE_ID:
    raise RuntimeError("ELEVENLABS_VOICE_ID is not configured")


VOICE_ENVIRONMENTS = {
    "Sarah": "ELEVENLABS_VOICE_SARAH_ID",
    "Adam": "ELEVENLABS_VOICE_ADAM_ID",
    "Rachel": "ELEVENLABS_VOICE_RACHEL_ID",
    "Michael": "ELEVENLABS_VOICE_MICHAEL_ID",
}


def generate_voice(text: str, voice_name: str = "Sarah", settings: dict | None = None):
    settings = settings or {}
    voice_id = settings.get("custom_voice_id") if voice_name == "Custom Voice" else os.getenv(VOICE_ENVIRONMENTS.get(voice_name, ""), VOICE_ID)
    if not voice_id:
        raise RuntimeError("The selected ElevenLabs voice is not configured")

    url = f"https://api.elevenlabs.io/v1/" f"text-to-speech/{voice_id}/with-timestamps"

    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": float(settings.get("stability", 50)) / 100,
            "similarity_boost": float(settings.get("similarity", 75)) / 100,
            "speed": float(settings.get("speed", 1.0)),
        },
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

    result = response.json()
    return base64.b64decode(result["audio_base64"]), result.get("alignment") or result.get("normalized_alignment")
