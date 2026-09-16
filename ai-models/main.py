from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

# Import the extraction logic and schema from your existing file
from prompt_to_3d import extract_from_image, SyntropyConceptGraph

app = FastAPI(title="Syntropy AI Extraction Service")

class GenerateRequest(BaseModel):
    image_path: str

@app.post("/generate", response_model=SyntropyConceptGraph)
async def generate_graph(request: GenerateRequest):
    print(f"Received request to process: {request.image_path}")
    
    # 1. Verify the file exists in the Docker shared volume
    if not os.path.exists(request.image_path):
        raise HTTPException(
            status_code=400, 
            detail=f"Image not found at path: {request.image_path}"
        )

    # 2. Run the Gemini extraction pipeline
    try:
        graph_data = extract_from_image(request.image_path)
        return graph_data
    except Exception as e:
        print(f"Extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))