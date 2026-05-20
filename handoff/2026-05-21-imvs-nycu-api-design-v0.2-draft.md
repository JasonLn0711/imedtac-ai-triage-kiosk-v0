---
id: 2026-05-21-imvs-nycu-api-design-v0.2-draft
title: "iMVS / NYCU AI Triage Demo API Design v0.2 Draft"
date: 2026-05-21
topic: ai-triage
type: handoff
status: pre-sync draft
audience: Johnny Fang and imedtac engineering design team
source:
  - ../source/2026-05-19-johnny-ai-triage-product-spec/source.md
  - ../source/2026-05-19-johnny-line-thursday-engineering-sync/source.md
  - ../source/2026-05-19-expert-review-scope-api-boundary/source.md
---

# iMVS / NYCU AI Triage Demo API Design v0.2 Draft

## Purpose

This draft answers Johnny's `2026-05-19` request for an API design document for
the mid-June AI triage customer demo.

The goal is to freeze the smallest integration contract for a synthetic-data
demo:

```text
iMVS vital-sign payload
  -> NYCU typed question object + session_key
  -> iMVS answer payload + session_key
  -> NYCU next question or staff_review_summary
```

This is NYCU's proposed pre-sync API v0.2 draft. It is safe to use for the
Thursday engineering discussion, but it is not the confirmed / frozen bilateral
contract until 慧誠 confirms actual payload field names, units,
required/optional fields, missing/failure semantics, UI insertion point, and
session ownership.

After the Thursday sync, produce the confirmed `2026-05-22` API v0.2 from this
draft and `handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`.

多寶 workflow update: if 慧誠's UI can support it, prefer a two-phase flow:
Phase 1 asks non-vital-dependent questions while iMVS is still measuring vital
signs; Phase 2 asks vital-aware follow-up only after values are available. See
`docs/2026-05-19-two-phase-question-flow-design.md`.

## Demo Boundary

This API is for a synthetic-data capability demo only.

It does not provide:

- diagnosis;
- treatment advice;
- final triage / acuity level;
- emergency order;
- real patient-data processing;
- production HIS / EMR / FHIR writeback.

Use `staff_review_summary`, `review_basis`, or `clinical_review_note` for the
output field. Expert freeze-gate update: prefer `review_basis` over
`assessment_support` because the latter can be confused with SOAP Assessment.
Do not name the output field `diagnosis`.

## Endpoint 1: Start Triage Session / Phase 1 Intake

```http
POST /api/triage-demo/sessions
Content-Type: application/json
```

### Request

Example:

- `api-examples/2026-05-21-start-session-request-demo-respiratory.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Discussion value: `2026-05-22-demo-v0.2-draft`. |
| `schema_version` | string | yes | Discussion value: `imvs-nycu-triage-demo-schema-v0.2-draft`. |
| `flow_version` | string | yes | Discussion value: `respiratory-early-handoff-flow-v0.2-draft`. |
| `case_id` | string | yes | Synthetic demo case id; do not use real encounter id. |
| `case_version` | string | yes | Synthetic case content version. |
| `fixture_version` | string | yes | Synthetic fixture version. |
| `question_set_version` | string | yes | Question wording/order/mapping version. |
| `wording_version` | string | yes | Staff-summary wording version pending clinical signoff. |
| `request_id` | string | yes | Client-generated request id for tracing and retry discussion. |
| `idempotency_key` | string | yes | Prevents duplicate start-session retries from creating duplicate workflow advancement. |
| `workflow_mode` | string | yes | Preferred: `parallel_measurement_intake`. Fallback: `post_measurement_only`. |
| `measurement_state` | string | yes | `in_progress` when asking Phase 1 during measurement; `complete` for post-measurement fallback. |
| `vitals_ready` | boolean | yes | `false` during Phase 1; `true` after measured vital payload arrives. |
| `safe_to_ask_phase1_question` | boolean | yes when measurement is active | True only when 慧誠 confirms the current measurement step can safely accept touch questions. |
| `client.source` | string | yes | Example: `imvs-demo`. |
| `client.locale` | string | yes | Example: `en-US`. |
| `patient_context.demo_patient_id` | string | yes | Demo-only ID. Do not send real MRN or name. |
| `patient_context.age` | number | no | Synthetic demo demographics only. |
| `patient_context.sex` | string | no | Synthetic demo demographics only. |
| `vitals` | object | yes | iMVS-shaped vital payload. Values may be `null` when `measurement_state=in_progress`. |
| `vitals.measurement_timestamp` | string/null | yes | ISO timestamp for the vital-sign measurement event; `null` if measurement is still in progress. |
| `vitals.device_id` | string | yes | Demo device identifier, not a patient identifier. |
| `vitals.<field>.value` | number/null | yes | Per-vital measured value or null. |
| `vitals.<field>.unit` | string | yes | Explicit unit such as `%`, `C`, `mmHg`, `beats/min`, `cm`, or `kg`. |
| `vitals.<field>.measurement_status` | string | yes | `measured`, `missing`, `failed`, `manual_entry`, or `not_available`. |
| `vitals.<field>.quality_flag` | string | yes | `ok`, `needs_review`, `device_error`, `out_of_range_demo`, or `unknown`. |
| `vitals.<field>.missing_reason` | string/null | no | Required when a vital is missing or failed. |
| `capabilities.question_types` | array | yes | `single_choice`, `multi_choice`, `scale`. |
| `capabilities.max_questions` | number | yes | Current June design cap follows the 慧誠 / iMVS product spec: fewer than `8` visible patient-facing questions; use `7` as the hard maximum. |
| `capabilities.voice_input` | boolean | yes | Recommended `false` for June critical path. |

### Response

Example:

- `api-examples/2026-05-21-start-session-response-question.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `session_key` | string | yes | Proposed: NYCU generates; iMVS echoes it in later calls. |
| `request_id` | string | yes | Echo request id for traceability. |
| `response_id` | string | yes | NYCU response id for demo debugging. |
| `session_expires_at` | string | yes | Expiry time for the demo session. |
| `session_state` | string | yes | `active`, `summary_ready`, `expired`, `abandoned`, or `error`. |
| `last_question_id` | string/null | yes | Last answered or emitted question id; `null` on first question. |
| `status` | string | yes | `question` or `summary`. |
| `workflow_mode` | string | yes | Echoes the chosen workflow mode. |
| `measurement_state` | string | yes | Current measurement state. |
| `vitals_ready` | boolean | yes | Whether Phase 2 can start. |
| `question_phase` | string | yes if `status=question` | `pre_vital_intake` or `post_vital_followup`. |
| `phase_reason` | string | yes if `status=question` | Short reason why this question is allowed in the current phase. |
| `progress.current` | number | yes | Required for AC07 progress display. |
| `progress.expected_total` | number | yes | Can be estimated for dynamic flows. |
| `question.id` | string | yes if `status=question` | Stable runtime question id. |
| `question.registry_refs` | array | yes | Question registry IDs backing this runtime question. |
| `question.source_refs` | array | yes | Source IDs backing this runtime question. |
| `question.evidence_status` | string | yes | Current evidence status. |
| `question.review_owner` | string | yes | Owner for wording/source review. |
| `question.type` | string | yes if `status=question` | `single_choice`, `multi_choice`, or `scale`. |
| `question.text` | string | yes if `status=question` | Rendered question text. |
| `question.options` | array | yes for choice types | Stable option ids and labels. |
| `question.none_option_id` | string/null | no | Used for mutually exclusive "none" option. |
| `question.evidence_refs` | array | no | For demo, may be `LOCAL-PROTOCOL-TBD`. |
| `demo_boundary` | string | yes | Explicit demo-only boundary. |

## Endpoint 2: Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
```

### Request

Example:

- `api-examples/2026-05-21-submit-answer-request-demo-respiratory.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Must match supported demo API version. |
| `schema_version` | string | yes | Must match supported demo schema. |
| `flow_version` | string | yes | Must match the running demo flow. |
| `case_id` | string | yes | Synthetic demo case id. |
| `case_version` | string | yes | Synthetic case content version. |
| `fixture_version` | string | yes | Synthetic fixture version. |
| `question_set_version` | string | yes | Question wording/order/mapping version. |
| `wording_version` | string | yes | Staff-summary wording version. |
| `request_id` | string | yes | Client-generated id for tracing one answer submission. |
| `idempotency_key` | string | yes | Prevents retry from advancing the question flow twice. |
| `session_key` | string | yes | Same key returned by Endpoint 1. |
| `workflow_mode` | string | yes | `parallel_measurement_intake` for the optimized flow. |
| `measurement_state` | string | yes | Current measurement state from iMVS. |
| `vitals_ready` | boolean | yes | Whether the measured vital payload has been sent. |
| `question_phase` | string | yes | Phase of the question being answered. |
| `question_id` | string | yes | The question being answered. |
| `answer.selected_option_ids` | array | yes for choice questions | Empty only when scale is used. |
| `answer.scale_value` | number/null | yes for scale questions | `null` for choice questions. |
| `client_event.input_mode` | string | yes | `touch`, `keyboard`, `voice_confirmed`, etc. |
| `client_event.answered_at` | string | no | ISO timestamp if available. |

### Response: Next Question

Example:

- `api-examples/2026-05-21-next-question-response-demo-respiratory.json`
- `api-examples/2026-05-21-post-vital-question-response-demo-respiratory.json`

The response follows the same `status=question` structure as Endpoint 1.

## Endpoint 3: Submit Vital Payload When Ready

Use this endpoint only for the optimized two-phase workflow. It allows Phase 1
questions to run during measurement, then starts Phase 2 after vital signs are
available.

```http
POST /api/triage-demo/sessions/{session_key}/vitals
Content-Type: application/json
```

Example:

- `api-examples/2026-05-21-update-vitals-request-demo-respiratory.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Must match supported demo API version. |
| `schema_version` | string | yes | Must match supported demo schema. |
| `flow_version` | string | yes | Must match the running demo flow. |
| `case_id` | string | yes | Synthetic demo case id. |
| `request_id` | string | yes | Client-generated id for tracing the vitals-ready update. |
| `idempotency_key` | string | yes | Prevents duplicate vitals-ready updates from resetting the flow. |
| `session_key` | string | yes | Same key returned by Endpoint 1. |
| `workflow_mode` | string | yes | `parallel_measurement_intake`. |
| `measurement_state` | string | yes | `complete` when vital values are ready; `failed` if measurement failed. |
| `vitals_ready` | boolean | yes | `true` only when measured values and quality flags are available. |
| `vitals` | object | yes | Measured vital payload plus quality fields. |

Fallback: if 慧誠 cannot add Endpoint 3 for June, use the original
post-measurement-only flow: call Endpoint 1 only after all synthetic vital
values are available.

### Response: Staff Summary

Example:

- `api-examples/2026-05-21-summary-response-demo-respiratory.json`

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `session_key` | string | yes | Same session key. |
| `session_expires_at` | string | yes | Same session expiry window. |
| `session_state` | string | yes | `summary_ready`. |
| `last_question_id` | string | yes | Last answered question before summary. |
| `status` | string | yes | `summary`. |
| `workflow_mode` | string | yes | `parallel_measurement_intake` or fallback mode. |
| `measurement_state` | string | yes | `complete` unless an error occurred. |
| `vitals_ready` | boolean | yes | Must be `true` for a staff summary. |
| `question_phase` | string | yes | `summary`. |
| `summary_visibility` | string | yes | Must be `staff_only` for June demo. |
| `handoff_required` | boolean | yes | Explicitly true for the first respiratory handoff case. |
| `handoff_reason_codes` | array | yes | Stable machine-readable reasons for staff-review handoff. |
| `staff_review_summary.format` | string | yes | Proposed: `review_summary_demo`. |
| `staff_review_summary.subjective` | array | yes | Patient-reported context. |
| `staff_review_summary.objective` | array | yes | Measured vitals. |
| `staff_review_summary.review_basis` | array | yes | Non-diagnostic staff-review context; safer replacement for `assessment_support`. |
| `staff_review_summary.review_action` | array | yes | Human review reminder only. Replaces the risky `plan_support` wording. |
| `staff_review_summary.staff_handoff_note` | string | yes | Short safe display string: `Please review measured vitals and reported symptoms.` |
| `staff_review_summary.not_claimed` | array | yes | Explicit forbidden claims. |
| `evidence_refs` | array | no | For demo, may be `LOCAL-PROTOCOL-TBD`. |
| `demo_boundary` | string | yes | Synthetic demo only. |

## Question Types

### `single_choice`

Use for mutually exclusive answers.

```json
{
  "type": "single_choice",
  "options": [
    {"id": "today", "label": "Started today"},
    {"id": "days", "label": "A few days"}
  ]
}
```

### `multi_choice`

Use when multiple symptoms may apply. If `none_option_id` is selected, iMVS
should clear other selected options.

```json
{
  "type": "multi_choice",
  "none_option_id": "none",
  "options": [
    {"id": "cough", "label": "Cough"},
    {"id": "fever", "label": "Fever or chills"},
    {"id": "none", "label": "None of these"}
  ]
}
```

### `scale`

Use for pain / severity.

```json
{
  "type": "scale",
  "scale": {
    "min": 0,
    "max": 10,
    "min_label": "No pain",
    "max_label": "Worst imaginable pain"
  }
}
```

## Proposed First Demo Case

Start with one case:

```text
fever + dyspnea + low SpO2
```

Why:

- It naturally uses temperature, SpO2, respiratory rate, and heart rate.
- It shows measured vitals affecting follow-up questions.
- It can produce a useful staff-review summary without diagnosis.
- It is easier to explain than all-specialty coverage.

Demo-safe summary wording after expert review:

```text
Synthetic demo case.
Patient reports shortness of breath.
Measured vitals include fever, increased respiratory rate, and lower oxygen saturation than expected for this demo scenario.
Staff should review the respiratory complaint and measured vitals.
This demo does not diagnose, recommend treatment, assign a final triage level, or write to HIS/EMR.
```

For the first respiratory case, do not force all eight questions. The preferred
flow is:

```text
Q1 chief complaint
Q2 dyspnea duration / severity
Q3 chest pain / pressure
Q4 chronic lung disease / baseline oxygen / medication context
-> staff_review_summary
```

## Failure Behavior

For June, keep failure behavior simple and explicit.

| Failure | Recommended response |
| --- | --- |
| Missing required vital field | Return `status=error`, `error.code=missing_required_field`, and name the field. |
| Unsupported question type | Return `status=error`, `error.code=unsupported_question_type`. |
| Expired / unknown session | Return `status=error`, `error.code=invalid_session`. |
| Measurement quality unavailable | Return `status=error`, `error.code=measurement_quality_unavailable` or continue only with explicit staff-review handoff if 多寶 approves. |
| Network unavailable | iMVS shows fallback screen; no clinical result is displayed. |
| NYCU API timeout | iMVS shows retry or fallback screen; no fabricated summary. |

Example:

- `api-examples/2026-05-21-error-response-demo-invalid-session.json`

Fallback wording:

```text
AI triage demo service is unavailable. Please continue with the standard staff workflow.
No AI-generated clinical summary was produced.
```

## Data And Privacy Rules

For the June demo, do not send:

- real patient name;
- real MRN / chart number;
- national ID;
- phone number;
- address;
- raw audio;
- real medical record content;
- credentials or endpoint secrets.

Use `demo_patient_id` only.

## Decisions Needed From 慧誠

- Exact iMVS vital field names and units.
- Which fields are guaranteed vs optional.
- Whether NYCU may generate `session_key`.
- Where AI triage appears in the UI flow.
- Whether June demo may call an external HTTPS endpoint or laptop API.
- Whether local mock fallback is acceptable.
- Required language: English only, Chinese only, or bilingual.
- Whether voice input is in or out for the June critical path.
- Who is the engineering point of contact.
- When the API design must be finalized.

## Recommended Delivery Timeline

| Date | Deliverable |
| --- | --- |
| `2026-05-20` | Send API design skeleton / sample JSON for review. |
| `2026-05-21` | Thursday sync: freeze fields, session behavior, UI insertion, and clinical wording. |
| `2026-05-22` | API design v0.2 with confirmed field names and one mock flow. |
| `2026-05-25` | First mock adapter or static integration rehearsal, if fields are confirmed. |

## Suggested Reply To Johnny

```text
Johnny 好，我可以先在 5/20 提供一版 API design skeleton，內容會包含：
1. iMVS 上傳 vital sign payload 的建議欄位；
2. NYCU 回傳 question object + session_key 的格式；
3. iMVS 回傳 answer + session_key 後，NYCU 回下一題或 staff-review summary 的格式；
4. 六月 demo 的 in/out scope。

週四可以跟你和工程設計團隊一起確認欄位、session key、UI 插入點、網路/compute 方式，以及 voice input 是否放進六月 demo 主線。
另外我會請多寶一起確認 clinical stop rule 和 summary wording，避免 demo 被理解成 diagnosis 或 final triage decision。
```
