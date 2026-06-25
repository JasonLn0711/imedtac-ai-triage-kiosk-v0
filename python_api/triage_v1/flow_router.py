from __future__ import annotations

from typing import Any

from .constants import BRANCH_MODULES
from .models import AnswerRecord, FlowState, Patient, Question, ReviewFlag
from .question_registry import QuestionRegistry
from .vital_normalizer import normalize_vitals
from .vital_rules import evaluate_vitals, has_staff_notify_flag


INITIAL_DETAIL_BY_GROUP_OPTION = {
    "init-3_fever_cold": "INIT-3A-FEVER",
    "init-3_cardiorespiratory": "INIT-3A-CARDIORESP",
    "init-3_gi": "INIT-3A-GI",
    "init-3_gu_back": "INIT-3A-GU-BACK",
    "init-3_neuro_general": "INIT-3A-NEURO",
    "init-3_injury_wound_limb": "INIT-3A-INJURY",
    "init-3_skin_allergy_eye_ent": "INIT-3A-SKIN-EYE-ENT",
    "init-3_medication_follow_up": "INIT-3A-FOLLOW-UP",
    "init-3_other_not_sure": "INIT-3A-OTHER",
}


def has_flag(flow_state: FlowState, code: str) -> bool:
    return any(flag.code == code for flag in flow_state.flags)


def _requested_chief_concern(body: dict[str, Any]) -> str:
    context = body.get("patient_context") if isinstance(body.get("patient_context"), dict) else {}
    return str(body.get("chief_concern") or context.get("chief_concern") or "").strip().lower()


def choose_branch(body: dict[str, Any], flags: list) -> str:
    flag_codes = {flag.code for flag in flags}
    chief_concern = _requested_chief_concern(body)
    if has_staff_notify_flag(flags):
        return "staff_notify"
    if not flags:
        return "initial_intake"
    if "bradycardia_module" in flag_codes:
        return "bradycardia"
    if "tachycardia_module" in flag_codes:
        return "tachycardia"
    if "low_spo2_review" in flag_codes:
        return "hypoxia_cyanosis"
    if "respiratory_module" in flag_codes:
        return "shortness_of_breath"
    if "respiratory_depression_module" in flag_codes:
        return "respiratory_depression"
    if "hypertension_module" in flag_codes:
        return "hypertension"
    if "measured_fever_context" in flag_codes:
        return "fever"
    if any(term in chief_concern for term in ("palpitation", "heart racing", "tachycardia", "chest")):
        return "palpitation"
    if any(term in chief_concern for term in ("fever", "temperature", "chills")):
        return "fever"
    if any(term in chief_concern for term in ("breath", "spo2", "oxygen")):
        return "shortness_of_breath"
    return "palpitation"


def _questions_for_branch(branch: str, registry: QuestionRegistry) -> list[Question]:
    if branch == "initial_intake":
        return registry.initial_questions()
    if branch == "staff_notify":
        return []
    if branch == "tachycardia":
        return registry.questions_for_module("tachycardia_compatibility")
    return registry.questions_for_module(BRANCH_MODULES[branch])


def build_initial_flow(body: dict[str, Any], registry: QuestionRegistry, session_key: str, expires_at: str) -> FlowState:
    raw_vitals = body.get("vitals") or {}
    vitals = normalize_vitals(raw_vitals)
    flags = evaluate_vitals(vitals)
    branch = choose_branch(body, flags)
    patient_context = body.get("patient_context") if isinstance(body.get("patient_context"), dict) else {}
    questions = _questions_for_branch(branch, registry)
    state = "staff_notify_ready" if branch == "staff_notify" else "active"

    return FlowState(
        session_key=session_key,
        case_id=f"vital-routed-{branch}",
        flow_version="vital-rules-router-v1-demo",
        current_phase=questions[0].phase if questions else branch,
        question_plan=[question.id for question in questions],
        current_index=0,
        vitals=vitals,
        patient_context=patient_context,
        patient=Patient.from_context(patient_context, vitals, branch),
        answers=[],
        flags=flags,
        branch=branch,
        state=state,
        session_expires_at=expires_at,
        start_request=dict(body),
    )


def next_question(flow_state: FlowState, registry: QuestionRegistry) -> Question | None:
    if flow_state.current_index >= len(flow_state.question_plan):
        return None
    return registry.get(flow_state.question_plan[flow_state.current_index])


def selected_option_ids(body: dict[str, Any]) -> list[str]:
    answer = body.get("answer")
    selected = answer.get("selected_option_ids") if isinstance(answer, dict) else None
    return selected if isinstance(selected, list) else []


def answer_value(body: dict[str, Any]) -> str | float | int | None:
    answer = body.get("answer")
    if not isinstance(answer, dict):
        return None
    numeric = answer.get("numeric_value")
    if numeric not in (None, "") and isinstance(numeric, int | float):
        return numeric
    text = answer.get("text_value")
    if text not in (None, ""):
        return str(text).strip()
    return None


def validate_answer(question: Question, body: dict[str, Any]) -> str | None:
    if not body.get("question_id"):
        return "question_id is required"
    if body["question_id"] != question.id:
        return f"expected question_id {question.id}, received {body['question_id']}"
    value = answer_value(body)
    if question.type == "number":
        if not isinstance(value, int | float):
            return "answer.numeric_value is required for number questions"
        return None
    if question.type in {"text", "time"}:
        if not value:
            return f"answer.text_value is required for {question.type} questions"
        return None
    selected = selected_option_ids(body)
    if not selected:
        return "answer.selected_option_ids must contain at least one option id"
    if len(selected) > question.max_selections:
        return f"selected_option_ids exceeds max_selections {question.max_selections}"
    allowed = {option.id for option in question.options}
    invalid = [option_id for option_id in selected if option_id not in allowed]
    if invalid:
        return f"unknown option id(s): {', '.join(invalid)}"
    return None


def _label_for_selected(question: Question, selected: list[str]) -> str:
    labels = [option.label for option in question.options if option.id in selected]
    return " ".join(labels).lower()


def _display_label_for_selected(question: Question, selected: list[str]) -> str:
    labels = [option.label for option in question.options if option.id in selected]
    return " ".join(labels).strip()


def _initial_complaint_text(flow_state: FlowState, registry: QuestionRegistry) -> str:
    detail_answer = next((answer for answer in flow_state.answers if answer.question_id.startswith("INIT-3A-")), None)
    if detail_answer:
        detail = _label_for_selected(registry.get(detail_answer.question_id), detail_answer.selected_option_ids)
        if detail and "not sure" not in detail:
            return detail
    complaint_answer = next((answer for answer in flow_state.answers if answer.question_id == "INIT-3"), None)
    return _label_for_selected(registry.get("INIT-3"), complaint_answer.selected_option_ids) if complaint_answer else ""


def _module_for_initial_answers(flow_state: FlowState, registry: QuestionRegistry) -> str:
    complaint = _initial_complaint_text(flow_state, registry)
    if "cardiorespiratory" in complaint:
        return BRANCH_MODULES["palpitation"]
    if "fever/cold" in complaint:
        return BRANCH_MODULES["fever"]
    if complaint == "gi":
        return "Pain/abdominal_pain.md"
    if "gu/back" in complaint:
        return "Renal&GU/urinary_symptoms.md"
    if "neuro/general" in complaint:
        return "Pain/Headache.md"
    if "injury/wound/limb" in complaint:
        return "Trauma/trauma.md"
    if "skin/allergy/eye/ent" in complaint:
        return "Skin/skin_infection.md"
    if "medication/follow-up" in complaint or "other/not sure" in complaint:
        return "chronic_follow_up.md"
    if "chest / breathing / heartbeat" in complaint or "heartbeat" in complaint:
        return BRANCH_MODULES["palpitation"]
    if "stomach or bowel" in complaint:
        return "Pain/abdominal_pain.md"
    if "urinary or back pain" in complaint:
        return "Renal&GU/urinary_symptoms.md"
    if "headache, dizziness, or weakness" in complaint:
        return "Pain/Headache.md"
    if "injury, wound, or limb pain" in complaint:
        return "Trauma/trauma.md"
    if "skin, allergy, eye, ear, or nose" in complaint:
        return "Skin/skin_infection.md"
    if "medication" in complaint or "follow-up" in complaint:
        return "chronic_follow_up.md"
    if "chest pain" in complaint:
        return "Pain/chest_pain.md"
    if "shortness of breath" in complaint:
        return BRANCH_MODULES["shortness_of_breath"]
    if "palpitation" in complaint:
        return BRANCH_MODULES["palpitation"]
    if "high blood pressure" in complaint:
        return BRANCH_MODULES["hypertension"]
    if "slow heartbeat" in complaint:
        return BRANCH_MODULES["bradycardia"]
    if "fast heartbeat" in complaint:
        return BRANCH_MODULES["tachycardia"]
    if "leg swelling" in complaint:
        return "Heart/edema.md"
    if "low oxygen" in complaint or "blue lips" in complaint:
        return BRANCH_MODULES["hypoxia_cyanosis"]
    if "fever" in complaint:
        return BRANCH_MODULES["fever"]
    if "headache" in complaint:
        return "Pain/Headache.md"
    if "abdominal pain" in complaint:
        return "Pain/abdominal_pain.md"
    if "diarrhea" in complaint or "constipation" in complaint:
        return "GI/diarrhea_constipation.md"
    if "nausea" in complaint or "vomiting" in complaint:
        return "GI/nausea_vomiting.md"
    if "trouble swallowing" in complaint:
        return "GI/dysphagia.md"
    if "abdominal swelling" in complaint or "bloating" in complaint:
        return "GI/abdominal_swelling_ascites.md"
    if "black stool" in complaint or "vomiting blood" in complaint:
        return "GI/gastrointestinal_bleeding.md"
    if "yellow skin" in complaint or "yellow eyes" in complaint:
        return "GI/jaundice.md"
    if "unintentional weight loss" in complaint:
        return "GI/unintentional_weight_loss.md"
    if "dizziness" in complaint:
        return "Neuro/dizziness.md"
    if "fainting" in complaint:
        return "Neuro/syncope.md"
    if "confusion" in complaint:
        return "Neuro/confusion_delirium.md"
    if "memory" in complaint:
        return "Neuro/dementia.md"
    if "weakness or paralysis" in complaint:
        return "Neuro/neurologic_weakness_paralysis.md"
    if "numbness" in complaint or "tingling" in complaint:
        return "Neuro/numbness_tingling_sensory_loss.md"
    if "walking imbalance" in complaint or "falls" in complaint:
        return "Neuro/gait_imbalance_falls.md"
    if "sleep" in complaint:
        return "Neuro/sleep_disorders.md"
    if "urinary" in complaint:
        return "Renal&GU/urinary_symptoms.md"
    if "painful urination" in complaint or "bladder pain" in complaint:
        return "Renal&GU/dysuria_bladder_pain.md"
    if "abnormal urine" in complaint or "kidney test" in complaint:
        return "Renal&GU/azotemia_urinary_abnormalities.md"
    if "fluid or electrolyte" in complaint:
        return "Renal&GU/fluid_electrolyte_disturbances.md"
    if "cough" in complaint or "cold" in complaint:
        return "Respiratory/upper_respiratory.md"
    if "back pain" in complaint:
        return "Pain/back_pain.md"
    if "eye problem" in complaint:
        return "Eye/eye.md"
    if "ear" in complaint or "nose" in complaint or "throat" in complaint or "sore throat" in complaint or "sinus" in complaint:
        return "ENT/ent.md"
    if "allergy" in complaint:
        return "allergy.md"
    if "skin" in complaint or "wound" in complaint:
        return "Skin/skin_infection.md"
    if "trauma" in complaint or "injury" in complaint:
        return "Trauma/trauma.md"
    if "bruise" in complaint:
        return "Hema/bruise.md"
    if "bleeding" in complaint or "clotting" in complaint:
        return "Hema/bleeding_thrombosis.md"
    if "lymph" in complaint or "spleen" in complaint:
        return "Hema/lymph_nodes_spleen_enlargement.md"
    if "weakness" in complaint or "fatigue" in complaint:
        return "Neuro/weakness_fatigue.md"
    if "limb pain" in complaint or "swelling" in complaint:
        return "Pain/limb_pain_swelling.md"
    if "chronic" in complaint or "test or lab" in complaint or "other concern" in complaint or "not sure" in complaint:
        return "chronic_follow_up.md"
    return BRANCH_MODULES["palpitation"]


def _maybe_insert_initial_detail_question(flow_state: FlowState) -> None:
    if flow_state.branch != "initial_intake":
        return
    complaint_answer = flow_state.answers[-1] if flow_state.answers else None
    if not complaint_answer or complaint_answer.question_id != "INIT-3":
        return
    detail_question_id = next(
        (INITIAL_DETAIL_BY_GROUP_OPTION[option_id] for option_id in complaint_answer.selected_option_ids
         if option_id in INITIAL_DETAIL_BY_GROUP_OPTION),
        None,
    )
    if not detail_question_id or detail_question_id in flow_state.question_plan:
        return
    flow_state.question_plan.insert(flow_state.current_index, detail_question_id)


def _maybe_expand_initial_intake(flow_state: FlowState, registry: QuestionRegistry) -> None:
    if flow_state.branch != "initial_intake":
        return
    if flow_state.current_index < len(flow_state.question_plan):
        next_id = flow_state.question_plan[flow_state.current_index]
        if next_id.startswith("INIT-"):
            return
    module_key = _module_for_initial_answers(flow_state, registry)
    added_questions = registry.questions_for_module(module_key) + registry.universal_questions()
    flow_state.question_plan.extend(question.id for question in added_questions)
    flow_state.branch = module_key
    flow_state.case_id = f"vital-routed-{module_key.replace('/', '-').replace('.md', '')}"


def _selected_labels(question: Question, selected: list[str]) -> list[str]:
    return [option.label for option in question.options if option.id in selected]


def _hypertension_answer_requires_staff(question: Question, selected: list[str]) -> bool:
    if not selected:
        return False
    labels = _selected_labels(question, selected)
    combined = " ".join(labels).lower()
    if not combined or all(label.lower() in {"none", "not sure", "none / not sure"} for label in labels):
        return False
    symptom_terms = (
        "chest",
        "shortness",
        "trouble breathing",
        "severe headache",
        "blurred",
        "vision",
        "weakness",
        "confusion",
        "faint",
        "neurologic",
        "numbness",
        "speech",
    )
    return any(term in combined for term in symptom_terms)


def _maybe_staff_notify_from_answer(flow_state: FlowState, question: Question, selected: list[str]) -> None:
    if flow_state.branch != "hypertension":
        return
    if not _hypertension_answer_requires_staff(question, selected):
        return
    if has_staff_notify_flag(flow_state.flags):
        flow_state.state = "staff_notify_ready"
        flow_state.current_phase = "staff_notify"
        return
    flow_state.flags.append(ReviewFlag("staff_notify_hypertension_symptoms"))
    flow_state.state = "staff_notify_ready"
    flow_state.current_phase = "staff_notify"


def record_answer(flow_state: FlowState, body: dict[str, Any], question: Question, registry: QuestionRegistry | None = None) -> None:
    selected = selected_option_ids(body)
    value = answer_value(body)
    flow_state.answers.append(AnswerRecord(
        question_id=question.id,
        selected_option_ids=selected,
        numeric_value=value if isinstance(value, int | float) else None,
        text_value=value if isinstance(value, str) else None,
        request_id=body.get("request_id") or None,
        idempotency_key=body.get("idempotency_key") or None,
    ))
    flow_state.patient.record_answer(question, selected, value)
    if question.id == "INIT-1" and selected:
        sex = _display_label_for_selected(question, selected)
        if sex:
            flow_state.patient.sex = sex
            flow_state.patient_context["sex"] = sex
    if question.id == "INIT-2":
        age_value = value if isinstance(value, int | float) else _display_label_for_selected(question, selected)
        if age_value not in (None, ""):
            flow_state.patient.age = age_value
            flow_state.patient_context["age"] = age_value
    if question.id == "INIT-3" and selected:
        chief_concern = _display_label_for_selected(question, selected)
        flow_state.patient.chief_concern = chief_concern
        flow_state.patient_context["chief_concern"] = chief_concern
    if question.id.startswith("INIT-3A-") and selected:
        chief_concern = _display_label_for_selected(question, selected)
        if chief_concern and chief_concern.lower() != "not sure":
            flow_state.patient.chief_concern = chief_concern
            flow_state.patient_context["chief_concern"] = chief_concern
    flow_state.current_index += 1
    _maybe_insert_initial_detail_question(flow_state)
    _maybe_staff_notify_from_answer(flow_state, question, selected)
    if flow_state.state == "staff_notify_ready":
        return
    if registry:
        _maybe_expand_initial_intake(flow_state, registry)
    next_id = flow_state.question_plan[flow_state.current_index] if flow_state.current_index < len(flow_state.question_plan) else None
    flow_state.current_phase = "summary" if next_id is None else registry.get(next_id).phase if registry else question.phase
