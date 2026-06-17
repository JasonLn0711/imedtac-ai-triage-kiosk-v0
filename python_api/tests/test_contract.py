from __future__ import annotations

import json
import os
from pathlib import Path

from fastapi.testclient import TestClient

from python_api import triage_contract as contract
from python_api.main import app
from python_api.triage_v1.models import FlowState, NormalizedVital, Patient, PatientAnswer
from python_api.triage_v1.summary_builder import build_summary


client = TestClient(app)
PROJECT_ROOT = Path(__file__).resolve().parents[2]
START_EXAMPLE = json.loads(
    (PROJECT_ROOT / "handoff/api-examples/2026-05-21-start-session-response-question.json").read_text(encoding="utf-8")
)
SUMMARY_EXAMPLE = json.loads(
    (PROJECT_ROOT / "handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json").read_text(encoding="utf-8")
)
CONTRACT_FIELD_KEYS = (
    "api_version",
    "schema_version",
    "flow_version",
    "case_id",
    "case_version",
    "fixture_version",
    "question_set_version",
    "wording_version",
)
MVP_QUESTION_TYPES = {"single_choice", "multi_choice"}


def start_body(**overrides):
    return {
        "request_id": overrides.get("request_id", "req-contract-start-001"),
        "idempotency_key": overrides.get("idempotency_key", "idem-contract-start-001"),
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "vitals": overrides.get("vitals", {
            "heart_rate_bpm": {
                "value": 130,
                "unit": "bpm",
                "measurement_status": "measured",
                "quality_flag": "needs_review",
                "missing_reason": None,
            }
        }),
        "patient_context": overrides.get("patient_context", {}),
        "capabilities": {
            "question_types": ["single_choice", "multi_choice"],
            "max_questions": overrides.get("max_questions", 99),
            "max_options_per_question": 9,
            "variable_option_count": True,
            "voice_input": False,
        },
    }


def answer_body(question, selected_option_ids, idempotency_key):
    return {
        "request_id": f"req-contract-answer-{question['id']}",
        "idempotency_key": idempotency_key,
        "session_key": "filled-by-test",
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "question_id": question["id"],
        "answer": {
            "selected_option_ids": selected_option_ids,
            "scale_value": None,
        },
        "client_event": {
            "answered_at": "2026-05-25T10:02:00+08:00",
            "input_mode": "touch",
        },
    }


def first_option_ids(question):
    return [question["options"][0]["id"]]


def option_id_by_label(question, label):
    for option in question["options"]:
        if option["label"] == label:
            return option["id"]
    raise AssertionError(f"{question['id']} does not contain option label {label!r}")


def assert_contract_fields(body, example=START_EXAMPLE):
    for key in CONTRACT_FIELD_KEYS:
        assert body[key] == example[key]


def assert_mvp_question_contract(question):
    assert question["type"] in MVP_QUESTION_TYPES
    assert question["ui_template"] in MVP_QUESTION_TYPES
    assert question["option_count"] == len(question["options"])
    assert len(question["options"]) <= 9
    assert question["rendering_constraints"]["max_visible_options_without_scroll"] == 9


def setup_function():
    contract.reset_mock_state()
    os.environ.pop("DEMO_BEARER_TOKEN", None)


def test_demo_bearer_token_gate_is_disabled_until_configured():
    response = client.post("/api/triage-demo/sessions", json=start_body())
    assert response.status_code == 200


def test_demo_bearer_token_gate_accepts_only_configured_authorization_header():
    os.environ["DEMO_BEARER_TOKEN"] = "unit-test-demo-token"

    missing = client.post("/api/triage-demo/sessions", json=start_body(idempotency_key="idem-missing"))
    invalid = client.post(
        "/api/triage-demo/sessions",
        json=start_body(idempotency_key="idem-invalid"),
        headers={"Authorization": "Bearer wrong-token"},
    )
    valid = client.post(
        "/api/triage-demo/sessions",
        json=start_body(idempotency_key="idem-valid"),
        headers={"Authorization": "Bearer unit-test-demo-token"},
    )

    assert missing.status_code == 401
    assert missing.json()["status"] == "error"
    assert missing.json()["error"]["code"] == "demo_bearer_token_required"
    assert missing.json()["error"]["details"]["required_header"] == "Authorization: Bearer <demo token>"
    assert invalid.status_code == 401
    assert valid.status_code == 200


def test_start_session_returns_first_question_and_progress_expected_total():
    response = client.post("/api/triage-demo/sessions", json=start_body(max_questions=99))
    body = response.json()

    assert response.status_code == 200
    assert_contract_fields(body)
    assert body["status"] == "question"
    assert body["session_key"]
    assert body["progress"]["current"] == 1
    assert body["progress"]["expected_total"] == 7
    assert body["question"]["id"] == "tachy-chief-concern"
    assert_mvp_question_contract(body["question"])


def test_start_session_keeps_external_golden_contract_fields():
    response = client.post("/api/triage-demo/sessions", json=start_body(max_questions=99))
    body = response.json()

    assert response.status_code == 200
    assert_contract_fields(body, START_EXAMPLE)
    assert body["workflow_mode"] == START_EXAMPLE["workflow_mode"]
    assert body["measurement_state"] == START_EXAMPLE["measurement_state"]
    assert body["vitals_ready"] == START_EXAMPLE["vitals_ready"]
    assert body["question"]["id"] == START_EXAMPLE["question"]["id"]
    assert body["question"]["type"] == START_EXAMPLE["question"]["type"]
    assert body["question"]["options"] == START_EXAMPLE["question"]["options"]


def test_start_session_routes_from_fever_vital_rules():
    response = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-fever-vital-route",
            vitals={
                "heart_rate_bpm": {"value": 88, "unit": "bpm"},
                "temperature_c": {"value": 38.2, "unit": "C"},
            },
        ),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["question"]["id"] == "FEV-2"
    assert body["question_phase"] == "symptom_specific"
    assert body["progress"]["expected_total"] == 3


def test_start_session_staff_notify_threshold_returns_summary_compatible_terminal_status():
    response = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-high-fever-staff-notify",
            vitals={"temperature_c": {"value": 39, "unit": "C"}},
        ),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["status"] == "summary"
    assert body["session_state"] == "summary_ready"
    assert body["question_phase"] == "summary"
    assert body["compatibility_mode"] == "staff_notify_wrapped_as_summary"
    assert body["staff_review_summary"]["staff_review_flags"]
    assert body["summary_visibility"] == "staff_only"
    assert "question" not in body


def test_start_session_routes_from_imvs_low_spo2_vital_rules():
    response = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-spo2-vital-route",
            vitals={
                "HR": {"BP_Value": "86", "Unit": "bpm"},
                "SPO2": {"Value": "92", "Unit": "%"},
                "Temp": {"Value": "36.8", "Unit": "C"},
            },
        ),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["question"]["id"] == "HYP-1"
    assert body["question_phase"] == "symptom_specific"
    assert body["progress"]["expected_total"] == 5


def test_normal_vitals_start_initial_questions_even_with_payload_chief_concern():
    response = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-normal-chief-concern-still-initial",
            vitals={
                "heart_rate_bpm": {"value": 78, "unit": "bpm"},
                "spo2_percent": {"value": 98, "unit": "%"},
                "temperature_c": {"value": 36.6, "unit": "C"},
                "blood_pressure_systolic_mm_hg": {"value": 118, "unit": "mmHg"},
                "blood_pressure_diastolic_mm_hg": {"value": 76, "unit": "mmHg"},
                "respiratory_rate_per_min": {"value": 16, "unit": "/min"},
                "glucose_mg_dl": {"value": 90, "unit": "mg/dL"},
                "height_cm": {"value": 170, "unit": "cm"},
                "weight_kg": {"value": 70, "unit": "kg"},
            },
            patient_context={
                "demo_patient_id": "DEMO-VITAL-001",
                "age": 68,
                "sex": "female",
                "identity_mode": "demo",
                "chief_concern": "palpitation",
            },
        ),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["question"]["id"] == "INIT-1"
    assert body["question"]["text"] == "What is your biological gender?"
    assert body["question_phase"] == "initial"


def test_normal_vitals_start_initial_questions_then_route_to_symptom_module_and_universal_csv():
    start = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-normal-initial-route",
            vitals={
                "heart_rate_bpm": {"value": 78, "unit": "bpm"},
                "temperature_c": {"value": 36.6, "unit": "C"},
                "spo2_percent": {"value": 98, "unit": "%"},
            },
            patient_context={"demo_patient_id": "DEMO-NORMAL-001", "sex": "female"},
        ),
    )
    body = start.json()
    session_key = body["session_key"]

    assert start.status_code == 200
    assert body["question"]["id"] == "INIT-1"
    assert body["question_phase"] == "initial"

    gender = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(body["question"], ["init-1_female"], "idem-normal-init-1"),
    ).json()
    assert gender["question"]["id"] == "INIT-2"
    assert gender["question"]["type"] == "single_choice"
    assert_mvp_question_contract(gender["question"])

    age_answer = answer_body(
        gender["question"],
        [option_id_by_label(gender["question"], "40-64")],
        "idem-normal-init-2",
    )
    age = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=age_answer).json()
    assert age["question"]["id"] == "INIT-3"
    assert len(age["question"]["options"]) == 9
    assert age["question"]["options"][0] == {"id": "init-3_fever_cold", "label": "Fever or cold symptoms"}
    assert_mvp_question_contract(age["question"])

    complaint = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(age["question"], ["init-3_cardiorespiratory"], "idem-normal-init-3"),
    ).json()
    assert complaint["question"]["id"] == "INIT-4"
    assert complaint["question"]["type"] == "single_choice"
    assert_mvp_question_contract(complaint["question"])

    duration_answer = answer_body(
        complaint["question"],
        [option_id_by_label(complaint["question"], "Today")],
        "idem-normal-init-4",
    )
    symptom = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=duration_answer).json()

    assert symptom["question"]["id"] == "PAL-1"
    assert symptom["question_phase"] == "symptom_specific"
    assert symptom["progress"]["expected_total"] == 10
    assert_mvp_question_contract(symptom["question"])


def test_initial_gender_answer_overrides_start_payload_sex_in_summary():
    start = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-gender-override-start",
            vitals={
                "heart_rate_bpm": {"value": 78, "unit": "bpm"},
                "temperature_c": {"value": 36.6, "unit": "C"},
                "spo2_percent": {"value": 98, "unit": "%"},
            },
            patient_context={"demo_patient_id": "DEMO-GENDER-001", "sex": "female"},
        ),
    )
    body = start.json()
    session_key = body["session_key"]

    gender = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(body["question"], ["init-1_male"], "idem-gender-override-init-1"),
    ).json()

    age_answer = answer_body(
        gender["question"],
        [option_id_by_label(gender["question"], "40-64")],
        "idem-gender-override-init-2",
    )
    age = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=age_answer).json()

    complaint = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(age["question"], ["init-3_cardiorespiratory"], "idem-gender-override-init-3"),
    ).json()

    duration_answer = answer_body(
        complaint["question"],
        [option_id_by_label(complaint["question"], "Today")],
        "idem-gender-override-init-4",
    )
    current = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=duration_answer).json()

    for index in range(20):
        if current["status"] == "summary":
            break
        current_question = current["question"]
        selected = [current_question["none_option_id"]] if current_question.get("none_option_id") else first_option_ids(current_question)
        current = client.post(
            f"/api/triage-demo/sessions/{session_key}/answers",
            json=answer_body(current_question, selected, f"idem-gender-override-module-{index}"),
        ).json()

    summary = current["staff_review_summary"]
    assert summary["patient_record"]["sex"] == "Male"
    assert "40-64 y/o Male" in summary["soap_note"]["subjective"]


def test_grouped_initial_complaint_inserts_detail_question_and_routes_from_detail():
    start = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-grouped-initial-start",
            vitals={
                "heart_rate_bpm": {"value": 78, "unit": "bpm"},
                "temperature_c": {"value": 36.6, "unit": "C"},
                "spo2_percent": {"value": 98, "unit": "%"},
            },
        ),
    )
    body = start.json()
    session_key = body["session_key"]

    gender = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(body["question"], ["init-1_female"], "idem-grouped-initial-1"),
    ).json()

    age_answer = answer_body(
        gender["question"],
        [option_id_by_label(gender["question"], "40-64")],
        "idem-grouped-initial-2",
    )
    age = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=age_answer).json()

    detail = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(
            age["question"],
            ["init-3_gi"],
            "idem-grouped-initial-3",
        ),
    ).json()

    assert detail["question"]["id"] == "INIT-3A-GI"
    assert len(detail["question"]["options"]) < 9

    duration = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(detail["question"], ["init-3a-gi_diarrhea"], "idem-grouped-initial-3a"),
    ).json()

    assert duration["question"]["id"] == "INIT-4"
    assert duration["question"]["type"] == "single_choice"
    assert_mvp_question_contract(duration["question"])

    duration_answer = answer_body(
        duration["question"],
        [option_id_by_label(duration["question"], "Today")],
        "idem-grouped-initial-4",
    )
    symptom = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=duration_answer).json()

    assert symptom["question"]["id"] == "DC-1"
    assert symptom["question_phase"] == "symptom_specific"


def test_same_answer_idempotency_key_retry_returns_same_response_without_advancing_flow():
    start = client.post("/api/triage-demo/sessions", json=start_body()).json()
    session_key = start["session_key"]
    first_question = start["question"]

    first_answer = answer_body(first_question, ["heart_racing"], "idem-contract-answer-001")
    first = client.post(f"/api/triage-demo/sessions/{session_key}/answers", json=first_answer)
    retry = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json={**first_answer, "request_id": "req-contract-answer-001-retry"},
    )

    assert first.status_code == 200
    assert retry.status_code == 200
    assert retry.json()["response_id"] == first.json()["response_id"]
    assert retry.json()["progress"]["current"] == 2
    assert retry.json()["question"]["id"] == "tachy-onset"

    second = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(first.json()["question"], ["half_day"], "idem-contract-answer-002"),
    )
    assert second.json()["progress"]["current"] == 3
    assert second.json()["question"]["id"] == "tachy-current-feeling"


def test_same_idempotency_key_with_different_answer_body_returns_conflict():
    start = client.post("/api/triage-demo/sessions", json=start_body()).json()
    session_key = start["session_key"]
    first_question = start["question"]

    first = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(first_question, ["heart_racing"], "idem-conflict-001"),
    )
    conflict = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(first_question, ["chest_tightness"], "idem-conflict-001"),
    )
    body = conflict.json()

    assert first.status_code == 200
    assert conflict.status_code == 409
    assert body["status"] == "error"
    assert body["error"]["code"] == "idempotency_conflict"
    assert body["error"]["retryable"] is False
    assert body["session_state"] == "active"
    assert body["recovery"]["safe_next_action"] == "restart_demo_session"
    assert body["recovery"]["ui_locking_required"] is True


def test_summary_builder_formats_subjective_template_fields():
    vitals = {
        "temperature_c": NormalizedVital("temperature_c", 37.2, "C", "measured", "ok"),
        "heart_rate_bpm": NormalizedVital("heart_rate_bpm", 92, "bpm", "measured", "ok"),
        "respiratory_rate_per_min": NormalizedVital("respiratory_rate_per_min", 18, "/min", "measured", "ok"),
        "spo2_percent": NormalizedVital("spo2_percent", 97, "%", "measured", "ok"),
        "blood_pressure_systolic_mm_hg": NormalizedVital("blood_pressure_systolic_mm_hg", 128, "mmHg", "measured", "ok"),
        "blood_pressure_diastolic_mm_hg": NormalizedVital("blood_pressure_diastolic_mm_hg", 76, "mmHg", "measured", "ok"),
    }
    patient = Patient(
        patient_id="demo-template",
        age=32,
        sex="Female",
        chief_concern="abdominal pain",
        vitals=vitals,
        answers=[
            PatientAnswer("INIT-4", "How long have you had abdominal pain?", [], "2 days", "initial"),
            PatientAnswer("ABD-1", "Where is the abdominal pain?", ["Right upper abdomen"], None, "symptom_specific"),
            PatientAnswer("1-1-2", "Rate the pain from 1-10.", [], 6, "symptom_specific"),
            PatientAnswer("UNIV-1", "Do you have any past medical history?", ["HTN"], None, "universal"),
            PatientAnswer("UNIV-2", "Have you had previous surgery?", ["No"], None, "universal"),
            PatientAnswer("UNIV-3", "Are you currently taking any medications?", ["No"], None, "universal"),
            PatientAnswer("UNIV-4", "Do you have any drug allergy?", ["No"], None, "universal"),
            PatientAnswer("UNIV-5", "Are you pregnant?", ["Not sure"], None, "universal"),
        ],
    )
    flow_state = FlowState(
        session_key="summary-template-session",
        case_id="summary-template-case",
        flow_version="test",
        current_phase="summary",
        question_plan=[],
        current_index=0,
        vitals=vitals,
        patient_context={},
        patient=patient,
        answers=[],
        flags=[],
        branch="Pain/abdominal_pain.md",
    )

    subjective = build_summary(flow_state, registry=None)["staff_review_summary"]["subjective"]

    assert "32 y/o Female" in subjective
    assert "C.C.: abdominal pain for 2 days" in subjective
    assert "Detail: Where is the abdominal pain?: Right upper abdomen; Rate the pain from 1-10.: 6" in subjective
    assert "Past history: HTN, No" in subjective
    assert "Medications: No" in subjective
    assert "Allergy: No" in subjective
    assert "NRS: 6" in subjective
    assert "Pregnancy: Not sure" in subjective


def test_answering_final_question_returns_staff_review_summary():
    start = client.post("/api/triage-demo/sessions", json=start_body(
        vitals={
            "temperature_c": {"value": 36.5, "unit": "C"},
            "heart_rate_bpm": {"value": 130, "unit": "bpm"},
            "respiratory_rate_per_min": {"value": 16, "unit": "/min"},
            "spo2_percent": {"value": 98, "unit": "%"},
            "blood_pressure_systolic_mm_hg": {"value": 102, "unit": "mmHg"},
            "blood_pressure_diastolic_mm_hg": {"value": 68, "unit": "mmHg"},
        },
        patient_context={
            "age": 76,
            "sex": "Female",
            "chief_concern": "Palpitation and chest tightness for half day",
            "past_history": ["arrhythmia", "hyperlipidemia"],
            "allergy": "peanut",
            "demo_review_level": 2,
        },
    )).json()
    session_key = start["session_key"]
    current_question = start["question"]
    result = None

    for index in range(contract.expected_total):
        selected = [current_question["none_option_id"]] if current_question.get("none_option_id") else first_option_ids(current_question)
        result = client.post(
            f"/api/triage-demo/sessions/{session_key}/answers",
            json=answer_body(current_question, selected, f"idem-summary-{index + 1}"),
        )
        body = result.json()
        current_question = body.get("question")

    body = result.json()
    assert result.status_code == 200
    assert_contract_fields(body, SUMMARY_EXAMPLE)
    assert body["status"] == "summary"
    assert body["session_state"] == "summary_ready"
    assert body["progress"]["current"] == 7
    assert body["progress"]["expected_total"] == 7
    assert body["staff_review_summary"]
    assert body["summary_visibility"] == "staff_only"

    summary = body["staff_review_summary"]
    soap = summary["soap_note"]
    assert summary["patient_record"]["answers"]
    assert "76 y/o Female" in soap["subjective"]
    assert "C.C.: Palpitation and chest tightness for half day" in soap["subjective"]
    assert "Past history: arrhythmia, hyperlipidemia" in soap["subjective"]
    assert "Allergy: peanut" in soap["subjective"]
    assert "Vital sign: T/P/R: 36.5/130/16 SpO2: 98% BP 102/68 mmHg" in soap["objective"]
    assert "Demo script review marker: 2" in soap["assessment"]
    assert "vital sign: t/p/r" in summary["soap_text"].lower()


def test_high_heart_rate_path_only_returns_mvp_supported_question_types():
    start = client.post("/api/triage-demo/sessions", json=start_body()).json()
    session_key = start["session_key"]
    body = start

    for index in range(contract.expected_total):
        assert body["status"] == "question"
        assert_mvp_question_contract(body["question"])
        selected = [body["question"]["none_option_id"]] if body["question"].get("none_option_id") else first_option_ids(body["question"])
        response = client.post(
            f"/api/triage-demo/sessions/{session_key}/answers",
            json=answer_body(body["question"], selected, f"idem-mvp-question-type-{index + 1}"),
        )
        body = response.json()

    assert body["status"] == "summary"
    assert_contract_fields(body, SUMMARY_EXAMPLE)


def test_initial_age_and_duration_questions_render_as_single_choice_buckets():
    start = client.post(
        "/api/triage-demo/sessions",
        json=start_body(
            idempotency_key="idem-initial-bucket-rendering",
            vitals={
                "heart_rate_bpm": {"value": 78, "unit": "bpm"},
                "temperature_c": {"value": 36.6, "unit": "C"},
                "spo2_percent": {"value": 98, "unit": "%"},
            },
        ),
    ).json()
    session_key = start["session_key"]

    age = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(start["question"], ["init-1_female"], "idem-initial-bucket-gender"),
    ).json()

    assert age["question"]["id"] == "INIT-2"
    assert age["question"]["type"] == "single_choice"
    assert [option["label"] for option in age["question"]["options"]] == [
        "Under 18",
        "18-39",
        "40-64",
        "65-79",
        "80 or older",
        "Not sure",
    ]
    assert_mvp_question_contract(age["question"])

    complaint = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(age["question"], [option_id_by_label(age["question"], "40-64")], "idem-initial-bucket-age"),
    ).json()
    duration = client.post(
        f"/api/triage-demo/sessions/{session_key}/answers",
        json=answer_body(complaint["question"], ["init-3_cardiorespiratory"], "idem-initial-bucket-complaint"),
    ).json()

    assert duration["question"]["id"] == "INIT-4"
    assert duration["question"]["type"] == "single_choice"
    assert [option["label"] for option in duration["question"]["options"]] == [
        "Today",
        "1-3 days",
        "4-7 days",
        "More than 1 week",
        "Long-term issue",
        "Not sure",
    ]
    assert_mvp_question_contract(duration["question"])


def test_invalid_session_returns_stable_error_response():
    body = answer_body(contract.question_sequence[0], ["heart_racing"], "idem-invalid-session-001")
    response = client.post("/api/triage-demo/sessions/missing-session/answers", json=body)
    data = response.json()

    assert response.status_code == 404
    assert data["status"] == "error"
    assert data["error"]["code"] == "invalid_session"
    assert data["error"]["retryable"] is False
    assert data["session_key"] == "missing-session"


def test_options_preflight_returns_cors_headers():
    response = client.options(
        "/api/triage-demo/sessions",
        headers={"Origin": "http://localhost:5174"},
    )

    assert response.status_code == 204
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:5174"
    assert response.headers["Access-Control-Allow-Methods"] == "POST, OPTIONS"
