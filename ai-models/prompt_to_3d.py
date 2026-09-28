import sys
import os
import re
import json
import argparse
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, model_validator
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

# Load any local .env file on module import
load_env_file()

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

        # Filter out invalid edges instead of crashing the pipeline
        valid_edges = []
        for edge in self.edges:
            if edge.source_id in node_ids and edge.target_id in node_ids:
                valid_edges.append(edge)
            else:
                print(f"[Syntropy AI] Dropping edge with unresolved node reference: {edge.source_id} -> {edge.target_id}", file=sys.stderr)
        self.edges = valid_edges

        # Ensure every question links to a valid node
        for q in self.questions:
            if q.linked_node_id not in node_ids:
                if self.nodes:
                    fallback_id = next((n.node_id for n in self.nodes if n.importance == "primary"), self.nodes[0].node_id)
                    print(f"[Syntropy AI] Remapping question {q.question_id} linked_node_id from '{q.linked_node_id}' to '{fallback_id}'", file=sys.stderr)
                    q.linked_node_id = fallback_id
                else:
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

def clean_json_text(text: str) -> str:
    """Strips markdown code fences and cleans response text for JSON parsing."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def get_mock_graph() -> SyntropyConceptGraph:
    """Returns a pre-validated sample concept graph for offline testing or demo mode."""
    sample_file = os.path.join(os.path.dirname(__file__), "my_first_graph.json")
    if os.path.exists(sample_file):
        with open(sample_file, "r", encoding="utf-8") as f:
            return SyntropyConceptGraph.model_validate_json(f.read())
    return SyntropyConceptGraph(
        subject_title="Demo Subject: Concept Extraction",
        raw_transcription="Sample transcription of handwritten notes.",
        nodes=[
            ConceptNode(node_id="concept_a", title="Concept A", explanation="Primary foundational concept", importance="primary", suggested_cluster="Foundations"),
            ConceptNode(node_id="concept_b", title="Concept B", explanation="Secondary supporting concept", importance="secondary", suggested_cluster="Foundations"),
            ConceptNode(node_id="concept_c", title="Concept C", explanation="Tertiary detail concept", importance="tertiary", suggested_cluster="Applications"),
        ],
        edges=[
            ConceptEdge(source_id="concept_a", target_id="concept_b", relationship_type="leads to"),
            ConceptEdge(source_id="concept_b", target_id="concept_c", relationship_type="enables"),
        ],
        questions=[
            QuizQuestion(
                question_id="q1",
                linked_node_id="concept_a",
                question_text="What is the role of Concept A?",
                options=[
                    QuizOption(id="A", text="Primary foundational concept"),
                    QuizOption(id="B", text="Secondary outcome"),
                    QuizOption(id="C", text="Tertiary detail"),
                ],
                correct_option_id="A",
                explanation="Concept A serves as the primary foundation."
            ),
            QuizQuestion(
                question_id="q2",
                linked_node_id="concept_b",
                question_text="How does Concept B relate to Concept A?",
                options=[
                    QuizOption(id="A", text="It is derived from Concept A"),
                    QuizOption(id="B", text="It opposes Concept A"),
                    QuizOption(id="C", text="No relation"),
                ],
                correct_option_id="A",
                explanation="Concept B is linked directly from Concept A."
            ),
        ]
    )

def extract_from_image(image_path: str, output_file: Optional[str] = None) -> SyntropyConceptGraph:
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    load_env_file()
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    mock_enabled = os.environ.get("MOCK_AI", "").lower() in ("true", "1", "yes")

    if not api_key:
        if mock_enabled:
            print("[Syntropy AI] GEMINI_API_KEY not set. Using mock concept graph (MOCK_AI=true).", file=sys.stderr)
            graph_data = get_mock_graph()
            if output_file:
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(graph_data.model_dump_json(indent=2))
            return graph_data
        else:
            raise ValueError(
                "GEMINI_API_KEY environment variable is not set. "
                "Please set GEMINI_API_KEY in your environment or in an .env file. "
                "(Set MOCK_AI=true if you want to run in offline testing mode without an API key)."
            )

    client = genai.Client(api_key=api_key)
    image = Image.open(image_path).convert("RGB")

    preferred_model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
    models_to_try = list(dict.fromkeys([
        preferred_model,
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3-flash-preview",
        "gemini-flash-latest",
        "gemini-3.8-flash",
        "gemini-3.7-flash",
    ]))

    last_error = None
    graph_data = None

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
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

            if hasattr(response, "parsed") and isinstance(response.parsed, SyntropyConceptGraph):
                graph_data = response.parsed
                break

            clean_json = clean_json_text(response.text or "")
            graph_data = SyntropyConceptGraph.model_validate_json(clean_json)
            break
        except Exception as e:
            last_error = e
            err_msg = str(e).lower()
            if any(term in err_msg for term in ["not found", "404", "unsupported", "deprecated", "model", "permission", "503", "unavailable", "429", "resource_exhausted", "quota"]):
                print(f"[Syntropy AI] Model '{model_name}' failed ({e}). Trying fallback...", file=sys.stderr)
                continue
            raise e

    if graph_data is None:
        if last_error:
            raise last_error
        raise RuntimeError("Failed to generate concept graph from model response.")

    if output_file:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(graph_data.model_dump_json(indent=2))

    return graph_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract Concept Graph from handwritten notes.")
    parser.add_argument("image_path", help="Path to the handwritten note image")
    parser.add_argument("--out", help="Optional output JSON file path", default=None)
    parser.add_argument("--mock", action="store_true", help="Force offline mock mode without calling Gemini API")

    args = parser.parse_args()

    if args.mock:
        os.environ["MOCK_AI"] = "true"

    try:
        result = extract_from_image(args.image_path, args.out)
        print(result.model_dump_json(indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)