import os
import requests

API_KEY = os.getenv("KIE_API_KEY")
CALLBACK_URL = os.getenv("KIE_CALLBACK_URL")
KIE_MODEL = os.getenv("KIE_VIDEO_MODEL")


if not API_KEY:
    raise RuntimeError("KIE_API_KEY is not configured")

if not KIE_MODEL:
    raise RuntimeError("KIE_VIDEO_MODEL is not configured")


BASE_URL = "https://api.kie.ai"


def create_video(prompt: str):

    url = f"{BASE_URL}/api/v1/jobs/createTask"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": KIE_MODEL,
        "callBackUrl": CALLBACK_URL,
        "input": {
            "prompt": prompt,
            "aspect_ratio": "9:16",
            "resolution": "720p",
            "duration": "5",
        },
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=60,
    )

    print("KIE STATUS:", response.status_code)
    print("KIE RESPONSE:", response.text)

    response.raise_for_status()

    result = response.json()

    if result.get("code") != 200:
        raise RuntimeError(f"KIE error: {result.get('msg', 'Unknown error')}")

    return result


def get_video_status(task_id: str):

    url = f"{BASE_URL}/api/v1/jobs/recordInfo"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
    }

    params = {
        "taskId": task_id,
    }

    response = requests.get(
        url,
        headers=headers,
        params=params,
        timeout=60,
    )

    print("KIE STATUS CHECK:", response.status_code)
    print("KIE RESULT:", response.text)

    response.raise_for_status()

    result = response.json()

    if result.get("code") != 200:
        raise RuntimeError(
            f"KIE status error: " f"{result.get('msg', 'Unknown error')}"
        )

    return result


def download_video(video_url: str, output_path: str):

    response = requests.get(
        video_url,
        stream=True,
        timeout=120,
    )

    response.raise_for_status()

    os.makedirs(
        os.path.dirname(output_path),
        exist_ok=True,
    )

    with open(output_path, "wb") as file:

        for chunk in response.iter_content(chunk_size=1024 * 1024):

            if chunk:
                file.write(chunk)

    return output_path
