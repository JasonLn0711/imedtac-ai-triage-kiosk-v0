#!/usr/bin/env python3
"""Bump synchronized SemVer runtime version controls for the demo repo."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def bump(version: str, part: str) -> str:
    major, minor, patch = [int(item) for item in version.split(".")]
    if part == "major":
        return f"{major + 1}.0.0"
    if part == "minor":
        return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"


def replace_once(path: Path, pattern: str, replacement: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    next_text, count = re.subn(pattern, replacement, text, count=1)
    if count != 1:
        raise SystemExit(f"Could not update {label} in {path.relative_to(ROOT)}")
    path.write_text(next_text, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--part", choices=("major", "minor", "patch"))
    group.add_argument("--set", dest="set_version", help="Set exact SemVer, for example 1.2.5.")
    parser.add_argument("--date", default=date.today().isoformat(), help="Manifest update date.")
    args = parser.parse_args()

    manifest_path = ROOT / "data" / "version_manifest.json"
    package_path = ROOT / "package.json"
    engine_path = ROOT / "JS" / "core" / "triage_engine" / "index.js"
    html_path = ROOT / "JS" / "app" / "triage-kiosk" / "index.html"

    manifest = read_json(manifest_path)
    current = manifest["project_version"]
    next_version = args.set_version or bump(current, args.part)
    if not SEMVER.match(next_version):
        raise SystemExit(f"Not a SemVer version: {next_version}")

    package = read_json(package_path)
    package["version"] = next_version
    write_json(package_path, package)

    manifest["project_version"] = next_version
    manifest["updated_at"] = args.date
    write_json(manifest_path, manifest)

    replace_once(
        engine_path,
        r'versionLabel: "v\d+\.\d+\.\d+"',
        f'versionLabel: "v{next_version}"',
        "runtime version label",
    )
    replace_once(
        html_path,
        r'id="versionBadge">v\d+\.\d+\.\d+</span>',
        f'id="versionBadge">v{next_version}</span>',
        "HTML fallback version badge",
    )

    print(f"Bumped project version {current} -> {next_version}")
    print("Run: npm run version:check && npm run demo:ready")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
