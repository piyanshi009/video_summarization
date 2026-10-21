import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai

# Load .env from the project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

def generate_summary(transcript: str) -> str:
    """Generate an AI summary using the Gemini API with retry logic.

    Retries up to 3 times on transient errors (HTTP 5xx, 429, 503) using exponential backoff.
    Non‑transient errors (e.g., invalid API key, bad request) are raised immediately.
    """

    if not transcript or not transcript.strip():
        raise ValueError("Transcript is empty.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Check your project-root .env file."
        )

    client = genai.Client(api_key=api_key)

    # Retry logic
    max_retries = 3
    backoff = 1  # initial seconds
    for attempt in range(1, max_retries + 1):
        try:
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
        except Exception as e:
            # Determine if error is transient based on status code if available
            status_code = getattr(e, "status_code", None) or getattr(e, "code", None)
            is_transient = False
            if isinstance(status_code, int) and (status_code >= 500 or status_code in (429, 503)):
                is_transient = True
            elif "503" in str(e) or "429" in str(e) or "temporarily unavailable" in str(e).lower():
                is_transient = True

            if not is_transient:
                # Non‑transient error, re‑raise immediately
                raise

            if attempt == max_retries:
                # Exhausted retries, raise a clear error
                raise RuntimeError(
                    f"Gemini API failed after {max_retries} attempts: {e}"
                ) from e
            else:
                # Wait before next retry (exponential backoff)
                time.sleep(backoff)
                backoff *= 2  # exponential increase


def generate_content(prompt: str) -> str:
    """Generate generic content using Gemini with the same retry/backoff logic.
    The prompt should include any needed instructions and the data to process.
    Returns the raw text response (could be JSON if requested)."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing. Check your .env file.")

    client = genai.Client(api_key=api_key)
    max_retries = 3
    backoff = 1
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=(prompt,)
            )
            result = response.text
            if not result:
                raise RuntimeError("Gemini returned empty response.")
            return result.strip()
        except Exception as e:
            status_code = getattr(e, "status_code", None) or getattr(e, "code", None)
            is_transient = False
            if isinstance(status_code, int) and (status_code >= 500 or status_code in (429, 503)):
                is_transient = True
            elif "503" in str(e) or "429" in str(e) or "temporarily unavailable" in str(e).lower():
                is_transient = True
            if not is_transient:
                raise
            if attempt == max_retries:
                raise RuntimeError(f"Gemini API failed after {max_retries} attempts: {e}") from e
            time.sleep(backoff)
            backoff *= 2
