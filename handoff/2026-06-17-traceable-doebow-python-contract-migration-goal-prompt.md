---
id: 2026-06-17-traceable-doebow-python-contract-migration-goal-prompt
title: "Traceable Doebow Question Bank And Python API Contract Migration Goal Prompt"
date: 2026-06-17
topic: ai-triage
type: goal-prompt
status: ready-for-execution
related:
  - ../API.md
  - ../README.md
  - ../python_api/README.md
  - ../python_api/main.py
  - ../python_api/triage_contract.py
  - ../python_api/triage_v1/
  - ../Question_DB/
  - ../source/2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync/source.md
  - ../source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
  - ../source/2026-05-22-nycu-sent-api-reply-email/source.md
  - ../source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./api-examples/
  - ./2026-06-17-contract-compatible-python-mvp-goal-prompt.md
  - ./2026-06-17-python-mvp-contract-compatibility-note.md
---

# Traceable Doebow Question Bank And Python API Contract Migration Goal Prompt

## Recommendation

Adopt doebow's `Question_DB/` question bank as the canonical runtime question
source, retire the JavaScript backend as the imedtac-facing server path, and
make `python_api/` the canonical FastAPI contract adapter for the AI triage
kiosk demo.

The imedtac-facing API contract should remain stable:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
same request semantics
same response envelope
same supported MVP question widgets
same staff_review_summary terminal contract
```

The implementation can change internally. The external integration should not
surprise 慧誠智醫（imedtac Co., Ltd.）or require their frontend to add a new
endpoint, parser, token format, widget, status branch, or answer protocol before
the next compatibility test.

## Traceable Evidence Map

| Evidence | Stable signal | Implementation implication |
| --- | --- | --- |
| `source/2026-05-21-imedtac-engineering-sync/` | June path is post-measurement: iMVS completes vital measurement, sends payload, receives question loop, then displays staff-review summary. | Keep `workflow_mode=post_measurement_only`, `measurement_state=complete`, and `vitals_ready=true` for normal MVP flow. |
| `source/2026-05-22-nycu-sent-api-reply-email/source.md` | The two-endpoint API packet was externally sent and should be treated as the June baseline unless a recorded change request updates it. | Do not silently change endpoint paths, required fields, response shape, idempotency semantics, or summary semantics. |
| `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md` and `handoff/api-examples/` | The external examples define the contract/version/session envelope and terminal `staff_review_summary`. | Load or compare against these examples in Python contract tests. |
| `source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md` | imedtac browser-callable demo path, CORS, bearer-token handoff, idempotency behavior, no generic skip, explicit not-sure option, up to 9 short options. | Preserve CORS, bearer-token behavior, idempotency retry/conflict behavior, explicit option ids, and no-scroll option budget. |
| `source/2026-06-16-imedtac-teams-question-option-adjustment/source.md` | imedtac confirmed current UI should stay single-choice / multi-choice; duration widget is not in the current engineering scope. | Transform or gate `Number`, `Time`, `text`, `free_text`, `scale`, ASR, and voice widgets from the first imedtac MVP path. |
| `source/2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync/source.md` | doebow pushed a Python/FastAPI direction and broader fixed-question bank; Jason and doebow agreed to keep the 2026-05-22 / 2026-06-11 API contract unless explicitly changed with imedtac. | Adopt `Question_DB/` and Python, but protect the external adapter boundary. |
| `docs/architecture-insertion-and-clinical-grounding.md` | The product contribution is vital-aware intake and staff-review workflow support, not diagnosis. | Outputs must remain staff-review intake support with measured vital facts and selected answers visible. |
| `docs/wu-instruction-register.md` | Prof. Wu direction: do not invent full AI triage; preserve clinician review, evidence traceability, and claim boundaries. | Keep no diagnosis, treatment, final triage level, disposition, order, production HIS/EMR/FHIR writeback, or production CDS claims. |

## Current Repo And Branch Evidence

Current `main` includes doebow's branch work:

```text
78f741d Merge remote-tracking branch 'origin/doebow'
c3964dc origin/doebow Revice_vital_sign_frontend
7674af8 Add python API
6269aad Add Initial_QA, Case_QA
6e7c766 Add question type
e2c6fe4 Add emergency module
fe3cf2b Modify quesions
```

The doebow question bank currently lives in:

```text
Question_DB/Initial_questions.csv
Question_DB/Universal_questions.csv
Question_DB/symptom_questions.csv
```

The Python runtime path currently lives in:

```text
python_api/main.py
python_api/triage_contract.py
python_api/triage_v1/
python_api/tests/
```

The local branch currently has an additional compatibility commit after
`origin/main`:

```text
e7debda fix: wrap staff notify as compatible summary
```

Before using GitHub/Render as the authoritative deployment source, push this
commit or intentionally decide not to include it.

## Compatibility Analysis

### Short Answer

Yes. doebow's design is compatible with the already-discussed imedtac API
contract if the Python backend acts as a strict adapter and the doebow internal
flow is rendered through the same two-endpoint contract.

Compatibility is conditional. It is supported when:

- doebow's broader question bank is internal runtime data;
- Python/FastAPI replaces the JS backend behind the same URL paths;
- every patient-facing question is rendered as the same `question` object
  schema;
- every MVP question uses `single_choice` or `multi_choice`;
- duration, age, time, or numeric content becomes selectable buckets;
- `staff_review_summary` remains the terminal staff-facing payload;
- branch-specific metadata stays additive, optional, or internal;
- severe-vital / staff-notify gates are wrapped as `status=summary` unless
  imedtac explicitly accepts a new status.

### Why It Can Work Without Changing The API

The imedtac frontend contract is mostly about transport and rendering:

```text
start a session
render one question object
submit selected option ids
repeat until status=summary
show staff_review_summary
```

doebow's design changes the internal source of questions and the routing
coverage. That does not inherently require a frontend contract change if the
Python adapter keeps returning the same external shape.

The backend can internally decide:

```text
measured vitals
-> route to doebow module
-> normalize unsupported question type
-> return contract-shaped question
-> collect option ids
-> build staff-review summary
```

The frontend still sees:

```text
status=question
question.type=single_choice|multi_choice
question.options=[{id,label}]
progress.current / progress.expected_total
status=summary
staff_review_summary
```

### Main Compatibility Risks

| Risk | Why it matters | Required control |
| --- | --- | --- |
| Endpoint drift | imedtac already integrated or prepared against the two endpoint paths. | Keep `/api/triage-demo/sessions` and `/api/triage-demo/sessions/{session_key}/answers`. |
| Version-field drift | Existing examples use tachycardia demo version fields. | Preserve external fields for the first compatibility path; put new branch metadata under optional debug/internal fields. |
| Unsupported UI widgets | imedtac said current UI scope is single-choice / multi-choice. | Convert `Number`, `Time`, duration, text/free-text, scale, voice, and ASR input into option buckets or gate them out. |
| New `status` values | imedtac may not have a renderer for `staff_notify`. | Wrap staff-notify gates as `status=summary` with staff-review flags unless a future change request is accepted. |
| Option count / label overflow | Teams working assumption is up to 9 short options without scroll. | Test every imedtac-facing question has <= 9 visible options and short labels. |
| Clinical overclaim | The demo is staff-review intake support, not diagnosis or final triage. | Scan runtime outputs/examples for forbidden clinical claims and keep scope controls visible. |
| Question source replacement | Directly adopting doebow's bank discards old curated tachycardia JS manifest. | Preserve old JS data as historical evidence only; add tests proving tachycardia compatibility remains available from `Question_DB/`. |

### Compatibility Verdict

The doebow route is compatible with the existing imedtac contract if the
implementation follows this rule:

```text
Internal runtime may change.
External imedtac contract must not require a new endpoint, required field,
status value, token format, widget, parser, or answer protocol.
```

Any change outside this rule is a future change request and must be recorded
before imedtac is asked to test it.

## Canonical Target Architecture

```text
imedtac iMVS frontend
-> POST /api/triage-demo/sessions
-> POST /api/triage-demo/sessions/{session_key}/answers
-> Python FastAPI HTTP adapter
-> triage_contract.py stable API contract adapter
-> triage_v1 engine
-> doebow Question_DB CSV question bank
-> staff_review_summary
```

Operational ownership:

| Layer | Owner |
| --- | --- |
| External API contract | `python_api/main.py`, `python_api/triage_contract.py` |
| Routing / answer validation / flow state | `python_api/triage_v1/flow_router.py` and `session_store.py` |
| Question bank | `Question_DB/*.csv` through `question_registry.py` |
| Vital parsing and route cues | `vital_normalizer.py`, `vital_rules.py` |
| Staff-review summary | `summary_builder.py`, `response_builder.py` |
| Historical JS runtime | reference/archive only; not canonical imedtac backend |

## Codex Goal Prompt

Copy the following prompt into a fresh Codex goal or execution thread.

```text
Goal: Implement the traceable doebow Question_DB + Python/FastAPI contract
migration for the AI triage kiosk demo in
/home/jnln3799/every_on_git_ubuntu/-ai-triage-kiosk-v0.

Primary objective:
Make the Python/FastAPI backend the canonical imedtac-facing runtime, adopt
doebow's Question_DB question bank as the canonical runtime question source,
discard the old JavaScript question manifest as active runtime input, and keep
the externally discussed 慧誠智醫（imedtac Co., Ltd.）API contract unchanged.

The final system must keep the same two endpoint paths, same request semantics,
same response envelope, same CORS and bearer-token behavior, same idempotency
semantics, same MVP question rendering contract, and same terminal
staff_review_summary behavior. Internal routing, question source, and backend
language may change only behind that adapter boundary.

Before editing, read these traceability sources:
1. AGENTS.md
2. docs/architecture-insertion-and-clinical-grounding.md
3. docs/source-index.md
4. docs/wu-instruction-register.md
5. API.md
6. README.md
7. handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
8. handoff/api-examples/2026-05-21-start-session-response-question.json
9. handoff/api-examples/2026-05-21-next-question-response-demo-tachycardia.json
10. handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json
11. source/2026-05-22-nycu-sent-api-reply-email/source.md
12. source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
13. source/2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync/source.md
14. source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
15. Question_DB/Initial_questions.csv
16. Question_DB/Universal_questions.csv
17. Question_DB/symptom_questions.csv
18. python_api/main.py
19. python_api/triage_contract.py
20. python_api/triage_v1/
21. python_api/tests/
22. package.json
23. Dockerfile

Current branch evidence to preserve:
- main includes doebow branch through:
  78f741d Merge remote-tracking branch 'origin/doebow'
- origin/doebow points at:
  c3964dc Revice_vital_sign_frontend
- doebow branch introduced Python API, Question_DB, broader fixed-question
  coverage, CSV-backed routing, and FastAPI test direction.
- local main may include:
  e7debda fix: wrap staff notify as compatible summary
  Preserve this compatibility behavior unless the user explicitly reverts it.

Non-negotiable imedtac external contract constraints:
- Keep POST /api/triage-demo/sessions.
- Keep POST /api/triage-demo/sessions/{session_key}/answers.
- Keep OPTIONS preflight for both endpoints.
- Keep Content-Type: application/json.
- Keep Authorization: Bearer <demo token> when DEMO_BEARER_TOKEN is configured.
- Keep CORS behavior for http://localhost and http://localhost:5174 unless a
  recorded imedtac change request updates allowed origins.
- Keep workflow_mode=post_measurement_only.
- Keep measurement_state=complete and vitals_ready=true for normal MVP flow.
- Keep status values for the first imedtac path limited to:
  question, summary, error.
- Do not expose status=staff_notify to imedtac unless a future recorded change
  request confirms frontend support. Wrap staff-notify gates as status=summary
  with staff-review flags.
- Keep progress.current and progress.expected_total.
- Keep the question object schema, including id, type, ui_template, text,
  options, option_count, required, allow_not_sure, max_selections, and rendering
  constraints.
- Keep MVP question.type limited to single_choice and multi_choice.
- Do not require number, time, text, free_text, scale, voice, ASR, or raw audio
  widgets in this MVP.
- Keep explicit option ids for not-sure behavior. Do not introduce a generic
  skip button as the default answer behavior.
- Keep idempotency retry stable and conflict behavior explicit.
- Keep staff_review_summary as the terminal summary payload.
- Keep demo_boundary and scope_controls language.
- No diagnosis, treatment advice, final triage level, acuity score,
  disposition recommendation, medication order, production clinical decision
  support, or production HIS/EMR/FHIR writeback claim.

Implementation phases:

Phase 0 - Freeze external contract evidence
1. Confirm the externally sent JSON examples still exist under
   handoff/api-examples/.
2. Confirm API.md still describes the two-endpoint contract.
3. Confirm the 2026-05-22 sent email source and 2026-05-23-to-2026-05-25 Teams
   follow-up support the change-control boundary.
4. Create or update a compatibility note that records:
   current external contract, Python runtime target, unchanged fields, additive
   fields, risks, owner, target test date, and explicit future-change-request
   items.

Phase 1 - Make doebow Question_DB canonical
1. Ensure runtime question loading goes through Question_DB/*.csv.
2. Do not let production/rehearsal API read old JS data/question_manifest as
   its runtime source.
3. Preserve old JS manifest/data as historical/reference evidence only.
4. Ensure the high-heart-rate/tachycardia compatibility path can still be
   served from Question_DB with stable question ids and option ids.
5. Add or keep tests proving every Question_DB-backed imedtac-facing runtime
   question is single_choice or multi_choice.
6. Add or keep tests proving no imedtac-facing runtime question has more than
   9 visible options.
7. Transform or gate unsupported doebow types:
   - Number / age -> single_choice age buckets or gated from imedtac path.
   - Time / duration -> single_choice duration buckets or gated from imedtac
     path.
   - text / free_text -> gated until a future pre-V3 text-input path.
   - scale / voice / ASR / raw audio -> future change request only.

Phase 2 - Make Python API the canonical backend
1. Keep python_api/main.py as the FastAPI route owner.
2. Keep python_api/triage_contract.py as the external contract adapter.
3. Port or preserve required backend behaviors in Python:
   - bearer-token gate;
   - CORS preflight;
   - JSON request parsing and stable errors;
   - idempotency retry and conflict;
   - session lifecycle and expiry;
   - vital normalization from normalized and iMVS-style payloads;
   - staff_review_summary envelope;
   - measured-vital objective summary;
   - forbidden clinical wording guardrails.
4. Update package scripts so canonical backend start path uses Python/FastAPI.
5. Keep JS frontend/static demo only as a local viewer or historical/reference
   material. It must not be described as the canonical imedtac backend.
6. Do not delete source/handoff/governance records.
7. Do not delete old JS tests until equivalent Python coverage exists or a
   documented test replacement decision is added.

Phase 3 - Contract-compatible MVP behavior
1. MVP 0:
   - high-heart-rate/tachycardia path;
   - doebow Question_DB source;
   - same two endpoints;
   - only single_choice/multi_choice;
   - measured vitals appear in staff_review_summary objective;
   - terminal response is status=summary.
2. MVP 1:
   - broader fixed-question routing from doebow bank;
   - vital branches for fever, low SpO2, bradycardia, hypertension,
     respiratory-rate cue, and normal/initial fallback;
   - every branch rendered through the same external envelope.
3. MVP 1.5:
   - template-assisted or optional LLM-assisted staff summary only after MVP 0/1
     pass;
   - selected answers and measured vitals remain visible as source facts;
   - no diagnosis/triage/treatment/disposition wording.
4. MVP 2/2.5/pre-V3/V3:
   - AI option matching, AI question selection, text input, and voice input are
     future layers;
   - add them only behind explicit compatibility gates and imedtac discussion.

Phase 4 - Render/cloud readiness
1. Keep Dockerfile deployable from this GitHub repo.
2. Confirm Docker image includes python_api, Question_DB, and handoff examples
   needed by triage_contract.py.
3. Confirm CMD binds to 0.0.0.0 and respects PORT.
4. Confirm /healthz works.
5. Confirm OPTIONS preflight works for http://localhost and http://localhost:5174.
6. Document Render settings:
   - Web Service;
   - Docker runtime;
   - branch main;
   - health check /healthz;
   - DEMO_BEARER_TOKEN stored in Render environment only if enabled.

Phase 5 - Documentation and handoff
1. Update README.md if canonical backend or deployment path changes.
2. Update API.md only to clarify implementation details; do not rewrite external
   contract semantics without a change-control record.
3. Update python_api/README.md with exact run/test/deploy commands.
4. Update docs/source-index.md and handoff/README.md when new handoff artifacts
   are added.
5. Maintain an imedtac-facing test note that states:
   - endpoint paths unchanged;
   - supported question types are single_choice/multi_choice;
   - duration content is option-based;
   - summary uses measured vital payload;
   - bearer token is delivered privately, not in repo;
   - requested feedback: UI rendering, no-scroll labels, summary preview, and
     high-heart-rate demo clarity.

Verification commands:
- git status --short --branch
- uv run --project python_api python -m pytest python_api/tests
- npm test if JS tests still exist
- npm run demo:ready if package scripts are still maintained
- git diff --check
- docker build -t ai-triage-kiosk-v0-render-check .
- docker run --rm -p 18080:8000 ai-triage-kiosk-v0-render-check
- curl -sS http://127.0.0.1:18080/healthz
- curl -sS -X OPTIONS http://127.0.0.1:18080/api/triage-demo/sessions \
  -H 'Origin: http://localhost:5174' -i
- rg -n -i "diagnosis|treatment|triage level|acuity|disposition|emergency department recommendation|medication order|HIS writeback|EMR writeback|FHIR writeback" python_api handoff/api-examples API.md README.md
- rg -n -i "(bearer [A-Za-z0-9._~+/=-]{12,}|api[_-]?key\\s*[:=]|token\\s*[:=]|password\\s*[:=]|secret\\s*[:=]|BEGIN (RSA|OPENSSH|PRIVATE) KEY)" python_api Question_DB README.md API.md docs handoff source --glob '!**/*.png'

Runtime evidence to gather before declaring complete:
1. Start-session on HR 130 reaches a Question_DB-backed tachycardia question.
2. Completing the tachycardia path reaches status=summary.
3. staff_review_summary objective includes measured vitals.
4. Severe-vital/staff-notify path returns status=summary, not status=staff_notify.
5. Registry audit proves all runtime questions are single_choice/multi_choice.
6. Registry audit proves no runtime question has more than 9 options.
7. INIT-2 and INIT-4 are rendered as option buckets or gated from the imedtac
   path.
8. External version fields match the sent examples for the first compatibility
   path.
9. Docker health check proves the backend can be deployed from the GitHub repo.

Acceptance criteria:
1. Python FastAPI serves the two unchanged imedtac endpoints.
2. doebow Question_DB is the canonical runtime question source.
3. Old JS backend is no longer the canonical imedtac backend runtime.
4. MVP imedtac-facing questions are only single_choice or multi_choice.
5. No imedtac-facing question has more than 9 visible options.
6. Unsupported doebow number/time/text/scale/voice/ASR widgets are transformed,
   gated, or documented as future change requests.
7. High-heart-rate path reaches status=summary and includes measured vitals in
   staff_review_summary.
8. Staff-notify gates are compatibility-wrapped as status=summary unless a
   future imedtac change request accepts a new status.
9. Existing external API examples remain compatible, or the diff is explicitly
   documented as optional additive metadata that imedtac does not need to parse.
10. Python tests pass.
11. Maintained JS tests pass or have a documented replacement decision.
12. Docker deploy path builds and health-checks.
13. No tracked file contains real credentials, bearer tokens, patient
    identifiers, private links, or live hospital integration secrets.
14. Documentation explains what changed internally and what did not change for
    imedtac.
15. Final report lists changed files, tests run, deployment readiness, remaining
    risks, and exact imedtac-facing behavior that stayed unchanged.
```

## Execution Notes For The Next Agent

Treat this as a migration with strict external compatibility, not as a blank
rewrite. The best route is:

1. Prove the external contract first.
2. Make doebow `Question_DB/` the only active question source.
3. Keep Python/FastAPI as the adapter and runtime.
4. Retire JS backend from active server paths.
5. Preserve test coverage until Python coverage fully replaces any JS behavior.
6. Verify Render/Docker deployment from the same repo.
7. Only then prepare imedtac-facing test messaging.

## Suggested imedtac-Facing Position After Verification

Use this only after compatibility tests and deployment checks pass:

```text
我們建議這次測試維持既有兩個 endpoint 與既有 question object 格式。
本版後端已改為 Python/FastAPI，題庫採用 doebow 整理後的 Question_DB，
但對 iMVS 前端的呼叫方式不變：

POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers

本次 MVP 仍只回傳 single_choice / multi_choice 題型。時間長短與年齡類內容
已轉成選項式回答，以符合目前 UI 不新增 numeric/time widget 的整合方向。
最終 staff_review_summary 會使用本次 session 的量測生命徵象與使用者選項，
供工作人員 review。
```

Do not send this until the API base URL, Render deployment state, and private
bearer-token delivery path are ready.
