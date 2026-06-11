from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class NormalizedVital:
    name: str
    value: float | int | None
    unit: str
    measurement_status: str
    quality_flag: str
    missing_reason: str | None = None


@dataclass(frozen=True)
class QuestionOption:
    id: str
    label: str


@dataclass(frozen=True)
class Question:
    id: str
    phase: str
    type: str
    text: str
    options: list[QuestionOption]
    max_selections: int
    required: bool = True
    trigger_reason_codes: list[str] = field(default_factory=list)
    source_refs: list[str] = field(default_factory=list)
    evidence_status: str = "clinical-review-needed"
    summary_effect: str = ""
    registry_refs: list[str] = field(default_factory=list)
    none_option_id: str | None = None
    allow_not_sure: bool = True
    allow_skip: bool = False
    evidence_refs: list[str] = field(default_factory=lambda: ["LOCAL-PROTOCOL-TBD"])
    demo_boundary: str = "Synthetic-data demo question for staff-review intake support."


@dataclass(frozen=True)
class AnswerRecord:
    question_id: str
    selected_option_ids: list[str]
    numeric_value: float | int | None = None
    text_value: str | None = None
    request_id: str | None = None
    idempotency_key: str | None = None


@dataclass(frozen=True)
class PatientAnswer:
    question_id: str
    question_text: str
    selected_options: list[str]
    answer_value: str | float | int | None
    phase: str


@dataclass
class Patient:
    patient_id: str | None
    age: int | str | None
    sex: str | None
    chief_concern: str
    vitals: dict[str, NormalizedVital]
    past_history: list[str] = field(default_factory=list)
    medications: list[str] = field(default_factory=list)
    allergies: list[str] = field(default_factory=list)
    demo_review_level: str | int | None = None
    answers: list[PatientAnswer] = field(default_factory=list)

    @classmethod
    def from_context(cls, context: dict[str, Any], vitals: dict[str, NormalizedVital], chief_concern: str) -> "Patient":
        return cls(
            patient_id=_first_present(context, "demo_patient_id", "patient_id", "id"),
            age=_first_present(context, "age", "patient_age"),
            sex=_first_present(context, "sex", "gender"),
            chief_concern=str(_first_present(context, "chief_concern", "cc", "chief_complaint") or chief_concern),
            vitals=vitals,
            past_history=_context_list(context, "past_history", "pmh", "history"),
            medications=_context_list(context, "medications", "meds", "current_medications"),
            allergies=_context_list(context, "allergies", "allergy"),
            demo_review_level=_first_present(context, "demo_review_level", "review_level", "level"),
        )

    def record_answer(
        self,
        question: Question,
        selected_option_ids: list[str],
        answer_value: str | float | int | None = None,
    ) -> None:
        labels = [option.label for option in question.options if option.id in selected_option_ids]
        self.answers.append(PatientAnswer(
            question_id=question.id,
            question_text=question.text,
            selected_options=labels,
            answer_value=answer_value,
            phase=question.phase,
        ))


def _first_present(context: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        value = context.get(key)
        if value not in (None, "", []):
            return value
    return None


def _context_list(context: dict[str, Any], *keys: str) -> list[str]:
    value = _first_present(context, *keys)
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if str(item).strip()]
    return [part.strip() for part in str(value).split(",") if part.strip()]

@dataclass(frozen=True)
class ReviewFlag:
    code: str
    label: str = ""
    source: str = ""
    summary_text: str = ""
    triggered_by: list[str] = field(default_factory=list)


@dataclass
class FlowState:
    session_key: str
    case_id: str
    flow_version: str
    current_phase: str
    question_plan: list[str]
    current_index: int
    vitals: dict[str, NormalizedVital]
    patient_context: dict[str, Any]
    patient: Patient
    answers: list[AnswerRecord]
    flags: list[ReviewFlag]
    branch: str
    state: str = "active"
    session_expires_at: str = ""
    start_request: dict[str, Any] = field(default_factory=dict)
