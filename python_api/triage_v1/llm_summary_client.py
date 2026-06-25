from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx


DEFAULT_LLM_SUMMARY_URL = ""
DEFAULT_TIMEOUT_SECONDS = 50


@dataclass(frozen=True)
class LlmSubjectiveSummary:
    subjective: list[str]
    model_id: str | None = None


def _load_env() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    repo_root = Path(__file__).resolve().parents[2]
    load_dotenv(repo_root / ".env")


def _valid_subjective(value: Any) -> list[str] | None:
    if not isinstance(value, list):
        return None
    lines = [item.strip() for item in value if isinstance(item, str) and item.strip()]
    return lines or None


def request_subjective_summary(payload: dict[str, Any]) -> LlmSubjectiveSummary | None:
    _load_env()
    url = os.getenv("LLM_SUMMARY_URL", DEFAULT_LLM_SUMMARY_URL).strip()
    if not url:
        return None
    try:
        with httpx.Client(timeout=DEFAULT_TIMEOUT_SECONDS) as client:
            response = client.post(url, json=payload)
    except httpx.HTTPError:
        return None
    if response.status_code != 200:
        return None
    try:
        body = response.json()
    except ValueError:
        return None
    subjective = _valid_subjective(body.get("subjective"))
    if not subjective:
        return None
    model_id = body.get("model_id") if isinstance(body.get("model_id"), str) else None
    return LlmSubjectiveSummary(subjective=subjective, model_id=model_id)
