from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from python_api import triage_contract as contract
from python_api.main import app
from python_api.triage_v1.flow_router import validate_answer
from python_api.triage_v1.question_registry import QuestionRegistry, RegistryError, option_id
from python_api.triage_v1.vital_normalizer import normalize_vitals
from python_api.triage_v1.vital_rules import evaluate_vitals


client = TestClient(app)
PROJECT_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = PROJECT_ROOT / "Question_DB" / "symptom_questions.csv"


def setup_function():
    contract.reset_mock_state()


def test_normalizer_accepts_normalized_and_imvs_style_payloads():
    normalized = normalize_vitals({
        "heart_rate_bpm": {"value": "130", "unit": "bpm", "quality_flag": "needs_review"},
        "temperature_c": "39.1",
        "HR": {"BP_Value": "88", "Unit": "bpm"},
        "NBP": {"SYS_Value": "102", "DIA_Value": "68", "Unit": "mmHg"},
    })

    assert normalized["heart_rate_bpm"].value == 130
    assert normalized["heart_rate_bpm"].quality_flag == "needs_review"
    assert normalized["temperature_c"].value == 39.1
    assert normalized["blood_pressure_systolic_mm_hg"].value == 102
    assert normalized["blood_pressure_diastolic_mm_hg"].value == 68


def test_normalizer_keeps_invalid_numeric_string_missing():
    normalized = normalize_vitals({"SPO2": {"Value": "not-a-number", "Unit": "%"}})

    assert normalized["spo2_percent"].value is None
    assert normalized["spo2_percent"].measurement_status == "missing"


def test_vital_rules_emit_deterministic_review_flags():
    flags = evaluate_vitals(normalize_vitals({
        "heart_rate_bpm": 130,
        "spo2_percent": 93,
        "temperature_c": 39,
        "blood_pressure_systolic_mm_hg": 88,
    }))
    codes = {flag.code for flag in flags}

    assert "tachycardia_staff_review_demo" in codes
    assert "low_spo2_review_demo" in codes
    assert "high_fever_staff_review_demo" in codes
    assert "low_bp_review_demo" in codes


def test_question_registry_loads_csv_and_stable_option_ids():
    registry = QuestionRegistry(CSV_PATH)
    question = registry.get("PAL-1")

    assert question.text == "What does your heartbeat feel like?"
    assert question.options[0].id == option_id("PAL-1", "Racing")
    assert registry.questions_for_module("Heart/palpitation.md")[0].id == "PAL-1"
    with pytest.raises(RegistryError):
        registry.get("missing-question")


def test_duration_csv_questions_accept_number_pad_text_value():
    registry = QuestionRegistry(CSV_PATH)
    question = registry.get("FEV-1")

    assert question.type == "text"
    assert validate_answer(question, {
        "question_id": "FEV-1",
        "answer": {
            "selected_option_ids": [],
            "text_value": "2 days",
        },
    }) is None


def test_fever_vital_context_starts_csv_backed_fever_branch():
    response = client.post("/api/triage-demo/sessions", json={
        "request_id": "req-v1-fever-start",
        "idempotency_key": "idem-v1-fever-start",
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "vitals": {"temperature_c": {"value": 39, "unit": "C"}},
    })
    body = response.json()

    assert response.status_code == 200
    assert body["status"] == "question"
    assert body["question"]["id"] == "FEV-1"
    assert body["progress"]["expected_total"] >= 6


def test_low_spo2_context_starts_csv_backed_respiratory_branch():
    response = client.post("/api/triage-demo/sessions", json={
        "request_id": "req-v1-spo2-start",
        "idempotency_key": "idem-v1-spo2-start",
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "vitals": {"spo2_percent": {"value": 93, "unit": "%"}},
    })
    body = response.json()

    assert response.status_code == 200
    assert body["status"] == "question"
    assert body["question"]["id"] == "SOB-1"
