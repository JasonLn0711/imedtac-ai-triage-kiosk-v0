# AI Triage Kiosk Demo API Contract

Version: `2026-06-11-contract-draft`

Audience: 慧誠智醫（imedtac Co., Ltd.）engineering / integration team

Owner: NYCU AI Triage Kiosk Demo Team

Status: Demo integration contract for synthetic-data staff-review intake support

## 1. Contract Recommendation

This contract defines the current post-measurement API for the AI Triage Kiosk Demo. The recommended integration path is a two-endpoint workflow:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

The runtime supports a synthetic-data, vital-aware intake loop. iMVS completes vital-sign measurement first, calls NYCU to create a demo session, receives the first governed question, then submits selected option ids until NYCU returns a staff-review summary or staff-notify handoff.

The API output is staff-review intake support and workflow support. It is designed for a human review workflow, synthetic-data demo context, and a separate production validation path.

## 2. Operating Scope

The contract supports:

- Post-measurement intake after iMVS vital-sign measurement is complete.
- Structured question rendering by iMVS using NYCU-provided `question` objects.
- Structured answer submission using stable option ids.
- Session-level idempotency for safe retry behavior.
- Staff-review summary generation for demo handoff.
- Conditional bearer-token protection for rehearsal deployments.
- CORS preflight support for browser-based integration testing.

Scope controls:

- Synthetic-data demo context.
- Staff-review intake support.
- Human review workflow.
- No real patient identifiers in requests.
- No live HIS / EMR / FHIR writeback.
- Production activation requires a separate validation and governance path.

## 3. Runtime Baseline

### Base Path

```text
/api/triage-demo
```

### Known Rehearsal Deployment Base URL

```text
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo
```

### Canonical Endpoints

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/triage-demo/sessions` | `POST` | Create a demo session after vital-sign measurement is complete and receive the first question. |
| `/api/triage-demo/sessions/{session_key}/answers` | `POST` | Submit the current answer and receive the next question, staff-notify response, or final staff-review summary. |
| `/api/triage-demo/sessions` | `OPTIONS` | CORS preflight. |
| `/api/triage-demo/sessions/{session_key}/answers` | `OPTIONS` | CORS preflight. |
| `/healthz` | `GET` | Runtime health check. |

The following earlier design is not part of the current external runtime contract:

```text
POST /api/triage-demo/sessions/{session_key}/vitals
```

That endpoint remains a future optimized workflow candidate and should only be activated after both teams confirm a measurement-time UI insertion point.

## 4. Headers, Authentication, And CORS

### Request Headers

| Header | Required | Description |
| --- | --- | --- |
| `Content-Type: application/json` | yes for `POST` | Both canonical POST endpoints accept JSON bodies. |
| `Authorization: Bearer <demo token>` | conditional | Required only when NYCU deployment sets `DEMO_BEARER_TOKEN`. |

### Bearer Token Behavior

If `DEMO_BEARER_TOKEN` is not configured, bearer-token checking is disabled for local/demo operation.

If `DEMO_BEARER_TOKEN` is configured, each canonical POST request must include:

```text
Authorization: Bearer <demo token>
```

Invalid or missing token response:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="nycu-imedtac-triage-demo"
Content-Type: application/json
```

Token stewardship:

- Store demo tokens only in deployment environment variables or private secret stores.
- Do not store bearer tokens in Git, Markdown, screenshots, logs, browser-visible config, or planning notes.
- Rotate any token that appears in chat, repo files, screenshots, or logs.

### CORS Baseline

| Item | Runtime Behavior |
| --- | --- |
| Allowed methods | `POST`, `OPTIONS` for the external contract |
| Allowed headers | `Content-Type`, `Authorization` |
| Default allowed origins | `http://localhost`, `http://localhost:5174` |
| Preflight | `OPTIONS` returns `204`; bearer token is not required for preflight. |

If iMVS uses `127.0.0.1`, an internal IP, a browser WebView origin, HTTPS domain, or another port, provide the exact browser `Origin` header so NYCU can add it to the allowlist.

## 5. Shared Response Envelope

Successful responses and error responses use a common envelope.

| Field | Type | Description |
| --- | --- | --- |
| `api_version` | string | API contract version. Current tachycardia demo examples use `2026-05-22-demo-v0.2-draft`. |
| `schema_version` | string | JSON schema version. Current examples use `imvs-nycu-triage-demo-schema-v0.2-draft`. |
| `flow_version` | string | Runtime flow version. Tachycardia JS runtime uses `tachycardia-live-demo-flow-v0.2-draft`; Python vital router uses `vital-rules-router-v1-demo`. |
| `case_id` | string | Synthetic demo case or routed session id. |
| `case_version` | string | Case content version. |
| `fixture_version` | string | Demo fixture version or `not_applicable` for dynamic routed sessions. |
| `question_set_version` | string | Question set / option mapping version. |
| `wording_version` | string | Patient and staff wording version. |
| `request_id` | string/null | Echoes caller request id when provided. |
| `response_id` | string | NYCU runtime response id. |
| `session_key` | string/null | Session id created by Endpoint 1. |
| `session_expires_at` | string/null | ISO timestamp. Current runtime TTL is 30 minutes. |
| `workflow_mode` | string | Current canonical value: `post_measurement_only`. |
| `measurement_state` | string | Current canonical value: `complete`. |
| `vitals_ready` | boolean | Current canonical value: `true`. |
| `status` | string | `question`, `summary`, `staff_notify`, or `error`. |
| `session_state` | string | `active`, `summary_ready`, `staff_notify_ready`, `expired`, or `error`. |
| `demo_boundary` | string | Operating-scope text for demo use. |

Canonical demo boundary:

```text
Synthetic-data staff-review intake support with human-review workflow and separate production validation path.
```

## 6. Endpoint 1: Start Session With Measured Vitals

```http
POST /api/triage-demo/sessions
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

### Purpose

iMVS calls this endpoint after vital-sign measurement is complete. NYCU creates a demo session, stores the caller payload in demo session state, evaluates vital-aware routing, and returns either:

- the first governed question,
- a staff-notify handoff response when the vital gate indicates immediate staff review, or
- an error response when the request violates the contract.

### Request Body

| Field | Type | Required | Runtime Rule / Integration Meaning |
| --- | --- | --- | --- |
| `api_version` | string | recommended | Contract trace field. |
| `schema_version` | string | recommended | Schema trace field. |
| `flow_version` | string | recommended | Demo flow trace field. |
| `case_id` | string | optional in code, recommended for tachycardia demo | JS tachycardia runtime accepts `demo-tachycardia-live-001` if provided. Python vital router can route broader vital/question sessions. |
| `case_version` | string | recommended | Case content trace field. |
| `fixture_version` | string | recommended | Fixture trace field. |
| `question_set_version` | string | recommended | Question/option mapping trace field. |
| `wording_version` | string | recommended | Display/summary wording trace field. |
| `request_id` | string | recommended | Unique id per HTTP request. |
| `idempotency_key` | string | recommended | Reuse the same key only for retrying the same request body. |
| `workflow_mode` | string | recommended | Must be `post_measurement_only` when provided. |
| `measurement_state` | string | conditional | Must be `complete` when provided. |
| `vitals_ready` | boolean | conditional | Must not be `false`. June demo should send `true`. |
| `client.source` | string | recommended | Example: `imvs-demo`. |
| `client.site` | string | optional | Demo site or environment label. |
| `client.locale` | string | recommended | Example: `en-US`. |
| `patient_context.demo_patient_id` | string | recommended | Synthetic demo patient id. Do not send real MRN, name, phone, or national id. |
| `patient_context.age` | number | optional | Synthetic or demo patient context. |
| `patient_context.sex` | string | optional | Synthetic or demo patient context. |
| `patient_context.identity_mode` | string | optional | Example: `demo`. |
| `patient_context.chief_concern` | string | optional | Python vital router can use this to select a branch when vitals do not force a branch. |
| `vitals` | object | recommended | Measured or synthetic vital payload. JS runtime uses fixture vitals if omitted. |
| `capabilities.question_types` | string[] | recommended | UI-supported question types. June baseline: `["single_choice", "multi_choice"]`. |
| `capabilities.max_questions` | number | recommended | UI capacity cap. This is not necessarily the displayed `expected_total`. |
| `capabilities.max_options_per_question` | number | recommended | Current no-scroll working assumption: up to 9 visible options. |
| `capabilities.max_option_label_length` | number | optional | Suggested UI design bound: 48 characters. |
| `capabilities.variable_option_count` | boolean | optional | Whether the UI supports variable option count per question. |
| `capabilities.voice_input` | boolean | recommended | June critical path: `false`. |

### Vital Payload Shape

Recommended normalized shape:

```json
{
  "measurement_timestamp": "2026-05-21T10:01:00+08:00",
  "device_id": "IMVS-DEMO-001",
  "heart_rate_bpm": {
    "value": 130,
    "unit": "bpm",
    "measurement_status": "measured",
    "quality_flag": "needs_review",
    "missing_reason": null
  }
}
```

Per-vital object:

| Field | Type | Description |
| --- | --- | --- |
| `value` | number/null | Vital value. May be `null` when unavailable or failed. |
| `unit` | string | Explicit unit for UI/log/summary alignment. |
| `measurement_status` | string | Suggested values: `measured`, `missing`, `failed`, `manual_entry`, `not_available`. |
| `quality_flag` | string | Suggested values: `ok`, `needs_review`, `device_error`, `out_of_range_demo`, `unknown`. |
| `missing_reason` | string/null | Reason for missing or unavailable measurement. |

Recommended normalized vital fields:

| Field | Unit | Description |
| --- | --- | --- |
| `blood_pressure_systolic_mm_hg` | `mmHg` | Systolic blood pressure. |
| `blood_pressure_diastolic_mm_hg` | `mmHg` | Diastolic blood pressure. |
| `spo2_percent` | `%` | Oxygen saturation. |
| `heart_rate_bpm` | `bpm` | Heart rate. |
| `temperature_c` | `C` | Body temperature. |
| `respiratory_rate_per_min` | `breaths/min` | Demo/manual/synthetic unless measured source is confirmed. |
| `glucose_mg_dl` | `mg/dL` | Glucose if supported by product variant. |
| `weight_kg` | `kg` | Weight. |
| `height_cm` | `cm` | Height. |

iMVS V1.4 baseline mapping:

| iMVS Object | iMVS Value Field(s) | Unit | Normalized Field |
| --- | --- | --- | --- |
| `NBP` | `SYS_Value`, `DIA_Value` | `mmHg` | `blood_pressure_systolic_mm_hg`, `blood_pressure_diastolic_mm_hg` |
| `SPO2` | `Value` | `%` | `spo2_percent` |
| `HR` | `BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp` | `Value` | `deg C` / `C` | `temperature_c` |
| `Glucose` | `Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight` | `Value` | `kg` | `weight_kg` |
| `Height` | `Value` | `cm` | `height_cm` |

Integration notes:

- Values may arrive as strings; runtime adapters should parse numeric values.
- The contract uses `bpm` for heart-rate units.
- BMI is derived context from height and weight, not a confirmed V1.4 upload field.
- SpO2 and glucose are supported fields; hardware availability may vary by product variant.

### Request Example

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "case_version": "demo-tachycardia-live-001-v0.2",
  "fixture_version": "v0.2.0",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft",
  "request_id": "req-demo-tachy-start-001",
  "idempotency_key": "idem-demo-tachy-start-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "client": {
    "source": "imvs-demo",
    "site": "demo",
    "locale": "en-US"
  },
  "patient_context": {
    "demo_patient_id": "DEMO-TACHY-001",
    "age": 76,
    "sex": "female",
    "identity_mode": "demo",
    "chief_concern": "palpitations"
  },
  "vitals": {
    "measurement_timestamp": "2026-05-21T10:01:00+08:00",
    "device_id": "IMVS-DEMO-001",
    "temperature_c": {
      "value": 36.5,
      "unit": "C",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    },
    "spo2_percent": {
      "value": 98,
      "unit": "%",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    },
    "heart_rate_bpm": {
      "value": 130,
      "unit": "bpm",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    },
    "blood_pressure_systolic_mm_hg": {
      "value": 102,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    },
    "blood_pressure_diastolic_mm_hg": {
      "value": 68,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    }
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice"],
    "max_questions": 7,
    "max_options_per_question": 9,
    "max_option_label_length": 48,
    "variable_option_count": true,
    "voice_input": false
  }
}
```

### Success Response: Question

HTTP `200`

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "case_version": "demo-tachycardia-live-001-v0.2",
  "fixture_version": "v0.2.0",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft",
  "request_id": "req-demo-tachy-start-001",
  "response_id": "resp-demo-tachy-question-001",
  "session_key": "demo-session-tachy-001",
  "session_expires_at": "2026-05-21T10:31:00+08:00",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "session_state": "active",
  "last_question_id": null,
  "status": "question",
  "question_phase": "post_measurement_intake",
  "phase_reason": "Measurement is complete and the demo heart-rate cue is available, so the tachycardia live intake question set can start.",
  "progress": {
    "current": 1,
    "expected_total": 7
  },
  "question": {
    "id": "tachy-chief-concern",
    "registry_refs": ["TACHY-001"],
    "source_refs": [
      "DUOBAO-DEMO-DESIGN-20260520",
      "DUOBAO-AFRVR-TACHY-QA-20260525",
      "IMEDTAC-POST-MEETING-PROGRESS-20260521",
      "LOCAL-PROTOCOL-TBD"
    ],
    "evidence_status": "clinical-review-needed",
    "review_owner": "clinical_reviewer_tbd",
    "type": "single_choice",
    "ui_template": "single_choice",
    "text": "What is the main reason you are using the kiosk today?",
    "options": [
      {"id": "heart_racing", "label": "Heart racing / palpitations"},
      {"id": "chest_tightness", "label": "Chest tightness / pressure"},
      {"id": "breathing_or_dizzy", "label": "Shortness of breath or dizziness"},
      {"id": "other_or_not_sure", "label": "Other / not sure"}
    ],
    "option_count": 4,
    "none_option_id": null,
    "required": true,
    "allow_not_sure": true,
    "allow_skip": false,
    "max_selections": 1,
    "trigger_reason_codes": ["post_measurement_tachycardia_live_demo"],
    "summary_effect": "Adds the main cardiopulmonary concern to the staff-review summary.",
    "rendering_constraints": {
      "requires_no_scroll": true,
      "max_visible_options_without_scroll": 9
    },
    "evidence_refs": ["DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"],
    "demo_boundary": "Synthetic-data demo question for staff-review intake support."
  },
  "demo_boundary": "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
}
```

### Success Response: Staff Notify

HTTP `200`

Python vital-router runtime may return a staff-notify response when vital rules select immediate staff review.

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "vital-rules-router-v1-demo",
  "case_id": "vital-routed-staff_notify",
  "session_key": "vital-router-session-001",
  "session_expires_at": "2026-06-11T12:30:00Z",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "session_state": "staff_notify_ready",
  "last_question_id": null,
  "status": "staff_notify",
  "question_phase": "staff_notify",
  "progress": {
    "current": 0,
    "expected_total": 0
  },
  "screen_text": "Please notify staff.",
  "handoff_required": true,
  "handoff_reason_codes": ["example_staff_review_flag"],
  "staff_review_flags": [
    {
      "code": "example_staff_review_flag",
      "label": "Example staff-review flag",
      "summary_text": "Example measured-vital review cue.",
      "triggered_by": "vitals"
    }
  ],
  "demo_boundary": "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
}
```

The exact `handoff_reason_codes` and `staff_review_flags` depend on the measured-vital payload and selected runtime branch.

## 7. Question Object Schema

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable question id. Endpoint 2 must send this value as `question_id`. |
| `registry_refs` | string[] | NYCU question registry references. |
| `source_refs` | string[] | Source/review references. |
| `evidence_status` | string | Review status, for example `clinical-review-needed` or `source-backed`. |
| `review_owner` | string | Review owner or placeholder. |
| `type` | string | Current external baseline: `single_choice`, `multi_choice`. Python runtime can also model `number`, `text`, and `time` for broader routed demos. |
| `ui_template` | string | UI rendering template. Usually equals `type`. |
| `text` | string | Patient-facing display text. |
| `options` | object[] | Option list. Each option has `id` and `label`. |
| `option_count` | number | Count of options. |
| `none_option_id` | string/null | Explicit none option id when available. |
| `required` | boolean | Whether answer is required. |
| `allow_not_sure` | boolean | Whether the question includes not-sure / staff-confirm path. |
| `allow_skip` | boolean | Current baseline usually `false`. |
| `max_selections` | number | Maximum selected option count. Single-choice questions use `1`. |
| `trigger_reason_codes` | string[] | Machine-readable reason codes for why the question appears. |
| `summary_effect` | string | Description of how the answer contributes to staff-review summary. |
| `rendering_constraints.requires_no_scroll` | boolean | Current UI working target: `true`. |
| `rendering_constraints.max_visible_options_without_scroll` | number | Current working assumption: `9`. |
| `evidence_refs` | string[] | Evidence/review refs. |
| `demo_boundary` | string | Question-level operating scope. |

Option object:

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable machine-readable option id. iMVS must submit ids, not labels. |
| `label` | string | Patient-facing label to render. |

## 8. Endpoint 2: Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

### Purpose

iMVS submits the structured answer for the current question. NYCU validates the session, current question, option ids, and selection count. The response is one of:

- next question,
- staff-notify handoff,
- final staff-review summary,
- structured error.

### Path Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `session_key` | string | yes | Session id returned by Endpoint 1. |

### Request Body

| Field | Type | Required | Runtime Rule / Integration Meaning |
| --- | --- | --- | --- |
| `api_version` | string | recommended | Contract trace field. |
| `schema_version` | string | recommended | Schema trace field. |
| `flow_version` | string | recommended | Should align with session flow. |
| `case_id` | string | recommended | Should align with session case. |
| `request_id` | string | recommended | Unique id per HTTP request. |
| `idempotency_key` | string | recommended | Reuse only for retrying the same answer body. |
| `session_key` | string | recommended | Body echo for logs; runtime session lookup uses path session key. |
| `workflow_mode` | string | recommended | Current value: `post_measurement_only`. |
| `measurement_state` | string | recommended | Current value: `complete`. |
| `vitals_ready` | boolean | recommended | Current value: `true`. |
| `question_phase` | string | recommended | Echo from question response when available. |
| `question_id` | string | yes | Must match the current question id for the session. |
| `answer.selected_option_ids` | string[] | yes for choice questions | At least one stable option id from the previous `question.options`. |
| `answer.numeric_value` | number | required for Python `number` questions | Used by broader Python routed demo when the current question type is `number`. |
| `answer.text_value` | string | required for Python `text` or `time` questions | Used by broader Python routed demo when the current question type is `text` or `time`. |
| `answer.scale_value` | number/null | optional | Future/UI confirmation field; current choice flow can send `null`. |
| `client_event.input_mode` | string | recommended | Example: `touch`. |
| `client_event.answered_at` | string | optional | ISO timestamp. |

### Request Example

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "request_id": "req-demo-tachy-answer-001",
  "idempotency_key": "idem-demo-tachy-answer-001",
  "session_key": "demo-session-tachy-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "post_measurement_intake",
  "question_id": "tachy-chief-concern",
  "answer": {
    "selected_option_ids": ["heart_racing"],
    "scale_value": null
  },
  "client_event": {
    "answered_at": "2026-05-21T10:02:00+08:00",
    "input_mode": "touch"
  }
}
```

### Answer Validation Rules

| Rule | Failure Response |
| --- | --- |
| `session_key` not found | HTTP `404`, `error.code = "invalid_session"` |
| Session expired | HTTP `410`, `error.code = "session_expired"` in JS runtime |
| Session already reached summary | HTTP `409`, `error.code = "session_summary_ready"` |
| Session already reached staff-notify handoff | HTTP `409`, `error.code = "session_staff_notify_ready"` in Python runtime |
| Missing `question_id` | HTTP `422`, `error.code = "invalid_answer"` |
| `question_id` does not match expected current question | HTTP `422`, `error.code = "invalid_answer"` |
| Choice question has empty `answer.selected_option_ids` | HTTP `422`, `error.code = "invalid_answer"` |
| Selection count exceeds `question.max_selections` | HTTP `422`, `error.code = "invalid_answer"` |
| Unknown option id | HTTP `422`, `error.code = "invalid_answer"` |
| `none_option_id` combined with another option | HTTP `422`, `error.code = "invalid_answer"` in JS runtime |
| Number question missing numeric answer | HTTP `422`, `error.code = "invalid_answer"` in Python runtime |
| Text/time question missing text answer | HTTP `422`, `error.code = "invalid_answer"` in Python runtime |

iMVS must submit stable option ids, not display labels.

### Success Response A: Next Question

HTTP `200`, `status = "question"`

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "case_version": "demo-tachycardia-live-001-v0.2",
  "fixture_version": "v0.2.0",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft",
  "request_id": "req-demo-tachy-answer-001",
  "response_id": "resp-demo-tachy-question-002",
  "session_key": "demo-session-tachy-001",
  "session_expires_at": "2026-05-21T10:31:00+08:00",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "session_state": "active",
  "last_question_id": "tachy-chief-concern",
  "status": "question",
  "question_phase": "post_measurement_intake",
  "phase_reason": "tachy-chief-concern was recorded; the next governed tachycardia demo question is ready.",
  "progress": {
    "current": 2,
    "expected_total": 7
  },
  "question": {
    "id": "tachy-onset",
    "type": "single_choice",
    "ui_template": "single_choice",
    "text": "When did this start?",
    "options": [
      {"id": "within_1_hour", "label": "Within the last hour"},
      {"id": "few_hours", "label": "A few hours ago"},
      {"id": "half_day", "label": "About half a day"},
      {"id": "more_than_1_day_or_not_sure", "label": "More than one day / not sure"}
    ],
    "option_count": 4,
    "none_option_id": null,
    "required": true,
    "allow_not_sure": true,
    "allow_skip": false,
    "max_selections": 1,
    "trigger_reason_codes": ["reported_palpitations"],
    "summary_effect": "Adds onset and duration context to the staff-review summary.",
    "rendering_constraints": {
      "requires_no_scroll": true,
      "max_visible_options_without_scroll": 9
    },
    "demo_boundary": "Synthetic-data demo question for staff-review intake support."
  },
  "demo_boundary": "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
}
```

### Success Response B: Final Staff-Review Summary

HTTP `200`, `status = "summary"`

| Field | Type | Description |
| --- | --- | --- |
| `session_state` | string | `summary_ready`. |
| `last_question_id` | string | Last successfully recorded question id. |
| `status` | string | `summary`. |
| `question_phase` | string | `summary`. |
| `progress.current` | number | Runtime current count. |
| `progress.expected_total` | number | Display denominator. |
| `summary_visibility` | string | `staff_only` in JS runtime. |
| `handoff_required` | boolean | Whether staff review / handoff is required. |
| `handoff_reason_codes` | string[] | Machine-readable reason codes. |
| `staff_review_summary` | object | Staff-review summary object. |
| `evidence_refs` | string[] | Evidence/review references when provided. |

`staff_review_summary` fields:

| Field | Type | Description |
| --- | --- | --- |
| `format` | string | Summary format label. |
| `subjective` | string[] | Patient-reported selected-answer summary. |
| `objective` | string[] | Vital payload summary. |
| `review_basis` | string[] | Staff review basis. |
| `review_action` | string[] | Human review action reminder. |
| `staff_handoff_note` | string | Short handoff note. |
| `scope_controls` | string[] | Positive scope controls. |

Example:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "case_version": "demo-tachycardia-live-001-v0.2",
  "fixture_version": "v0.2.0",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft",
  "request_id": "req-demo-tachy-answer-007",
  "response_id": "resp-demo-tachy-summary-001",
  "session_key": "demo-session-tachy-001",
  "session_expires_at": "2026-05-21T10:31:00+08:00",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "session_state": "summary_ready",
  "last_question_id": "tachy-medication-allergy-confirm",
  "status": "summary",
  "question_phase": "summary",
  "progress": {
    "current": 7,
    "expected_total": 7
  },
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": [
    "measured_elevated_heart_rate_demo",
    "reported_palpitations",
    "reported_chest_tightness",
    "associated_symptoms_none_selected",
    "staff_review_needed"
  ],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "Synthetic demo patient reports palpitations and middle chest tightness for about half a day.",
      "Selected associated symptoms: none of the listed shortness of breath, sweating, dizziness, or fainting options.",
      "Patient selected rhythm-history and hypertension context; aspirin, antihypertensive medication, and allergy status should be confirmed by staff."
    ],
    "objective": [
      "Demo vital payload includes HR 130 bpm, SpO2 98%, BP 102/68 mmHg, respiratory rate 16 breaths/min, and temperature 36.5 C.",
      "Heart-rate field quality flag is needs_review."
    ],
    "review_basis": [
      "Measured heart-rate cue plus reported palpitation / chest-tightness symptoms supports staff review in this demo workflow.",
      "The summary organizes measured vitals and selected answers for human review."
    ],
    "review_action": [
      "Please review measured heart rate, reported symptoms, rhythm-history selection, and medication/allergy confirmation."
    ],
    "staff_handoff_note": "Review measured heart rate and reported cardiopulmonary symptoms.",
    "scope_controls": [
      "Staff-review intake support",
      "Human review workflow",
      "Synthetic-data demo context",
      "Production integration managed through a separate validation path"
    ]
  },
  "evidence_refs": ["DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"],
  "demo_boundary": "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
}
```

## 9. Error Response Contract

Error responses use the shared envelope plus an `error` object.

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "request_id": "req-demo-answer-002",
  "response_id": "resp-demo-tachy-error-001",
  "session_key": "demo-session-tachy-001",
  "session_expires_at": "2026-05-21T10:31:00+08:00",
  "status": "error",
  "session_state": "error",
  "error": {
    "code": "invalid_answer",
    "message": "expected question_id tachy-onset, received tachy-chief-concern",
    "retryable": false,
    "details": null
  },
  "recovery": null,
  "demo_boundary": "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
}
```

### Error Codes

| HTTP | Code | Meaning | Retry Guidance |
| --- | --- | --- | --- |
| `400` | `invalid_json` | Request body is not valid JSON. | Fix payload, submit again with a new request id. |
| `400` | `request_body_too_large` | Request body exceeds demo API size limit. JS runtime limit defaults to 32 KB. | Reduce payload. |
| `401` | `demo_bearer_token_required` | Missing or invalid bearer token when token gate is enabled. | Provide configured token. |
| `404` | `invalid_session` | Session key not found or no longer available. | Start a new session. |
| `409` | `idempotency_conflict` | Same idempotency key reused with a different request body. | Lock UI and restart demo session. |
| `409` | `session_summary_ready` | Session already reached final summary. | Start a new session. |
| `409` | `session_staff_notify_ready` | Python vital-router session reached staff-notify handoff. | Staff should review before another answer path. |
| `410` | `session_expired` | Session expired. JS runtime marks expired sessions. | Start a new session. |
| `422` | `invalid_start_session_request` | Start-session payload violates workflow / measurement / vitals readiness rules. | Fix payload and retry. |
| `422` | `invalid_answer` | Answer payload does not match current question contract. | Keep UI on current question and correct submission. |
| `422` | `raw_audio_not_accepted` | JS internal answer-candidate endpoint rejected raw audio. | Do not submit raw audio. |
| `429` | `rate_limited` | Too many requests in the current rate-limit window. | Back off and retry later. |
| `503` | `session_store_unavailable` | Configured demo session store unavailable. | Retry after runtime/session-store recovery. |

## 10. Idempotency Contract

Both start-session and answer-submission requests support `idempotency_key`.

Rules:

- Use a unique `idempotency_key` per intended operation.
- Reuse the same key only when retrying the exact same request body.
- `request_id` may change across retries; the runtime excludes `request_id` from the idempotency body hash.
- Reusing the same key with a different body returns `409 idempotency_conflict`.

Conflict response includes recovery guidance:

```json
{
  "safe_next_action": "restart_demo_session",
  "owner": "imvs_ui_operator",
  "ui_locking_required": true,
  "instructions": [
    "Do not reuse this idempotency_key for a different answer.",
    "Do not auto-submit the changed answer with a new idempotency_key.",
    "Keep answer controls locked until the operator starts a new demo session or switches to labeled fallback.",
    "Start a new demo session through POST /api/triage-demo/sessions."
  ]
}
```

## 11. Session Lifecycle

| State | Meaning | iMVS Action |
| --- | --- | --- |
| `active` | Runtime is waiting for the next answer. | Render current `question`; submit selected option ids. |
| `summary_ready` | Runtime has produced final staff-review summary. | Display summary in staff-review surface; do not submit more answers. |
| `staff_notify_ready` | Runtime selected staff notify handoff. | Show staff notification/handoff screen; do not continue unattended. |
| `expired` | Session TTL elapsed. | Start a new session. |
| `error` | Request failed validation or runtime guard. | Follow `error.code` and `recovery`. |

Current session TTL: 30 minutes.

## 12. Frontend Rendering Requirements

iMVS should render the returned `question` object directly.

Required behavior:

- Display `question.text`.
- Render options in the order returned by NYCU.
- Submit `option.id`, not `option.label`.
- Enforce `question.max_selections`.
- When `question.none_option_id` is present, do not combine that option with other options.
- Preserve `question_id` from the response and send it back exactly.
- Do not parse or depend on `phase_reason` text for workflow logic.
- Use `progress.current` and `progress.expected_total` for display only.
- Use a clear staff-review / handoff surface for `status = "summary"` or `status = "staff_notify"`.

Recommended UI behavior:

- Keep answer controls locked while a request is in flight.
- On timeout, retry with the same `idempotency_key` and same body.
- On `idempotency_conflict`, lock controls and restart the demo session.
- Log `request_id`, `response_id`, `session_key`, `question_id`, and `error.code` for debugging; do not log tokens or real patient identifiers.

## 13. Privacy And Data Controls

The demo contract is designed for synthetic-data operation.

Do not send:

- Real patient name.
- MRN.
- National id.
- Phone number.
- Address.
- Real hospital account identifiers.
- Live clinical integration secrets.
- API keys or bearer tokens in body fields.
- Raw audio payloads.

Allowed demo context:

- Synthetic demo patient id.
- Synthetic age and sex.
- Synthetic vital measurements.
- Demo site / locale.
- Structured selected option ids.

## 14. Implementation Notes

The current repository contains two compatible but not identical runtime implementations.

### JS Runtime

Path:

```text
JS/api/lib/triage-demo-contract.js
```

Characteristics:

- Tachycardia live demo v0.2 dynamic-engine path.
- Uses `demo-tachycardia-live-001` fixture and tachycardia seven-question lane.
- Supports Redis/session-store adapter when configured.
- Supports rate limiting and request body size guard.
- Supports additional internal/demo helper endpoints:
  - `POST /api/triage-demo/sessions/{session_key}/answer-candidates`
  - `GET /api/triage-demo/sessions/{session_key}/summary`

External contract status:

- Use only the two canonical POST endpoints unless both teams explicitly agree to publish helper endpoints.

### Python FastAPI Runtime

Path:

```text
python_api/main.py
python_api/triage_contract.py
python_api/triage_v1/
```

Characteristics:

- Vital-rules-router v1 demo path.
- Reads CSV question banks under `Question_DB/`.
- Routes broader branch flows from measured vitals and chief concern.
- Can return `status = "staff_notify"` for immediate staff-review handoff.
- Models broader question types: `single_choice`, `multi_choice`, `number`, `text`, `time`.

External contract status:

- Uses the same two canonical POST endpoint workflow.
- Version fields may identify `vital-rules-router-v1-demo` rather than tachycardia v0.2.

## 15. Integration Checklist

Before rehearsal:

- Confirm base URL.
- Confirm browser `Origin` allowlist.
- Confirm whether `DEMO_BEARER_TOKEN` is enabled.
- Confirm token exchange through private channel only.
- Confirm iMVS sends `workflow_mode = "post_measurement_only"`.
- Confirm iMVS sends `measurement_state = "complete"`.
- Confirm iMVS sends `vitals_ready = true`.
- Confirm iMVS renders variable option counts.
- Confirm iMVS submits option ids, not labels.
- Confirm iMVS handles `question`, `summary`, `staff_notify`, and `error` statuses.
- Confirm retry behavior with `idempotency_key`.
- Confirm no real patient identifiers are sent.

## 16. Minimal Happy Path

1. iMVS completes measurement.
2. iMVS sends:

```http
POST /api/triage-demo/sessions
```

3. NYCU returns:

```json
{
  "status": "question",
  "session_key": "demo-session-tachy-001",
  "question": {
    "id": "tachy-chief-concern",
    "type": "single_choice",
    "options": [
      {"id": "heart_racing", "label": "Heart racing / palpitations"}
    ]
  }
}
```

4. iMVS renders the question and submits:

```http
POST /api/triage-demo/sessions/demo-session-tachy-001/answers
```

```json
{
  "request_id": "req-demo-answer-001",
  "idempotency_key": "idem-demo-answer-001",
  "question_id": "tachy-chief-concern",
  "answer": {
    "selected_option_ids": ["heart_racing"]
  }
}
```

5. NYCU returns the next question or final staff-review summary.

6. iMVS stops submitting answers when `status` is `summary` or `staff_notify`.
