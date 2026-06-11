#!/usr/bin/env python3
"""Validate demo governance registries and synthetic fixtures."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
SOURCE_ID_PREFIXES = ("FDA", "ENA", "AHA", "CDC", "ADA", "AUA", "HHS", "NIST", "LOCAL", "WU")


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise SystemExit(f"{path.relative_to(ROOT)} has no rows")
    return rows


def split_ids(value: str) -> list[str]:
    return [item.strip() for item in value.split(";") if item.strip()]


def main() -> int:
    sources = read_csv(DATA / "source_registry.csv")
    questions = read_csv(DATA / "question_registry.csv")
    api_questions = read_csv(DATA / "api_question_mapping.csv")
    flows = read_csv(DATA / "flow_registry.csv")

    source_ids = {row["source_id"] for row in sources}
    question_ids = {row["question_id"] for row in questions}
    flow_ids = {row["flow_id"] for row in flows}

    errors: list[str] = []

    for row in sources:
        if row["review_owner"].endswith("_tbd"):
            # This is allowed pre-review, but it should stay visible.
            pass
        if not row["url"]:
            errors.append(f"source {row['source_id']} is missing url")

    for row in questions:
        for source_id in split_ids(row["source_ids"]):
            if source_id not in source_ids:
                errors.append(
                    f"question {row['question_id']} references missing source {source_id}"
                )
        if row["evidence_status"] == "clinician-signoff-needed":
            if not row["demo_allowed"].startswith("blocked"):
                errors.append(
                    f"question {row['question_id']} needs signoff but is not blocked"
                )

    for row in api_questions:
        for question_id in split_ids(row["registry_refs"]):
            if question_id not in question_ids:
                errors.append(
                    f"api question {row['api_question_id']} references missing question {question_id}"
                )
        for source_id in split_ids(row["source_refs"]):
            if source_id not in source_ids:
                errors.append(
                    f"api question {row['api_question_id']} references missing source {source_id}"
                )

    for row in flows:
        fixture_path = ROOT / row["fixture_path"]
        if not fixture_path.exists():
            errors.append(f"flow {row['flow_id']} fixture missing: {row['fixture_path']}")
            continue
        fixture = json.loads(fixture_path.read_text(encoding="utf-8"))
        if fixture.get("status") != "synthetic_demo_only":
            errors.append(f"fixture {row['fixture_path']} is not synthetic_demo_only")
        if fixture.get("not_real_patient_data") is not True:
            errors.append(f"fixture {row['fixture_path']} lacks not_real_patient_data=true")
        if fixture.get("flow_id") != row["flow_id"]:
            errors.append(
                f"fixture {row['fixture_path']} flow_id does not match {row['flow_id']}"
            )
        for question_id in split_ids(row["question_ids"]):
            if question_id not in question_ids:
                errors.append(f"flow {row['flow_id']} references missing question {question_id}")
        for question_id in fixture.get("question_ids", []):
            if question_id not in question_ids:
                errors.append(
                    f"fixture {row['fixture_path']} references missing question {question_id}"
                )
        for source_id in fixture.get("source_ids", []):
            if source_id not in source_ids:
                errors.append(
                    f"fixture {row['fixture_path']} references missing source {source_id}"
                )

    id_pattern = re.compile(r"`([A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+)`")
    markdown_roots = [
        ROOT / "README.md",
        DATA / "README.md",
        ROOT / "docs",
        ROOT / "workstreams",
        ROOT / "handoff",
    ]
    markdown_files: list[Path] = []
    for root in markdown_roots:
        if root.is_file():
            markdown_files.append(root)
        elif root.exists():
            markdown_files.extend(root.rglob("*.md"))

    for path in markdown_files:
        text = path.read_text(encoding="utf-8")
        for match in id_pattern.finditer(text):
            identifier = match.group(1)
            if not identifier.startswith(SOURCE_ID_PREFIXES):
                continue
            if identifier not in source_ids:
                rel = path.relative_to(ROOT)
                errors.append(f"{rel} references missing source {identifier}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(
        "OK "
        f"sources={len(source_ids)} questions={len(question_ids)} "
        f"api_questions={len(api_questions)} flows={len(flow_ids)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
