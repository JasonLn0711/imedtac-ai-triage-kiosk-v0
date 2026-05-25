---
id: 2026-05-21-imedtac-two-endpoint-api-reply
title: "iMVS / NYCU AI Triage Demo 兩個 Endpoint API 回覆文件"
date: 2026-05-21
topic: ai-triage
type: handoff
status: external-ready-for-next-step
audience: Ben Siu, Lauren Wang, Johnny Fang, and imedtac engineering team
source:
  - ../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md
  - ../source/2026-05-12-imedtac-company-ai-triage-sync/source.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/teams-thread-record-2026-05-22.md
  - ../source/2026-05-22-nycu-sent-api-reply-email/sent-reply-record.md
  - ../source/2026-05-25-duobao-afrvr-tachycardia-case/source.md
  - ../source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ./2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ./2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
  - ./2026-05-25-imedtac-integration-next-steps.md
  - ./api-examples/
---

# iMVS / NYCU AI Triage Demo 兩個 Endpoint API 回覆文件

Ben、Lauren、Johnny 大家好：

依照今天會議後確認的方向，NYCU 端建議六月 customer demo 第一版採用
`post_measurement_only` 的兩個 endpoint API contract。這個版本的目標是讓
慧誠智醫（imedtac Co., Ltd.）的 iMVS 先完成 vital-sign measurement，再把
measured vital payload 傳給 NYCU API，由 NYCU 回傳結構化問題與
`staff_review_summary`，供 demo preview / staff-review workflow 使用。

本文正文以台灣使用的繁體中文書寫；API 欄位名稱、HTTP method、URL path、
JSON key、enum value 與範例 payload 會保留英文，確保工程串接時欄位語意
一致。

本版同時把 `2026-05-12` 慧誠已提供的 iMVS Product Spec `V2.0.4` 與
iMVS API Definition `V1.4` 納入設計 baseline。也就是說，NYCU 端會先以既有
Vital Sign Upload API 的欄位與單位作為 adapter 起點，再請 imedtac 工程團隊
確認目前 demo machine / GitHub 格式是否有欄位名稱、optional/required 或
missing/failure semantics 的更新。

此 API contract 定位為 synthetic-data demo / product capability demo 的工程整合
文件。輸出聚焦在 vital-aware intake support、typed-question workflow、
staff-review summary 與 demo preview；正式臨床決策、production HIS / EMR /
FHIR integration、real patient-data flow 與產品化驗證由後續 governance path
管理。

## 2026-05-25 交付狀態

今天要交付給 imedtac 的目標已經達成，並且可以推進到下一步工程對接。

多寶已提供 Case 2 AfRVR-style tachycardia question-answer demo case，NYCU 已將
它歸檔為正式 source input：

```text
source/2026-05-25-duobao-afrvr-tachycardia-case/
```

這份 case 確認六月第一條 live-performance lane 可採用 measured-first
tachycardia / palpitation / chest-tightness flow：iMVS 先完成 vital measurement，
NYCU 使用 measured heart-rate cue 與多寶提供的 structured answer path 產生
`staff_review_summary`。本文件、JSON examples、question / option template 與
skip-behavior answer 因此可以作為下一步 imedtac integration rehearsal 的工作
包。

下一步建議由 imedtac 確認 current Vital Upload field dictionary、question UI
rendering limits、demo environment / API base URL，然後用
`demo-tachycardia-live-001` 進行 Endpoint 1 / Endpoint 2 串接 rehearsal。

## 2026-05-25 Architecture Freeze / Deployment Clarification

本次 Render rehearsal API 設計不改變前面已與
慧誠智醫（imedtac Co., Ltd.）討論的兩個 endpoint API 架構。Render 只是 NYCU
端的 rehearsal deployment target，目的在於提供一個固定 HTTPS base URL，讓
iMVS browser 與 NYCU 測試端都對準同一個訊號源，降低 localhost、換電腦、
port 與 CORS 設定反覆調整的成本。

第一輪 integration rehearsal 的 frozen decisions：

| Area | Frozen decision |
| --- | --- |
| API shape | 只使用兩個 endpoints：`POST /api/triage-demo/sessions` 與 `POST /api/triage-demo/sessions/{session_key}/answers`。 |
| Workflow | `post_measurement_only`：iMVS 先完成 measurement，再呼叫 NYCU API 啟動問答。 |
| NYCU rehearsal base URL | `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo`。 |
| Public API verification | `2026-05-25 17:50 GMT+8` 已通過 `/healthz`、CORS preflight、start-session 與 submit-answer public URL checks。 |
| CORS origins | 第一輪 rehearsal allow `http://localhost` 與 `http://localhost:5174`。 |
| Progress UI | `Question X of Y` 的 `Y` 使用 NYCU response 的 `progress.expected_total`；`capabilities.max_questions` 是 UI capacity cap。 |
| Idempotency conflict | 同一 `idempotency_key` 搭配不同 answer body 時回 HTTP 409 / `idempotency_conflict`，不推進流程。 |
| Conflict recovery | 六月 demo recovery 固定為 restart demo session 或已標示 fallback，不做 answer revision。 |
| Pending UI state | iMVS 送出答案後立即鎖住答題相關 controls，等 NYCU 下一題或 summary 回來再解鎖。 |
| Summary | Endpoint 2 回 `status=summary` 與 `staff_review_summary`；`summary_visibility` 維持 `staff_only`。 |

NYCU 內部 Render 設定，例如 `npm run render:start`、`/healthz` 與 Render health
check，是部署操作設定，不要求 imedtac 改 API contract。若送出本文件後要調整
endpoint path、schema、enum、workflow mode、conflict recovery、CORS origin、
token requirement 或 summary display surface，應先由雙方重新確認後再實作。

Render dashboard 顯示的 Outbound IP Addresses 是 NYCU Render service 主動往外
呼叫外部系統時的來源 IP 範圍，不是 iMVS browser 呼叫 NYCU API 的必要設定。
目前 browser-direct rehearsal 不需要 imedtac allowlist 這些 outbound ranges；
只有當 NYCU Render service 之後需要主動呼叫 imedtac 後端、webhook、VPN /
firewall 保護的服務，才需要由 imedtac 在其 allowlist 加入目前 Render 顯示的
`74.220.50.0/24` 與 `74.220.58.0/24`。

## 2026-05-25 Teams Follow-Up Decisions

Ben / Johnny / imedtac UI 團隊在 Teams 補充的工程問題可以先用下列規則對齊。

1. `request_id` / `idempotency_key`
   - `request_id`：每次 HTTP request 都產生新的 unique id，主要用於 log trace、
     debug 與雙方對帳。
   - `idempotency_key`：同一個 logical operation 的安全 retry 使用同一個 key。
     同一 endpoint、同一 session/question context、同一 request body retry 時，
     NYCU 回同一個結果，不讓 question flow 前進兩次。
   - 不同題目，或使用者明確送出新的答案嘗試時，請使用新的
     `idempotency_key`。若同一 key 搭配不同 request body，NYCU 回
     `idempotency_conflict`，並維持原 session state、不推進 question flow。
   - 六月 demo 的 `idempotency_conflict` recovery 定調為 restart demo session：
     iMVS 不自動換 key 重送不同答案，由 operator 重新建立 demo session 或切換
     到已標示的 fallback。
   - iMVS 前端送出答案後，建議立即鎖住答題相關按鈕與選項；收到 NYCU 下一題或
     summary 後，再開啟下一題答題控制。

2. `capabilities.max_questions` / progress display
   - `capabilities.max_questions` 是 iMVS 提供給 NYCU 的題數上限 / UI capacity
     cap，不是保證最後一定會問到的題數。
   - iMVS 顯示 `Question X of Y` 時，建議使用 NYCU response 裡的
     `progress.expected_total` 作為 `Y`。
   - 六月 tachycardia rehearsal lane 可先讓同一 session 的
     `progress.expected_total` 維持穩定，方便 UI 顯示固定進度。

3. UI option / skip behavior
   - imedtac UI 目前工作假設可容納最多 `9` 個短選項，且不希望使用者 scroll。
   - NYCU 第一版仍建議多數題目維持 `4` 個左右的短選項，只有必要時才接近 UI
     上限。
   - imedtac UI 會保留 `I'm not sure` affordance；NYCU 也會在 question object
     中保留可解讀的 not-sure answer state。
   - `None of these` 不作為 UI 內建固定按鈕。若某題臨床上需要 none answer，
     NYCU 會把它當成該題 `question.options` 的 ordinary option id 回傳，例如
     `none_of_these`；iMVS 只需依 option id 回傳。

4. Demo environment
   - imedtac 預計由前端直接呼叫 NYCU 部署的 API。
   - NYCU rehearsal base URL 固定為：
     `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo`。
   - 完整 endpoints：
     `POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions`
     與
     `POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions/{session_key}/answers`。
   - NYCU 需開放 CORS origins：
     `http://localhost`、`http://localhost:5174`。
   - Demo bearer token 可採 NYCU 做法；實際 token 不寫入 repo 文件。
   - Render outbound IP ranges 目前不需要提供給 browser-direct path；若未來
     NYCU Render service 需主動呼叫 imedtac 的 IP-restricted backend，再由
     imedtac allowlist `74.220.50.0/24` 與 `74.220.58.0/24`。

5. Summary preview page
   - 使用者回答完所有問題後，NYCU Endpoint 2 會回 `status="summary"` 與
     `staff_review_summary`。
   - 最省工程量的 demo 路徑，是 iMVS 直接在既有 result / preview page 顯示
     同一份 summary payload，不需要另外刻完整頁面。
   - 若 imedtac 需要先快速驗證畫面，NYCU 可以提供輕量 NYCU-hosted demo
     preview / mock page；正式 rehearsal 仍建議以 iMVS 端 render payload 為主。
   - `summary_visibility` 維持 `staff_only`；summary 是 staff-review / demo
     preview，不是病人診斷結果、治療建議或 final triage level。

## 六月 Demo 確認流程

```text
iMVS 使用者登入 / demo case 開始
-> iMVS 完成 vital-sign measurement
-> iMVS 呼叫 NYCU Endpoint 1，送出 measured vital payload
-> NYCU 回傳 session_key + 第一題 question object
-> iMVS 顯示 single-choice / multi-choice question
-> iMVS 呼叫 NYCU Endpoint 2，送出 session_key + answer
-> NYCU 回傳下一題 question object 或 staff_review_summary
-> imedtac UI 在既有 result / preview page 顯示 staff-review summary
```

六月預設值：

| 欄位 | 六月預設值 | 定義 | 範例與說明 |
| --- | --- | --- | --- |
| `workflow_mode` | `post_measurement_only` | 表示本次 demo 使用「先完成量測、再開始問答」的流程模式。 | 範例：`post_measurement_only`；iMVS 完成量測後才呼叫 NYCU 問答 API。 |
| `measurement_state` | `complete` | 表示 iMVS 呼叫 NYCU API 時，vital-sign measurement 已經完成。 | 範例：`complete`；NYCU 可直接使用 request 內的 vital payload 選題。 |
| `vitals_ready` | `true` | 表示 request 內已包含可供 demo 問答流程使用的 vital payload。 | 範例：`true`；代表 heart rate、SpO2 等量測資料已進入本次 session。 |
| `question_phase` | 問題回覆用 `post_measurement_intake`；最終摘要用 `summary` | 標示目前回覆屬於量測後問答階段，或已經進入摘要階段。 | 範例：`post_measurement_intake`；iMVS 顯示下一題。範例：`summary`；iMVS 顯示 staff preview。 |
| `voice_input` | `false` | 表示六月 critical path 聚焦觸控選項題；語音輸入列為後續擴充能力。 | 範例：`false`；iMVS 使用 touch choice UI 送出答案。 |
| `question.type` | `single_choice`、`multi_choice`；`scale` 需待 imedtac UI 確認 | 定義 iMVS 需要使用哪一種 UI template 顯示問題。 | 範例：`single_choice`；iMVS 顯示單選題模板。範例：`multi_choice`；iMVS 顯示複選題模板。 |

## Endpoint 清單

### Endpoint 1：Start Session With Measured Vitals

```http
POST /api/triage-demo/sessions
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

用途：

- iMVS 在 vital-sign measurement 完成後呼叫此 endpoint。
- request 內包含 measured 或 synthetic demo vital payload。
- NYCU 建立 demo session，並回傳 `session_key` 與第一題 question object。

### Endpoint 2：Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
Authorization: Bearer <demo token, if enabled>
```

用途：

- iMVS 對同一個 active session 送出單題答案。
- NYCU 回傳下一題 question object，或在問答完成後回傳最終
  `staff_review_summary`。

六月 integration 以兩個 endpoint 作為主要路徑。獨立 vitals-ready endpoint
保留為 future optimized mode；雙方未來若重新開啟「量測中先問 Phase 1、
量測完成後再問 Phase 2」的 two-phase workflow，可將該 endpoint 納入下一版
schema。

## 問答集變更與 API Contract Change-Control

NYCU 建議六月先 freeze 兩個 endpoint 的 shape。多寶 / 許醫師後續若調整題目、
選項、題目順序、必答規則或 `staff_review_summary` wording，會透過下列版本欄位
管理；imedtac 的 endpoint 串接可維持穩定：

- `flow_version`
- `case_version`
- `fixture_version`
- `question_set_version`
- `wording_version`

下列情境會啟動 API schema revision：

- 新增超出目前六月 scope 的題型，例如 free text、voice input 或待 imedtac UI
  確認的 `scale`；
- 改變 answer payload，例如需要 explicit skip button、`skip_reason` 或其他
  answer metadata；
- 新增 early handoff / stop behavior，需要更明確的 `handoff_required`、
  `handoff_reason_codes`、`session_state` 或 `next_action`；
- imedtac UI template constraints 比目前假設更嚴格，例如固定 option count、
  progress display constraints，或單題選項 / label 長度限制更嚴格；
- vital payload field dictionary 需要 adapter 或 schema 對齊。

因此，題庫與 wording 可以持續臨床審查；endpoint 串接則可先依照本文兩個
endpoint 進行。

第一版 preset question / option template 建議採用 tachycardia live lane：

```text
handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
```

這份題組使用 `single_choice` / `multi_choice`，以
`demo-tachycardia-live-001`、`tachycardia-live-demo-flow-v0.2-draft`、以及
`tachycardia-question-set-v0.2-draft` 管理版本。Respiratory low-SpO2 lane
保留為 synthetic fallback / evidence demo lane。

## 已有 iMVS Vital Upload Baseline

慧誠在 `2026-05-12` 提供的 iMVS API `V1.4` 已包含 Vital Sign Upload 的 nested
payload 與 sample units。NYCU 端會把這份文件當成六月 adapter baseline：

| iMVS V1.4 object | iMVS value field(s) | iMVS unit sample | NYCU normalized field(s) |
| --- | --- | --- | --- |
| `NBP` | `SYS_Value`, `DIA_Value` | `mmHg` | `blood_pressure_systolic_mm_hg`, `blood_pressure_diastolic_mm_hg` |
| `SPO2` | `Value` | `%` | `spo2_percent` |
| `HR` | `BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp` | `Value` | `deg C` / source sample `°C` | `temperature_c` |
| `Glucose` | `Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight` | `Value` | `kg` | `weight_kg` |
| `Height` | `Value` | `cm` | `height_cm` |

設計控制：

- V1.4 文件中的 measurement values 型別是 string；NYCU runtime 會解析成 number，
  但保留明確 `unit` 供 UI、log 與 summary 對齊。
- V1.4 表格中的 HR unit 有 `bmp` typo-like 寫法，但 JSON sample 使用 `bpm`；
  本文件以 `bpm` 作為 heart rate 的標準單位。
- `Respiratory rate` 不在 5/12 V1.4 Vital Upload 欄位中；若六月 demo 要使用，
  需由 imedtac 確認它是量測值、手動輸入值，或僅是 synthetic demo fixture。
- `BMI` 是 report / derived context；V1.4 sample 未把 BMI 列為 upload 欄位，
  因此只在 height + weight 可用且顯示範圍確認後衍生。
- Product spec 中 SpO2 與 glucose 硬體在部分 variant 標為 optional；Endpoint
  可以支援這兩個欄位，但是否列為 guaranteed field 需以 target SKU 為準。

## 欄位範例說明

下列表格最後一欄提供每個 field 的實際 demo JSON 範例與簡短說明。範例值統一使用
六月第一 live-performance lane：`demo-tachycardia-live-001`，也就是多寶 case
設計轉換後的 palpitation / chest-tightness with elevated heart-rate cue demo
case。Respiratory low-SpO2 lane 保留為 fallback / second-lane 設計，不再作為本
文件主要 JSON example。

## API 欄位分層建議

目前欄位集合是完整 trace-friendly contract，但若把所有欄位都要求 imedtac UI
手動提供，會偏重。建議六月 MVP 分三層：

| 層級 | 欄位 | 建議 |
| --- | --- | --- |
| iMVS 必須送出 | `api_version`, `request_id`, `idempotency_key`, `workflow_mode`, `measurement_state`, `vitals_ready`, `case_id`, `client.locale`, `patient_context.demo_patient_id`, `vitals`, `capabilities.question_types`, `capabilities.max_questions` | 這些支撐 session 建立、重試安全、case selection、語系、量測資料與 UI 能力。 |
| NYCU 可推導 / 回傳 echo | `schema_version`, `flow_version`, `case_version`, `fixture_version`, `question_set_version`, `wording_version` | 若 imedtac 覺得 request 太重，這些可由 NYCU 根據 `case_id` 與 API 版本決定，並在 response 中回傳供 log 對帳。 |
| UI / answer constraints | `capabilities.max_options_per_question`, `capabilities.max_option_label_length`, `capabilities.variable_option_count`, `question.required`, `question.allow_skip`, `question.max_selections`, `question.none_option_id` | 這些不是 clinical logic，而是畫面 / answer validation contract。Teams `2026-05-25` 目前訊號是最多約 `9` 個短選項、不讓使用者 scroll、保留 `I'm not sure`、不使用 UI 內建 `None of these`。 |

因此，下面的 JSON example 是「完整 trace example」。實際 MVP 串接時，可以把 NYCU
可推導欄位改成 optional / server-managed，不需要讓 imedtac 每次 request 都手動組
全部版本欄位。

## JSON Value 固定規則

JSON key 已在本文各 endpoint table 中固定；value 需要再分成四類管理。工程串接
原則是：前端 / 狀態機 / fallback / log 不解析自然語言文字，只讀固定 code、
enum、boolean、number 與 object structure。

| 類別 | 是否需要列出所有情況 | API 文件規則 | 範例 |
| --- | --- | --- | --- |
| Machine-readable enum / code | yes | 只要 iMVS 或 NYCU 會用來 branching、render、retry、fallback、audit、routing，就必須列 allowed values。 | `status`, `session_state`, `workflow_mode`, `measurement_state`, `question.type`, `measurement_status`, `quality_flag`, `error.code`, `fallback.recommended_mode` |
| Stable IDs | yes, within the active question set | `question.id`、`option.id`、`selected_option_ids`、`handoff_reason_codes` 都是 code，不是顯示文字；iMVS 應送回 id，不送回 label。 | `tachy-chief-concern`, `heart_racing`, `measured_elevated_heart_rate_demo` |
| Display text | no, but define display contract | `question.text`、`option.label`、`phase_reason`、`staff_review_summary.*` 只供顯示；可隨 `question_set_version` / `wording_version` 更新。前端不可 parse 文字做流程判斷。 | `Heart racing / palpitations` 可以改 wording，但 `heart_racing` id 不變。 |
| Number / boolean / timestamp | no exhaustive list | 定義 type、unit、nullable、range / precision when needed；不用列出所有數字。 | `heart_rate_bpm.value` 是 number/null，unit 固定 `bpm`；`vitals_ready` 是 boolean。 |

June v0.2 建議先固定下列 machine-readable values：

| Field | Allowed values / rule |
| --- | --- |
| `status` | `question`, `summary`, `error` |
| `session_state` | `active`, `summary_ready`, `expired`, `abandoned`, `error` |
| `workflow_mode` | June required: `post_measurement_only`; future optimized: `parallel_measurement_intake` |
| `measurement_state` | June normal: `complete`; failure / future states: `failed`, `missing`, `in_progress` |
| `question_phase` | June: `post_measurement_intake`, `summary`; future optimized: `pre_vital_intake`, `post_vital_followup` |
| `question.type` | June: `single_choice`, `multi_choice`; future only after UI confirmation: `scale` |
| `question.ui_template` | Same as `question.type` unless imedtac defines a separate UI-template enum. |
| `vitals.<field>.measurement_status` | `measured`, `missing`, `failed`, `manual_entry`, `not_available` |
| `vitals.<field>.quality_flag` | `ok`, `needs_review`, `device_error`, `out_of_range_demo`, `unknown` |
| `summary_visibility` | June: `staff_only` |
| `client_event.input_mode` | June: `touch`; optional/future values only if enabled: `keyboard`, `voice_confirmed`, `operator_scripted` |
| `fallback.recommended_mode` | `standard_staff_workflow`, `local_scripted_demo`, `retry_remote_api` |
| `error.code` | `api_timeout`, `invalid_session`, `measurement_quality_unavailable`, `missing_required_field`, `unsupported_question_type`, `idempotency_conflict` |

For `answer.selected_option_ids`, the allowed values are not global. They are
the `id` values returned inside the immediately preceding `question.options`.
For example, if NYCU returns option id `heart_racing`, iMVS submits
`"selected_option_ids": ["heart_racing"]`; iMVS should not submit the display
label `Heart racing / palpitations`.

For `staff_review_summary` and patient / staff display strings, NYCU will keep
scope-control wording versioned through `wording_version`. imedtac UI should
display these strings as provided and use `status`, `summary_visibility`,
`handoff_required`, and `handoff_reason_codes` for workflow behavior.

## Endpoint 1 Request

必填 request 欄位：

| 欄位 | 型別 | 必填 | 定義 | 範例與說明 |
| --- | --- | --- | --- | --- |
| `api_version` | string | yes | 本次 API contract 的版本識別碼；目前 draft 值為 `2026-05-22-demo-v0.2-draft`。 | 範例：`2026-05-22-demo-v0.2-draft`；雙方用此值確認同一版 API contract。 |
| `schema_version` | string | yes | request / response JSON schema 的版本識別碼；目前 draft 值為 `imvs-nycu-triage-demo-schema-v0.2-draft`。 | 範例：`imvs-nycu-triage-demo-schema-v0.2-draft`；雙方用此值確認 JSON 欄位集合。 |
| `flow_version` | string | yes | 問答流程版本，用來區分不同 demo lane；例如 `tachycardia-live-demo-flow-v0.2-draft` 或 `respiratory-early-handoff-flow-v0.2-draft`。 | 範例：`tachycardia-live-demo-flow-v0.2-draft`；代表本次 session 使用 tachycardia live lane。 |
| `case_id` | string | yes | synthetic demo case 的識別碼；六月 demo 使用 synthetic/demo id，正式 encounter id 由 production governance path 管理。 | 範例：`demo-tachycardia-live-001`；代表本次使用心搏過速 demo case。 |
| `case_version` | string | yes | synthetic case 內容版本；用來追蹤同一個 `case_id` 的內容是否有更新。 | 範例：`demo-tachycardia-live-001-v0.2`；代表同一 case 的 v0.2 內容。 |
| `fixture_version` | string | yes | demo fixture 版本；用來追蹤範例 vital payload / answer path / expected output 的版本。 | 範例：`v0.2.0`；代表本次 rehearsal payload 與 expected output 版本。 |
| `question_set_version` | string | yes | 問題清單、問題順序、問題文字與 option mapping 的版本。 | 範例：`tachycardia-question-set-v0.2-draft`；代表目前題目清單與選項 mapping。 |
| `wording_version` | string | yes | `staff_review_summary` 顯示文字與安全邊界 wording 的版本。 | 範例：`staff-summary-wording-v0.2-clinical-draft`；代表 staff summary wording 草稿版。 |
| `request_id` | string | yes | iMVS 端產生的單次 request 追蹤識別碼，用於 log、debug 與雙方對帳。 | 範例：`req-demo-start-001`；iMVS 與 NYCU log 可用此值對齊。 |
| `idempotency_key` | string | yes | 防止 retry 造成重複建立 session 或重複推進流程的冪等鍵。 | 範例：`idem-demo-start-001`；同一 start-session request retry 時使用相同 key。 |
| `workflow_mode` | string | yes | demo workflow 模式；六月必須為 `post_measurement_only`。 | 範例：`post_measurement_only`；代表 iMVS 已先完成 vital-sign measurement。 |
| `measurement_state` | string | yes | vital-sign measurement 的狀態；六月呼叫此 endpoint 時必須為 `complete`。 | 範例：`complete`；代表 request 送達時量測流程已完成。 |
| `vitals_ready` | boolean | yes | 是否已提供可使用的 vital payload；六月呼叫此 endpoint 時必須為 `true`。 | 範例：`true`；代表 `vitals` object 可供 NYCU 選題。 |
| `client.source` | string | yes | 呼叫來源識別，例如 `imvs-demo`；用來區分不同前端、設備或 demo client。 | 範例：`imvs-demo`；代表 request 來自 iMVS demo client。 |
| `client.locale` | string | yes | 前端顯示語系，例如 `en-US`；六月美國客戶 demo 建議使用英文顯示。 | 範例：`en-US`；NYCU 回傳英文題目與 summary wording。 |
| `patient_context.demo_patient_id` | string | yes | demo-only patient id；六月 demo 使用 synthetic/demo id，MRN、身分證字號、姓名、電話與正式病歷資料由 production governance path 管理。 | 範例：`DEMO-TACHY-001`；代表 synthetic demo patient identity。 |
| `patient_context.age` | number | no | synthetic demo 年齡；只供 demo case 情境使用。 | 範例：`76`；供 tachycardia demo case 呈現成人情境。 |
| `patient_context.sex` | string | no | synthetic demo 生理性別或情境性別；只供 demo case 情境使用。 | 範例：`female`；供 tachycardia demo case 內容對齊。 |
| `vitals` | object | yes | iMVS 量測完成後送給 NYCU 的 measured 或 synthetic vital payload。 | 範例：`{"heart_rate_bpm":{"value":130,"unit":"bpm"}}`；NYCU 用此 object 產生 vital-aware 問題。 |
| `capabilities.question_types` | array | yes | iMVS UI 支援的題型清單；六月建議先使用 `["single_choice", "multi_choice"]`。 | 範例：`["single_choice","multi_choice"]`；NYCU 回傳 iMVS 可 render 的題型。 |
| `capabilities.max_questions` | number | yes | iMVS 可接受的病人端題數上限 / UI capacity cap；不是保證最後一定會問到的題數。UI 的 `Question X of Y` 建議使用 NYCU response 的 `progress.expected_total`。 | 範例：`7`；NYCU 將問答控制在 demo 節奏內，實際完成題數可能少於上限。 |
| `capabilities.max_options_per_question` | number | yes after Teams `2026-05-25` signal | iMVS 單題最多可清楚顯示幾個短選項；目前 imedtac UI 工作假設可容納最多 `9` 個且不讓使用者 scroll。NYCU 第一版仍偏好 `4` 個左右短選項。 | 範例：`9`；代表 UI capacity，不代表 NYCU 每題都會回九個選項。 |
| `capabilities.max_option_label_length` | number | ask imedtac / design short labels | 單一選項 label 最長可接受字元數；目前工作假設是由 NYCU 與多寶把 option wording 設計得簡短，避免長句造成排版風險。 | 範例：`48`；NYCU 控制 option label 長度以配合 kiosk UI。 |
| `capabilities.variable_option_count` | boolean | ask imedtac | iMVS 是否支援每一題有不同選項數量；若 iMVS 使用固定 template，NYCU 會依 template 固定 option count。 | 範例：`true`；代表不同題目可回傳不同選項數。 |
| `capabilities.voice_input` | boolean | yes | 本次 session 是否支援語音輸入；六月 critical path 建議固定為 `false`。 | 範例：`false`；代表本次 demo 使用 touch answer flow。 |

Vital payload 最小欄位結構：

| 欄位 | 型別 | 定義 | 範例與說明 |
| --- | --- | --- | --- |
| `vitals.measurement_timestamp` | string | iMVS 完成量測的時間戳，建議使用 ISO 8601 格式。 | 範例：`2026-05-21T10:01:00+08:00`；代表 iMVS 完成量測的時間。 |
| `vitals.device_id` | string | demo device identifier；用來識別設備，病人識別由 `patient_context.demo_patient_id` 或 production governance path 管理。 | 範例：`IMVS-DEMO-001`；代表本次 demo kiosk / device。 |
| `vitals.<field>.value` | number/null | 單一 vital 欄位的量測值；若 unavailable、failed 或不適用，可為 `null`。 | 範例：`heart_rate_bpm.value = 130`；代表 tachycardia live demo 的心跳量測值。 |
| `vitals.<field>.unit` | string | 單位；V1.4 baseline 為 `mmHg`、`%`、`bpm`、`deg C` / `C`、`mg/dL`、`kg`、`cm`。 | 範例：`bpm`；讓 iMVS 與 NYCU 對心跳單位有一致理解。 |
| `vitals.<field>.measurement_status` | string | 此 vital 欄位的量測狀態；可用值建議為 `measured`、`missing`、`failed`、`manual_entry`、`not_available`。 | 範例：`measured`；代表此 vital 欄位已有量測結果。 |
| `vitals.<field>.quality_flag` | string | 此 vital 欄位的品質旗標；可用值建議為 `ok`、`needs_review`、`device_error`、`out_of_range_demo`、`unknown`。 | 範例：`needs_review`；代表此 vital 欄位適合進入 staff review cue。 |
| `vitals.<field>.missing_reason` | string/null | 當 `value` 缺漏或量測失敗時，說明缺漏原因；若正常量測則可為 `null`。 | 範例：`null`；代表此欄位在範例 payload 中已有量測值。 |

Endpoint 1 request 範例：

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
  "request_id": "req-demo-start-001",
  "idempotency_key": "idem-demo-start-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "demo_script": {
    "mode": "live_measured",
    "fallback_mode": "local_scripted_demo",
    "case_label": "Palpitation / chest tightness with elevated heart-rate cue"
  },
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
    "heart_rate_bpm": {
      "value": 130,
      "unit": "bpm",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    },
    "spo2_percent": {
      "value": 98,
      "unit": "%",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    },
    "respiratory_rate_per_min": {
      "value": 16,
      "unit": "breaths/min",
      "measurement_status": "manual_entry",
      "quality_flag": "ok",
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

## Endpoint 1 Response

NYCU 回傳 session 與第一題 typed question：

| 欄位 | 型別 | 必填 | 定義 | 範例與說明 |
| --- | --- | --- | --- | --- |
| `session_key` | string | yes | NYCU 產生的 session key；iMVS 在 Endpoint 2 後續每次送 answer 時都要帶回。 | 範例：`demo-session-tachy-001`；iMVS 後續 submit answer 時放在 path 與 body。 |
| `request_id` | string | yes | 回傳 iMVS 原本送出的 `request_id`，方便雙方 trace。 | 範例：`req-demo-start-001`；讓 response 對回原 start-session request。 |
| `response_id` | string | yes | NYCU 端產生的 response id，用於 debug、log 與問題追蹤。 | 範例：`resp-demo-start-001`；NYCU 用此值標記本次 response。 |
| `session_expires_at` | string | yes | demo session 的到期時間；超過後應視為 expired 或重新開始。 | 範例：`2026-05-21T10:31:00+08:00`；代表此 demo session 的有效時間。 |
| `session_state` | string | yes | session 狀態；可用值建議為 `active`、`summary_ready`、`expired`、`abandoned`、`error`。 | 範例：`active`；代表 iMVS 可繼續顯示問題並送出答案。 |
| `last_question_id` | string/null | yes | 最近已送出或已回答的 question id；第一題前可為 `null`。 | 範例：`null`；Endpoint 1 第一題前尚未有已回答題目。 |
| `status` | string | yes | 此 response 類型；可為 `question` 或 `summary`，Endpoint 1 正常情況會是 `question`。 | 範例：`question`；iMVS 依此 render question object。 |
| `workflow_mode` | string | yes | 回傳本 session 使用的 workflow mode；六月應為 `post_measurement_only`。 | 範例：`post_measurement_only`；回傳確認此 session 使用量測後問答模式。 |
| `measurement_state` | string | yes | 回傳目前 measurement state；六月應為 `complete`。 | 範例：`complete`；回傳確認 vital-sign measurement 已完成。 |
| `vitals_ready` | boolean | yes | 回傳目前是否已有可使用的 vital payload；六月應為 `true`。 | 範例：`true`；回傳確認 vital payload 已存入 session context。 |
| `question_phase` | string | yes | 目前問題階段；六月量測後問答使用 `post_measurement_intake`。 | 範例：`post_measurement_intake`；iMVS 顯示量測後問答題。 |
| `phase_reason` | string | yes | 簡短說明為什麼此題可以在目前階段顯示。 | 範例：`Measured vitals are available for post-measurement intake.`；供工程 debug 與 demo trace。 |
| `progress.current` | number | yes | 目前顯示到第幾題，用於 iMVS UI progress display。 | 範例：`1`；代表目前顯示第一題。 |
| `progress.expected_total` | number | yes | NYCU 建議 iMVS 用於 `Question X of Y` 的 `Y`。它是目前 session 的顯示用預估總題數，應小於或等於 `capabilities.max_questions`；六月 tachycardia rehearsal lane 可先固定為 `7`，讓 UI 進度穩定。 | 範例：`7`；代表本 session 顯示預計七題內完成。 |
| `question` | object | yes when `status=question` | NYCU 回傳給 iMVS 顯示的 typed question object。 | 範例：`{"id":"tachy-chief-concern","type":"single_choice"}`；iMVS 依此 render 第一題。 |
| `demo_boundary` | string | yes | 明確標示此 response 的定位為 synthetic-data staff-review intake support。 | 範例：`Synthetic-data staff-review intake support demo.`；對齊 demo operating scope。 |

Question object 最小欄位結構：

| 欄位 | 型別 | 必填 | 定義 | 範例與說明 |
| --- | --- | --- | --- | --- |
| `question.id` | string | yes | 穩定的 runtime question id；iMVS 回答時以此值作為 `question_id`。 | 範例：`tachy-chief-concern`；iMVS submit answer 時以此值作為 `question_id`。 |
| `question.registry_refs` | array | yes | 對應到 NYCU 內部 question registry 的來源 id；用於 trace 問題來源與版本。 | 範例：`["TACHY-001"]`；代表此題對應內部題庫 registry。 |
| `question.source_refs` | array | yes | 支援此問題的來源或 review source id；可先使用待審核來源代碼。 | 範例：`["LOCAL-PROTOCOL-TBD"]`；代表此題的來源 review code。 |
| `question.evidence_status` | string | yes | 此問題目前的 evidence / review 狀態；例如 `clinician-signoff-needed`。 | 範例：`clinician-signoff-needed`；代表此題等待臨床 reviewer 確認。 |
| `question.review_owner` | string | yes | 此題 wording / clinical review 的負責角色或待確認 owner。 | 範例：`clinical_reviewer_tbd`；代表 owner 會在 review 流程中指定。 |
| `question.type` | string | yes | UI 題型；六月建議使用 `single_choice` 或 `multi_choice`。 | 範例：`single_choice`；iMVS 顯示單選題模板。 |
| `question.ui_template` | string | yes | iMVS 應使用的 UI template；通常與 `question.type` 相同。 | 範例：`single_choice`；前端可直接套用既有 single-choice component。 |
| `question.text` | string | yes | 顯示給使用者看的題目文字。 | 範例：`What brings you in today?`；這是 kiosk 畫面顯示的題目。 |
| `question.options` | array | yes | 選項清單；每個 option 應包含穩定 `id` 與顯示 `label`。 | 範例：`[{"id":"heart_racing","label":"Heart racing / palpitations"}]`；iMVS 用 `label` 顯示、用 `id` 回傳答案。 |
| `question.option_count` | number | yes | 此題實際選項數量；讓 iMVS 可驗證是否超過 UI 容量。 | 範例：`4`；代表此題有四個可點選 options。 |
| `question.none_option_id` | string/null | no | 若 NYCU 在該題 `question.options` 內明確回傳互斥的 none option，填入該 option id；沒有則為 `null`。Teams `2026-05-25` 訊號是 imedtac UI 不提供內建固定 `None of these` 按鈕。 | 範例：`none_of_these`；iMVS 可用此值處理由 NYCU 明確回傳的互斥選項。 |
| `question.required` | boolean | no | 表示此題是否為本 flow 的必答題；tachycardia live lane 建議 Q1-Q5 為 `true`。 | 範例：`true`；iMVS 不顯示 silent skip，只顯示 `Not sure` 或 staff-confirmation option。 |
| `question.allow_not_sure` | boolean | no | 表示此題是否內建 `Not sure` / `Unable to answer` / `Staff should confirm` 選項。 | 範例：`true`；使用者不確定時仍回傳明確 option id。 |
| `question.allow_skip` | boolean | no | 若 imedtac UI 需要 skip button，用此欄位控制；required safety questions 建議為 `false`。 | 範例：`false`；代表本題不允許 silent skip。 |
| `question.max_selections` | number/null | no | `multi_choice` 題的最大可選數；單選題可為 `1`。 | 範例：`3`；iMVS 可限制同題選取數。 |
| `question.trigger_reason_codes` | array | no | 說明此題出現的 reason code，供 log / debug / demo trace 使用。 | 範例：`["measured_elevated_heart_rate_demo"]`；代表此題由 heart-rate cue 觸發。 |
| `question.summary_effect` | string/null | no | 說明此題答案如何進入 `staff_review_summary`。 | 範例：`Adds current heart-racing status to staff review summary.` |
| `question.rendering_constraints.requires_no_scroll` | boolean | no | 是否要求此題盡量不需捲動即可顯示完整內容；六月 demo 建議為 `true`。 | 範例：`true`；代表題目文字與選項以首屏完整顯示為設計目標。 |
| `question.rendering_constraints.max_visible_options_without_scroll` | number | no | iMVS 首屏可顯示的最大短選項數；Teams `2026-05-25` 工作假設為最多 `9` 個。 | 範例：`9`；NYCU 仍會優先回傳較短、較少的選項以維持可讀性。 |

## Endpoint 2 Request

```http
POST /api/triage-demo/sessions/{session_key}/answers
Content-Type: application/json
```

必填 request 欄位：

| 欄位 | 型別 | 必填 | 定義 | 範例與說明 |
| --- | --- | --- | --- | --- |
| `api_version` | string | yes | 本次 API contract 的版本識別碼；需與 Endpoint 1 使用的版本相容。 | 範例：`2026-05-22-demo-v0.2-draft`；answer request 沿用同一版 API contract。 |
| `schema_version` | string | yes | request / response JSON schema 的版本識別碼；需與 Endpoint 1 使用的版本相容。 | 範例：`imvs-nycu-triage-demo-schema-v0.2-draft`；answer request 與 session schema 對齊。 |
| `flow_version` | string | yes | 目前 active demo flow 的版本；應與 Endpoint 1 啟動 session 時一致。 | 範例：`tachycardia-live-demo-flow-v0.2-draft`；代表答案屬於 tachycardia live lane。 |
| `case_id` | string | yes | synthetic demo case 的識別碼；應與 Endpoint 1 啟動 session 時一致。 | 範例：`demo-tachycardia-live-001`；代表答案屬於同一 synthetic case。 |
| `case_version` | string | no | synthetic case 內容版本；Endpoint 2 可 echo Endpoint 1 建立 session 時使用的版本。 | 範例：`demo-tachycardia-live-001-v0.2`；完整 trace 可帶回 case content version。 |
| `fixture_version` | string | no | demo fixture 版本；Endpoint 2 可 echo Endpoint 1 建立 session 時使用的 fixture 版本。 | 範例：`v0.2.0`；完整 trace 可帶回 rehearsal fixture version。 |
| `question_set_version` | string | no | 問題清單與 option mapping 版本；Endpoint 2 可 echo active session 的 question set。 | 範例：`tachycardia-question-set-v0.2-draft`；完整 trace 可帶回答案對應題庫版本。 |
| `wording_version` | string | no | `staff_review_summary` wording 與 scope-control wording 版本；Endpoint 2 可 echo active session 的 wording 版本。 | 範例：`staff-summary-wording-v0.2-clinical-draft`；完整 trace 可帶回 summary wording 版本。 |
| `request_id` | string | yes | iMVS 端產生的單次 answer submission 追蹤識別碼。 | 範例：`req-demo-answer-001`；雙方用此值追蹤單次 answer request。 |
| `idempotency_key` | string | yes | 防止 retry 造成同一題答案被重複處理、導致 question flow 前進兩次的冪等鍵。 | 範例：`idem-demo-answer-001`；同一 answer retry 時使用相同 key。 |
| `session_key` | string | yes | Endpoint 1 回傳的 session key；用來讓 NYCU 找到對應 session state。 | 範例：`demo-session-tachy-001`；NYCU 用此值取得 active session。 |
| `workflow_mode` | string | yes | 此 session 使用的 workflow mode；六月應為 `post_measurement_only`。 | 範例：`post_measurement_only`；answer request 延續量測後問答模式。 |
| `measurement_state` | string | yes | measurement state；六月送 answer 時應維持 `complete`。 | 範例：`complete`；answer request 延續已完成量測的 session state。 |
| `vitals_ready` | boolean | yes | 是否已有可使用的 vital payload；六月送 answer 時應維持 `true`。 | 範例：`true`；NYCU 可在下一題或 summary 中持續引用 vital context。 |
| `question_phase` | string | yes | 正在回答的問題階段；六月多數情況為 `post_measurement_intake`。 | 範例：`post_measurement_intake`；代表使用者正在回答量測後問答題。 |
| `question_id` | string | yes | 使用者正在回答的 question id；應等於 NYCU 前一個 response 的 `question.id`。 | 範例：`tachy-chief-concern`；NYCU 用此值把答案綁到前一題。 |
| `answer.selected_option_ids` | array | yes for choice questions | 使用者選取的 option id 清單；單選題通常只有一個 id，複選題可有多個 id。 | 範例：`["heart_racing"]`；代表使用者選了 heart racing / palpitations。 |
| `answer.scale_value` | number/null | no | 若題型為 `scale`，填入使用者選擇的數值；choice 題型使用 `null`。 | 範例：`null`；代表本題是 choice question。 |
| `client_event.input_mode` | string | yes | 使用者輸入模式；六月建議為 `touch`。 | 範例：`touch`；代表使用者在 kiosk UI 點選答案。 |
| `client_event.answered_at` | string | no | 使用者完成回答的時間戳，建議使用 ISO 8601 格式。 | 範例：`2026-05-21T10:02:00+08:00`；代表使用者完成點選的時間。 |

Endpoint 2 request 範例：

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
  "question_id": "tachy-chief-concern",
  "answer": {
    "selected_option_ids": ["heart_racing"],
    "scale_value": null
  },
  "client_event": {
    "input_mode": "touch",
    "answered_at": "2026-05-21T10:02:00+08:00"
  }
}
```

## Endpoint 2 Response

NYCU 會回傳兩種 response 類型之一。

### A. 下一題 question object

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
    "expected_total": 7
  },
  "question": {
    "id": "tachy-onset",
    "registry_refs": ["TACHY-002"],
    "source_refs": ["DUOBAO-DEMO-DESIGN-20260520", "DUOBAO-AFRVR-TACHY-QA-20260525", "LOCAL-PROTOCOL-TBD"],
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
    "summary_effect": "Adds onset and duration context to the staff-review summary."
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
  }
}
```

Staff-review summary 欄位定義：

| 欄位 | 型別 | 必填 | 定義 | 範例與說明 |
| --- | --- | --- | --- | --- |
| `summary_visibility` | string | yes | 摘要可見範圍；六月 demo 建議為 `staff_only`，表示給 staff / doctor / customer preview。若需要 patient-facing copy，建議另行設計 patient-safe wording。 | 範例：`staff_only`；iMVS 將 summary 顯示在 staff / doctor / customer preview。 |
| `handoff_required` | boolean | yes | 是否需要 human review / staff handoff；demo case 若有需要人工確認的 vital 或 symptom context，應為 `true`。 | 範例：`true`；代表本次 demo summary 進入 staff-review workflow。 |
| `handoff_reason_codes` | array | yes | 需要人工 review 的機器可讀理由代碼，例如 tachycardia live lane 的 heart-rate cue 與回報症狀。 | 範例：`["measured_elevated_heart_rate_demo","reported_palpitations"]`；前端或 log 可用此值標記 handoff 原因。 |
| `staff_review_summary.format` | string | yes | 摘要格式版本或格式名稱；目前建議為 `review_summary_demo`。 | 範例：`review_summary_demo`；代表使用 demo staff summary 格式。 |
| `staff_review_summary.subjective` | array | yes | 使用者回報的主觀資訊，例如主訴、症狀、使用者選項。 | 範例：`["Synthetic demo patient reports heart racing with chest heaviness for about half a day."]`；整理使用者選項。 |
| `staff_review_summary.objective` | array | yes | iMVS 量測到的客觀資訊，例如 heart rate、SpO2、temperature 等 vital payload 摘要。 | 範例：`["Demo vital payload includes HR 130 bpm, SpO2 98%, BP 102/68 mmHg, and temperature 36.5 C."]`；整理 iMVS 量測資料。 |
| `staff_review_summary.review_basis` | array | yes | 支援 staff review 的資訊依據；欄位語意維持在 review context。 | 範例：`["Measured heart-rate cue plus reported palpitation symptoms supports staff review in this demo workflow."]`；說明 summary 依據。 |
| `staff_review_summary.review_action` | array | yes | 給 staff 的 review reminder 與 workflow cue。 | 範例：`["Please review measured heart rate, reported symptoms, rhythm-history selection, and medication/allergy confirmation."]`；提供 staff workflow cue。 |
| `staff_review_summary.staff_handoff_note` | string | yes | 給 staff / doctor preview 的短句，提醒檢視量測數值與使用者回報症狀。 | 範例：`Review measured heart rate and reported cardiopulmonary symptoms.`；可直接顯示在 preview。 |
| `staff_review_summary.scope_controls` | array | yes | 以正向語氣列出本 demo 的 operating scope，例如 staff-review intake support、human review workflow、synthetic-data demo context 與 separate validation path。 | 範例：`["Staff-review intake support","Human review workflow"]`；明確呈現 demo operating scope。 |

## Retry 與 Idempotency

使用 `request_id` 做 trace，使用 `idempotency_key` 處理安全 retry。

建議規則：

- `request_id` 每次 HTTP request 都重新產生 unique id，方便雙方 log trace。
- `idempotency_key` 綁定同一個 logical operation。對 Endpoint 1 而言，是同一次
  start-session attempt；對 Endpoint 2 而言，是同一個 session / question /
  answer submission attempt。
- 同一 logical operation retry 時使用同一個 `idempotency_key`。
- 不同題目、或使用者明確重新送出新的答案嘗試時，使用新的
  `idempotency_key`。

必要行為：

```text
Same endpoint + same session_key when applicable + same idempotency_key + same
request body -> return the same result and keep the question flow at the same
state.
```

若相同 `idempotency_key` 搭配實質不同 request body，NYCU 應回傳
`error.code = "idempotency_conflict"`，並維持原 session state、不推進 question
flow。六月 demo 對此情境的單一 recovery 規則是 restart demo session：

```text
iMVS receives idempotency_conflict
-> do not auto-submit the changed answer with a new idempotency_key
-> keep answer controls locked for the current failed attempt
-> operator starts a new demo session through Endpoint 1
   or switches to clearly labeled Local Scripted Demo Mode
```

此規則不新增 endpoint，也不改兩個 endpoint 的主架構；它只是把
`idempotency_conflict` 的 error-handling contract 固定下來。若未來要從 conflict
那一題重新問，才需要另開 session-state recovery / answer-revision endpoint。

Frontend interaction 建議：

```text
使用者送出答案
-> iMVS snapshot answer body + idempotency_key
-> lock all answer-related buttons/options
-> retry only the same body with the same idempotency_key if needed
-> unlock only after NYCU returns the next question or summary
```

## Error 與 Fallback 行為

Error response 使用 structured fallback contract：NYCU 回傳穩定 error code、
retryability 與建議 fallback mode，讓 iMVS 維持標準 staff workflow 或
Local Scripted Demo Mode。

建議 error 欄位：

| 欄位 | 定義 | 範例與說明 |
| --- | --- | --- |
| `status` | response 類型；error response 固定為 `error`。 | 範例：`error`；iMVS 依此進入 fallback handling。 |
| `error.code` | 穩定的 machine-readable error code，供 iMVS 判斷錯誤類型。 | 範例：`api_timeout`；代表 NYCU API 回應逾時。 |
| `error.message` | 短的工程可讀錯誤訊息，供 debug 或 UI fallback 使用。 | 範例：`NYCU demo API timeout.`；供工程 log 與 operator 判讀。 |
| `error.retryable` | 此錯誤是否建議 retry；`true` 表示可安全重試，`false` 表示建議轉入 fallback 或人工流程。 | 範例：`true`；代表 iMVS 可用相同 idempotency key retry。 |
| `recovery.safe_next_action` | 對特定錯誤建議的安全下一步；`idempotency_conflict` 的六月 demo 值固定為 `restart_demo_session`。 | 範例：`restart_demo_session`；代表 operator 重新從 Endpoint 1 建立 demo session。 |
| `recovery.ui_locking_required` | 告訴 iMVS 此錯誤需要維持答題控制鎖定，直到 operator restart 或 fallback。 | 範例：`true`；避免使用者在不同步狀態下繼續送答案。 |
| `fallback.recommended_mode` | 建議 fallback 模式；可為 `standard_staff_workflow`、`local_scripted_demo` 或 `retry_remote_api`。 | 範例：`local_scripted_demo`；代表 customer demo 可切換到 local scripted run。 |
| `demo_boundary` | 說明此 error / fallback 的定位為 demo-only workflow support。 | 範例：`Demo workflow support fallback.`；fallback response 仍維持相同 operating scope。 |

若 rehearsal 或 customer demo 時 NYCU remote API 進入 fallback condition，
imedtac UI 可切換到 Local Scripted Demo Mode 以維持 demo continuity。此模式需
在內部與必要畫面上清楚標示為 local scripted run mode，方便 demo operator 與
工程團隊辨識目前執行模式。

## 使用者答不出來 / Skip 行為

Teams `2026-05-25` 的目前共識是：本次 demo 不做 generic silent skip；
imedtac UI 會保留 `I'm not sure`，不使用 UI 內建固定 `None of these` 按鈕。

目前工程建議如下：

- 對 required safety 或 handoff 問題，使用明確 answer option 或 staff-confirmation path。
- 若使用者可能不知道答案，建議在選項中明確提供 `Not sure` 或
  `Unable to answer`。
- 若某題需要表示「以上皆無」，NYCU 應把 `none_of_these` 當成該題
  `question.options` 內的 ordinary option 回傳，而不是依賴 iMVS 內建固定按鈕。
- 若 imedtac UI 需要對非 critical 問題提供真正的 skip interaction，API 應明確
  表示該題被 skip，並附上 `skip_reason`：

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

NYCU 會在與多寶 / 許醫師討論後，確認哪些題目必答、哪些題目可以提供
`Not sure` / `Unable to answer`，以及哪些題目可以允許真正 skip。

## 需要 imedtac 提供的資訊

為了 freeze API examples 並精準對齊欄位名稱，NYCU 需要 imedtac 提供以下資訊。

1. Vital Upload API field dictionary
   - 目前 demo machine / GitHub 格式是否仍沿用 V1.4 的 `NBP`、`SPO2`、`HR`、
     `Temp`、`Glucose`、`Height`、`Weight`；
   - 若 units 與 V1.4 baseline 不同，請提供 current units；
   - required / optional 狀態；
   - missing / failed / poor-quality value 的表示方式；
   - blood pressure 結構；
   - respiratory rate 是量測值、手動輸入值，或本次 demo 不提供。

2. iMVS question-rendering limits
   - 支援哪些 question templates；
   - 不捲動時最多可顯示幾個 options；
   - option label 最長可接受多少字元；
   - 每題 option count 是否可以不同；
   - 是否可 render `progress`、`ui_template`、`option_count` 與 answer constraints。

3. Demo environment
   - imedtac 已表示六月 demo 預計由 front-end browser 直接呼叫 NYCU API；
   - NYCU API rehearsal base URL：
     `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo`；
   - CORS allowlist 需包含 `http://localhost` 與 `http://localhost:5174`；
   - 需支援 browser preflight、`Content-Type: application/json`，以及如啟用
     demo bearer token 時的 `Authorization` header；
   - demo bearer token 或 shared token 是否啟用由 NYCU 決定，但實際 token 不寫入
     repo 文件。

4. Demo preview page
   - `staff_review_summary` 顯示在哪一頁；
   - preview 是否僅供 staff / doctor / customer demo preview；
   - patient-facing UI 是否需要隱藏 summary。

## 交付規劃

NYCU 目前可提供：

- 本兩個 endpoint API 文件；
- start-session、answer submission、next-question、summary、error response
  的 JSON examples；
- 多寶 `2026-05-25` AfRVR-style tachycardia case 對齊後的第一版 preset
  question / option template；
- skip-behavior 建議：required safety / handoff questions 使用明確選項，例如
  `Not sure` 或 `Staff should confirm`；若需要「以上皆無」，NYCU 以該題自己的
  option id 回傳，不依賴 UI 內建固定按鈕；generic skip button 若需要，僅作為
  非 critical 問題的顯式 `skipped + skip_reason` event。

此 API schema 不綁定單一 case。相同兩個 endpoints 可以支援 tachycardia
live-performance lane 與 respiratory synthetic lane；需要替換的是 `flow_version`、
`case_id`、question set 與 summary wording。
