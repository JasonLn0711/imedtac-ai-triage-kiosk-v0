# Python API Implementation Plan

本文件是 `python_api/` 的實作計畫，用來把現有的 AI triage kiosk demo
整理成可維護、可串接、可升版的 Python API runtime。

本專案定位是 **synthetic-data staff-review intake support demo**。系統產出的是
staff-review summary / FHIR-compatible SOAP-style handoff draft，支援醫護人員快速回顧病人主訴、vital
sign context、症狀回答與需要確認的事項；不是診斷、治療建議、final triage
level、production clinical decision support，或正式 HIS / EMR / FHIR writeback。

## Product Thesis

慧誠智醫（imedtac Co., Ltd.）的核心優勢是 kiosk hardware、vital-sign
measurement、device gateway / middleware、hospital workflow integration。AI
triage demo 的插入點應該放在 **vital sign measurement 完成之後**，讓 AI 問答
從實際量測資訊開始，而不是做一個獨立的 symptom chatbot。

Demo 要展示的 capability 是：

```text
patient arrives
-> iMVS vital signs are measured
-> Python API receives normalized vital context
-> triage-support engine asks governed symptom questions
-> patient answers through kiosk UI
-> Python API returns next question or staff-review summary
-> nurse / clinician reviews the structured result
```

## Existing Architecture

目前 runtime 採用 FastAPI，主要檔案如下：

| Area | File / folder | Role |
| --- | --- | --- |
| HTTP API | `python_api/main.py` | FastAPI app、routes、CORS、JSON body parsing、optional bearer-token auth。 |
| Demo contract engine | `python_api/triage_contract.py` | Session lifecycle、idempotency、question sequence、answer validation、summary response。 |
| Browser test page | `python_api/static/` | Local API test UI。 |
| Contract tests | `python_api/tests/` | HTTP-level tests for auth、session start、answer submit、idempotency、summary、CORS。 |
| Demo fixture | `JS/fixtures/tachycardia-live-demo.json` | Current tachycardia synthetic demo case and expected answer path。 |
| API examples | `handoff/api-examples/` | Versioned request / response examples used by runtime。 |
| Question registry draft | `Case_question/symptom_questions.csv` | Symptom-specific question module source for future router expansion。 |
| Design note | `docs/architecture-insertion-and-clinical-grounding.md` | Canonical architecture and clinical-grounding boundary。 |

Current endpoint contract:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/triage-demo/sessions` | `POST` | Called after iMVS measurement is complete. Creates a session and returns the first question. |
| `/api/triage-demo/sessions/{session_key}/answers` | `POST` | Submits selected option IDs and returns the next question or final staff-review summary. |
| `/healthz` | `GET` | Runtime health check. |
| `/` | `GET` | Local browser test page. |

Current flow:

```mermaid
flowchart TD
  A[iMVS completes vital-sign measurement] --> B[POST /api/triage-demo/sessions]
  B --> C[Create server-managed session]
  C --> D[Return session_key + first question]
  D --> E[iMVS renders question]
  E --> F[Patient selects option ids]
  F --> G[POST /api/triage-demo/sessions/{session_key}/answers]
  G --> H{More questions?}
  H -->|Yes| I[Return next question]
  I --> E
  H -->|No| J[Return staff_review_summary]
  J --> K[Staff review]
```

Important current runtime behaviors:

| Behavior | Current decision |
| --- | --- |
| Workflow mode | `post_measurement_only` |
| Measurement state | `complete` |
| Demo case | `demo-tachycardia-live-001` |
| Flow version | `tachycardia-live-demo-flow-v0.2-draft` |
| Question set version | `tachycardia-question-set-v0.2-draft` |
| Question types | `single_choice`, `multi_choice` |
| UI capacity assumption | Up to 9 short options without scrolling |
| Input mode | Touch first; voice disabled for June critical path |
| Output visibility | `staff_only` summary |
| Auth | Optional `Authorization: Bearer <demo token>` through `DEMO_BEARER_TOKEN` |
| CORS | Currently allows `http://localhost` and `http://localhost:5174` |
| Session TTL | 30 minutes |
| Idempotency | Same key + same body returns the cached response; same key + changed body returns conflict |

## Vital Sign Architecture

The Python API should accept normalized vital fields derived from imedtac's iMVS
Vital Sign Upload API baseline.

| iMVS source | Unit | Runtime field |
| --- | --- | --- |
| `NBP.SYS_Value` | `mmHg` | `blood_pressure_systolic_mm_hg` |
| `NBP.DIA_Value` | `mmHg` | `blood_pressure_diastolic_mm_hg` |
| `SPO2.Value` | `%` | `spo2_percent` |
| `HR.BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp.Value` | `C` / `deg C` | `temperature_c` |
| `Glucose.Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight.Value` | `kg` | `weight_kg` |
| `Height.Value` | `cm` | `height_cm` |

Recommended per-vital object shape for Endpoint 1:

```json
{
  "heart_rate_bpm": {
    "value": 130,
    "unit": "bpm",
    "measurement_status": "measured",
    "quality_flag": "needs_review",
    "missing_reason": null
  }
}
```

Implementation rule:

- V1.4 source values may arrive as strings; adapter code should parse them into
  numeric runtime values.
- `respiratory_rate_per_min` remains demo/manual/synthetic unless imedtac
  confirms a measured source.
- BMI may be derived from height and weight, but it is not treated as a direct
  iMVS upload field.
- SpO2 and glucose fields are supported, but hardware availability depends on
  target SKU confirmation.
- Abnormal vital logic is a **clinical validation gate**. The demo can show
  review flags and question routing, but not final triage or autonomous medical
  advice.

## Question Flow

The intended question flow has four phases:

```text
After Vital Sign Phase
-> Initial Phase
-> Symptom-Specific Phase
-> Universal Phase
-> Staff-Review Summary
```

Phase behavior:

| Phase | Purpose | Current / future source |
| --- | --- | --- |
| After Vital Sign Phase | Check measured vitals first and decide whether to ask vital-triggered questions or flag staff review. | Current tachycardia lane uses HR 130 as the demo cue. |
| Initial Phase | Capture age, sex, chief concern, and duration when needed. | `Case_question/Case_Question_design.md` and current tachycardia question examples. |
| Symptom-Specific Phase | Ask module-specific questions based on chief complaint and vital context. | Future expansion from `Case_question/symptom_questions.csv` and `Case_question/Symptom_module/`. |
| Universal Phase | Ask general review fields such as history, medication, allergy, pregnancy where applicable. | Current tachycardia lane includes history / medication / allergy confirmation. |
| Summary Phase | Produce staff-review summary with scope controls and human-review boundary. | Current API returns `staff_review_summary`. |

Routing policy:

- If vital signs trigger an immediate demo staff-review flag, the engine should
  ask the shortest relevant confirmation questions and preserve the flag in the
  summary.
- If a clear chief concern is already available, the engine can skip broad
  initial symptom discovery and enter the symptom-specific module.
- If chief concern is unclear, the engine asks Initial Phase questions before
  routing to a symptom module.
- Every patient path should end with Universal Phase fields needed for safe
  staff review, unless the path is intentionally shortened by a staff-review
  flag.

## Model Versions

### Model V0: Current Tachycardia Fixed Demo

Goal: preserve the current working two-endpoint tachycardia lane.

Core design:

- Fixed question sequence stored in `triage_contract.py`.
- Synthetic fixture from `JS/fixtures/tachycardia-live-demo.json`.
- Fixed `case_id=demo-tachycardia-live-001`.
- Fixed `question_set_version=tachycardia-question-set-v0.2-draft`.
- Answer validation checks current `question_id`, allowed option IDs, and
  `max_selections`.
- Summary is staff-review only.

This version is best for live rehearsal because behavior is predictable and
matches the externally communicated API contract.

### Model V1: Rule-Based Fixed Flow

Goal: implement the first complete version requested for this repo: a fixed
workflow controlled by explicit `if / else` rules.

Core design:

- Parse Endpoint 1 vital payload and patient context.
- Run `AfterVitalSignRuleEngine`.
- Select the first branch using deterministic rules:
  - vital-triggered branch,
  - chief-complaint branch,
  - fallback initial intake branch.
- Load symptom-specific questions from `Case_question/symptom_questions.csv`.
- Ask a fixed number of module questions based on the chosen branch.
- Ask Universal Phase questions.
- Generate a structured staff-review summary.

Suggested internal components:

| Component | Responsibility |
| --- | --- |
| `VitalNormalizer` | Convert iMVS / caller payload into normalized vital fields and units. |
| `VitalRuleEngine` | Evaluate demo vital triggers and staff-review flags. |
| `QuestionRegistry` | Load CSV / module questions into stable question objects. |
| `FlowState` | Track phase, current question, answers, and progress. |
| `SummaryBuilder` | Convert vitals + answers into staff-review summary wording. |

V1 does not need LLM routing. It should be explainable, testable, and easy to
demo with deterministic fixtures.

### Model V2: LLM-Assisted Question Prioritization

Goal: add LLM support after the fixed flow is stable. The LLM should help rank
or reorder the most relevant options/questions, while the deterministic engine
still controls allowed actions and safety boundaries.

Core design:

- Rule engine remains the source of truth for allowed phases and allowed
  question pool.
- LLM receives only synthetic/demo-safe context:
  - normalized vitals,
  - selected chief concern,
  - previous answer IDs,
  - candidate question IDs / option IDs,
  - demo boundary instruction.
- LLM returns a structured ranking, not free-form medical advice.
- Server validates the LLM output against the allowed question registry.
- If LLM output is invalid, missing, slow, or unavailable, runtime falls back to
  V1 deterministic ordering.

Expected LLM output shape:

```json
{
  "recommended_question_ids": ["tachy-associated-symptoms", "tachy-heart-history-meds"],
  "option_order_overrides": {
    "tachy-current-feeling": ["heart_racing", "chest_heavy", "chest_pressure_pain"]
  },
  "reason_codes": ["measured_elevated_heart_rate_demo", "reported_palpitations"]
}
```

LLM output must not include diagnosis, treatment advice, final acuity,
autonomous emergency instruction, or production clinical claim.

### Model V3: Evidence / Provenance-Aware Flow

Goal: make every future patient-facing question traceable.

Core design:

- Every question has:
  - `question_id`,
  - `question_text`,
  - `symptom_context`,
  - `vital_trigger`,
  - `source_refs`,
  - `evidence_status`,
  - `clinical_purpose`,
  - `review_owner`,
  - `summary_effect`.
- Runtime responses include registry / source refs for review and handoff.
- Question changes are versioned through `question_set_version` and
  `wording_version`.
- Customer-facing changes are handled through external commitment change
  control before implementation.

This version prepares the demo for clinical review and future validation
planning without turning it into a production clinical product.

### Model V4: Voice / ASR-Ready Intake

Goal: add voice input as a future capability lane after the touch-based flow is
stable.

Core design:

- Touch remains the canonical answer contract through
  `answer.selected_option_ids`.
- ASR output is converted into candidate option IDs.
- Patient or staff confirmation is required before an answer is submitted.
- Patent-sensitive ASR + LLM process details stay private unless explicitly
  cleared.
- Runtime still returns governed question objects and staff-review summary.

This version is not part of the June critical path.

## Data Models To Stabilize

### Session

| Field | Meaning |
| --- | --- |
| `session_key` | Server-generated demo session id. |
| `session_expires_at` | Session expiry timestamp. |
| `session_state` | `active`, `summary_ready`, `expired`, `abandoned`, or `error`. |
| `start_request` | Original Endpoint 1 context for debug and summary generation. |
| `vitals` | Normalized vital payload. |
| `patient_context` | Synthetic patient context only. |
| `answers` | Ordered answer records. |

### Question

| Field | Meaning |
| --- | --- |
| `id` | Stable question ID. |
| `type` | `single_choice` or `multi_choice` for current demo. |
| `text` | Patient-facing English question. |
| `options` | Stable option IDs and display labels. |
| `max_selections` | UI and server validation rule. |
| `trigger_reason_codes` | Why this question appears. |
| `source_refs` | Provenance references. |
| `summary_effect` | How answers affect staff-review summary. |

### Answer

| Field | Meaning |
| --- | --- |
| `question_id` | Must match the current server-side question. |
| `answer.selected_option_ids` | Stable option IDs selected by patient / kiosk. |
| `client_event.input_mode` | Current value is `touch`; future values may include confirmed voice. |
| `idempotency_key` | Protects retry behavior and changed-answer conflicts. |

### FHIR-Compatible SOAP Staff-Review Handoff

The final output should remain a SOAP-style staff-review draft because SOAP is
familiar for clinical review. The underlying fields should be structured so each
SOAP section can map cleanly to FHIR resources in a future validated hospital
integration path. For the demo, the API may continue to return
`staff_review_summary`; the content should be organized as SOAP sections with
FHIR-compatible field names, explicit units, source metadata, and review flags.

Recommended SOAP-to-FHIR mapping:

| SOAP section | Demo content | FHIR-compatible mapping |
| --- | --- | --- |
| `Subjective` | Chief concern, duration, patient-reported symptoms, selected positives / negatives, history, medication, allergy, and relevant context. | `QuestionnaireResponse` items with stable question IDs, option IDs, labels, timestamps, and `Patient` context. |
| `Objective` | Measured vital signs with explicit values, units, measurement status, quality flag, missing reason, device id, and measurement timestamp. | `Observation` resources grouped in a `Bundle`, with kiosk `Encounter` context. |
| `Assessment` | Staff-review cues, reason codes, vital-triggered review flags, and summary interpretation limited to workflow support. | `DetectedIssue` or review-flag extension plus `Composition.section`; no diagnosis, final acuity, or treatment claim. |
| `Plan` | Human-review next step, staff confirmation needs, scope controls, and demo boundary. | `Composition` narrative/sections plus `Provenance`; no production order, disposition, medication, or HIS / EMR / FHIR writeback. |

The SOAP-style draft should include:

- measured vital context with explicit units,
- chief concern and duration when available,
- symptom-specific positives / negatives as governed answer IDs and labels,
- history / medication / allergy fields,
- staff-review flags and reason codes,
- scope controls,
- human-review boundary,
- FHIR mapping metadata such as resource type, source refs, question set version,
  wording version, and runtime version.

The SOAP-style draft should not include diagnosis, treatment plan, final triage
level, formal acuity score, production clinical decision support claim,
production order, or production HIS / EMR / FHIR writeback claim.

## Implementation Milestones

### Milestone 1: Preserve Current Runtime

- Keep current FastAPI endpoints stable.
- Keep `demo-tachycardia-live-001` working.
- Keep idempotency and answer validation tests passing.
- Add tests before changing externally visible endpoint behavior.

### Milestone 2: Extract V1 Rule Engine

- Move fixed question sequence and routing logic out of monolithic contract code.
- Add `QuestionRegistry` loader for CSV-backed symptom questions.
- Add deterministic `VitalRuleEngine`.
- Keep tachycardia lane behavior compatible with the current API.

### Milestone 3: Add Multi-Module Symptom Routing

- Support chief complaint routing into symptom modules.
- Implement fixed flow:
  `After Vital Sign -> Initial -> Symptom-Specific -> Universal -> Summary`.
- Add fixtures for at least:
  - tachycardia / palpitation,
  - fever,
  - shortness of breath,
  - abdominal pain or urinary symptoms.

### Milestone 4: Add V2 LLM Ranking Behind A Feature Flag

- Add config flag such as `QUESTION_ROUTER_MODE=rules` or `llm_ranked`.
- Keep V1 deterministic fallback.
- Validate every LLM-selected question / option against the registry.
- Log reason codes without storing private patient data.

### Milestone 5: Add Provenance Metadata

- Add source / review metadata to question registry.
- Version `question_set_version` and `wording_version`.
- Prepare clinical-review packet from question metadata and summary examples.

## Testing Plan

Required tests:

- `POST /api/triage-demo/sessions` returns first question.
- Unsupported `case_id` returns `422 invalid_start_session_request`.
- `measurement_state != complete` returns a controlled error.
- `vitals_ready=false` returns a controlled error.
- Valid answer returns next question.
- Invalid `question_id` returns `422 invalid_answer`.
- Unknown option ID returns `422 invalid_answer`.
- Reused idempotency key with same body returns cached response.
- Reused idempotency key with different body returns `409 idempotency_conflict`.
- Final answer returns `status=summary` and `staff_review_summary`.
- LLM mode falls back to V1 rules when ranking is invalid or unavailable.

Suggested command:

```bash
uv run python -m pytest python_api/tests
```

## Safety And Scope Controls

- Use `triage support`, `workflow support`, and `demo` language.
- Do not store real patient data, identifiers, credentials, private API tokens,
  or live hospital integration details in tracked files.
- Do not write diagnosis, autonomous medical advice, treatment advice, final
  triage / acuity claims, or production clinical decision claims.
- Treat vital thresholds and red-flag logic as clinical validation gates.
- FDA is not a symptom-questionnaire source. FDA-related work belongs to
  intended use, risk, validation, software, cybersecurity, and safety-claim
  boundaries after official text is verified.
- Every future patient-facing question should move toward question provenance:
  source name, version, exact supporting text, clinical purpose, vital trigger,
  and review owner.

## Current Recommendation

Implement **Model V1: Rule-Based Fixed Flow** first. It preserves the current
two-endpoint architecture, keeps the imedtac integration stable, and gives the
team a clean base for CSV-backed symptom modules. After V1 is passing tests and
the demo path is stable, add **Model V2: LLM-Assisted Question Prioritization**
behind a feature flag so the LLM improves ordering without controlling the
clinical boundary.
