from __future__ import annotations

from .constants import SCOPE_CONTROLS
from .llm_summary_client import request_subjective_summary
from .models import FlowState, NormalizedVital, Patient
from .question_registry import QuestionRegistry


PAST_HISTORY_QUESTION_IDS = {"2-1", "3-1", "UNIV-1"}
SURGERY_QUESTION_IDS = {"2-2", "3-2", "UNIV-2"}
MEDICATION_QUESTION_IDS = {"2-3", "3-3", "UNIV-3"}
ALLERGY_QUESTION_IDS = {"2-4", "3-4", "UNIV-4"}
PREGNANCY_QUESTION_IDS = {"2-5", "3-5", "UNIV-5"}
NRS_QUESTION_IDS = {"1-1-2", "1-12-2"}
INITIAL_QUESTION_PREFIXES = ("INIT-",)
UNIVERSAL_QUESTION_PREFIXES = ("UNIV-", "2-", "3-")


VITAL_DISPLAY_NAMES = {
    "temperature_c": "T",
    "heart_rate_bpm": "P",
    "respiratory_rate_per_min": "R",
    "spo2_percent": "SpO2",
    "blood_pressure_systolic_mm_hg": "SBP",
    "blood_pressure_diastolic_mm_hg": "DBP",
}


def _value(vitals: dict[str, NormalizedVital], name: str) -> float | int | None:
    vital = vitals.get(name)
    return vital.value if vital else None


def _join_or_nil(values: list[str]) -> str:
    return ", ".join(values) if values else "Nil"


def _patient_header(patient: Patient) -> str:
    age = f"{patient.age} y/o" if patient.age not in (None, "") else ""
    sex = patient.sex or ""
    return f"{age} {sex}"


def _answer_values(answer) -> list[str]:
    values = [str(option).strip() for option in answer.selected_options if str(option).strip()]
    if answer.answer_value not in (None, ""):
        value = str(answer.answer_value).strip()
        if value:
            values.append(value)
    return values


def _answer_value_text(answer) -> str:
    return ", ".join(_answer_values(answer))


def _answers_for_ids(patient: Patient, question_ids: set[str]) -> list:
    return [answer for answer in patient.answers if answer.question_id in question_ids]


def _join_answer_values(answers: list, context_values: list[str] | None = None) -> str:
    values = [str(value).strip() for value in context_values or [] if str(value).strip()]
    for answer in answers:
        values.extend(_answer_values(answer))
    return _join_or_nil(values)


def _duration(patient: Patient) -> str | None:
    for answer in patient.answers:
        if answer.question_id == "INIT-4" or "duration" in answer.question_text.lower() or "how long" in answer.question_text.lower():
            value = _answer_value_text(answer)
            if value:
                return value
    return None


def _chief_concern_line(patient: Patient) -> str:
    chief_concern = patient.chief_concern or "chief concern not supplied"
    duration = _duration(patient)
    if duration and " for " not in chief_concern.lower():
        return f"C.C.: {chief_concern} for {duration}"
    return f"C.C.: {chief_concern}"


def _is_initial_or_universal_answer(answer) -> bool:
    return answer.question_id.startswith(INITIAL_QUESTION_PREFIXES + UNIVERSAL_QUESTION_PREFIXES)


def _symptom_detail(patient: Patient) -> str:
    details = []
    for answer in patient.answers:
        if _is_initial_or_universal_answer(answer):
            continue
        value = _answer_value_text(answer)
        if value:
            details.append(f"{answer.question_text}: {value}")
    return "Detail: " + ("; ".join(details) if details else "No governed intake answers recorded.")


def _nrs_line(patient: Patient) -> str:
    for answer in patient.answers:
        text = answer.question_text.lower()
        is_nrs_question = answer.question_id in NRS_QUESTION_IDS or "nrs" in text or "pain scale" in text or "intensity" in text
        if is_nrs_question:
            value = _answer_value_text(answer)
            if value:
                return f"NRS: {value}"
    return "NRS: Not recorded"


def _pregnancy_line(patient: Patient) -> str | None:
    answers = _answers_for_ids(patient, PREGNANCY_QUESTION_IDS)
    if not answers:
        return None
    return f"Pregnancy: {_join_answer_values(answers)}"


def _vital_line(flow_state: FlowState) -> str:
    patient = flow_state.patient
    vitals = patient.vitals
    temp = _value(vitals, "temperature_c")
    pulse = _value(vitals, "heart_rate_bpm")
    resp = _value(vitals, "respiratory_rate_per_min")
    spo2 = _value(vitals, "spo2_percent")
    sbp = _value(vitals, "blood_pressure_systolic_mm_hg")
    dbp = _value(vitals, "blood_pressure_diastolic_mm_hg")

    tpr = "/".join(str(value) if value is not None else "-" for value in (temp, pulse, resp))
    parts = [f"T/P/R: {tpr}"]
    if spo2 is not None:
        parts.append(f"SpO2: {spo2}%")
    if sbp is not None or dbp is not None:
        systolic = sbp if sbp is not None else "-"
        diastolic = dbp if dbp is not None else "-"
        parts.append(f"BP {systolic}/{diastolic} mmHg")
    return "Vital sign: " + " ".join(parts)


def _observed_vitals(flow_state: FlowState) -> list[dict]:
    return [
        {
            "name": vital.name,
            "display_name": VITAL_DISPLAY_NAMES.get(vital.name, vital.name),
            "value": vital.value,
            "unit": vital.unit,
            "measurement_status": vital.measurement_status,
            "quality_flag": vital.quality_flag,
            "missing_reason": vital.missing_reason,
        }
        for vital in flow_state.vitals.values()
        if vital.value is not None
    ]


def _flag_note(flow_state: FlowState) -> str:
    if not flow_state.flags:
        return "Note: No vital-sign review cue was triggered in this demo workflow."
    flag_text = "; ".join(flag.summary_text for flag in flow_state.flags)
    return f"Note: {flag_text}"


def _soap_note(flow_state: FlowState) -> dict[str, list[str]]:
    patient = flow_state.patient
    subjective = [
        _patient_header(patient),
        _chief_concern_line(patient),
        _symptom_detail(patient),
        f"Past history: {_join_answer_values(_answers_for_ids(patient, PAST_HISTORY_QUESTION_IDS | SURGERY_QUESTION_IDS), patient.past_history)}",
        f"Medications: {_join_answer_values(_answers_for_ids(patient, MEDICATION_QUESTION_IDS), patient.medications)}",
        f"Allergy: {_join_answer_values(_answers_for_ids(patient, ALLERGY_QUESTION_IDS), patient.allergies)}",
        _nrs_line(patient),
    ]
    pregnancy = _pregnancy_line(patient)
    if pregnancy:
        subjective.append(pregnancy)
    objective = [_vital_line(flow_state)]
    assessment = [
        "Measured vitals and selected answers are organized for staff review in this demo workflow."
    ]
    if patient.demo_review_level not in (None, ""):
        assessment.append(f"Demo script review marker: {patient.demo_review_level}")
    plan = [
        "Please review the measured vital context and selected symptom answers."
    ]
    return {
        "subjective": subjective,
        "objective": objective,
        "assessment": assessment,
        "plan": plan,
    }


def _flat_soap_text(soap_note: dict[str, list[str]]) -> str:
    sections = []
    for title, key in (("S", "subjective"), ("O", "objective"), ("A", "assessment"), ("P", "plan")):
        sections.append(title + "\n" + "\n".join(soap_note[key]))
    return "\n\n".join(sections)


def _patient_record(flow_state: FlowState) -> dict:
    return {
        "patient_id": flow_state.patient.patient_id,
        "age": flow_state.patient.age,
        "sex": flow_state.patient.sex,
        "chief_concern": flow_state.patient.chief_concern,
        "past_history": flow_state.patient.past_history,
        "medications": flow_state.patient.medications,
        "allergies": flow_state.patient.allergies,
        "demo_review_level": flow_state.patient.demo_review_level,
        "answers": [answer.__dict__ for answer in flow_state.patient.answers],
    }


def _maybe_apply_llm_subjective(
    soap_note: dict[str, list[str]],
    patient_record: dict,
    vitals_observed: list[dict],
) -> tuple[str, str | None]:
    payload = {
        "patient_record": patient_record,
        "subjective_template": soap_note["subjective"],
        "objective": soap_note["objective"],
        "vitals_observed": vitals_observed,
        "scope_controls": SCOPE_CONTROLS,
    }
    result = request_subjective_summary(payload)
    if result is None:
        return "deterministic_fallback", None
    soap_note["subjective"] = result.subjective
    return "llm", result.model_id


def build_summary(flow_state: FlowState, registry: QuestionRegistry) -> dict:
    highlights = []
    for answer in flow_state.answers:
        question = registry.get(answer.question_id)
        labels = [option.label for option in question.options if option.id in answer.selected_option_ids]
        highlights.append({
            "question_id": answer.question_id,
            "question_text": question.text,
            "selected_options": labels,
        })

    flag_codes = [flag.code for flag in flow_state.flags]
    soap_note = _soap_note(flow_state)
    patient_record = _patient_record(flow_state)
    vitals_observed = _observed_vitals(flow_state)
    subjective_source, subjective_model = _maybe_apply_llm_subjective(soap_note, patient_record, vitals_observed)
    soap_text = _flat_soap_text(soap_note)
    staff_review_summary = {
        "format": "soap_review_summary_demo_v1",
        "capability_statement": "This demo shows a synthetic-data vital-aware intake loop for staff-review summary generation.",
        "scope_controls": SCOPE_CONTROLS,
        "patient_record": patient_record,
        "vitals_observed": vitals_observed,
        "chief_concern": flow_state.patient.chief_concern,
        "symptom_answer_highlights": highlights,
        "history_medication_allergy_context": [
            item for item in highlights if "history" in item["question_id"] or "allergy" in item["question_id"]
        ],
        "staff_review_flags": [
            {
                "code": flag.code,
                "label": flag.label,
                "summary_text": flag.summary_text,
                "triggered_by": flag.triggered_by,
            }
            for flag in flow_state.flags
        ],
        "soap_note": soap_note,
        "soap_text": soap_text,
        "subjective": soap_note["subjective"],
        "objective": soap_note["objective"],
        "review_basis": soap_note["assessment"],
        "review_action": soap_note["plan"],
        "staff_handoff_note": "Review measured vital context and selected symptom answers.",
        "subjective_summary_source": subjective_source,
    }
    if subjective_model:
        staff_review_summary["subjective_summary_model"] = subjective_model
    return {
        "summary_visibility": "staff_only",
        "handoff_required": bool(flag_codes),
        "handoff_reason_codes": flag_codes + ["staff_review_needed"],
        "staff_review_summary": staff_review_summary,
        "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
    }
