from __future__ import annotations

import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main


class FakeSummarizer:
    def summarize_subjective(self, payload):
        assert payload["patient_record"]["age"] == 53
        return [
            "53 y/o M",
            "C.C. Fever for 2 days",
            "Detail: RUQ blunt pain, no vomit or diarrhea",
            "Past history: HTN",
            "Medication: Nil",
            "Allergy: Nil",
            "NRS: 6",
        ]


def test_healthz_reports_model(monkeypatch):
    monkeypatch.setenv("LLM_MODEL_ID", "test/model")
    monkeypatch.setattr(main, "get_summarizer", lambda: FakeSummarizer())

    with TestClient(main.app) as client:
        response = client.get("/healthz")

    assert response.status_code == 200
    assert response.json()["model_id"] == "test/model"
    assert response.json()["model_loaded"] == "true"


def test_subjective_summary_uses_configured_summarizer(monkeypatch):
    monkeypatch.setenv("LLM_MODEL_ID", "test/model")
    monkeypatch.setattr(main, "get_summarizer", lambda: FakeSummarizer())

    with TestClient(main.app) as client:
        response = client.post(
            "/api/llm-summary/subjective",
            json={
                "patient_record": {"age": 53, "sex": "M"},
                "subjective_template": ["53 y/o M"],
                "objective": [],
                "vitals_observed": [],
                "scope_controls": [],
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["model_id"] == "test/model"
    assert body["summary_mode"] == "llm_subjective_v1"
    assert body["subjective"][1] == "C.C. Fever for 2 days"
