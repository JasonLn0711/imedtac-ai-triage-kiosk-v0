#!/usr/bin/env python3
"""Hydrate tachycardia dynamic manifest governance fields from CSV registries."""

from __future__ import annotations

import argparse
import csv
import json
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
MANIFEST_PATH = DATA / "question_manifest.tachycardia.v0.3.json"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def split_ids(value: str) -> list[str]:
    return [item.strip() for item in value.split(";") if item.strip()]


def demo_allowed_from_registry(value: str) -> bool:
    return value.startswith("yes_demo_only")


def build_manifest() -> dict:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    api_rows = {row["api_question_id"]: row for row in read_csv(DATA / "api_question_mapping.csv")}
    question_rows = {row["question_id"]: row for row in read_csv(DATA / "question_registry.csv")}

    built = deepcopy(manifest)
    for question in built["questions"]:
        api_row = api_rows.get(question["id"])
        if not api_row:
            raise SystemExit(f"missing api_question_mapping row for {question['id']}")

        registry_refs = split_ids(api_row["registry_refs"])
        registry_allowed = [
            demo_allowed_from_registry(question_rows[registry_ref]["demo_allowed"])
            for registry_ref in registry_refs
            if registry_ref in question_rows
        ]
        if len(registry_allowed) != len(registry_refs):
            missing = [registry_ref for registry_ref in registry_refs if registry_ref not in question_rows]
            raise SystemExit(f"missing question_registry rows for {question['id']}: {missing}")

        question["registry_refs"] = registry_refs
        question["source_refs"] = split_ids(api_row["source_refs"])
        question["evidence_status"] = api_row["evidence_status"]
        question["review_owner"] = api_row["review_owner"]
        question["demo_allowed"] = all(registry_allowed)

    return built


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if the built manifest differs from the current file.")
    args = parser.parse_args()

    built = build_manifest()
    current = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    rendered = json.dumps(built, ensure_ascii=False, indent=2) + "\n"

    if args.check:
      current_rendered = json.dumps(current, ensure_ascii=False, indent=2) + "\n"
      if rendered != current_rendered:
          print("ERROR: data/question_manifest.tachycardia.v0.3.json is not synchronized with CSV registries")
          return 1
      print("OK tachy_manifest_build check")
      return 0

    MANIFEST_PATH.write_text(rendered, encoding="utf-8")
    print(f"Updated {MANIFEST_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
