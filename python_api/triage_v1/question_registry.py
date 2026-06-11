from __future__ import annotations

import csv
import re
from pathlib import Path

from .models import Question, QuestionOption

TACHYCARDIA_OPTION_IDS = {
    ("tachy-chief-concern", "Heart racing / palpitations"): "heart_racing",
    ("tachy-chief-concern", "Chest tightness / pressure"): "chest_tightness",
    ("tachy-chief-concern", "Shortness of breath or dizziness"): "breathing_or_dizzy",
    ("tachy-chief-concern", "Other / not sure"): "other_or_not_sure",
    ("tachy-onset", "Within the last hour"): "within_1_hour",
    ("tachy-onset", "A few hours ago"): "few_hours",
    ("tachy-onset", "About half a day"): "half_day",
    ("tachy-onset", "More than one day / not sure"): "more_than_1_day_or_not_sure",
    ("tachy-current-feeling", "Heart racing or pounding"): "heart_racing",
    ("tachy-current-feeling", "Chest tightness or heaviness"): "chest_heavy",
    ("tachy-current-feeling", "Chest pressure or pain"): "chest_pressure_pain",
    ("tachy-current-feeling", "Burning, sharp discomfort, or not sure"): "burning_sharp_or_not_sure",
    ("tachy-associated-symptoms", "Shortness of breath"): "short_breath",
    ("tachy-associated-symptoms", "Sweating, nausea, or unusual fatigue"): "sweating_nausea_fatigue",
    ("tachy-associated-symptoms", "Dizziness, lightheadedness, or fainting"): "dizzy_faint",
    ("tachy-associated-symptoms", "None of these"): "none_of_these",
    ("tachy-post-vital-heart-rate-cue", "My heart still feels fast"): "still_racing",
    ("tachy-post-vital-heart-rate-cue", "My chest still feels heavy / tight"): "chest_still_heavy",
    ("tachy-post-vital-heart-rate-cue", "Both"): "both",
    ("tachy-post-vital-heart-rate-cue", "Neither now / not sure"): "neither_or_not_sure",
    ("tachy-heart-history-meds", "Known rhythm problem"): "known_rhythm_problem",
    ("tachy-heart-history-meds", "Heart or blood-pressure medicine"): "heart_bp_medicine",
    ("tachy-heart-history-meds", "No known history / medicine"): "no_known",
    ("tachy-heart-history-meds", "Not sure, staff should confirm"): "staff_confirm",
    ("tachy-medication-allergy-confirm", "Medication allergy"): "med_allergy",
    ("tachy-medication-allergy-confirm", "Regular medicines"): "regular_medicines",
    ("tachy-medication-allergy-confirm", "No known medication allergy"): "none_known",
    ("tachy-medication-allergy-confirm", "Not sure"): "not_sure",
}

TACHYCARDIA_NONE_OPTION_IDS = {
    "tachy-associated-symptoms": "none_of_these",
    "tachy-post-vital-heart-rate-cue": "neither_or_not_sure",
}


class RegistryError(ValueError):
    pass


def option_id(question_id: str, label: str) -> str:
    if (question_id, label) in TACHYCARDIA_OPTION_IDS:
        return TACHYCARDIA_OPTION_IDS[(question_id, label)]
    slug = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return f"{question_id.lower()}_{slug or 'option'}"


def _question_type(value: str, labels: list[str]) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    aliases = {
        "single_choice": "single_choice",
        "single": "single_choice",
        "multiple_choice": "multi_choice",
        "multi_choice": "multi_choice",
        "multiple": "multi_choice",
        "multi": "multi_choice",
        "number": "number",
        "number_pad": "number",
        "numeric": "number",
        "time": "time",
        "text": "text",
        "free_text": "text",
        "age": "number",
        "duration": "text",
        "biological_gender": "single_choice",
    }
    if normalized in aliases:
        return aliases[normalized]
    if not labels:
        return "text"
    return "multi_choice"


def _display_labels(row: dict[str, str], option_values: list[str]) -> list[str]:
    raw_answers = row.get("answers") or ""
    labels = [part.strip() for part in re.findall(r"\[[ xX]\]\s*([^\[]+)", raw_answers) if part.strip()]
    if len(labels) == len(option_values):
        return labels
    return option_values


def question_to_dict(question: Question) -> dict:
    return {
        "registry_refs": question.registry_refs,
        "source_refs": question.source_refs,
        "evidence_status": question.evidence_status,
        "review_owner": "clinical_reviewer_tbd",
        "type": question.type,
        "ui_template": question.type,
        "text": question.text,
        "options": [{"id": option.id, "label": option.label} for option in question.options],
        "option_count": len(question.options),
        "none_option_id": question.none_option_id,
        "required": question.required,
        "allow_not_sure": question.allow_not_sure,
        "allow_skip": question.allow_skip,
        "max_selections": question.max_selections,
        "trigger_reason_codes": question.trigger_reason_codes,
        "summary_effect": question.summary_effect,
        "rendering_constraints": {
            "requires_no_scroll": True,
            "max_visible_options_without_scroll": 9,
        },
        "evidence_refs": question.evidence_refs,
        "demo_boundary": question.demo_boundary,
        "id": question.id,
    }


class QuestionRegistry:
    def __init__(
        self,
        csv_path: Path,
        seed_questions: list[Question] | None = None,
        initial_csv_path: Path | None = None,
        universal_csv_path: Path | None = None,
    ) -> None:
        self.csv_path = csv_path
        self.initial_csv_path = initial_csv_path
        self.universal_csv_path = universal_csv_path
        self._questions: dict[str, Question] = {}
        self._module_index: dict[str, list[str]] = {}
        for question in seed_questions or []:
            self.add(question, module_key="tachycardia_compatibility")
        self._load_csv(self.csv_path, phase="symptom_specific")
        if self.initial_csv_path:
            self._load_csv(self.initial_csv_path, phase="initial", module_key_override="initial_intake")
        if self.universal_csv_path:
            self._load_csv(self.universal_csv_path, phase="universal", module_key_override="universal_intake")

    def add(self, question: Question, module_key: str | None = None) -> None:
        self._questions[question.id] = question
        if module_key:
            self._module_index.setdefault(module_key, []).append(question.id)

    def _load_csv(self, csv_path: Path, phase: str, module_key_override: str | None = None) -> None:
        if not csv_path.exists():
            return
        with csv_path.open(encoding="utf-8", newline="") as csv_file:
            for row in csv.DictReader(csv_file):
                question_id = (row.get("question_id") or "").strip()
                text = (row.get("question") or "").strip()
                if not question_id or not text:
                    continue
                option_values = [part.strip() for part in (row.get("answer_options") or "").split(";") if part.strip()]
                labels = _display_labels(row, option_values)
                options = [
                    QuestionOption(option_id(question_id, option_value), label)
                    for option_value, label in zip(option_values, labels)
                ]
                none_option = TACHYCARDIA_NONE_OPTION_IDS.get(
                    question_id,
                    next((option.id for option in options if option.label.lower() == "none"), None),
                )
                question_type = _question_type(row.get("question_type") or "", labels)
                question = Question(
                    id=question_id,
                    phase=phase,
                    type=question_type,
                    text=text,
                    options=options,
                    max_selections=1 if question_type == "single_choice" else max(1, len(options)),
                    trigger_reason_codes=[f"module_{question_id.lower()}"],
                    source_refs=[row.get("module_file") or str(csv_path.name)],
                    evidence_status="clinical-review-needed",
                    summary_effect=f"Adds {row.get('module_title') or 'symptom module'} answer context to the staff-review summary.",
                    registry_refs=[question_id],
                    none_option_id=none_option,
                )
                module_key = module_key_override or (row.get("module_file") or "").strip()
                if module_key_override == "initial_intake" and question_id.startswith("INIT-3A-"):
                    module_key = "initial_detail"
                self.add(question, module_key=module_key)
                if module_key == "Heart/tachycardia.md":
                    self.add(question, module_key="tachycardia_compatibility")

    def get(self, question_id: str) -> Question:
        try:
            return self._questions[question_id]
        except KeyError as exc:
            raise RegistryError(f"Unknown question_id {question_id}") from exc

    def questions_for_module(self, module_key: str) -> list[Question]:
        return [self.get(question_id) for question_id in self._module_index.get(module_key, [])]

    def initial_questions(self) -> list[Question]:
        return self.questions_for_module("initial_intake")

    def universal_questions(self) -> list[Question]:
        csv_questions = self.questions_for_module("universal_intake")
        if csv_questions:
            return csv_questions
        return [
            Question(
                id="universal-history-medications",
                phase="universal",
                type="multi_choice",
                text="Is there any history or medication context staff should confirm?",
                options=[
                    QuestionOption("known_medical_history", "Known medical history"),
                    QuestionOption("regular_medicines", "Regular medicines"),
                    QuestionOption("no_known_history_meds", "No known history or medicines"),
                    QuestionOption("not_sure", "Not sure"),
                ],
                max_selections=4,
                trigger_reason_codes=["history_medication_context"],
                source_refs=["LOCAL-PROTOCOL-TBD"],
                summary_effect="Adds general history and medication context for staff confirmation.",
            ),
            Question(
                id="universal-medication-allergy",
                phase="universal",
                type="multi_choice",
                text="Do you have medication allergies staff should confirm?",
                options=[
                    QuestionOption("med_allergy", "Medication allergy"),
                    QuestionOption("no_known_med_allergy", "No known medication allergy"),
                    QuestionOption("regular_medicines", "Regular medicines"),
                    QuestionOption("not_sure", "Not sure"),
                ],
                max_selections=4,
                trigger_reason_codes=["medication_allergy_context"],
                source_refs=["LOCAL-PROTOCOL-TBD"],
                summary_effect="Adds medication allergy context for staff confirmation.",
            ),
        ]
