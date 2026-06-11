from __future__ import annotations

import copy
import hashlib
import hmac
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable

try:
    from .triage_v1.constants import DEMO_BOUNDARY, SESSION_TTL_SECONDS
    from .triage_v1.flow_router import build_initial_flow, next_question, record_answer, validate_answer
    from .triage_v1.question_registry import QuestionRegistry, question_to_dict
    from .triage_v1.response_builder import question_response, staff_notify_response, summary_response
    from .triage_v1.session_store import SessionStore
except ImportError:  # pragma: no cover - supports running main.py from python_api/
    from triage_v1.constants import DEMO_BOUNDARY, SESSION_TTL_SECONDS
    from triage_v1.flow_router import build_initial_flow, next_question, record_answer, validate_answer
    from triage_v1.question_registry import QuestionRegistry, question_to_dict
    from triage_v1.response_builder import question_response, staff_notify_response, summary_response
    from triage_v1.session_store import SessionStore


PROJECT_ROOT = Path(__file__).resolve().parents[1]
ALLOWED_ORIGINS = {"http://localhost", "http://localhost:5174"}

_idempotency_records: dict[str, dict[str, Any]] = {}
_response_counter = 0
_session_counter = 0
_sessions = SessionStore()


def _read_json(relative_path: str) -> Any:
    return json.loads((PROJECT_ROOT / relative_path).read_text(encoding="utf-8"))


def clone(value: Any) -> Any:
    return copy.deepcopy(value)

start_question_example = _read_json("handoff/api-examples/2026-05-21-start-session-response-question.json")

contract_fields = {
    "api_version": start_question_example["api_version"],
    "schema_version": start_question_example["schema_version"],
    "flow_version": "vital-rules-router-v1-demo",
    "case_id": "vital-routed-session",
    "case_version": "vital-rules-router-v1",
    "fixture_version": "not_applicable",
    "question_set_version": "vital-routed-question-set-v1",
    "wording_version": start_question_example["wording_version"],
}

_registry = QuestionRegistry(
    PROJECT_ROOT / "Question_DB" / "symptom_questions.csv",
    initial_csv_path=PROJECT_ROOT / "Question_DB" / "Initial_questions.csv",
    universal_csv_path=PROJECT_ROOT / "Question_DB" / "Universal_questions.csv",
)
question_sequence = [question_to_dict(question) for question in _registry.questions_for_module("tachycardia_compatibility")]
expected_total = len(question_sequence)


def configured_demo_bearer_token() -> str | None:
    token = os.environ.get("DEMO_BEARER_TOKEN", "").strip()
    return token or None


def bearer_token_from_header(value: str | None) -> str | None:
    if not value:
        return None
    parts = value.strip().split(None, 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None


def demo_bearer_auth_challenge() -> str:
    return 'Bearer realm="nycu-imedtac-triage-demo"'


def require_demo_bearer_auth(headers: dict[str, str]) -> dict[str, Any] | None:
    expected_token = configured_demo_bearer_token()
    if not expected_token:
        return None

    received_token = bearer_token_from_header(headers.get("authorization") or headers.get("Authorization"))
    if received_token and hmac.compare_digest(received_token, expected_token):
        return None

    return error_result(401, {}, "demo_bearer_token_required", "A valid demo bearer token is required for this rehearsal API.", {
        "retryable": False,
        "details": {
            "required_header": "Authorization: Bearer <demo token>",
            "token_storage": "Set DEMO_BEARER_TOKEN in the deployment environment; do not store tokens in repo files.",
        },
    })


def _next_response_id(kind: str) -> str:
    global _response_counter
    _response_counter += 1
    return f"resp-vital-router-{kind}-{_response_counter:03d}"


def _next_session_key() -> str:
    global _session_counter
    _session_counter += 1
    return f"vital-router-session-{_session_counter:03d}"


def _expiry_from(now: datetime | None = None) -> str:
    current = now or datetime.now(timezone.utc)
    return (current + timedelta(seconds=SESSION_TTL_SECONDS)).isoformat().replace("+00:00", "Z")


def error_result(status_code: int, body: dict[str, Any] | None, code: str, message: str, options: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    options = options or {}
    return {
        "statusCode": status_code,
        "body": {
            **contract_fields,
            "request_id": body.get("request_id") or None,
            "response_id": _next_response_id("error"),
            "session_key": options.get("session_key"),
            "session_expires_at": options.get("session_expires_at"),
            "status": "error",
            "session_state": options.get("session_state") or "error",
            "error": {
                "code": code,
                "message": message,
                "retryable": bool(options.get("retryable")),
                "details": options.get("details"),
            },
            "recovery": options.get("recovery"),
            "demo_boundary": DEMO_BOUNDARY,
        },
    }


def _stable_stringify(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _idempotency_comparable_body(body: dict[str, Any]) -> dict[str, Any]:
    comparable = clone(body or {})
    comparable.pop("request_id", None)
    return comparable


def _hash_body(body: dict[str, Any]) -> str:
    return hashlib.sha256(_stable_stringify(_idempotency_comparable_body(body)).encode("utf-8")).hexdigest()


def _idempotency_conflict_recovery() -> dict[str, Any]:
    return {
        "safe_next_action": "restart_demo_session",
        "owner": "imvs_ui_operator",
        "ui_locking_required": True,
        "instructions": [
            "Do not reuse this idempotency_key for a different answer.",
            "Do not auto-submit the changed answer with a new idempotency_key.",
            "Keep answer controls locked until the operator starts a new demo session or switches to labeled fallback.",
            "Start a new demo session through POST /api/triage-demo/sessions.",
        ],
    }


def _with_idempotency(scope: str, body: dict[str, Any], compute: Callable[[], dict[str, Any]], options: dict[str, Any] | None = None) -> dict[str, Any]:
    options = options or {}
    idempotency_key = body.get("idempotency_key")
    if not idempotency_key:
        return compute()

    record_key = f"{scope}:{idempotency_key}"
    body_hash = _hash_body(body)
    existing = _idempotency_records.get(record_key)
    if existing and existing["bodyHash"] != body_hash:
        return error_result(409, body, "idempotency_conflict", "The same idempotency_key was reused with a different request body.", {
            "retryable": False,
            "session_key": options.get("session_key"),
            "session_expires_at": options.get("session_expires_at"),
            "session_state": options.get("session_state") or "error",
            "details": {
                "idempotency_key": idempotency_key,
                "expected_body_hash": existing["bodyHash"],
                "received_body_hash": body_hash,
            },
            "recovery": _idempotency_conflict_recovery(),
        })
    if existing:
        return clone(existing["result"])

    result = compute()
    _idempotency_records[record_key] = {"bodyHash": body_hash, "result": clone(result)}
    return result


def _validate_case(body: dict[str, Any]) -> str | None:
    if body.get("workflow_mode") and body["workflow_mode"] != "post_measurement_only":
        return "workflow_mode must be post_measurement_only for the current demo contract"
    if body.get("measurement_state") and body["measurement_state"] != "complete":
        return "measurement_state must be complete for the current post-measurement demo contract"
    if body.get("vitals_ready") is False:
        return "vitals_ready must be true for the current post-measurement demo contract"
    return None


def create_session(body: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    case_error = _validate_case(body)
    if case_error:
        return error_result(422, body, "invalid_start_session_request", case_error, {"retryable": False})

    def compute() -> dict[str, Any]:
        flow_state = build_initial_flow(body, _registry, _next_session_key(), _expiry_from())
        _sessions.put(flow_state)
        if flow_state.state == "staff_notify_ready":
            return {"statusCode": 200, "body": staff_notify_response(body, flow_state, None, contract_fields, _next_response_id)}

        question = next_question(flow_state, _registry)
        if not question:
            flow_state.state = "summary_ready"
            return {"statusCode": 200, "body": summary_response(body, flow_state, "", _registry, contract_fields, _next_response_id)}

        response = question_response(
            body,
            flow_state,
            question,
            None,
            "Measurement is complete; vital_rules evaluated measured vitals and flow_router selected the intake branch.",
            contract_fields,
            _next_response_id,
        )
        return {"statusCode": 200, "body": response}

    return _with_idempotency("sessions", body, compute)


def submit_answer(session_key: str | None, body: dict[str, Any] | None = None) -> dict[str, Any]:
    body = body or {}
    flow_state = _sessions.get(session_key)
    if not flow_state:
        return error_result(404, body, "invalid_session", "The session_key was not found or is no longer available.", {
            "retryable": False,
            "session_key": session_key,
        })

    def compute() -> dict[str, Any]:
        if flow_state.state == "summary_ready":
            return error_result(409, body, "session_summary_ready", "The session has already reached summary status; start a new session for another answer path.", {
                "retryable": False,
                "session_key": flow_state.session_key,
                "session_expires_at": flow_state.session_expires_at,
            })
        if flow_state.state == "staff_notify_ready":
            return error_result(409, body, "session_staff_notify_ready", "The session has already reached staff-notify status; staff should review before another answer path.", {
                "retryable": False,
                "session_key": flow_state.session_key,
                "session_expires_at": flow_state.session_expires_at,
                "session_state": flow_state.state,
            })

        question = next_question(flow_state, _registry)
        if not question:
            flow_state.state = "summary_ready"
            return error_result(409, body, "session_summary_ready", "The session has no remaining questions.", {
                "retryable": False,
                "session_key": flow_state.session_key,
                "session_expires_at": flow_state.session_expires_at,
            })

        answer_error = validate_answer(question, body)
        if answer_error:
            return error_result(422, body, "invalid_answer", answer_error, {
                "retryable": False,
                "session_key": flow_state.session_key,
                "session_expires_at": flow_state.session_expires_at,
            })

        record_answer(flow_state, body, question, _registry)
        if flow_state.state == "staff_notify_ready":
            return {"statusCode": 200, "body": staff_notify_response(body, flow_state, question.id, contract_fields, _next_response_id)}

        if flow_state.current_index >= len(flow_state.question_plan):
            flow_state.state = "summary_ready"
            return {"statusCode": 200, "body": summary_response(body, flow_state, question.id, _registry, contract_fields, _next_response_id)}

        upcoming = next_question(flow_state, _registry)
        return {
            "statusCode": 200,
            "body": question_response(
                body,
                flow_state,
                upcoming,
                question.id,
                f"{question.id} was recorded; the next governed V1 demo question is ready.",
                contract_fields,
                _next_response_id,
            ),
        }

    return _with_idempotency(
        f"answers:{flow_state.session_key}",
        body,
        compute,
        {
            "session_key": flow_state.session_key,
            "session_expires_at": flow_state.session_expires_at,
            "session_state": flow_state.state,
        },
    )


def reset_mock_state() -> None:
    global _response_counter, _session_counter
    _sessions.clear()
    _idempotency_records.clear()
    _response_counter = 0
    _session_counter = 0
