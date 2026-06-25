from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, AsyncIterator

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from summarizer import SummaryGenerationError, get_summarizer


SERVICE_ROOT = Path(__file__).resolve().parent
REPO_ROOT = SERVICE_ROOT.parent
try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - LLM_api installs python-dotenv, but tests may run from python_api env
    load_dotenv = None
if load_dotenv:
    load_dotenv(SERVICE_ROOT / ".env")
    load_dotenv(REPO_ROOT / ".env")

DEFAULT_MODEL_ID = "Qwen/Qwen3.5-4B"


class SubjectiveSummaryRequest(BaseModel):
    patient_record: dict[str, Any] = Field(default_factory=dict)
    subjective_template: list[str] = Field(default_factory=list)
    objective: list[str] = Field(default_factory=list)
    vitals_observed: list[dict[str, Any]] = Field(default_factory=list)
    scope_controls: list[str] = Field(default_factory=list)


class SubjectiveSummaryResponse(BaseModel):
    subjective: list[str]
    model_id: str
    summary_mode: str = "llm_subjective_v1"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.model_loaded = False
    get_summarizer()
    app.state.model_loaded = True
    yield


app = FastAPI(
    title="AI Triage Demo LLM Summary API",
    description="Local Hugging Face wording service for staff-review subjective summaries.",
    version="0.1.0",
    lifespan=lifespan,
)


def model_id() -> str:
    return os.getenv("LLM_MODEL_ID", DEFAULT_MODEL_ID).strip() or DEFAULT_MODEL_ID


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "nycu-imedtac-llm-summary-api",
        "model_id": model_id(),
        "model_loaded": str(getattr(app.state, "model_loaded", False)).lower(),
    }


@app.post("/api/llm-summary/subjective", response_model=SubjectiveSummaryResponse)
async def subjective_summary(request: SubjectiveSummaryRequest) -> SubjectiveSummaryResponse:
    payload = request.model_dump() if hasattr(request, "model_dump") else request.dict()
    try:
        subjective = get_summarizer().summarize_subjective(payload)
    except SummaryGenerationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if not subjective:
        raise HTTPException(status_code=503, detail="Model did not return a usable subjective summary.")
    return SubjectiveSummaryResponse(subjective=subjective, model_id=model_id())
