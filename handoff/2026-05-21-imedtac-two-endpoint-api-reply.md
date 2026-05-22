---
id: 2026-05-21-imedtac-two-endpoint-api-reply
title: "iMVS / NYCU AI Triage Demo 兩個 Endpoint API 回覆文件"
date: 2026-05-21
topic: ai-triage
type: handoff
status: external-ready-mvp-contract
audience: Ben Siu, Lauren Wang, Johnny Fang, and 貴司 engineering team
source:
  - ../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md
  - ../source/2026-05-12-imedtac-company-ai-triage-sync/source.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ./api-examples/
---

# iMVS / NYCU AI Triage Demo 兩個 Endpoint API 回覆文件

Ben、Lauren、Johnny 大家好：

依照 0521 會議後確認的方向，NYCU 端建議六月 customer demo 第一版採用小而固定的 `post_measurement_only` 兩個 endpoint contract。這個版本的目標是讓貴司的 iMVS 先完成 vital-sign measurement，再把 measured vital payload 傳給 NYCU API，由 NYCU 回傳結構化問題與 `staff_review_summary`，供 demo preview / staff-review workflow 使用。

本版刻意保留最小 integration surface。完整 trace-friendly API、更多 session lifecycle、fallback taxonomy、question provenance、future two-phase workflow 與 production validation controls 會放在 NYCU 內部 future design planning，不要求貴司在六月第一版 demo 先實作。

此 API contract 定位為 synthetic-data demo / product capability demo 的工程整合文件。輸出聚焦在 vital-aware intake support、typed-question workflow、staff-review summary 與 demo preview；正式臨床決策、production HIS / EMR / FHIR integration、real patient-data flow 與產品化驗證由後續 governance path 管理。

## 六月 Demo 小固定 Contract

本文送出後即作為六月 demo 的 shared implementation baseline。除非 NYCU 與貴司另行討論、明確記錄並更新版本，本文列出的 endpoint path、required request fields、response shape、question object、answer semantics、`not_sure` behavior、summary shape 與固定 enum values 都視為六月 demo 固定契約。

六月版本只要求下列能力：

| 類別 | 六月固定規則 |
| --- | --- |
| Workflow | `post_measurement_only`；iMVS 完成量測後才呼叫 NYCU。 |
| Endpoint | 兩個 endpoint：start session、submit answer。 |
| Question UI | `single_choice` / `multi_choice`。 |
| Answer payload | iMVS 回傳 `answer.selected_option_ids`。 |
| User uncertainty | 使用 NYCU 回傳的 `not_sure` 或 question-specific `*_not_sure` option id。 |
| Final output | NYCU 回傳 `staff_review_summary`，供 staff / doctor / customer demo preview。 |
| Minimum versions | `api_version`、`question_set_version`、`wording_version`。 |

Teams、email 或會議訊息可以提出問題與釐清事項，但不會直接改變 API contract。任何 contract change 都需要一筆明確 change request，內容包含 current rule、proposed rule、reason、compatibility impact、owner、target date、是否需要 version bump，以及雙方工程團隊確認結果；在 change request 確認前，兩邊 implementation 都以本文為準。

## 六月 Demo 流程

```text
iMVS 使用者登入 / demo case 開始
-> iMVS 完成 vital-sign measurement
-> iMVS 呼叫 NYCU Endpoint 1，送出 measured vital payload
-> NYCU 回傳 session_key + 第一題 question object
-> iMVS 顯示 single-choice / multi-choice question
-> iMVS 呼叫 NYCU Endpoint 2，送出 session_key + answer
-> NYCU 回傳下一題 question object 或 staff_review_summary
-> 貴司 UI 顯示 staff / doctor / customer demo preview
```

六月固定值：

| Field | June value | Meaning |
| --- | --- | --- |
| `api_version` | `2026-05-22-demo-v0.2-draft` | 雙方確認使用同一份 demo API contract。 |
| `workflow_mode` | `post_measurement_only` | 先完成 iMVS 量測，再開始 NYCU 問答。 |
| `measurement_state` | `complete` | iMVS 呼叫 NYCU 時，量測已完成。 |
| `vitals_ready` | `true` | request 內已包含可用 vital payload。 |
| `question.type` | `single_choice` / `multi_choice` | 六月 demo 只要求這兩種 reusable UI template。 |
| `summary_visibility` | `staff_only` | `staff_review_summary` 給 staff / doctor / demo preview，不是病人診斷結果。 |

## Endpoint 1: Start Session With Measured Vitals

```http
POST /api/triage-demo/sessions
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

用途：iMVS 在 vital-sign measurement 完成後呼叫此 endpoint，NYCU 建立 demo session，並回傳 `session_key` 與第一題 question object。

### Endpoint 1 Request

| Field | Required | Type | June rule |
| --- | --- | --- | --- |
| `api_version` | yes | string | 固定為 `2026-05-22-demo-v0.2-draft`。 |
| `request_id` | yes | string | 貴司產生的單次 request id，供雙方 log 對帳。 |
| `idempotency_key` | yes | string | 同一次 start-session retry 使用相同 key，避免重複建 session。 |
| `workflow_mode` | yes | string | 固定為 `post_measurement_only`。 |
| `measurement_state` | yes | string | 固定為 `complete`。 |
| `vitals_ready` | yes | boolean | 固定為 `true`。 |
| `client.locale` | yes | string | 六月美國客戶 demo 建議 `en-US`。 |
| `case_id` | yes | string | 六月第一 lane 建議 `demo-tachycardia-live-001`。 |
| `vitals` | yes | object | iMVS 完成量測後送出的 measured 或 synthetic demo vital payload。 |
| `capabilities.question_types` | yes | array | 六月建議 `["single_choice", "multi_choice"]`。 |
| `capabilities.max_questions` | yes | number | 六月建議最多 `7` 題。 |

Vital payload 六月最小結構：

| Field | Required | Type | June rule |
| --- | --- | --- | --- |
| `vitals.measurement_timestamp` | yes | string | ISO 8601 timestamp。 |
| `vitals.heart_rate_bpm.value` | yes | number/null | Heart rate value；unit 固定 `bpm`。 |
| `vitals.heart_rate_bpm.unit` | yes | string | 固定 `bpm`。 |
| `vitals.spo2_percent.value` | no | number/null | 若 target device 提供 SpO2 則送出；unit 固定 `%`。 |
| `vitals.temperature_c.value` | no | number/null | 若 target device 提供體溫則送出；unit 固定 `deg C`。 |
| `vitals.blood_pressure_systolic_mm_hg.value` | no | number/null | 若 target device 提供血壓則送出；unit 固定 `mmHg`。 |
| `vitals.blood_pressure_diastolic_mm_hg.value` | no | number/null | 若 target device 提供血壓則送出；unit 固定 `mmHg`。 |

貴司在 `2026-05-12` 提供的 iMVS API `V1.4` 已包含 `NBP`、`SPO2`、`HR`、`Temp`、`Glucose`、`Weight`、`Height` 等 baseline。六月最小 contract 只要求 demo lane 實際使用的 vital fields；完整 adapter dictionary 可在後續版本擴充。

### Endpoint 1 Response

| Field | Type | Meaning |
| --- | --- | --- |
| `api_version` | string | Echo 目前 API contract version。 |
| `status` | string | `question`、`summary` 或 `error`；正常 start-session 會是 `question`。 |
| `session_key` | string | NYCU 產生的 session id，Endpoint 2 需要帶回。 |
| `question_set_version` | string | 目前題組版本。 |
| `wording_version` | string | 目前 wording / summary version。 |
| `question` | object | 若 `status=question`，回傳下一題。 |

## Endpoint 2: Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

用途：iMVS 對同一個 active session 送出單題答案。NYCU 回傳下一題 question object，或在問答完成後回傳最終 `staff_review_summary`。

### Endpoint 2 Request

| Field | Required | Type | June rule |
| --- | --- | --- | --- |
| `api_version` | yes | string | 固定為 `2026-05-22-demo-v0.2-draft`。 |
| `request_id` | yes | string | 貴司產生的單次 request id。 |
| `idempotency_key` | yes | string | 同一次 answer retry 使用相同 key，避免流程前進兩次。 |
| `session_key` | yes | string | 使用 Endpoint 1 回傳的值。 |
| `question_id` | yes | string | 使用 NYCU 前一題回傳的 `question.id`。 |
| `answer.selected_option_ids` | yes | array | 使用 NYCU 前一題回傳的 `option.id`，不要送 display label。 |

### Endpoint 2 Response

| Field | Type | Meaning |
| --- | --- | --- |
| `api_version` | string | Echo 目前 API contract version。 |
| `status` | string | `question`、`summary` 或 `error`。 |
| `session_key` | string | 同一個 session。 |
| `question_set_version` | string | 目前題組版本。 |
| `wording_version` | string | 目前 wording / summary version。 |
| `question` | object/null | 若 `status=question`，回傳下一題。 |
| `staff_review_summary` | object/null | 若 `status=summary`，回傳 staff-review summary。 |

## Question Object

貴司 UI 只需要依照 machine-readable fields render，不需要解析題目文字。

| Field | Required | Type | Meaning |
| --- | --- | --- | --- |
| `question.id` | yes | string | 穩定 question id；answer request 需要帶回。 |
| `question.type` | yes | string | `single_choice` 或 `multi_choice`。 |
| `question.text` | yes | string | Patient-facing display text。 |
| `question.options` | yes | array | 選項清單，每個選項包含 `id` 與 `label`。 |
| `question.required` | yes | boolean | 是否為必答題。 |
| `question.allow_not_sure` | yes | boolean | 此題是否提供明確 `Not sure` 選項。 |
| `question.not_sure_option_id` | yes | string/null | 若有 `Not sure` 選項，填入該 option id。 |
| `question.max_selections` | no | number/null | `multi_choice` 題可用來限制最多可選幾個。 |

Option object：

| Field | Required | Type | Meaning |
| --- | --- | --- | --- |
| `id` | yes | string | iMVS 回傳 answer 時使用的 machine-readable id。 |
| `label` | yes | string | UI 顯示文字；前端不可解析 label 做流程判斷。 |

## 使用者答不出來 / Not Sure 行為

六月 demo 不建議提供無原因的略過按鈕，因為略過是結果，不是原因；如果只記錄使用者略過，NYCU 與貴司都無法判斷使用者是不理解問題、不知道怎麼回答，或知道問題但忘記 / 不確定答案。

因此，本次 demo 的固定規則是：若某題允許使用者表達不確定，NYCU 會在該題 `question.options` 中提供 `Not sure` 類選項，並透過 `question.allow_not_sure` 與 `question.not_sure_option_id` 標示。iMVS 送 answer 時只要把該 option id 放進 `answer.selected_option_ids`。

範例：

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "request_id": "req-demo-answer-003",
  "idempotency_key": "idem-demo-answer-003",
  "session_key": "sess-demo-abc123",
  "question_id": "tachy-onset",
  "answer": {
    "selected_option_ids": ["more_than_1_day_or_not_sure"]
  }
}
```

## Staff Review Summary

`staff_review_summary` 是 staff / doctor / customer demo preview 使用的結構化摘要，不是 diagnosis、treatment advice、final triage level 或 production HIS / EMR / FHIR writeback。

六月最小 summary object：

| Field | Required | Type | Meaning |
| --- | --- | --- | --- |
| `summary_visibility` | yes | string | 固定 `staff_only`。 |
| `intake_summary` | yes | string | 以 demo-safe wording 整理使用者回答與量測資訊。 |
| `review_basis` | yes | array | 列出 summary 使用到的 vital cue 與 answer facts。 |
| `review_action` | yes | string | 建議 staff review / confirm 的工作流文字，不是醫療指示。 |
| `demo_boundary` | yes | string | 標示 synthetic-data demo / workflow support boundary。 |

## Minimal JSON Example

Endpoint 1 request：

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "request_id": "req-demo-start-001",
  "idempotency_key": "idem-demo-start-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "client": {
    "locale": "en-US"
  },
  "case_id": "demo-tachycardia-live-001",
  "vitals": {
    "measurement_timestamp": "2026-05-21T10:01:00+08:00",
    "heart_rate_bpm": {
      "value": 150,
      "unit": "bpm"
    },
    "spo2_percent": {
      "value": 98,
      "unit": "%"
    }
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice"],
    "max_questions": 7
  }
}
```

Endpoint 1 response：

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "status": "question",
  "session_key": "sess-demo-abc123",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft",
  "question": {
    "id": "tachy-chief-concern",
    "type": "single_choice",
    "text": "What is the main reason you are using the kiosk today?",
    "required": true,
    "allow_not_sure": true,
    "not_sure_option_id": "other_or_not_sure",
    "options": [
      {"id": "heart_racing", "label": "Heart racing / palpitations"},
      {"id": "chest_tightness", "label": "Chest tightness / pressure"},
      {"id": "breathing_or_dizzy", "label": "Shortness of breath or dizziness"},
      {"id": "other_or_not_sure", "label": "Other / not sure"}
    ]
  }
}
```

Endpoint 2 summary response：

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "status": "summary",
  "session_key": "sess-demo-abc123",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft",
  "staff_review_summary": {
    "summary_visibility": "staff_only",
    "intake_summary": "Demo participant reported heart racing with a high heart-rate reading in the demo payload. Some details may require staff confirmation.",
    "review_basis": [
      "heart_rate_bpm=150 bpm in demo payload",
      "selected_option_ids include heart_racing"
    ],
    "review_action": "Staff should review the measured vital payload and confirm the symptom details in the standard workflow.",
    "demo_boundary": "Synthetic-data demo workflow support; not a diagnosis, treatment recommendation, final triage level, or production writeback."
  }
}
```

## What NYCU Can Manage Internally For June

為了降低貴司六月串接負擔，下列欄位可以先由 NYCU server-side 管理或在 response echo，不要求貴司每次 request 手動提供：

- `schema_version`
- `flow_version`
- `case_version`
- `fixture_version`
- detailed session lifecycle fields
- detailed error taxonomy
- question provenance fields
- measurement-quality subfields beyond the confirmed iMVS payload
- future two-phase vitals-ready endpoint

這些欄位會保留在 NYCU 的 future complete API design planning，後續若需要擴充，可用 version bump 與 change request 納入。

## 需要貴司確認的資訊

為了讓六月小 contract 能穩定串接，NYCU 需要貴司協助確認以下資訊：

1. Vital payload：目前 demo machine / GitHub 格式是否仍沿用 V1.4 的 `NBP`、`SPO2`、`HR`、`Temp`、`Glucose`、`Height`、`Weight`；若 units 或 missing/failure 表示方式不同，請提供 current example payload。
2. UI rendering：是否支援 `single_choice` / `multi_choice`；單題最多可顯示幾個 options；option label 最長建議字元數；是否需要 no-scroll。
3. Demo environment：NYCU API base URL / deployment path、browser direct call 或 backend proxy、CORS / firewall / VPN、demo bearer token 或 shared token 是否可接受。
4. Summary display：`staff_review_summary` 顯示在哪一頁，是否僅供 staff / doctor / customer demo preview。

## 交付規劃

NYCU 可先提供：

- 本兩個 endpoint API 文件；
- start-session、answer submission、next-question、summary 的 minimal JSON examples；
- 許醫師 wording review 後的第一版 preset question / option template；
- `not_sure` / staff-confirmation answer behavior 建議。

相同兩個 endpoints 可以支援 tachycardia live-performance lane 與 respiratory synthetic lane；六月對外串接先維持小固定 contract，未來完整 API 再依 demo rehearsal 與貴司 UI / environment feedback 逐步擴充。
