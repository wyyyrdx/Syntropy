"""
Syntropy OCR Extraction Utility
Role: AI Engineer Deliverable
File: /backend/ai-models/ocr.py
"""

import sys
import os
import json
import argparse
from PIL import Image
from google import genai
from google.genai import types

def load_env_file():
    """Loads key=value pairs from .env files in standard locations into os.environ if not already set."""
    search_dirs = [
        os.path.dirname(os.path.abspath(__file__)),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")),
        os.getcwd(),
    ]
    for directory in search_dirs:
        env_path = os.path.join(directory, ".env")
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip('"').strip("'")
                            if key and key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass

load_env_file()

def transcribe_handwriting(image_path: str) -> str:
    """Performs direct OCR transcription of handwritten notes using vision LLM."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    load_env_file()
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    mock_enabled = os.environ.get("MOCK_AI", "").lower() in ("true", "1", "yes")

    if not api_key:
        if mock_enabled:
            sample_file = os.path.join(os.path.dirname(__file__), "my_first_graph.json")
            if os.path.exists(sample_file):
                try:
                    with open(sample_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        return data.get("raw_transcription", "Sample handwriting transcription.")
                except Exception:
                    pass
            return "Sample handwriting transcription of uploaded note."
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please set GEMINI_API_KEY in your environment or in an .env file. "
            "(Set MOCK_AI=true if you want to run in offline testing mode without an API key)."
        )

    client = genai.Client(api_key=api_key)
    image = Image.open(image_path).convert("RGB")

    preferred_model = os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite")
    models_to_try = list(dict.fromkeys([
        preferred_model,
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash",
    ]))

    last_error = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    image, 
                    "Transcribe all handwritten text in this image verbatim. Preserve headings, bullet points, and diagram labels."
                ],
                config=types.GenerateContentConfig(
                    temperature=0.0
                )
            )
            return response.text or ""
        except Exception as e:
            last_error = e
            err_msg = str(e).lower()
            if any(term in err_msg for term in ["not found", "404", "unsupported", "deprecated", "model", "permission", "503", "unavailable", "429", "resource_exhausted", "quota"]):
                print(f"[Syntropy OCR] Model '{model_name}' failed ({e}). Trying fallback...", file=sys.stderr)
                continue
            raise e

    if last_error:
        raise last_error
    raise RuntimeError("Failed to transcribe handwriting.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OCR transcribe handwritten note image.")
    parser.add_argument("image_path", help="Path to the image")
    parser.add_argument("--mock", action="store_true", help="Run in offline mock mode")
    args = parser.parse_args()

    if args.mock:
        os.environ["MOCK_AI"] = "true"

    try:
        text = transcribe_handwriting(args.image_path)
        print(text)
    except Exception as e:
        print(f"OCR Error: {e}", file=sys.stderr)
        sys.exit(1)
