from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import os
import sys

# Import the extraction logic and schema from prompt_to_3d
from prompt_to_3d import extract_from_image, SyntropyConceptGraph, load_env_file

# Preload environment variables from .env files
load_env_file()

app = FastAPI(
    title="Syntropy AI Extraction Service",
    description="Multimodal AI service for extracting 3D Concept Graphs and Quiz Questions from notes",
    version="1.0.0"
)

class GenerateRequest(BaseModel):
    image_path: str

def resolve_image_path(raw_path: str) -> str:
    """
    Intelligently resolves image paths across Docker volumes, local uploads, and relative paths.
    """
    # 1. Direct match (absolute or current working directory relative)
    if os.path.exists(raw_path):
        return os.path.abspath(raw_path)

    # 2. Extract base filename and search candidate storage locations
    filename = os.path.basename(raw_path.replace("\\", "/"))
    candidates = [
        # Docker shared upload mount
        os.path.join("/app", "uploads", filename),
        # Backend uploads folder when running from repo root or ai-models
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "uploads", filename)),
        os.path.abspath(os.path.join(os.getcwd(), "backend", "uploads", filename)),
        os.path.abspath(os.path.join(os.getcwd(), "uploads", filename)),
        # Frontend public directory
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", filename)),
        os.path.abspath(os.path.join(os.getcwd(), "frontend", "public", filename)),
        # Local to current directory or script
        os.path.abspath(os.path.join(os.path.dirname(__file__), filename)),
        os.path.abspath(os.path.join(os.getcwd(), filename)),
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return candidate

    return raw_path

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
        "active_model": os.environ.get("GEMINI_MODEL", "gemini-3.8-flash"),
    }

@app.post("/generate", response_model=SyntropyConceptGraph)
async def generate_graph(request: GenerateRequest, mock: bool = Query(default=False)):
    print(f"[Syntropy AI Service] Received request for image: '{request.image_path}'")

    resolved_path = resolve_image_path(request.image_path)
    
    # Verify image existence after resolution
    if not os.path.exists(resolved_path):
        error_msg = f"Image not found at path: {request.image_path} (checked candidates for {os.path.basename(request.image_path)})"
        print(f"[Syntropy AI Service] Error: {error_msg}", file=sys.stderr)
        raise HTTPException(status_code=400, detail=error_msg)

    if mock:
        os.environ["MOCK_AI"] = "true"

    try:
        graph_data = extract_from_image(resolved_path)
        print(f"[Syntropy AI Service] Successfully generated graph for '{request.image_path}' with {len(graph_data.nodes)} nodes and {len(graph_data.edges)} edges.")
        return graph_data
    except Exception as e:
        print(f"[Syntropy AI Service] Extraction failed: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=str(e))