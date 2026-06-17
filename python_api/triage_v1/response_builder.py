from __future__ import annotations

from typing import Any, Callable

from .constants import DEMO_BOUNDARY
from .models import FlowState, Question
from .question_registry import question_to_dict
from .summary_builder import build_summary


def base_response(body: dict[str, Any], flow_state: FlowState, contract_fields: dict[str, Any], response_id: str) -> dict[str, Any]:
    return {
        **contract_fields,
        "request_id": body.get("request_id") or None,
        "response_id": response_id,
        "session_key": flow_state.session_key,
        "session_expires_at": flow_state.session_expires_at,
        "workflow_mode": "post_measurement_only",
        "measurement_state": "complete",
        "vitals_ready": True,
        "demo_boundary": DEMO_BOUNDARY,
    }


def question_response(
    body: dict[str, Any],
    flow_state: FlowState,
    question: Question,
    last_question_id: str | None,
    phase_reason: str,
    contract_fields: dict[str, Any],
    next_response_id: Callable[[str], str],
) -> dict[str, Any]:
    return {
        **base_response(body, flow_state, contract_fields, next_response_id(f"question-{flow_state.current_index + 1}")),
        "session_state": "active",
        "last_question_id": last_question_id,
        "status": "question",
        "question_phase": question.phase,
        "phase_reason": phase_reason,
        "progress": {"current": flow_state.current_index + 1, "expected_total": len(flow_state.question_plan)},
        "question": question_to_dict(question),
    }


def staff_notify_response(
    body: dict[str, Any],
    flow_state: FlowState,
    last_question_id: str | None,
    registry,
    contract_fields: dict[str, Any],
    next_response_id: Callable[[str], str],
) -> dict[str, Any]:
    return {
        **base_response(body, flow_state, contract_fields, next_response_id("summary")),
        "session_state": "summary_ready",
        "last_question_id": last_question_id,
        "status": "summary",
        "question_phase": "summary",
        "progress": {"current": len(flow_state.question_plan), "expected_total": len(flow_state.question_plan)},
        "compatibility_mode": "staff_notify_wrapped_as_summary",
        "handoff_required": True,
        "handoff_reason_codes": [flag.code for flag in flow_state.flags],
        **build_summary(flow_state, registry),
    }


def summary_response(
    body: dict[str, Any],
    flow_state: FlowState,
    last_question_id: str,
    registry,
    contract_fields: dict[str, Any],
    next_response_id: Callable[[str], str],
) -> dict[str, Any]:
    return {
        **base_response(body, flow_state, contract_fields, next_response_id("summary")),
        "session_state": "summary_ready",
        "last_question_id": last_question_id,
        "status": "summary",
        "question_phase": "summary",
        "progress": {"current": len(flow_state.question_plan), "expected_total": len(flow_state.question_plan)},
        **build_summary(flow_state, registry),
    }
