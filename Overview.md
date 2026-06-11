# Code Structure Overview

This repo is the execution home for the English AI triage kiosk demo for
慧誠智醫（imedtac Co., Ltd.）. The current system demonstrates a synthetic-data,
post-measurement intake workflow: iMVS-shaped vital data enters a governed
question loop, the demo collects choice-only answers, and the runtime returns a
staff-review summary for human review.

The repo is intentionally organized around a demo boundary. Runtime code,
fixtures, API contract examples, source-governance registries, meeting/source
records, and handoff drafts are kept separate so the demo can move quickly
without turning into a production clinical triage product.

## Runtime Entry Points

| Path | Role |
| --- | --- |
| `app/triage-kiosk/` | Browser-based English kiosk demo. This is the main patient-facing demo surface. |
| `app/summary-review/` | Staff-facing summary review prototype and fallback page for reviewing the generated demo summary. |
| `core/triage_engine/` | Shared JavaScript triage-support engine used by the browser demo and tests. |
| `api/triage-demo/` | Serverless-style API route files for the June demo contract. |
| `api/lib/triage-demo-contract.js` | Shared API contract implementation for session creation, answer submission, summary output, auth checks, CORS, idempotency, and error handling. |
| `scripts/mock-api-server.js` | Local rehearsal API server for the same session and answer flow. |
| `demo/fixtures/` | Synthetic iMVS-shaped demo payloads used by the runtime and contract examples. |

## Top-Level Folders

### `app/`

Contains browser-facing demo screens.

| Path | Purpose |
| --- | --- |
| `app/index.html` | Lightweight app landing page. |
| `app/triage-kiosk/index.html` | Main kiosk demo page. |
| `app/triage-kiosk/triage-kiosk.js` | Frontend controller for case selection, question rendering, answer collection, vital cues, and summary display. |
| `app/summary-review/index.html` | Staff summary review page shell. |
| `app/summary-review/SummaryReview.tsx` | Summary review UI source used for the staff-review surface. |
| `app/summary-review/fallback.html` | Static fallback page when the richer review page is not available. |
| `app/summary-review/assets/` | Summary-review visual assets. |
| `app/shared/styles.css` | Shared demo styling used by the app surfaces. |

The `app/` folder is safe frontend runtime material. It is included in the
sanitized Vercel build output.

### `core/`

Contains shared runtime logic that should stay independent from the browser and
server wrappers.

| Path | Purpose |
| --- | --- |
| `core/triage_engine/index.js` | Demo question bank, case definitions, vital cue display logic, answer handling, source-family display, and staff-review summary generation. |

This code supports the demo workflow. It must preserve the boundary: staff-review
intake support only, not diagnosis, treatment advice, final acuity assignment,
or HIS / EMR / FHIR writeback.

### `api/`

Contains the API implementation used for the imedtac-facing demo contract.

| Path | Purpose |
| --- | --- |
| `api/triage-demo/sessions.js` | Starts a demo session and returns a `session_key` plus the first question. |
| `api/triage-demo/sessions/[session_key]/answers.js` | Accepts an answer for the current question and returns the next question or the staff-review summary. |
| `api/triage-demo/sessions/[session_key]/summary.js` | Returns a session summary for review support. |
| `api/lib/triage-demo-contract.js` | Contract logic shared by API routes and the local mock API server. |

The current June integration shape is intentionally small: start session, submit
answers, then return a staff-review summary. The contract is synthetic-data
demo infrastructure, not a live hospital integration.

### `demo/`

Contains synthetic demo payloads.

| Path | Purpose |
| --- | --- |
| `demo/fixtures/` | Fake iMVS-shaped vital-sign payloads for chest pressure, fever / urinary symptoms, respiratory handoff, tachycardia live demo, and partial-vitals rehearsal. |
| `demo/fixtures/README.md` | Fixture inventory and data boundary. |

These fixtures must not contain real patient identifiers, live endpoint URLs,
credentials, ASR audio, or hospital data.

### `data/`

Contains governance registries and version metadata.

| Path | Purpose |
| --- | --- |
| `data/source_registry.csv` | Source IDs, intended use, limits, allowed-use status, and review ownership. |
| `data/question_registry.csv` | Patient-facing questions mapped to triggers, sources, clinical purpose, output effect, evidence status, and reviewer ownership. |
| `data/api_question_mapping.csv` | Runtime API question IDs mapped back to registry question IDs and evidence metadata. |
| `data/flow_registry.csv` | Demo flows mapped to fixtures, question IDs, allowed outputs, forbidden outputs, and review owner. |
| `data/version_manifest.json` | Canonical version manifest checked against runtime files and examples. |
| `data/README.md` | Registry rules and validation instructions. |

The registries are review scaffolding. They help keep the demo deterministic and
source-governed, but they are not clinical validation evidence.

### `scripts/`

Contains local utility scripts and verification checks.

| Path | Purpose |
| --- | --- |
| `scripts/checks/smoke-demo.js` | Smoke test for the browser demo runtime. |
| `scripts/mock-api-server.js` | Local Node API server for rehearsal and contract testing. |
| `scripts/build-vercel.js` | Builds a sanitized `dist/` folder containing frontend runtime only. |
| `scripts/check_version_control.py` | Verifies synchronized runtime, schema, API, and manifest versions. |
| `scripts/bump_version.py` | Bumps the synchronized project version. |
| `scripts/check_governance_registries.py` | Validates registry references and synthetic-demo-only fixture boundaries. |

The main readiness command is:

```bash
npm run demo:ready
```

### `tests/`

Contains automated checks for runtime behavior and API contract behavior.

| Path | Purpose |
| --- | --- |
| `tests/unit/triage-engine.test.js` | Focused tests for question selection, summary behavior, and demo-only safety boundaries. |
| `tests/contract/triage-demo-api.test.js` | Contract tests for the session API, answer flow, summary behavior, errors, and compatibility expectations. |

### `docs/`

Contains synthesized project knowledge, architecture notes, policies, and
governance documents.

Important files include:

| Path | Purpose |
| --- | --- |
| `docs/architecture-insertion-and-clinical-grounding.md` | Core architecture note for AI insertion after vital measurement and vital-aware dynamic questioning. |
| `docs/demo-acceptance-criteria.md` | Functional, governance, data, and presentation gates for demo readiness. |
| `docs/demo-script-for-presenter.md` | Safe presenter script and forbidden claims. |
| `docs/runtime-to-governance-map.md` | Map from runtime questions to registry and source-family coverage. |
| `docs/vercel-frontend-runtime.md` | Notes on the sanitized frontend deployment boundary. |
| `docs/version-control-policy.md` | Versioning policy for runtime, API, schemas, flows, and readiness checks. |
| `docs/source-index.md` | Index of copied source bundles and upstream context. |
| `docs/wu-instruction-register.md` | Consolidated Prof. Wu instructions and company-side clarifications. |
| `docs/writing-method-policy.md` | Required confident, affirmative, product-minded writing style for handoffs and company-facing artifacts. |
| `docs/repo-organization.md` | Folder ownership and repo routing. |
| `docs/repo-relationships.md` | Ownership split between this repo, planning, and related repos. |

Before implementation work, read
`docs/architecture-insertion-and-clinical-grounding.md`.

Before broad context answers, read `docs/source-index.md` and
`docs/wu-instruction-register.md`.

### `handoff/`

Contains handoff drafts, API examples, reviewer packets, and company-facing or
Prof. Wu-facing work products.

| Path | Purpose |
| --- | --- |
| `handoff/README.md` | Current handoff map, active integration summary, and open external-facing constraints. |
| `handoff/api-examples/` | JSON request / response examples for the June two-endpoint API flow and error cases. |
| `handoff/reviewer-packet/` | Review-support materials for claim language, human handoff, validation, data lifecycle, and go/no-go review. |
| `handoff/patent/` | Patent-sensitive protection packet and disclosure draft. |
| `handoff/*.md` | Dated handoff drafts, meeting packets, API pre-reads, runbooks, response plans, and integration notes. |

Handoff files are not runtime code. They preserve what has been communicated,
what is ready to share, and what needs review before external use.

### `decisions/`

Contains dated product, API, governance, and external-commitment decisions.

Decision notes are used when a product direction changes, a demo boundary is
locked, or an external commitment needs to be preserved. These files are part of
the repo's change-control memory.

### `workstreams/`

Contains active derived work by execution lane.

Current workstreams cover insertion point, clinical evidence governance, MVP
scope, urology-reference reuse, first-principles gates, June demo planning, and
guided ASR / structured questionnaire positioning.

Workstreams are for active thinking and execution notes. They are separate from
raw meeting sources and from final handoff drafts.

### `source/`

Contains copied source bundles, meeting records, transcripts, emails, Teams /
LINE notes, attachments, and upstream Prof. Wu context.

This folder preserves project evidence and external-commitment records. It
should be treated as source material, not as editable canonical meeting minutes.
Credential values, private tokens, and live secrets must not be stored here.

Important source families include:

| Path | Purpose |
| --- | --- |
| `source/2026-05-12-imedtac-company-ai-triage-sync/` | Company-provided iMVS product-spec and API baseline context. |
| `source/2026-05-21-imedtac-engineering-sync/` | Engineering sync record confirming the June post-measurement flow. |
| `source/2026-05-22-nycu-sent-api-reply-email/` | Sent API reply record preserving externally communicated contract details. |
| `source/2026-05-27-*` | Later Teams / implementation follow-up records around summary review and UI option behavior. |
| `source/upstream-wu-context/` | Earlier Prof. Wu context copied from planning. |

### `planning-bridge/`

Contains snapshot copies from the planning repo and related project locators.

This folder helps the demo repo stay traceable to planning context, but it is
not the live planning source of truth. Current priority, capacity, status,
deadlines, and locator notes belong in `../planning-everything-track`.

### `dist/`

Generated by:

```bash
npm run build
```

The build script creates a sanitized frontend runtime containing only:

```text
app/
core/
demo/
index.html
```

It intentionally excludes private folders such as `source/`, `handoff/`,
`docs/`, `planning-bridge/`, and `decisions/`.

`dist/` is build output, not source-of-truth material.

## Root Files

| Path | Purpose |
| --- | --- |
| `README.md` | Main project entry point, mission, current frame, run commands, and safety boundary. |
| `CHANGELOG.md` | Versioned change history. |
| `AGENTS.md` | Repo instructions for Codex / agent behavior, safety rules, writing method, and change-control expectations. |
| `package.json` | Node scripts for local server, mock API, tests, smoke checks, version checks, and build. |
| `vercel.json` | Vercel deployment configuration. |
| `Overview.md` | This structure overview. |

## Current Demo Flow

```text
iMVS vital-sign measurement complete
-> measured or synthetic vital payload enters the NYCU demo API / local runtime
-> session starts and returns the first question
-> kiosk renders single-choice or multi-choice questions
-> answer loop continues with session_key
-> staff_review_summary is returned
-> staff / clinician / demo-customer reviews the summary
```

The runtime is deliberately narrow. It supports synthetic measurement-time
intake, synthetic vital payloads, governed English questions, and staff-review
summary generation. It does not diagnose, recommend treatment, assign a final
triage level, order emergency care, or write to HIS / EMR / FHIR.

## Common Commands

```bash
npm start
npm run mock:api
npm test
npm run smoke
npm run version:check
npm run build
npm run demo:ready
```

Use `npm run demo:ready` before a demo or handoff rehearsal because it combines
version checks, unit and contract tests, smoke checks, frontend build, and Git
whitespace validation.
