---
id: 2026-05-21-imedtac-two-endpoint-api-reply
title: "iMVS / NYCU AI Triage Demo Two-Endpoint API Reply"
date: 2026-05-21
topic: ai-triage
type: handoff
status: external-ready-draft
audience: Ben Siu, Lauren Wang, Johnny Fang, and imedtac engineering team
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ./2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ./api-examples/
---

# iMVS / NYCU AI Triage Demo Two-Endpoint API Reply

Ben, Lauren, Johnny 大家好：

依照今天會議後確認的方向，NYCU 端建議六月 customer demo 第一版採用
`post_measurement_only` 的兩個 endpoint API contract。這個版本的目標是讓
慧誠智醫（imedtac Co., Ltd.）的 iMVS 先完成 vital-sign measurement，再把
measured vital payload 傳給 NYCU API，由 NYCU 回傳結構化問題與
`staff_review_summary`，供 demo preview / staff-review workflow 使用。

此 API contract 是 synthetic-data demo / product capability demo 的工程整合
文件，不是正式臨床診斷、治療建議、最終檢傷等級、HIS / EMR / FHIR 寫回或
production patient-data flow。

## Confirmed June Demo Flow

```text
iMVS user login / demo case start
-> iMVS completes vital-sign measurement
-> iMVS calls NYCU Endpoint 1 with measured vital payload
-> NYCU returns session_key + first question object
-> iMVS renders single-choice / multi-choice question
-> iMVS calls NYCU Endpoint 2 with session_key + answer
-> NYCU returns next question object or staff_review_summary
-> imedtac UI shows staff / doctor / customer demo preview
```

June default values:

| Field | June value |
| --- | --- |
| `workflow_mode` | `post_measurement_only` |
| `measurement_state` | `complete` |
| `vitals_ready` | `true` |
| `question_phase` | `post_measurement_intake` for questions; `summary` for final summary |
| `voice_input` | `false` for June critical path |
| Supported question types | `single_choice`, `multi_choice`; `scale` only if imedtac UI confirms support |

## Endpoint List

### Endpoint 1: Start Session With Measured Vitals

```http
POST /api/triage-demo/sessions
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

Purpose:

- iMVS calls this endpoint after vital-sign measurement is complete.
- Request includes measured or synthetic demo vital payload.
- NYCU creates a demo session and returns `session_key` plus the first question.

### Endpoint 2: Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

Purpose:

- iMVS submits one answer for the active session.
- NYCU returns either the next question or the final `staff_review_summary`.

The previous separate vitals-ready endpoint is not required for the June demo
integration. It can remain a future optimized mode if both teams later reopen
two-phase measurement-time intake.

## Endpoint 1 Request

Required request fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Current draft: `2026-05-22-demo-v0.2-draft`. |
| `schema_version` | string | yes | Current draft: `imvs-nycu-triage-demo-schema-v0.2-draft`. |
| `flow_version` | string | yes | Example: `tachycardia-live-demo-flow-v0.2-draft` or `respiratory-early-handoff-flow-v0.2-draft`. |
| `case_id` | string | yes | Synthetic demo case id. Do not send real encounter id. |
| `case_version` | string | yes | Synthetic case content version. |
| `fixture_version` | string | yes | Synthetic fixture version. |
| `question_set_version` | string | yes | Question wording/order/mapping version. |
| `wording_version` | string | yes | Staff-summary wording version. |
| `request_id` | string | yes | Client-generated request id for traceability. |
| `idempotency_key` | string | yes | Prevents retry from creating duplicate session advancement. |
| `workflow_mode` | string | yes | Must be `post_measurement_only` for June. |
| `measurement_state` | string | yes | Must be `complete` for June. |
| `vitals_ready` | boolean | yes | Must be `true` for June. |
| `client.source` | string | yes | Example: `imvs-demo`. |
| `client.locale` | string | yes | Example: `en-US`. |
| `patient_context.demo_patient_id` | string | yes | Demo-only ID. Do not send MRN, national ID, name, phone, or real chart data. |
| `patient_context.age` | number | no | Synthetic demo demographics only. |
| `patient_context.sex` | string | no | Synthetic demo demographics only. |
| `vitals` | object | yes | Measured or synthetic iMVS vital payload. |
| `capabilities.question_types` | array | yes | Recommended: `["single_choice", "multi_choice"]` for June. |
| `capabilities.max_questions` | number | yes | Recommended hard cap: `7` visible patient-facing questions. |
| `capabilities.max_options_per_question` | number | ask imedtac | Needed to keep the kiosk screen readable. |
| `capabilities.max_option_label_length` | number | ask imedtac | Needed to prevent overflow. |
| `capabilities.variable_option_count` | boolean | ask imedtac | Confirms whether option count can vary by question. |
| `capabilities.voice_input` | boolean | yes | Recommended `false` for June. |

Vital payload minimum shape:

| Field | Type | Notes |
| --- | --- | --- |
| `vitals.measurement_timestamp` | string | ISO timestamp for measurement. |
| `vitals.device_id` | string | Demo device identifier, not a patient identifier. |
| `vitals.<field>.value` | number/null | Measured value or `null` if unavailable / failed. |
| `vitals.<field>.unit` | string | Example: `%`, `C`, `mmHg`, `beats/min`, `cm`, `kg`. |
| `vitals.<field>.measurement_status` | string | `measured`, `missing`, `failed`, `manual_entry`, or `not_available`. |
| `vitals.<field>.quality_flag` | string | `ok`, `needs_review`, `device_error`, `out_of_range_demo`, or `unknown`. |
| `vitals.<field>.missing_reason` | string/null | Required when the value is missing or failed. |

Illustrative request snippet:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "request_id": "req-demo-start-001",
  "idempotency_key": "idem-demo-start-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "client": {
    "source": "imvs-demo",
    "locale": "en-US"
  },
  "patient_context": {
    "demo_patient_id": "DEMO-TACHY-001",
    "age": 45,
    "sex": "male",
    "identity_mode": "demo"
  },
  "vitals": {
    "measurement_timestamp": "2026-05-21T10:01:00+08:00",
    "device_id": "IMVS-DEMO-001",
    "heart_rate_bpm": {
      "value": 118,
      "unit": "beats/min",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    },
    "spo2_percent": {
      "value": 97,
      "unit": "%",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    }
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice"],
    "max_questions": 7,
    "max_options_per_question": 4,
    "max_option_label_length": 48,
    "variable_option_count": true,
    "voice_input": false
  }
}
```

## Endpoint 1 Response

NYCU returns the session and first typed question:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `session_key` | string | yes | NYCU-generated session key; iMVS echoes it in Endpoint 2. |
| `request_id` | string | yes | Echoes request id. |
| `response_id` | string | yes | NYCU response id for debugging. |
| `session_expires_at` | string | yes | Demo session expiry time. |
| `session_state` | string | yes | `active`, `summary_ready`, `expired`, `abandoned`, or `error`. |
| `last_question_id` | string/null | yes | `null` for first question. |
| `status` | string | yes | `question` or `summary`; normally `question` here. |
| `workflow_mode` | string | yes | Echoes `post_measurement_only`. |
| `measurement_state` | string | yes | Echoes `complete`. |
| `vitals_ready` | boolean | yes | Echoes `true`. |
| `question_phase` | string | yes | `post_measurement_intake`. |
| `phase_reason` | string | yes | Short explanation for why this question is allowed. |
| `progress.current` | number | yes | Current question number. |
| `progress.expected_total` | number | yes | Estimated visible question count. |
| `question` | object | yes when `status=question` | Typed question object. |
| `demo_boundary` | string | yes | Demo-only boundary statement. |

Question object minimum shape:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `question.id` | string | yes | Stable runtime question id. |
| `question.registry_refs` | array | yes | Question registry ids, when available. |
| `question.source_refs` | array | yes | Source ids / review sources. |
| `question.evidence_status` | string | yes | Example: `clinician-signoff-needed`. |
| `question.review_owner` | string | yes | Clinical/product review owner. |
| `question.type` | string | yes | `single_choice` or `multi_choice` for June. |
| `question.ui_template` | string | yes | Usually same as `question.type`. |
| `question.text` | string | yes | Display text. |
| `question.options` | array | yes | Stable option ids and labels. |
| `question.option_count` | number | yes | Number of options. |
| `question.none_option_id` | string/null | no | For mutually exclusive "none" behavior. |
| `question.rendering_constraints.requires_no_scroll` | boolean | no | Recommended `true`. |
| `question.rendering_constraints.max_visible_options_without_scroll` | number | no | Ask imedtac to confirm. |

## Endpoint 2 Request

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
```

Required request fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_version` | string | yes | Must match supported API version. |
| `schema_version` | string | yes | Must match supported schema version. |
| `flow_version` | string | yes | Must match the active demo flow. |
| `case_id` | string | yes | Synthetic demo case id. |
| `request_id` | string | yes | One answer submission id. |
| `idempotency_key` | string | yes | Prevents retry from advancing the question flow twice. |
| `session_key` | string | yes | Same key returned by Endpoint 1. |
| `workflow_mode` | string | yes | `post_measurement_only`. |
| `measurement_state` | string | yes | `complete`. |
| `vitals_ready` | boolean | yes | `true`. |
| `question_phase` | string | yes | Usually `post_measurement_intake`. |
| `question_id` | string | yes | The question being answered. |
| `answer.selected_option_ids` | array | yes for choice questions | Stable option ids selected by the user. |
| `answer.scale_value` | number/null | no | Only if `scale` is enabled. |
| `client_event.input_mode` | string | yes | Recommended: `touch`. |
| `client_event.answered_at` | string | no | ISO timestamp if available. |

Illustrative answer snippet:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "request_id": "req-demo-answer-001",
  "idempotency_key": "idem-demo-answer-001",
  "session_key": "demo-session-tachy-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "post_measurement_intake",
  "question_id": "chief-concern",
  "answer": {
    "selected_option_ids": ["chest_discomfort"],
    "scale_value": null
  },
  "client_event": {
    "input_mode": "touch",
    "answered_at": "2026-05-21T10:02:00+08:00"
  }
}
```

## Endpoint 2 Response

NYCU returns one of two response types:

### A. Next question

```json
{
  "status": "question",
  "session_key": "demo-session-tachy-001",
  "session_state": "active",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "post_measurement_intake",
  "progress": {
    "current": 2,
    "expected_total": 5
  },
  "question": {
    "id": "chest-pain-pressure",
    "type": "single_choice",
    "ui_template": "single_choice",
    "text": "Are you having chest pain or pressure right now?",
    "options": [
      {"id": "yes", "label": "Yes"},
      {"id": "no", "label": "No"},
      {"id": "not_sure", "label": "Not sure"}
    ],
    "option_count": 3
  }
}
```

### B. Staff-review summary

```json
{
  "status": "summary",
  "session_key": "demo-session-tachy-001",
  "session_state": "summary_ready",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "summary",
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": ["vital_review", "reported_symptoms_review"],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "Synthetic demo patient selected chest discomfort."
    ],
    "objective": [
      "Measured heart rate is available in the demo vital payload."
    ],
    "review_basis": [
      "Measured vitals and reported symptoms should be reviewed by staff."
    ],
    "review_action": [
      "Please review measured vitals and reported symptoms."
    ],
    "staff_handoff_note": "Please review measured vitals and reported symptoms.",
    "not_claimed": [
      "No diagnosis",
      "No final triage level",
      "No treatment recommendation",
      "No production HIS/EMR writeback"
    ]
  }
}
```

## Retry And Idempotency

Use `request_id` for tracing and `idempotency_key` for safe retry behavior.

Required behavior:

```text
Same endpoint + same session_key when applicable + same idempotency_key + same
request body -> return the same result and do not advance the question flow
twice.
```

If the same `idempotency_key` arrives with a materially different body, NYCU
should return `error.code = "idempotency_conflict"` and should not advance the
session.

## Error And Fallback Behavior

Errors should never create a fake clinical summary.

Recommended error fields:

| Field | Notes |
| --- | --- |
| `status` | `error` |
| `error.code` | Stable machine-readable code. |
| `error.message` | Short engineering-readable message. |
| `error.retryable` | Boolean. |
| `fallback.recommended_mode` | `standard_staff_workflow`, `local_scripted_demo`, or `retry_remote_api`. |
| `demo_boundary` | Clarifies demo-only behavior. |

If NYCU remote API is unavailable during rehearsal or customer demo, imedtac UI
may switch to Local Scripted Demo Mode for demo continuity. That mode should be
clearly labeled internally and should not be presented as live API behavior.

## User Skip Behavior

This is still under NYCU / clinical reviewer discussion.

Current engineering recommendation before final clinical confirmation:

- Do not use a silent generic skip for required safety or handoff questions.
- For questions that may be hard for a user to answer, prefer explicit options
  such as `Not sure` or `Unable to answer`.
- If imedtac needs a true skip interaction for non-critical questions, the API
  should represent it explicitly, for example:

```json
{
  "answer": {
    "selected_option_ids": [],
    "scale_value": null,
    "skipped": true,
    "skip_reason": "user_unable_to_answer"
  }
}
```

NYCU will confirm which questions are required and which may allow `Not sure` /
`Unable to answer` after discussion with 多寶 / 許醫師.

## Inputs Needed From imedtac

To freeze the API examples and avoid guessing field names, NYCU needs:

1. Vital Upload API field dictionary:
   - actual field names;
   - units;
   - required / optional status;
   - missing / failed / poor-quality value representation;
   - blood pressure structure;
   - whether respiratory rate is measured, manually entered, or absent.

2. iMVS question-rendering limits:
   - supported question templates;
   - maximum visible options without scrolling;
   - maximum label length;
   - whether option count may vary;
   - whether `progress`, `ui_template`, `option_count`, and answer constraints
     can be rendered.

3. Demo environment:
   - expected base URL / deployment path for NYCU API;
   - whether browser UI calls NYCU API directly or through imedtac backend;
   - CORS / firewall / VPN constraints;
   - whether a demo bearer token or shared token is acceptable.

4. Demo preview page:
   - where `staff_review_summary` should be displayed;
   - whether the preview is staff / doctor / customer only;
   - whether patient-facing display must hide the summary.

## Delivery Plan

NYCU can provide:

- this two-endpoint API document first;
- JSON examples for start-session, answer submission, next-question, summary,
  and error responses;
- a first preset question / option template after 多寶 / 許醫師 wording review;
- a clarified skip-behavior recommendation after clinical review.

The API schema is case-agnostic. The same two endpoints can support the
tachycardia live-performance lane and the respiratory synthetic lane; only
`flow_version`, `case_id`, question set, and summary wording need to change.
