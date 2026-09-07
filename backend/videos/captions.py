from pathlib import Path


def format_timestamp(seconds):
    total_milliseconds = max(0, round(seconds * 1000))
    hours, remainder = divmod(total_milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    seconds, milliseconds = divmod(remainder, 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"


def caption_entries(alignment, words_per_caption=3):
    if not alignment:
        return []
    characters = alignment.get("characters", [])
    starts = alignment.get("character_start_times_seconds", [])
    ends = alignment.get("character_end_times_seconds", [])
    words, current, start = [], [], None
    for character, char_start, char_end in zip(characters, starts, ends):
        if start is None and not character.isspace():
            start = char_start
        if character.isspace():
            if current:
                words.append(("".join(current), start, char_end))
                current, start = [], None
        else:
            current.append(character)
    if current:
        words.append(("".join(current), start, ends[-1] if ends else start))
    return [(chunk[0][1], chunk[-1][2], " ".join(item[0] for item in chunk).upper()) for chunk in (words[index:index + words_per_caption] for index in range(0, len(words), words_per_caption))]


def write_srt(alignment, destination):
    entries = caption_entries(alignment)
    path = Path(destination)
    path.parent.mkdir(parents=True, exist_ok=True)
    lines = []
    for index, (start, end, text) in enumerate(entries, start=1):
        lines.extend([str(index), f"{format_timestamp(start)} --> {format_timestamp(end)}", text, ""])
    path.write_text("\n".join(lines), encoding="utf-8")
    return path
