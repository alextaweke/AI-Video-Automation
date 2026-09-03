import os
import requests

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


def generate_script(topic: str) -> str:

    url = "https://api.anthropic.com/v1/messages"

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    payload = {
        "model": "claude-sonnet-4-5",
        "max_tokens": 1500,
        "messages": [
            {
                "role": "user",
                "content": f"""
Create a short engaging faceless video script.

Topic:
{topic}

Requirements:

- 60 seconds approximately
- Strong hook in the first sentence
- Simple conversational language
- 5 to 8 short paragraphs
- No camera directions
- No markdown
- Make it suitable for voice narration
""",
            }
        ],
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=60,
    )

    response.raise_for_status()

    data = response.json()

    return data["content"][0]["text"]
