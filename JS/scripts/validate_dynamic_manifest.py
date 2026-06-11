#!/usr/bin/env python3
"""Validate dynamic-engine manifest, effects, policy, templates, and vector index."""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def split_ids(value: str) -> list[str]:
    return [item.strip() for item in value.split(";") if item.strip()]


def main() -> int:
    manifest = read_json(DATA / "question_manifest.tachycardia.v0.3.json")
    effects = read_json(DATA / "answer_effects.tachycardia.v0.3.json")
    policy = read_json(DATA / "routing_policy.tachycardia.v0.3.json")
    templates = read_json(DATA / "summary_templates.tachycardia.v0.3.json")
    vector_index = read_json(DATA / "vector_index/tachycardia.v0.3.json")
    sources = {row["source_id"] for row in read_csv(DATA / "source_registry.csv")}
    registry_questions = {row["question_id"]: row for row in read_csv(DATA / "question_registry.csv")}
    api_questions = {row["api_question_id"]: row for row in read_csv(DATA / "api_question_mapping.csv")}

    errors: list[str] = []
    question_ids = set()
    option_keys = set()

    for question in manifest.get("questions", []):
        question_id = question.get("id")
        if not question_id:
            errors.append("manifest question missing id")
            continue
        if question_id in question_ids:
            errors.append(f"duplicate question id {question_id}")
        question_ids.add(question_id)
        if question_id not in api_questions:
            errors.append(f"{question_id} missing api_question_mapping row")
        if question.get("demo_allowed") is not True:
            errors.append(f"{question_id} is not demo_allowed=true")
        if question.get("type") not in {"single_choice", "multi_choice"}:
            errors.append(f"{question_id} unsupported type {question.get('type')}")
        options = question.get("options", [])
        if not (2 <= len(options) <= 9):
            errors.append(f"{question_id} option count must be 2-9")
        option_ids = [option.get("id") for option in options]
        if len(option_ids) != len(set(option_ids)):
            errors.append(f"{question_id} has duplicate option ids")
        for registry_ref in question.get("registry_refs", []):
            if registry_ref not in registry_questions:
                errors.append(f"{question_id} references missing registry row {registry_ref}")
            elif not registry_questions[registry_ref]["demo_allowed"].startswith("yes_demo_only"):
                errors.append(f"{question_id} registry row {registry_ref} is not demo allowed")
        for source_ref in question.get("source_refs", []):
            if source_ref not in sources:
                errors.append(f"{question_id} references missing source {source_ref}")
        for option in options:
            if not option.get("id") or not option.get("label"):
                errors.append(f"{question_id} option missing id or label")
            if len(option.get("label", "")) > 80:
                errors.append(f"{question_id}.{option.get('id')} label too long")
            option_keys.add(f"{question_id}.{option.get('id')}")

    for option_key in option_keys:
        if option_key not in effects.get("option_effects", {}):
            errors.append(f"missing answer effect for {option_key}")

    for effect_key in effects.get("option_effects", {}):
        if effect_key not in option_keys:
            errors.append(f"answer effect references missing option {effect_key}")

    for next_question_id in policy.get("default_next_question_by_id", {}).values():
        if next_question_id not in question_ids:
            errors.append(f"routing policy references missing default question {next_question_id}")
    for rule in policy.get("dynamic_rules", []):
        if rule.get("from_question_id") not in question_ids:
            errors.append(f"routing rule {rule.get('id')} from_question_id missing")
        if rule.get("selected_next_question_id") not in question_ids:
            errors.append(f"routing rule {rule.get('id')} selected question missing")
        for candidate_id in rule.get("candidate_question_ids", []):
            if candidate_id not in question_ids:
                errors.append(f"routing rule {rule.get('id')} candidate missing {candidate_id}")

    if not templates.get("scope_controls"):
        errors.append("summary templates missing scope_controls")

    index_rows = vector_index.get("rows", [])
    index_question_rows = [row for row in index_rows if row.get("row_type") == "question"]
    index_option_rows = [row for row in index_rows if row.get("row_type") == "option"]
    index_question_ids = {row["question_id"] for row in index_question_rows}
    if index_question_ids != question_ids:
        errors.append("vector index question ids do not match manifest question ids")
    index_option_keys = {row.get("option_key") for row in index_option_rows}
    if index_option_keys != option_keys:
        errors.append("vector index option keys do not match manifest option keys")
    expected_counts = vector_index.get("row_counts", {})
    if expected_counts.get("questions") != len(question_ids):
        errors.append("vector index question row count metadata is incorrect")
    if expected_counts.get("options") != len(option_keys):
        errors.append("vector index option row count metadata is incorrect")
    for row in index_rows:
        if row.get("row_type") not in {"question", "option"}:
            errors.append(f"vector index row has unsupported row_type {row.get('row_type')}")
        if not row.get("tokens"):
            errors.append(f"vector index row {row.get('row_id')} has no tokens")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(
        "OK dynamic_manifest "
        f"manifest={manifest['manifest_version']} questions={len(question_ids)} effects={len(effects['option_effects'])}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
