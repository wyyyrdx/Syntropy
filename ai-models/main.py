import os
import sys
import tempfile
from pathlib import Path
from typing import List

from fastapi import FastAPI, File, HTTPException, Query, UploadFile

from prompt_to_3d import SyntropyConceptGraph, extract_from_files, load_env_file

load_env_file()

app = FastAPI(
    title="Syntropy AI Extraction Service",
    description="Multimodal AI service for extracting concept graphs and quiz questions from notes",
    version="1.1.0",
)

SUPPORTED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}
MAX_FILES = 12
MAX_FILE_BYTES = 25 * 1024 * 1024


@app.get("/")
@app.get("/health")
async def health_check():
    api_key_set = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    mock_mode = os.environ.get("MOCK_AI", "").lower() in ("true", "1", "yes")
    return {
        "status": "ok",
        "service": "Syntropy AI Extraction Service",
        "gemini_api_key_configured": api_key_set,
        "mock_mode": mock_mode,
        "active_model": os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-lite"),
    }


@app.post("/generate", response_model=SyntropyConceptGraph)
async def generate_graph(
    files: List[UploadFile] = File(...),
    mock: bool = Query(default=False),
):
    if not files or len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Upload between 1 and {MAX_FILES} note files.")

    try:
        with tempfile.TemporaryDirectory(prefix="syntropy-notes-") as temp_dir:
            inputs = []
            for index, upload in enumerate(files):
                content_type = (upload.content_type or "").lower()
                suffix = SUPPORTED_TYPES.get(content_type)
                if not suffix:
                    raise HTTPException(
                        status_code=415,
                        detail=f"Unsupported file type for {upload.filename or 'upload'}: {content_type or 'unknown'}",
                    )

                content = await upload.read(MAX_FILE_BYTES + 1)
                if len(content) > MAX_FILE_BYTES:
                    raise HTTPException(status_code=413, detail=f"{upload.filename or 'File'} exceeds 25 MB.")
                if not content:
                    raise HTTPException(status_code=400, detail=f"{upload.filename or 'File'} is empty.")

                local_path = Path(temp_dir) / f"page-{index + 1}{suffix}"
                local_path.write_bytes(content)
                inputs.append((str(local_path), content_type))

            graph_data = extract_from_files(inputs, force_mock=mock)
            print(
                f"[Syntropy AI Service] Generated {len(graph_data.nodes)} nodes from {len(inputs)} file(s)."
            )
            return graph_data
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[Syntropy AI Service] Extraction failed: {exc}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
