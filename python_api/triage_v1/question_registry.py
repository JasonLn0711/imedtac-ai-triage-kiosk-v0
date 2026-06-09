from __future__ import annotations

import csv
import re
from pathlib import Path

from .models import Question, QuestionOption


class RegistryError(ValueError):
    pass


def option_id(question_id: str, label: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return f"{question_id.lower()}_{slug or 'option'}"


def _question_type(value: str, labels: list[str]) -> str:
    lowered = value.lower()
    if "age" in lowered or "number" in lowered:
        return "number"
    if "free text" in lowered or "text" in lowered or "duration" in lowered:
        return "text"
    if "single" in lowered:
        return "single_choice"
    if not labels:
        return "text"
    return "multi_choice"


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
                labels = [part.strip() for part in (row.get("answer_options") or "").split(";") if part.strip()]
                options = [QuestionOption(option_id(question_id, label), label) for label in labels]
                none_option = next((option.id for option in options if option.label.lower() == "none"), None)
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
                self.add(question, module_key=module_key)

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

