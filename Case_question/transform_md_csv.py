#!/usr/bin/env python3
"""
Transform symptom-module Markdown question tables into a CSV file.

Default input:
  Case_question/Symptom_module/

Default output:
  Question_DB/symptom_questions.csv
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DEFAULT_INPUT = ROOT / "Symptom_module"
DEFAULT_OUTPUT = ROOT / ".." / "Question_DB" / "symptom_questions.csv"

OPTION_RE = re.compile(r"\[\s*\]\s*([^\[]+)")


def split_markdown_row(line: str) -> list[str]:
    line = line.strip()
    if not line.startswith("|") or not line.endswith("|"):
        return []
    return [cell.strip() for cell in line.strip("|").split("|")]


def is_separator_row(cells: list[str]) -> bool:
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.strip()) for cell in cells)


def extract_title(text: str, fallback: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def extract_options(answer_text: str) -> list[str]:
    options = [match.strip() for match in OPTION_RE.findall(answer_text)]
    if options:
        return options
    return [part.strip() for part in re.split(r"\s*/\s*|,\s*", answer_text) if part.strip()]


def iter_question_rows(md_file: Path, input_dir: Path) -> list[dict[str, str]]:
    text = md_file.read_text(encoding="utf-8")
    title = extract_title(text, md_file.stem.replace("_", " ").title())
    relative = md_file.relative_to(input_dir)
    category = relative.parts[0] if len(relative.parts) > 1 else ""

    rows: list[dict[str, str]] = []
    header: list[str] | None = None

    for line in text.splitlines():
        cells = split_markdown_row(line)
        if not cells:
            continue

        lowered = [cell.lower() for cell in cells]
        if {"id", "type", "question"}.issubset(set(lowered)):
            header = lowered
            continue

        if header is None or is_separator_row(cells):
            continue

        if len(cells) != len(header):
            continue

        record = dict(zip(header, cells))
        question_id = record.get("id", "")
        question_type = (
            record.get("question type")
            or record.get("question_type")
            or record.get("type")
            or ""
        )
        question = record.get("question", "")
        answers = record.get("answers") or record.get("options / note") or ""

        if not question_id or not question:
            continue

        options = extract_options(answers)
        rows.append(
            {
                "category": category,
                "module_title": title,
                "module_file": str(relative),
                "question_id": question_id,
                "question_type": question_type,
                "question": question,
                "answers": answers,
                "answer_options": "; ".join(options),
            }
        )

    return rows


def transform(input_dir: Path, output_file: Path) -> int:
    md_files = sorted(input_dir.rglob("*.md"))
    all_rows: list[dict[str, str]] = []

    for md_file in md_files:
        all_rows.extend(iter_question_rows(md_file, input_dir))

    output_file.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "category",
        "module_title",
        "module_file",
        "question_id",
        "question_type",
        "question",
        "answers",
        "answer_options",
    ]

    with output_file.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    return len(all_rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert symptom-module Markdown tables to CSV."
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=DEFAULT_INPUT,
        help=f"Markdown module directory. Default: {DEFAULT_INPUT}",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"CSV output path. Default: {DEFAULT_OUTPUT}",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    row_count = transform(args.input_dir, args.output)
    print(f"Wrote {row_count} question rows to {args.output}")


if __name__ == "__main__":
    main()
