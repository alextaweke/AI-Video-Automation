import os
import requests

API_KEY = os.getenv("KIE_API_KEY")
CALLBACK_URL = os.getenv("KIE_CALLBACK_URL")


def create_video(prompt: str):

    url = "https://api.kie.ai/api/v1/jobs/createTask"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": "YOUR_KIE_VIDEO_MODEL",
        "input": {
            "prompt": prompt,
        },
        "callBackUrl": CALLBACK_URL,
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=60,
    )

    response.raise_for_status()

    return response.json()
