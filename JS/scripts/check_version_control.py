#!/usr/bin/env python3
"""Check that demo/runtime/API version controls stay synchronized."""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")
FLOW_VERSION = re.compile(r"^v\d+\.\d+$")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    errors: list[str] = []
    manifest = read_json(ROOT / "data" / "version_manifest.json")
    project_version = manifest.get("project_version", "")
    expected_label = f"v{project_version}"

    if not SEMVER.match(project_version):
        errors.append(f"data/version_manifest.json project_version is not SemVer: {project_version}")

    package = read_json(ROOT / "package.json")
    if package.get("version") != project_version:
        errors.append(
            f"package.json version {package.get('version')} != manifest project_version {project_version}"
        )

    engine_text = (ROOT / "JS" / "core" / "triage_engine" / "index.js").read_text(encoding="utf-8")
    if f'versionLabel: "{expected_label}"' not in engine_text:
        errors.append(f"JS/core/triage_engine/index.js does not expose {expected_label}")

    html_text = (ROOT / "JS" / "app" / "triage-kiosk" / "index.html").read_text(encoding="utf-8")
    if f'id="versionBadge">{expected_label}</span>' not in html_text:
        errors.append(f"JS/app/triage-kiosk/index.html fallback badge is not {expected_label}")

    api_contract = manifest["api_contract"]
    for path in sorted((ROOT / "handoff" / "api-examples").glob("*.json")):
        payload = read_json(path)
        for key in (
            "api_version",
            "schema_version",
            "flow_version",
            "case_version",
            "fixture_version",
            "question_set_version",
            "wording_version",
        ):
            if payload.get(key) != api_contract[key]:
                errors.append(
                    f"{path.relative_to(ROOT)} {key}={payload.get(key)!r} != {api_contract[key]!r}"
                )
        future_workflow_files = set(api_contract.get("future_workflow_example_files", []))
        allowed_workflow_modes = {api_contract["workflow_mode"]}
        if path.name in future_workflow_files:
            allowed_workflow_modes.update(api_contract.get("future_workflow_modes", []))
        if payload.get("workflow_mode") not in allowed_workflow_modes:
            errors.append(
                f"{path.relative_to(ROOT)} workflow_mode={payload.get('workflow_mode')!r} not in {sorted(allowed_workflow_modes)!r}"
            )

    manifest_flow_versions = manifest.get("flow_versions", {})
    with (ROOT / "data" / "flow_registry.csv").open(newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            flow_id = row["flow_id"]
            version = row["version"]
            if not FLOW_VERSION.match(version):
                errors.append(f"data/flow_registry.csv {flow_id} version is not vMAJOR.MINOR: {version}")
            expected = manifest_flow_versions.get(flow_id)
            if expected and version != expected:
                errors.append(f"data/flow_registry.csv {flow_id} version {version} != manifest {expected}")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(
        "OK version_control "
        f"project={expected_label} api={api_contract['api_version']} "
        f"schema={api_contract['schema_version']} flow={api_contract['flow_version']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
