from services.transcriber import transcribe_audio


audio_path = "../data/uploads/abc.wav"

output_path = "../data/transcripts/abc.json"


transcript = transcribe_audio(
    audio_path,
    output_path
)


print("\n--- TRANSCRIPT ---\n")

for item in transcript:
    print(
        f"[{item['start']}s - {item['end']}s] "
        f"{item['text']}"
    )

print("\nTranscript saved successfully!")
print(output_path)