
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

# Load .env from the project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


def generate_summary(transcript: str) -> str:
    """Generate an AI summary using the Gemini API."""

    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Check your project-root .env file."
        )

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=MODEL,
        contents=(
            "Summarize the following video transcript accurately.\n"
            "Use these headings: Overview, Key Points, and Conclusion.\n"
            "Do not invent facts or information absent from the transcript.\n\n"
            + transcript[:25000]
        ),
    )

    summary = response.text
    if not summary:
        raise RuntimeError("Gemini returned an empty summary.")

    return summary.strip()
