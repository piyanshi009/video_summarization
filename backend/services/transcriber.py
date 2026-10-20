from faster_whisper import WhisperModel
import json
import os


model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)


def transcribe_audio(audio_path, output_path):

    segments, info = model.transcribe(audio_path)

    transcript = []

    for segment in segments:
        transcript.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip()
        })

    os.makedirs(
        os.path.dirname(output_path),
        exist_ok=True
    )

    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(
            transcript,
            file,
            indent=4,
            ensure_ascii=False
        )

    return transcript