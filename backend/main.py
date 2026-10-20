from backend.services.summerizer import generate_summary
from fastapi import FastAPI, UploadFile, File, HTTPException
from pathlib import Path
from faster_whisper import WhisperModel
import subprocess
import os
import shutil
import json

app = FastAPI(title="AI Video Summarizer")

# Project paths
PROJECT_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = PROJECT_DIR / "data" / "uploads"
OUTPUT_DIR = PROJECT_DIR / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Use the FFmpeg path you installed earlier.
FFMPEG_PATH = os.getenv("FFMPEG_PATH") or shutil.which("ffmpeg") or (
    r"C:\Users\DELL\Downloads\ffmpeg-9.0-essentials_build"
    r"\ffmpeg-9.0-essentials_build\bin\ffmpeg.exe"
)

# Load the model once, using CPU mode.
model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)


@app.get("/")
def home():
    return {"message": "AI Video Summarizer API is running!"}


@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    allowed_extensions = {".mp4", ".mov", ".mkv", ".webm"}

    original_name = Path(file.filename or "").name
    extension = Path(original_name).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Upload a supported video: MP4, MOV, MKV or WEBM."
        )

    # Use a generated name to avoid filename collisions.
    import uuid
    video_id = uuid.uuid4().hex
    video_path = UPLOAD_DIR / f"{video_id}{extension}"
    audio_path = UPLOAD_DIR / f"{video_id}.wav"
    transcript_path = OUTPUT_DIR / f"{video_id}_transcript.json"

    try:
        # 1. Save uploaded video.
        with video_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if video_path.stat().st_size == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        # 2. Extract audio using FFmpeg.
        result = subprocess.run(
            [
                str(FFMPEG_PATH),
                "-y",
                "-i", str(video_path),
                "-vn",
                "-ac", "1",
                "-ar", "16000",
                "-c:a", "pcm_s16le",
                str(audio_path)
            ],
            capture_output=True,
            text=True,
            timeout=600
        )

        if result.returncode != 0 or not audio_path.exists():
            raise HTTPException(
                status_code=422,
                detail="Audio extraction failed. Check the video and FFmpeg installation."
            )

        # 3. Generate timestamped transcript.
        segments, info = model.transcribe(
            str(audio_path),
            beam_size=5
        )

        transcript = [
            {
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            }
            for segment in segments
        ]
        
                # 4. Generate AI summary from the transcript.
        transcript_text = "\n".join(
            f"[{segment['start']}s - {segment['end']}s] {segment['text']}"
            for segment in transcript
        )

        summary = ""
        if transcript_text.strip():
            try:
                summary = generate_summary(transcript_text)
            except Exception as error:
                print(f"AI summarization failed: {error}")

        # 4. Save transcript as JSON.
        with transcript_path.open("w", encoding="utf-8") as output_file:
            json.dump(
                {
                    "video_id": video_id,
                    "language": info.language,
                    "segments": transcript
                },
                output_file,
                ensure_ascii=False,
                indent=2
            )

        return {
            "message": "Video processed successfully",
            "video_id": video_id,
            "filename": original_name,
            "language": info.language,
            "transcript": transcript,
            "transcript_file": str(transcript_path.relative_to(PROJECT_DIR)),
            "has_speech": bool(transcript),
            "summary": summary,
            "summary_generated": bool(summary)
        }

    except HTTPException:
        raise
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Video processing timed out.")
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Video processing failed: {str(error)}"
        )
    finally:
        await file.close()
