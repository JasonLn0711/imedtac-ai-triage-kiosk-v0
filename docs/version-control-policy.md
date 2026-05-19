---
id: version-control-policy
title: "Automated Version Control Policy"
date: 2026-05-19
topic: ai-triage
type: governance
status: active
---

# Automated Version Control Policy

## Decision

Use a lightweight automated version-control layer. This supplements the existing
manual version concepts already present in `package.json`, runtime
`VERSION.versionLabel`, API examples, and `data/flow_registry.csv`.

The project version is SemVer:

```text
vMAJOR.MINOR.PATCH
```

Current runtime / packet version:

```text
v0.2.0
```

## Controlled Version Items

| Item | Location | Automation |
| --- | --- | --- |
| Project SemVer | `data/version_manifest.json`, `package.json`, runtime `VERSION.versionLabel`, HTML fallback badge | `npm run version:check`; `python3 scripts/bump_version.py --set 1.2.5` |
| API version | `data/version_manifest.json`, `handoff/api-examples/*.json` | `npm run version:check` |
| Schema version | `data/version_manifest.json`, `handoff/api-examples/*.json` | `npm run version:check` |
| Flow version | `data/version_manifest.json`, `handoff/api-examples/*.json`, `data/flow_registry.csv` | `npm run version:check` |
| Case / fixture version | `data/version_manifest.json`, `handoff/api-examples/*.json`, `demo/fixtures/*.json` | `npm run version:check`, `python3 scripts/check_governance_registries.py` |
| Question set version | `data/version_manifest.json`, `handoff/api-examples/*.json`, `data/api_question_mapping.csv` | `npm run version:check`, `python3 scripts/check_governance_registries.py` |
| Wording version | `data/version_manifest.json`, `handoff/api-examples/*.json` | `npm run version:check` |
| Safety wording | runtime, fixtures, API examples | `npm run smoke` |
| Demo readiness | version, tests, smoke, build, diff hygiene | `npm run demo:ready` |

## Version Change Rules

### Major

Bump major when intended use, stakeholder-facing boundary, or integration risk
class changes.

Examples:

- real patient data path is introduced;
- production HIS / EMR / FHIR writeback is added;
- final acuity / autonomous clinical decisioning becomes part of scope;
- API removes or changes required fields in a non-compatible way.

Major bumps require explicit project-owner and clinical/product review.

### Minor

Bump minor when demo behavior or integration contract changes, but the demo
boundary stays the same.

Examples:

- add two-phase question flow;
- add a new synthetic case;
- add an optional endpoint or optional fields;
- change question ordering logic;
- change `question_set_version`, `case_version`, or `wording_version`;
- change staff-summary structure while staying staff-only and non-diagnostic.

### Patch

Bump patch for corrections that do not change workflow behavior or contract.

Examples:

- typo fixes;
- doc clarifications;
- CSS / layout polish;
- test-only hardening;
- fixture label correction that does not change clinical meaning.

## Commands

Check consistency:

```bash
npm run version:check
```

Bump patch / minor / major:

```bash
npm run version:bump:patch
npm run version:bump:minor
npm run version:bump:major
```

Set an exact version:

```bash
python3 scripts/bump_version.py --set 1.2.5
```

Full readiness gate:

```bash
npm run demo:ready
```

## Current Interpretation

`v0.2.0` is appropriate because the repo moved beyond the initial `v0.1.0`
choice-only baseline by adding:

- two-phase pre-vital / post-vital question flow;
- API v0.2 draft fields;
- respiratory flow registry and API question mapping;
- case / fixture / question-set / wording version controls;
- expert-reviewed wording controls;
- automated version and safety checks.
