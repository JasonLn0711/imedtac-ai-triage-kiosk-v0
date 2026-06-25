from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Any


DEFAULT_MODEL_ID = "Qwen/Qwen3.5-4B"
MAX_SUBJECTIVE_LINES = 10
MAX_LINE_LENGTH = 220


class SummaryGenerationError(RuntimeError):
    pass


def _model_id() -> str:
    return os.getenv("LLM_MODEL_ID", DEFAULT_MODEL_ID).strip() or DEFAULT_MODEL_ID


def _build_prompt(payload: dict[str, Any]) -> str:
    compact_payload = {
        "patient_record": payload.get("patient_record", {}),
        "subjective_template": payload.get("subjective_template", []),
        "objective": payload.get("objective", []),
        "vitals_observed": payload.get("vitals_observed", []),
        "scope_controls": payload.get("scope_controls", []),
    }
    return (
        "You are rewriting the Subjective section for a synthetic-data staff-review intake demo.\n"
        "Return JSON only, with this exact schema: {\"subjective\": [\"...\"]}.\n"
        "Use short SOAP-style lines like: 53 y/o M; C.C. Fever for 2 days; "
        "Detail: RUQ blunt pain, no vomit or diarrhea; Past history: HTN; "
        "Medication: Nil; Allergy: Nil; NRS: 6.\n"
        "Use only facts present in the payload. Do not add diagnosis, treatment advice, "
        "final triage or acuity, disposition, medication orders, or new clinical claims.\n"
        "Prefer Nil for absent history, medication, or allergy. Keep each line concise.\n\n"
        f"Payload:\n{json.dumps(compact_payload, ensure_ascii=False, sort_keys=True)}"
    )


def _extract_json(text: str) -> dict[str, Any]:
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, flags=re.DOTALL)
        if not match:
            raise SummaryGenerationError("Model output did not contain JSON.")
        try:
            value = json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise SummaryGenerationError("Model output JSON was malformed.") from exc
    if not isinstance(value, dict):
        raise SummaryGenerationError("Model output JSON must be an object.")
    return value


def validate_subjective(value: Any) -> list[str]:
    if not isinstance(value, list):
        raise SummaryGenerationError("Model output subjective must be a list.")
    lines = []
    for item in value[:MAX_SUBJECTIVE_LINES]:
        if not isinstance(item, str):
            continue
        line = item.strip()
        if line:
            lines.append(line[:MAX_LINE_LENGTH])
    if not lines:
        raise SummaryGenerationError("Model output subjective was empty.")
    return lines


@dataclass
class HuggingFaceSubjectiveSummarizer:
    model_id: str

    def __post_init__(self) -> None:
        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer
        except ImportError as exc:
            raise SummaryGenerationError("Install LLM_api dependencies with uv before starting the LLM service.") from exc

        self._torch = torch
        token = os.getenv("HF_TOKEN") or None
        trust_remote_code = os.getenv("LLM_TRUST_REMOTE_CODE", "false").strip().lower() in {"1", "true", "yes"}
        device = "cuda" if torch.cuda.is_available() else "cpu"
        torch_dtype = torch.bfloat16 if device == "cuda" else torch.float32
        self._tokenizer = AutoTokenizer.from_pretrained(
            self.model_id,
            token=token,
            trust_remote_code=trust_remote_code,
        )
        if self._tokenizer.pad_token_id is None and self._tokenizer.eos_token:
            self._tokenizer.pad_token = self._tokenizer.eos_token
        self._model = AutoModelForCausalLM.from_pretrained(
            self.model_id,
            token=token,
            trust_remote_code=trust_remote_code,
            torch_dtype=torch_dtype,
        )
        self._model.to(device)
        self._model.eval()

    def summarize_subjective(self, payload: dict[str, Any]) -> list[str]:
        messages = [
            {
                "role": "user",
                "content": _build_prompt(payload),
            }
        ]
        try:
            prompt = self._tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
            )
        except Exception:
            prompt = _build_prompt(payload)
        try:
            inputs = self._tokenizer(prompt, return_tensors="pt")
            target_device = next(self._model.parameters()).device
            inputs = {key: value.to(target_device) for key, value in inputs.items()}
            with self._torch.inference_mode():
                output_ids = self._model.generate(
                    **inputs,
                    max_new_tokens=2048,
                    do_sample=False,
                    pad_token_id=self._tokenizer.eos_token_id,
                )
        except Exception as exc:  # pragma: no cover - depends on local model runtime
            raise SummaryGenerationError("Model generation failed.") from exc

        prompt_length = inputs["input_ids"].shape[-1]
        generated_ids = output_ids[0][prompt_length:]
        content = self._tokenizer.decode(generated_ids, skip_special_tokens=True)
        print(content)
        return validate_subjective(_extract_json(content).get("subjective"))


_SUMMARIZER: HuggingFaceSubjectiveSummarizer | None = None


def get_summarizer() -> HuggingFaceSubjectiveSummarizer:
    global _SUMMARIZER
    if _SUMMARIZER is None:
        _SUMMARIZER = HuggingFaceSubjectiveSummarizer(_model_id())
    return _SUMMARIZER
