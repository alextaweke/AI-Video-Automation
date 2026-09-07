TEMPLATE_PRESETS = {
    "tiktok": {"name": "TikTok", "aspect_ratio": "9:16", "duration": "15-30 sec", "scenes": 3, "voice": "Energetic", "captions": True, "music": True},
    "youtube_shorts": {"name": "YouTube Shorts", "aspect_ratio": "9:16", "duration": "30-60 sec", "scenes": 5, "voice": "Professional", "captions": True, "music": True},
    "instagram_reels": {"name": "Instagram Reels", "aspect_ratio": "9:16", "duration": "30-60 sec", "scenes": 4, "voice": "Conversational", "captions": True, "music": True},
    "youtube_landscape": {"name": "YouTube Landscape", "aspect_ratio": "16:9", "duration": "2-4 min", "scenes": 8, "voice": "Professional", "captions": True, "music": True},
    "educational": {"name": "Educational", "aspect_ratio": "16:9", "duration": "2-3 min", "scenes": 6, "voice": "Clear", "captions": True, "music": False},
    "motivational": {"name": "Motivational", "aspect_ratio": "9:16", "duration": "30-60 sec", "scenes": 5, "voice": "Inspiring", "captions": True, "music": True},
    "news": {"name": "News", "aspect_ratio": "16:9", "duration": "1-2 min", "scenes": 6, "voice": "Authoritative", "captions": True, "music": False},
    "storytelling": {"name": "Storytelling", "aspect_ratio": "9:16", "duration": "60-90 sec", "scenes": 6, "voice": "Expressive", "captions": True, "music": True},
    "product_advertisement": {"name": "Product Advertisement", "aspect_ratio": "9:16", "duration": "15-30 sec", "scenes": 4, "voice": "Persuasive", "captions": True, "music": True},
}


def get_template(template_key):
    return TEMPLATE_PRESETS.get(template_key, TEMPLATE_PRESETS["youtube_shorts"])
