from faster_whisper import WhisperModel

# Load Whisper model on CPU
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

# Transcribe audio
segments, info = model.transcribe(
    "../data/uploads/abc.wav"
)

print("\n--- TRANSCRIPT ---\n")

for segment in segments:
    print(
        f"[{segment.start:.2f}s - {segment.end:.2f}s] "
        f"{segment.text}"
    )