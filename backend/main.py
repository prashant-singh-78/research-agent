import os
import logging
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agent import ResearchAgent, OllamaServiceError, OLLAMA_CHAT_URL, DEFAULT_MODEL

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("api")

app = FastAPI(
    title="PALLU - Personal AI Research Assistant API",
    description="Personal AI Research Assistant (PALLU) powered by local Ollama (qwen3:4b), DuckDuckGo, and ArXiv.",
    version="1.0.0"
)

# Enable CORS for local development and deployed frontend origins
cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://research-agent-1-m8p4.onrender.com",
]

# Allow additional custom origins via environment variable
extra_origins = os.environ.get("ALLOWED_ORIGINS", "")
if extra_origins:
    for o in extra_origins.split(","):
        clean_o = o.strip()
        if clean_o and clean_o not in cors_origins:
            cors_origins.append(clean_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^(http://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.onrender\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agent instance
agent = ResearchAgent(
    ollama_url=OLLAMA_CHAT_URL,
    model=DEFAULT_MODEL,
    timeout=180
)


# Request and Response Models
class ResearchRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="The message, scientific question, or research topic.",
        example="Advancements in Quantum Computing and Qubits"
    )
    max_web_results: int = Field(
        default=5,
        ge=0,
        le=10,
        description="Maximum number of live DuckDuckGo web results to retrieve."
    )
    max_paper_results: int = Field(
        default=3,
        ge=0,
        le=10,
        description="Maximum number of academic arXiv papers to retrieve."
    )
    mode: Optional[str] = Field(
        default="chat",
        description="Mode: 'chat' (Normal Chat), 'web' (Web Search), 'deep' (Deep Research), or 'auto'."
    )
    language: str = Field(
        default="hinglish",
        description="Language style for response ('hinglish' by default)."
    )
    depth: Optional[str] = Field(
        default="concise",
        description="Research synthesis depth: 'concise' (fast synthesis) or 'deep' (comprehensive)."
    )
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Previous conversation turns for context-aware follow-ups."
    )


class SourceItem(BaseModel):
    title: str
    url: str
    snippet: Optional[str] = None
    summary: Optional[str] = None
    authors: Optional[List[str]] = None
    published: Optional[str] = None
    source_type: str


class SourcesGroup(BaseModel):
    web_sources: List[Dict[str, Any]]
    academic_papers: List[Dict[str, Any]]
    total_web: int
    total_academic: int


class ResearchMetadata(BaseModel):
    model: str
    ollama_endpoint: str
    execution_time_seconds: float
    search_time_seconds: Optional[float] = None
    generation_time_seconds: Optional[float] = None
    language: str
    depth: Optional[str] = "concise"
    routed_mode: Optional[str] = "chat"
    intent: Optional[str] = "general_knowledge"


class ResearchResponse(BaseModel):
    query: str
    status: str
    report_hinglish: str
    sources: SourcesGroup
    metadata: ResearchMetadata


@app.get("/", tags=["Info"])
def root():
    """
    Root endpoint providing API information and available routes.
    """
    return {
        "name": "PALLU - Personal AI Research Assistant API",
        "assistant": "PALLU",
        "tagline": "Your Personal AI Research Assistant",
        "version": "1.0.0",
        "status": "online",
        "description": "PALLU: Your Personal AI Research Assistant powered by local Ollama (qwen3:4b), DuckDuckGo, and ArXiv.",
        "endpoints": {
            "GET /": "API overview",
            "GET /health": "Health check for server and Ollama model status",
            "POST /research": "Perform deep research on a topic",
            "GET /docs": "Interactive Swagger UI documentation"
        },
        "default_model": DEFAULT_MODEL,
        "default_language": "Hinglish (Simple Hindi + English)"
    }


@app.get("/health", tags=["System"])
def health_check():
    """
    Health check endpoint: verifies backend status and Ollama availability.
    """
    ollama_status = agent.check_ollama_status()
    is_healthy = ollama_status.get("reachable", False) and ollama_status.get("model_available", False)

    response_payload = {
        "status": "healthy" if is_healthy else "degraded",
        "backend": "ok",
        "ollama": {
            "endpoint": agent.ollama_url,
            "reachable": ollama_status.get("reachable", False),
            "target_model": agent.model,
            "target_model_installed": ollama_status.get("model_available", False),
            "all_available_models": ollama_status.get("available_models", [])
        }
    }

    if not ollama_status.get("reachable", False):
        response_payload["error"] = ollama_status.get("error", "Ollama is not reachable.")

    return response_payload


@app.post("/research", response_model=ResearchResponse, tags=["Research"])
def conduct_research(request: ResearchRequest):
    """
    Deep research endpoint:
    - Gathers verified live web data from DuckDuckGo.
    - Fetches relevant scientific papers from ArXiv.
    - Synthesizes findings using local qwen3:4b model in clear Hinglish.
    - Strictly prevents hallucination of sources and returns verified citations.
    """
    try:
        logger.info(
            f"Received request: '{request.query}', mode: '{request.mode}', depth: '{request.depth}', "
            f"history_items: {len(request.conversation_history) if request.conversation_history else 0}"
        )
        result = agent.research(
            query=request.query,
            max_web_results=request.max_web_results,
            max_paper_results=request.max_paper_results,
            mode=request.mode or "chat",
            language_style=request.language,
            depth=request.depth or "concise",
            conversation_history=request.conversation_history
        )
        return result

    except OllamaServiceError as ose:
        logger.error(f"Ollama Service Error: {ose}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ollama AI Service Error: {str(ose)}"
        )
    except Exception as e:
        logger.error(f"Internal error during research processing: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while executing research: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
