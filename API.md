# AI Triage Demo API

本文整理目前 `api/` 實作與 `spec/iMVS_AI_Triage_20260515.pdf` 的對應關係，作為
慧誠智醫（imedtac Co., Ltd.）六月 AI Triage kiosk demo 的 API 規格說明。

本版 API 是 synthetic-data demo contract。API output 定位為 staff-review intake
support 與 workflow support，不是診斷、治療建議、final triage level、production
HIS/EMR/FHIR writeback，或正式臨床決策系統。

## Contract Baseline

目前 runtime 實作採用兩個 endpoint：

| Endpoint | Method | 用途 |
| --- | --- | --- |
| `/api/triage-demo/sessions` | `POST` | iMVS 完成 vital-sign measurement 後建立 demo session，取得第一題。 |
| `/api/triage-demo/sessions/{session_key}/answers` | `POST` | 送出目前題目的 answer，取得下一題或最終 `staff_review_summary`。 |

目前 workflow 固定為：

```text
iMVS completes vital-sign measurement
-> POST /api/triage-demo/sessions
-> NYCU returns session_key + first question
-> iMVS renders question and submits selected option ids
-> POST /api/triage-demo/sessions/{session_key}/answers
-> NYCU returns next question or staff_review_summary
```

早期 three-endpoint two-phase design 中的
`POST /api/triage-demo/sessions/{session_key}/vitals` 目前不是 runtime API。它保留
為 future optimized workflow，只有在雙方重新確認 measurement-time UI insertion
point 後才應升版納入。

## Base URL

Local/mock server 或 Vercel function path 使用：

```text
/api/triage-demo
```

已記錄的第一輪 rehearsal deployment base URL：

```text
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo
```

完整 endpoint：

```text
POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions
POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions/{session_key}/answers
```

## Headers And CORS

Request headers:

| Header | Required | 說明 |
| --- | --- | --- |
| `Content-Type: application/json` | yes | 兩個 `POST` endpoint 都接收 JSON body。 |
| `Authorization: Bearer <demo token>` | conditional | 若 NYCU runtime 設定 `DEMO_BEARER_TOKEN`，兩個 `POST` endpoint 都要求 bearer token。實際 token 不寫入 repo。 |

CORS:

| Item | Runtime behavior |
| --- | --- |
| Allowed methods | `POST`, `OPTIONS` |
| Allowed headers | `Content-Type`, `Authorization` |
| Allowed browser origins | `http://localhost`, `http://localhost:5174` |
| Preflight | `OPTIONS` 回 `204`，不要求 bearer token。 |

如果測試環境使用 `127.0.0.1`、內網 IP、其他 port、HTTPS domain 或 WebView custom
origin，需要先提供實際 `Origin` header 再加入 allowlist。

## Shared Response Fields

正常 response 與 error response 都會包含下列 contract/version/session 欄位。

| Field | Type | 說明 |
| --- | --- | --- |
| `api_version` | string | API contract version。目前由範例回傳 `2026-05-22-demo-v0.2-draft`。 |
| `schema_version` | string | JSON schema version。目前為 `imvs-nycu-triage-demo-schema-v0.2-draft`。 |
| `flow_version` | string | Demo flow version。目前 tachycardia lane 為 `tachycardia-live-demo-flow-v0.2-draft`。 |
| `case_id` | string | Synthetic demo case id。目前支援 `demo-tachycardia-live-001`。 |
| `case_version` | string | Demo case content version。 |
| `fixture_version` | string | Demo fixture version。 |
| `question_set_version` | string | Question set 與 option id mapping version。 |
| `wording_version` | string | Patient/staff display wording version。 |
| `request_id` | string/null | Echo caller request id。 |
| `response_id` | string | NYCU runtime response id。 |
| `session_key` | string/null | Session id。Endpoint 1 成功後由 NYCU 產生。 |
| `session_expires_at` | string/null | Session expiry ISO timestamp。Runtime TTL 為 30 分鐘。 |
| `workflow_mode` | string | Runtime 固定回 `post_measurement_only`。 |
| `measurement_state` | string | Runtime 正常回 `complete`。 |
| `vitals_ready` | boolean | Runtime 正常回 `true`。 |
| `demo_boundary` | string | Demo operating scope。 |

## Endpoint 1: Start Session With Measured Vitals

```http
POST /api/triage-demo/sessions
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

### Purpose

iMVS 在 vital-sign measurement 完成後呼叫此 endpoint。NYCU runtime 建立一個
demo session，保存 caller payload 的 `vitals`、`patient_context` 與 `demo_script`
context，然後回傳第一題 `question`。

### Request Body

Runtime 目前只強制驗證 `case_id`、`measurement_state` 與 `vitals_ready` 的核心
邏輯；下表同時列出 integration baseline 建議欄位，方便 imedtac frontend 完整串接。

| Field | Type | Required | Runtime rule / integration meaning |
| --- | --- | --- | --- |
| `api_version` | string | recommended | Contract 對齊欄位。Runtime 可由 NYCU response 管理。 |
| `schema_version` | string | recommended | Schema 對齊欄位。 |
| `flow_version` | string | recommended | Demo flow version。Tachycardia lane 使用 `tachycardia-live-demo-flow-v0.2-draft`。 |
| `case_id` | string | optional in code, recommended | 若提供，必須是 `demo-tachycardia-live-001`；其他值回 `422 invalid_start_session_request`。 |
| `case_version` | string | recommended | Case content version。 |
| `fixture_version` | string | recommended | Rehearsal fixture version。 |
| `question_set_version` | string | recommended | Question set version。 |
| `wording_version` | string | recommended | Summary/display wording version。 |
| `request_id` | string | recommended | 每次 HTTP request 產生新的 trace id。 |
| `idempotency_key` | string | recommended | 同一次 start-session retry 使用同一 key。相同 key 不同 body 會回 conflict。 |
| `workflow_mode` | string | recommended | June demo 使用 `post_measurement_only`。 |
| `measurement_state` | string | conditional | 若提供，必須是 `complete`。非 `complete` 回 `422 invalid_start_session_request`。 |
| `vitals_ready` | boolean | conditional | 若提供 `false`，回 `422 invalid_start_session_request`。June demo 應送 `true`。 |
| `demo_script` | object | optional | Demo operation mode，例如 `live_measured` 或 fallback note。 |
| `client.source` | string | recommended | Caller source，例如 `imvs-demo`。 |
| `client.site` | string | optional | Demo site or environment label。 |
| `client.locale` | string | recommended | Display locale，例如 `en-US`。 |
| `patient_context.demo_patient_id` | string | recommended | Synthetic demo patient id。不可送真實 MRN、姓名、電話或身份資料。 |
| `patient_context.age` | number | optional | Synthetic demo context。 |
| `patient_context.sex` | string | optional | Synthetic demo context。 |
| `patient_context.identity_mode` | string | optional | Demo identity mode，例如 `demo`。 |
| `vitals` | object | recommended | Measured or synthetic vital payload。若省略，runtime 使用 fixture vitals。 |
| `capabilities.question_types` | string[] | recommended | UI 支援題型。June baseline 為 `["single_choice","multi_choice"]`。 |
| `capabilities.max_questions` | number | recommended | UI capacity cap，不是 `Question X of Y` 的 `Y`。 |
| `capabilities.max_options_per_question` | number | recommended | Teams working assumption 為最多 `9` 個短選項且 no-scroll。 |
| `capabilities.max_option_label_length` | number | optional | 建議先用 `48` 作為 UI 設計上限。 |
| `capabilities.variable_option_count` | boolean | optional | 是否支援每題不同 option count。 |
| `capabilities.voice_input` | boolean | recommended | June critical path 固定 `false`。 |

### Vital Payload

Recommended normalized vital shape:

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

Per-vital object fields:

| Field | Type | 說明 |
| --- | --- | --- |
| `value` | number/null | Vital value。Unavailable 或 failed 可為 `null`。 |
| `unit` | string | Unit。需明確提供，供 UI/log/summary 對齊。 |
| `measurement_status` | string | Suggested values: `measured`, `missing`, `failed`, `manual_entry`, `not_available`。 |
| `quality_flag` | string | Suggested values: `ok`, `needs_review`, `device_error`, `out_of_range_demo`, `unknown`。 |
| `missing_reason` | string/null | 缺漏或未量測原因。正常量測可為 `null`。 |

iMVS V1.4 baseline 到 normalized runtime field 的 mapping：

| iMVS object | iMVS value field(s) | Unit | Normalized field |
| --- | --- | --- | --- |
| `NBP` | `SYS_Value`, `DIA_Value` | `mmHg` | `blood_pressure_systolic_mm_hg`, `blood_pressure_diastolic_mm_hg` |
| `SPO2` | `Value` | `%` | `spo2_percent` |
| `HR` | `BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp` | `Value` | `deg C` / `C` | `temperature_c` |
| `Glucose` | `Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight` | `Value` | `kg` | `weight_kg` |
| `Height` | `Value` | `cm` | `height_cm` |

Design controls:

- V1.4 values may arrive as strings; runtime adapter should parse them to numbers.
- V1.4 sample has an HR unit typo-like `bmp` in one table, but JSON sample uses `bpm`; this contract uses `bpm`.
- `respiratory_rate_per_min` is demo/manual/synthetic unless imedtac confirms a measured source.
- BMI is derived context from height and weight; it is not a confirmed V1.4 upload field.
- SpO2 and glucose are supported fields, but product variants may make their hardware optional.

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
    "identity_mode": "demo"
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

### Success Response

HTTP `200`.

| Field | Type | 說明 |
| --- | --- | --- |
| `session_state` | string | Normal value: `active`。 |
| `last_question_id` | string/null | Endpoint 1 第一題前為 `null`。 |
| `status` | string | Endpoint 1 正常為 `question`。 |
| `question_phase` | string | Endpoint 1 正常為 `post_measurement_intake`。 |
| `phase_reason` | string | Debug/display reason text。Frontend 不應 parse 此文字。 |
| `progress.current` | number | 目前題號。第一題為 `1`。 |
| `progress.expected_total` | number | UI 顯示 `Question X of Y` 的 `Y`。目前 tachycardia lane 為 `7`。 |
| `question` | object | 第一題 question object。 |

Question object:

| Field | Type | 說明 |
| --- | --- | --- |
| `id` | string | Stable question id。Endpoint 2 的 `question_id` 必須帶回此值。 |
| `registry_refs` | string[] | NYCU question registry refs。 |
| `source_refs` | string[] | Question source/review refs。 |
| `evidence_status` | string | Evidence/review status，例如 `clinical-review-needed` 或 `source-backed`。 |
| `review_owner` | string | Review owner placeholder，例如 `clinical_reviewer_tbd`。 |
| `type` | string | `single_choice` 或 `multi_choice`。 |
| `ui_template` | string | 通常與 `type` 相同。 |
| `text` | string | Patient-facing display text。 |
| `options` | object[] | Option list。每個 option 有 `id` 與 `label`。 |
| `option_count` | number | Option count。 |
| `none_option_id` | string/null | 若該題有 explicit none option，填入該 option id。 |
| `required` | boolean | 是否必答。 |
| `allow_not_sure` | boolean | 是否有 explicit not-sure/staff-confirm option path。 |
| `allow_skip` | boolean | Runtime examples 目前多為 `false`。 |
| `max_selections` | number | 最大可選 option 數。單選為 `1`。 |
| `trigger_reason_codes` | string[] | 此題出現的 machine-readable reason codes。 |
| `summary_effect` | string | 此題答案如何進入 staff summary 的說明。 |
| `rendering_constraints.requires_no_scroll` | boolean | June UI working goal: `true`。 |
| `rendering_constraints.max_visible_options_without_scroll` | number | Current working assumption: `9`。 |
| `evidence_refs` | string[] | Summary/review evidence refs。 |
| `demo_boundary` | string | Question-level demo boundary。 |

### Response Example

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
  "session_state": "active",
  "last_question_id": null,
  "status": "question",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
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

## Endpoint 2: Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

### Purpose

iMVS 對 active session 送出目前 question 的 structured answer。NYCU runtime 驗證
`question_id`、option ids 與 `max_selections` 後，回傳下一題或最終
`staff_review_summary`。

### Path Parameters

| Parameter | Type | Required | 說明 |
| --- | --- | --- | --- |
| `session_key` | string | yes | Endpoint 1 回傳的 `session_key`。 |

### Request Body

| Field | Type | Required | Runtime rule / integration meaning |
| --- | --- | --- | --- |
| `api_version` | string | recommended | Contract 對齊欄位。 |
| `schema_version` | string | recommended | Schema 對齊欄位。 |
| `flow_version` | string | recommended | 應與 session flow 一致。 |
| `case_id` | string | recommended | 應與 session case 一致。 |
| `case_version` | string | optional | Trace field。 |
| `fixture_version` | string | optional | Trace field。 |
| `question_set_version` | string | optional | Trace field。 |
| `wording_version` | string | optional | Trace field。 |
| `request_id` | string | recommended | 每次 HTTP request 新的 trace id。 |
| `idempotency_key` | string | recommended | 同一次 answer submission retry 使用同一 key。 |
| `session_key` | string | recommended | 建議 body 也 echo path session key，方便 log。Runtime 以 path/query session key 找 session。 |
| `workflow_mode` | string | recommended | June demo 使用 `post_measurement_only`。 |
| `measurement_state` | string | recommended | June demo 使用 `complete`。 |
| `vitals_ready` | boolean | recommended | June demo 使用 `true`。 |
| `question_phase` | string | recommended | 通常為 `post_measurement_intake`。 |
| `question_id` | string | yes | 必須等於目前 session 正在等待的 question id。 |
| `answer.selected_option_ids` | string[] | yes | 至少一個 option id；每個 id 必須存在於前一個 response 的 `question.options`。 |
| `answer.scale_value` | number/null | optional | 目前 runtime choice questions 使用 `null`。`scale` 是 future/UI confirmation item。 |
| `client_event.input_mode` | string | recommended | June baseline 為 `touch`。 |
| `client_event.answered_at` | string | optional | ISO timestamp。 |

### Answer Validation

Runtime validation:

| Rule | Failed response |
| --- | --- |
| `session_key` not found | HTTP `404`, `error.code = "invalid_session"` |
| Session already reached summary | HTTP `409`, `error.code = "session_summary_ready"` |
| Missing `question_id` | HTTP `422`, `error.code = "invalid_answer"` |
| `question_id` does not match expected question | HTTP `422`, `error.code = "invalid_answer"` |
| Empty `answer.selected_option_ids` | HTTP `422`, `error.code = "invalid_answer"` |
| Selection count exceeds `question.max_selections` | HTTP `422`, `error.code = "invalid_answer"` |
| Unknown option id | HTTP `422`, `error.code = "invalid_answer"` |

iMVS must send option ids, not labels. Example: send `heart_racing`, not
`Heart racing / palpitations`.

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

### Success Response A: Next Question

HTTP `200`, `status = "question"`.

| Field | Type | 說明 |
| --- | --- | --- |
| `session_state` | string | `active`。 |
| `last_question_id` | string | 剛成功記錄的 question id。 |
| `status` | string | `question`。 |
| `question_phase` | string | `post_measurement_intake`。 |
| `progress.current` | number | 下一題題號。 |
| `progress.expected_total` | number | 顯示用預估總題數。 |
| `question` | object | 下一題 question object。 |

### Next Question Example

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
  "session_state": "active",
  "last_question_id": "tachy-chief-concern",
  "status": "question",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "question_phase": "post_measurement_intake",
  "phase_reason": "tachy-chief-concern was recorded; the next governed tachycardia demo question is ready.",
  "progress": {
    "current": 2,
    "expected_total": 7
  },
  "question": {
    "id": "tachy-onset",
    "registry_refs": ["TACHY-002"],
    "source_refs": [
      "DUOBAO-DEMO-DESIGN-20260520",
      "DUOBAO-AFRVR-TACHY-QA-20260525",
      "LOCAL-PROTOCOL-TBD"
    ],
    "evidence_status": "clinical-review-needed",
    "review_owner": "clinical_reviewer_tbd",
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
    "evidence_refs": ["DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"],
    "demo_boundary": "Synthetic-data demo question for staff-review intake support."
  },
  "demo_boundary": "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
}
```

### Success Response B: Staff Review Summary

HTTP `200`, `status = "summary"`。

| Field | Type | 說明 |
| --- | --- | --- |
| `session_state` | string | `summary_ready`。 |
| `last_question_id` | string | 最後成功記錄的 question id。 |
| `status` | string | `summary`。 |
| `question_phase` | string | `summary`。 |
| `progress.current` | number | Runtime 目前為 expected total。 |
| `progress.expected_total` | number | Runtime tachycardia lane 為 `7`。 |
| `summary_visibility` | string | `staff_only`。 |
| `handoff_required` | boolean | Demo summary 需要 human review 時為 `true`。 |
| `handoff_reason_codes` | string[] | Machine-readable handoff reasons。 |
| `staff_review_summary` | object | Staff/doctor/customer preview summary。 |
| `evidence_refs` | string[] | Review refs。 |

`staff_review_summary` fields:

| Field | Type | 說明 |
| --- | --- | --- |
| `format` | string | Summary format，例如 `review_summary_demo`。 |
| `subjective` | string[] | Patient-reported selected-answer summary。 |
| `objective` | string[] | Vital payload summary。 |
| `review_basis` | string[] | Staff review basis，維持 review support wording。 |
| `review_action` | string[] | Staff review reminder。 |
| `staff_handoff_note` | string | Short staff handoff note。 |
| `scope_controls` | string[] | Positive scope controls。 |

### Summary Example

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
  "session_state": "summary_ready",
  "last_question_id": "tachy-medication-allergy-confirm",
  "status": "summary",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
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

## Error Responses

All error responses use JSON body:

| Field | Type | 說明 |
| --- | --- | --- |
| `status` | string | Always `error`。 |
| `session_state` | string | Usually `error`; some session-aware errors may keep `active`。 |
| `error.code` | string | Machine-readable error code。 |
| `error.message` | string | Engineering-readable message。 |
| `error.retryable` | boolean | Whether retry is safe/recommended。 |
| `error.details` | object/null | Additional details。 |
| `recovery` | object/null | Recovery instructions for specific errors。 |

Runtime error codes:

| HTTP | `error.code` | Trigger |
| --- | --- | --- |
| `400` | `invalid_json` | Request body is not valid JSON。 |
| `401` | `demo_bearer_token_required` | `DEMO_BEARER_TOKEN` is configured and Authorization header is missing/invalid。 |
| `405` | `method_not_allowed` | Endpoint received non-`POST` method, excluding `OPTIONS` preflight。 |
| `409` | `idempotency_conflict` | Same `idempotency_key` reused with a different request body。 |
| `409` | `session_summary_ready` | Submit answer after summary is already ready, or no remaining questions。 |
| `422` | `invalid_start_session_request` | Unsupported `case_id`, non-complete `measurement_state`, or `vitals_ready=false`。 |
| `422` | `invalid_answer` | Invalid `question_id`, empty answer, too many selections, or unknown option id。 |

Additional example-only/future fallback codes in handoff materials include
`api_timeout`, `missing_required_field`, `unsupported_question_type`, and
`measurement_quality_unavailable`; these are not all produced by current runtime.

### Error Example: Invalid Session

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
  "response_id": "resp-demo-tachy-error-001",
  "session_key": "missing-session",
  "session_expires_at": null,
  "status": "error",
  "session_state": "error",
  "error": {
    "code": "invalid_session",
    "message": "The session_key was not found or is no longer available.",
    "retryable": false,
    "details": null
  },
  "recovery": null,
  "demo_boundary": "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
}
```

### Error Example: Idempotency Conflict

```json
{
  "status": "error",
  "session_state": "active",
  "error": {
    "code": "idempotency_conflict",
    "message": "The same idempotency_key was reused with a different request body.",
    "retryable": false,
    "details": {
      "idempotency_key": "idem-demo-tachy-answer-001",
      "expected_body_hash": "<sha256>",
      "received_body_hash": "<sha256>"
    }
  },
  "recovery": {
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
}
```

## Idempotency And Retry

`request_id` and `idempotency_key` have different jobs:

| Field | Rule |
| --- | --- |
| `request_id` | Generate a new unique id for every HTTP request。用於 log/debug。 |
| `idempotency_key` | Same logical operation uses the same key when retrying。用於避免 duplicate submit 推進流程兩次。 |

Runtime behavior:

```text
same endpoint scope + same idempotency_key + same request body
-> return the same stored response
```

```text
same endpoint scope + same idempotency_key + different request body
-> HTTP 409 idempotency_conflict
-> do not advance question flow
-> recovery.safe_next_action = restart_demo_session
```

Frontend recommendation after user submits an answer:

```text
snapshot question_id + answer body + idempotency_key
disable answer-related controls
retry only the same body/key if needed
unlock controls only after next question or summary arrives
```

On `idempotency_conflict`, iMVS should not auto-generate a new idempotency key
for a changed answer. June demo recovery is operator restart through Endpoint 1
or clearly labeled local scripted fallback.

## Allowed Runtime Values

| Field | Values / rule |
| --- | --- |
| `status` | `question`, `summary`, `error` |
| `session_state` | Current runtime: `active`, `summary_ready`, `error`; design values also include `expired`, `abandoned` |
| `workflow_mode` | Current runtime: `post_measurement_only` |
| `measurement_state` | Current normal runtime: `complete` |
| `question_phase` | `post_measurement_intake`, `summary` |
| `question.type` | `single_choice`, `multi_choice` |
| `question.ui_template` | Same as `question.type` unless future UI contract changes |
| `summary_visibility` | `staff_only` |
| `client_event.input_mode` | June baseline: `touch`; future examples include `keyboard`, `voice_confirmed`, `operator_scripted` |
| `answer.selected_option_ids` | Must be selected from the immediately preceding `question.options[].id` values |

## Skip, Not Sure, And None Of These

`spec/iMVS_AI_Triage_20260515.pdf` includes the need for `I'm not sure` and
`None of these` behavior. Current API handles this through explicit option ids:

- There is no generic silent skip in the June runtime flow.
- If the user is unsure, NYCU includes a question-specific option such as
  `other_or_not_sure`, `more_than_1_day_or_not_sure`, `staff_confirm`, or
  `not_sure`.
- If a question needs "None of these", NYCU includes `none_of_these` as a normal
  option inside `question.options` and may also set `question.none_option_id`.
- iMVS submits the chosen option id through `answer.selected_option_ids`.
- For mutually exclusive `not_sure` or `none_of_these`, iMVS UI should clear
  previously selected options when that option is selected, matching the PDF's
  AC 12.1 and AC 12.2 behavior.

Future explicit skip, if needed for non-critical questions, should use a schema
change such as:

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

This is not part of the current runtime contract.

## PDF Requirement Mapping

The `spec/iMVS_AI_Triage_20260515.pdf` product requirement maps to the API as
follows:

| PDF item | API support |
| --- | --- |
| US 06 transition after measurement | Runtime workflow is `post_measurement_only`; Endpoint 1 is called after `measurement_state=complete` and `vitals_ready=true`。 |
| US 07 dynamic OPQRST-style questioning, <8 questions | Runtime returns governed question sequence with `progress.expected_total = 7` for current tachycardia lane。 |
| US 08 visible progress | Use `progress.current` and `progress.expected_total` from every question response。 |
| US 09 structured button options | `question.type`, `question.ui_template`, `question.options[].id`, and `question.options[].label` drive touch button rendering。 |
| US 10 single-choice | `question.type = single_choice`, `max_selections = 1`。 |
| US 11 multi-choice | `question.type = multi_choice`, `max_selections` controls allowed selection count。 |
| US 12 I'm not sure / None of these | Represented as explicit option ids; `none_option_id` marks none option when present。 |
| US 13 scale | Future/UI-confirmation item; current runtime does not return scale questions。 |
| US 14 voice input | Future item; current `capabilities.voice_input` baseline is `false`。 |
| US 16 AI summary result display | Endpoint 2 final response returns `status=summary`, `summary_visibility=staff_only`, and `staff_review_summary`。 |
| US 17 SOAP-style summary | Current staff summary uses `subjective`, `objective`, `review_basis`, and `review_action`; wording remains staff-review support, not autonomous clinical decision。 |
| US 18 evidence mapping | Current response includes `source_refs`, `evidence_refs`, and `evidence_status`; full production evidence mapping remains a separate validation path。 |

## Current Runtime Notes

- Session storage is in-memory. Restarting the runtime clears active sessions and
  idempotency records.
- `session_expires_at` is generated as now + 30 minutes, but current in-memory
  lookup does not actively reject expired sessions.
- Current implementation supports one tachycardia live demo lane through
  `demo-tachycardia-live-001`.
- If Endpoint 1 omits `vitals`, runtime uses the tachycardia fixture vitals.
  For real rehearsal clarity, imedtac should send explicit measured or synthetic
  demo vitals.
- `GET /healthz` may exist in the mock/deployment server, but it is deployment
  health infrastructure, not part of the two main triage-demo API endpoints
  documented here.

## Source Files

Primary runtime files:

- `api/lib/triage-demo-contract.js`
- `api/triage-demo/sessions.js`
- `api/triage-demo/sessions/[session_key]/answers.js`

Primary contract and example files:

- `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`
- `handoff/api-examples/`
- `demo/fixtures/tachycardia-live-demo.json`
- `tests/contract/triage-demo-api.test.js`
- `spec/iMVS_AI_Triage_20260515.pdf`
