import sys
import os
import json
import argparse
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, model_validator
from PIL import Image
from google import genai
from google.genai import types

# ==========================================
# 1. AI Output Contracts & Schema Definition
# ==========================================

class ConceptNode(BaseModel):
    node_id: str = Field(..., description="Unique, snake_case identifier (e.g., 'quantum_superposition')")
    title: str = Field(..., description="Display name for the 3D concept node")
    explanation: str = Field(..., description="Clear, 1-2 sentence definition extracted directly from the notes")
    importance: Literal["primary", "secondary", "tertiary"] = Field(..., description="Hierarchy weight")
    suggested_cluster: Optional[str] = Field(None, description="High-level category grouping")

class ConceptEdge(BaseModel):
    source_id: str = Field(..., description="The origin node_id")
    target_id: str = Field(..., description="The destination node_id")
    relationship_type: str = Field(..., description="Action phrase describing the relationship")

class QuizOption(BaseModel):
    id: str = Field(..., description="Option key: 'A', 'B', 'C', or 'D'")
    text: str = Field(..., description="The option text")

class QuizQuestion(BaseModel):
    question_id: str = Field(..., description="Unique question identifier")
    linked_node_id: str = Field(..., description="The concept node_id tested by this question")
    question_text: str = Field(..., description="Active-recall question")
    options: List[QuizOption] = Field(..., min_length=3, max_length=4)
    correct_option_id: str = Field(..., description="ID of the correct option")
    explanation: str = Field(..., description="Why this answer is correct")

class SyntropyConceptGraph(BaseModel):
    subject_title: str = Field(..., description="Overarching subject of the notes")
    raw_transcription: str = Field(..., description="Complete OCR transcription")
    nodes: List[ConceptNode] = Field(..., min_length=3)
    edges: List[ConceptEdge] = Field(..., min_length=2)
    questions: List[QuizQuestion] = Field(..., min_length=2)

    @model_validator(mode="after")
    def validate_graph_integrity(self):
        node_ids = {node.node_id for node in self.nodes}
        for edge in self.edges:
            if edge.source_id not in node_ids:
                raise ValueError(f"Edge source_id '{edge.source_id}' does not exist in nodes.")
            if edge.target_id not in node_ids:
                raise ValueError(f"Edge target_id '{edge.target_id}' does not exist in nodes.")
        for q in self.questions:
            if q.linked_node_id not in node_ids:
                raise ValueError(f"Question linked_node_id '{q.linked_node_id}' does not exist in nodes.")
        return self

# ==========================================
# 2. Multimodal AI Extraction Pipeline
# ==========================================

SYSTEM_PROMPT = """You are the core AI Knowledge Engine for Syntropy.
Your task is to analyze images of messy handwritten notes and convert them into a structured 3D Concept Graph.

Strict Execution Steps:
1. Transcription: Accurately read and transcribe all handwritten text.
2. Concept Extraction: Identify primary core themes, secondary sub-concepts, and tertiary granular details.
3. Relationship Mapping: Build meaningful, directional edges between concepts. Every concept must connect to at least one other concept.
4. Question Generation: Formulate active-recall multiple-choice questions linked directly to specific concept nodes.
5. Strict Schema Enforcement: Return ONLY the structured JSON matching the provided schema."""

def extract_from_image(image_path: str, output_file: Optional[str] = None) -> SyntropyConceptGraph:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    client = genai.Client()
    image = Image.open(image_path)

    # Updated to gemini-3.6-flash
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            image,
            "Extract the full 3D concept graph, transcription, relationships, and quiz questions from these notes."
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=SyntropyConceptGraph,
            temperature=0.1,
        ),
    )

    graph_data = SyntropyConceptGraph.model_validate_json(response.text)

    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(graph_data.model_dump_json(indent=2))

    return graph_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract Concept Graph from handwritten notes.")
    parser.add_argument("image_path", help="Path to the handwritten note image")
    parser.add_argument("--out", help="Optional output JSON file path", default=None)
    
    args = parser.parse_args()

    try:
        result = extract_from_image(args.image_path, args.out)
        print(result.model_dump_json(indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)