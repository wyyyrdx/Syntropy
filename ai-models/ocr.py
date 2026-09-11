"""
Syntropy OCR Extraction Utility
Role: AI Engineer Deliverable
File: /backend/ai-models/ocr.py
"""

import sys
import os
import argparse
from PIL import Image
from google import genai
from google.genai import types

def transcribe_handwriting(image_path: str) -> str:
    """Performs direct OCR transcription of handwritten notes using vision LLM."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    client = genai.Client()
    image = Image.open(image_path)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            image, 
            "Transcribe all handwritten text in this image verbatim. Preserve headings, bullet points, and diagram labels."
        ],
        config=types.GenerateContentConfig(
            temperature=0.0
        )
    )
    return response.text

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OCR transcribe handwritten note image.")
    parser.add_argument("image_path", help="Path to the image")
    args = parser.parse_args()

    try:
        text = transcribe_handwriting(args.image_path)
        print(text)
    except Exception as e:
        print(f"OCR Error: {e}", file=sys.stderr)
        sys.exit(1)