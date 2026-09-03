from .claude import generate_script
from .elevenlabs import generate_voice
from .kie import create_video


def create_script(topic):

    return generate_script(topic)


def create_voice(script):

    return generate_voice(script)


def create_video_from_prompt(prompt):

    return create_video(prompt)
