from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from python_api import triage_contract as contract
from python_api.main import app
from python_api.triage_v1.flow_router import build_initial_flow, choose_branch, next_question, record_answer, validate_answer
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

    assert "tachycardia_module" in codes
    assert "low_spo2_review" in codes
    assert "staff_notify_high_fever" in codes
    assert "staff_notify_low_bp" in codes


def test_question_registry_loads_csv_and_stable_option_ids():
    registry = QuestionRegistry(CSV_PATH)
    question = registry.get("PAL-1")

    assert question.text == "What does your heartbeat feel like?"
    assert question.options[0].id == option_id("PAL-1", "Racing")
    assert registry.questions_for_module("Heart/palpitation.md")[0].id == "PAL-1"
    with pytest.raises(RegistryError):
        registry.get("missing-question")


def test_duration_csv_questions_accept_number_pad_text_value():
    registry = QuestionRegistry(CSV_PATH, initial_csv_path=PROJECT_ROOT / "Question_DB" / "Initial_questions.csv")
    question = registry.get("INIT-4")

    assert question.type == "time"
    assert validate_answer(question, {
        "question_id": "INIT-4",
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
        "vitals": {"temperature_c": {"value": 38.5, "unit": "C"}},
    })
    body = response.json()

    assert response.status_code == 200
    assert body["status"] == "question"
    assert body["question"]["id"] == "FEV-2"
    assert body["progress"]["expected_total"] == 3


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
    assert body["question"]["id"] == "HYP-1"
    assert body["progress"]["expected_total"] == 5



def test_vital_selected_module_does_not_append_universal_phase():
    response = client.post("/api/triage-demo/sessions", json={
        "request_id": "req-v1-fever-module-only",
        "idempotency_key": "idem-v1-fever-module-only",
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "vitals": {"temperature_c": {"value": 38.5, "unit": "C"}},
    })
    body = response.json()

    assert response.status_code == 200
    assert body["status"] == "question"
    assert body["question"]["id"] == "FEV-2"
    assert body["progress"]["expected_total"] == 3



def test_staff_notify_vital_thresholds_start_terminal_flow():
    cases = [
        {"temperature_c": {"value": 39, "unit": "C"}},
        {"temperature_c": {"value": 35, "unit": "C"}},
        {"spo2_percent": {"value": 91, "unit": "%"}},
        {"heart_rate_bpm": {"value": 40, "unit": "bpm"}},
        {"heart_rate_bpm": {"value": 131, "unit": "bpm"}},
        {"blood_pressure_systolic_mm_hg": {"value": 90, "unit": "mmHg"}},
        {"blood_pressure_systolic_mm_hg": {"value": 220, "unit": "mmHg"}},
        {"respiratory_rate_per_min": {"value": 8, "unit": "/min"}},
        {"respiratory_rate_per_min": {"value": 25, "unit": "/min"}},
    ]

    for index, vitals in enumerate(cases):
        response = client.post("/api/triage-demo/sessions", json={
            "request_id": f"req-staff-notify-{index}",
            "idempotency_key": f"idem-staff-notify-{index}",
            "workflow_mode": "post_measurement_only",
            "measurement_state": "complete",
            "vitals_ready": True,
            "vitals": vitals,
        })
        body = response.json()

        assert response.status_code == 200
        assert body["status"] == "staff_notify"
        assert body["session_state"] == "staff_notify_ready"
        assert body["screen_text"] == "Please notify staff."
        assert body["staff_review_flags"]


def test_non_terminal_vital_flags_choose_expected_modules():
    cases = [
        ({"temperature_c": 38.5}, "fever"),
        ({"spo2_percent": 93}, "hypoxia_cyanosis"),
        ({"heart_rate_bpm": 45}, "bradycardia"),
        ({"heart_rate_bpm": 130}, "tachycardia"),
        ({"blood_pressure_systolic_mm_hg": 180}, "hypertension"),
        ({"respiratory_rate_per_min": 22}, "shortness_of_breath"),
        ({"respiratory_rate_per_min": 10}, "respiratory_depression"),
    ]

    for raw_vitals, expected_branch in cases:
        flags = evaluate_vitals(normalize_vitals(raw_vitals))
        assert choose_branch({"vitals": raw_vitals}, flags) == expected_branch


def test_hypertension_symptom_answer_can_end_with_staff_notify(tmp_path):
    csv_path = tmp_path / "symptom_questions.csv"
    csv_path.write_text(
        'category,module_title,module_file,question_id,question_type,question,answers,answer_options\n'
        'Heart,Hypertension Symptom Module,Heart/hypertension.md,HTN-1,Multiple choice,'
        '"With the high blood-pressure reading, are any of these happening now?",'
        '"[ ] No symptoms now [ ] Chest pain or pressure [ ] Not sure",'
        '"No symptoms now; Chest pain or pressure; Not sure"\n',
        encoding="utf-8",
    )
    registry = QuestionRegistry(csv_path)
    flow_state = build_initial_flow(
        {"vitals": {"blood_pressure_systolic_mm_hg": {"value": 180, "unit": "mmHg"}}},
        registry,
        "hypertension-test-session",
        "2026-06-10T00:00:00Z",
    )
    question = next_question(flow_state, registry)

    assert flow_state.branch == "hypertension"
    assert question.id == "HTN-1"

    chest_option = next(option.id for option in question.options if option.label == "Chest pain or pressure")
    record_answer(flow_state, {
        "question_id": "HTN-1",
        "answer": {"selected_option_ids": [chest_option]},
    }, question, registry)

    assert flow_state.state == "staff_notify_ready"
    assert any(flag.code == "staff_notify_hypertension_symptoms" for flag in flow_state.flags)
