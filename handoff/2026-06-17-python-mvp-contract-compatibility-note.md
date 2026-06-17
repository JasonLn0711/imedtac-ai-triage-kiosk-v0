---
id: 2026-06-17-python-mvp-contract-compatibility-note
title: "Python MVP Contract Compatibility Note"
date: 2026-06-17
topic: ai-triage
type: compatibility-note
status: active
related:
  - ../API.md
  - ../handoff/api-examples/2026-05-21-start-session-response-question.json
  - ../handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json
  - ../python_api/README.md
  - ../source/2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync/source.md
  - ../source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
---

# Python MVP Contract Compatibility Note

## Recommendation

Use Python/FastAPI as the canonical AI triage demo backend while preserving the
externally discussed imedtac API contract. The backend can adopt doebow's
`Question_DB/` as the canonical question source because the imedtac-facing
contract is controlled by the Python adapter, not by the internal routing
implementation.

## Current External Contract

The external test contract remains:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
OPTIONS /api/triage-demo/sessions
OPTIONS /api/triage-demo/sessions/{session_key}/answers
```

Required compatibility controls:

```text
workflow_mode = post_measurement_only
measurement_state = complete
vitals_ready = true
question.type = single_choice | multi_choice
progress.current and progress.expected_total are present
status = question | summary | error for the first imedtac MVP path
staff_review_summary is the terminal staff-review payload
Authorization remains Bearer <demo token> when enabled
CORS remains compatible with http://localhost and http://localhost:5174
```

## Proposed Runtime

```text
Python FastAPI route layer
-> python_api/triage_contract.py compatibility adapter
-> python_api/triage_v1/ routing and summary engine
-> Question_DB/*.csv canonical question bank
```

The old JS API implementation is retained only as legacy/reference material
until fully removed. It is no longer the canonical imedtac API runtime.

## Compatibility Decision

| Item | Decision |
| --- | --- |
| Endpoint paths unchanged | yes |
| Required request shape unchanged | yes |
| Bearer-token header format unchanged | yes |
| CORS baseline unchanged | yes |
| Question object schema unchanged | yes |
| `single_choice` / `multi_choice` only for MVP | yes |
| doebow `Number` / `Time` question types | transformed to option buckets in imedtac-facing mode |
| Broader doebow branches | allowed behind the same response envelope |
| staff-notify gate | internal safety gate wrapped as `status=summary` for the first imedtac MVP path; UI support for a separate `staff_notify` status remains a future change request |
| JS backend runtime | legacy / non-canonical after Python scripts are wired |

## Compatibility Risk

The main risk is version-field drift. The Python runtime must not require
imedtac to parse new values such as `vital-rules-router-v1-demo` or
`vital-routed-*` during the first MVP compatibility test. Internal branch and
routing details may be logged or returned only as optional debug metadata.

## Owner And Test Gate

Owner: NYCU / Jason with doebow question-bank review.

Target gate:

```bash
uv run --project python_api python -m pytest python_api/tests
npm run smoke
git diff --check
```

Executed verification on `2026-06-17`:

```text
npm run test:python
-> 31 passed, 1 Starlette/httpx deprecation warning

npm test
-> 33 JS unit tests passed
-> 41 JS contract tests passed

npm run smoke
-> AI triage kiosk demo smoke check passed

npm run demo:ready
-> Python tests, JS tests, smoke, build, and git diff --check passed

npm start
-> FastAPI started on http://127.0.0.1:8000
-> GET /healthz returned status ok
-> POST /api/triage-demo/sessions returned the preserved v0.2 contract fields
   and a single_choice first question
```

Docker compose verification was not available on this local machine:

```text
docker compose config -> docker: unknown command: docker compose
docker-compose config -> zsh:1: command not found: docker-compose
```

The Dockerfile and compose files have been updated to the Python/FastAPI
runtime path, but container validation needs a machine with Docker Compose
installed.

Release note: do not send an imedtac testing notice until these gates pass and
the private bearer-token delivery path is ready.
