---
id: 2026-05-20-imedtac-pre-meeting-api-v02-pre-read
title: "慧誠智醫會前提供文件：iMVS / NYCU AI Triage Demo API v0.2 會前閱讀文件"
date: 2026-05-20
meeting_date: 2026-05-21
topic: ai-triage
type: external-handoff
status: ready-to-send draft
audience: Johnny Fang, 慧誠智醫工程設計團隊, 許醫師, NYCU demo 團隊
source:
  - ./2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ./2026-05-21-decision-defaults-and-owner-matrix.md
  - ./2026-05-22-api-v0.2-requirements-from-expert-review.md
  - ../docs/2026-05-19-ai-triage-product-spec-api-analysis.md
  - ../decisions/2026-05-20-june-demo-question-budget.md
---

# 慧誠智醫會前提供文件：iMVS / NYCU AI Triage Demo API v0.2 會前閱讀文件

提供對象：慧誠智醫 / Johnny Fang / 工程設計團隊 / 許醫師 / NYCU demo 團隊

會議時間：`2026-05-21 10:00` Asia/Taipei

## 1. 會議目標

NYCU 建議 5/21 sync 直接收斂 iMVS 與 NYCU AI Triage Demo 之間的 API v0.2 工作合約。這份文件提供可討論、可修改、可落地的 pre-read，讓慧誠工程團隊可以在會前先看見 UI 插入點、payload 欄位、`session_key` 行為、問題物件格式、回答回傳流程，以及人員檢閱摘要（`staff_review_summary`）的輸出格式。

本次建議收斂成一個完整、可進行 demo、可測試的合成資料流程：

```text
iMVS 合成生命徵象 payload
-> NYCU 結構化 / 選項式動態問診
-> iMVS 回傳回答 payload 與 session_key
-> NYCU 產生 staff_review_summary
-> 工作人員 / 臨床人員檢閱
```

這個 demo 的產品主張很清楚：iMVS 的量測資料可以成為 NYCU 結構化問診流程的 vital context，最後產生給工作人員 / 臨床人員檢閱的 `staff_review_summary`。六月版本以 synthetic data、staff review、read-only demo flow 作為範圍控制；不輸出診斷、治療建議、最終檢傷或 acuity 分級，也不執行 production HIS / EMR / FHIR writeback。

## 2. 慧誠需求與本次回應

| 慧誠提出的需求 / 規格方向 | 本次 NYCU 回應 |
| --- | --- |
| 六月前要能放進 iMVS kiosk / web service demo 流程。 | 先提供 API v0.2 草稿與 JSON 範例，讓慧誠工程團隊確認 UI 插入點與 payload 形狀。 |
| iMVS 量測到的生命徵象要進入 AI Triage 流程。 | API 請求以合成的 iMVS-shaped vital payload 為核心，欄位包含 `measurement_timestamp`、`device_id`、`value`、`unit`、`measurement_status`、`quality_flag`、`missing_reason`。 |
| 動態 OPQRST-style 問題數需要精簡。 | 依目前 iMVS product spec，可見的病人端問題使用 `<8` 作為上限；API 硬性上限建議設定為 `max_questions=7`。 |
| UI 需要支援單選、多選、量表與進度顯示。 | API 問題物件會明確回傳 `question.type`、`options`、`none_option_id`、`progress.current`、`progress.expected_total`。 |
| iMVS 需要知道回答後下一步怎麼走。 | 使用 `session_key` 維持 session；iMVS 送出回答後，NYCU 回傳下一題或 `staff_review_summary`。 |
| 希望有醫師 / 工作人員可看的 AI 結果頁。 | 六月 demo 建議顯示僅供工作人員檢視的 summary page，欄位使用 `review_basis`、`review_action`、`staff_handoff_note`。 |
| 語音輸入有產品吸引力。 | 語音輸入建議排除在六月關鍵路徑；若列為延伸項目，需逐字稿確認、重試 / 備援機制，並且不保留 raw audio。 |
| HIS / FHIR / EMR return path 是產品方向。 | 六月 demo 建議只做醫師檢視頁或 mock export，不做 production writeback。 |

## 3. 六月 demo 建議範圍

### 納入六月主線

- 完成一個完整的合成呼吸道情境 demo 流程；
- 使用 iMVS-shaped synthetic vital payload；
- 支援結構化問題流程；
- 以 `session_key` 為基礎送出結構化回答；
- 顯示可理解的進度；
- 支援 `single_choice`、`multi_choice`、`scale` 的 question schema；
- 產生提早轉交工作人員檢閱的 handoff summary；
- 定義穩定的錯誤行為與 fallback 文字；
- API 或 measurement quality 失敗時，不產生假的臨床摘要。

### 六月範圍控制

以下控制讓六月 demo 保持可交付、可整合、可由臨床人員檢閱：

- 輸出維持為 `staff_review_summary`，不輸出診斷；
- 保留 staff / clinician review，不輸出最終檢傷或 acuity 分級；
- 只呈現 workflow support，不輸出治療建議或 emergency order；
- 使用合成資料，不使用真實病人識別資料或真實病人資料；
- 語音不進入六月 critical path，因此不收 raw ASR audio；
- HIS / EMR / FHIR 維持 read-only / mock 呈現，不做 production writeback；
- 對外主張維持 demo capability，不使用 FDA / 510(k)-ready claim；
- 六月先完成一個可驗證的 respiratory loop，再擴充到更多案例或更廣科別。

## 4. API v0.2 建議合約

### 端點 1：建立 session

```http
POST /api/triage-demo/sessions
```

主要輸入：

- `api_version`
- `schema_version`
- `flow_version`
- `case_id`
- `request_id`
- `idempotency_key`
- `workflow_mode`
- `measurement_state`
- `vitals_ready`
- `client`
- `patient_context`
- `vitals`
- `capabilities`

主要回應：

- `session_key`
- `session_expires_at`
- `session_state`
- `last_question_id`
- `status: "question"`
- `progress`
- `question`
- `demo_boundary`

### 端點 2：送出回答

```http
POST /api/triage-demo/sessions/{session_key}/answers
```

主要輸入：

- `session_key`
- `question_id`
- `answer.selected_option_ids`
- `answer.scale_value`
- `client_event.input_mode`
- `request_id`
- `idempotency_key`

主要回應：

- 下一個 `question`；或
- `status: "summary"` 與 `staff_review_summary`。

### 端點 3：生命徵象完成後回傳 payload

```http
POST /api/triage-demo/sessions/{session_key}/vitals
```

若慧誠 UI 支援最佳化的 two-phase flow，建議使用此端點：

```text
Phase 1：iMVS 量測中先詢問 pre-vital intake questions
-> vitals-ready payload
-> Phase 2：vital-aware follow-up
-> staff_review_summary
```

若 iMVS UI 不適合在量測中顯示問題，使用保守 fallback：

```text
post-measurement-only flow
-> synthetic vital values 完成後再呼叫 Endpoint 1
```

## 5. 需要慧誠確認的 vital payload 欄位

NYCU 可以先依照以下 shape 製作 API v0.2 草稿。慧誠工程團隊需確認實際欄位名稱、單位、required / optional 狀態，以及 missing / failure 語意。

```json
{
  "vitals": {
    "measurement_timestamp": "2026-05-21T10:00:00+08:00",
    "device_id": "IMVS-DEMO-001",
    "temperature": {
      "value": 38.5,
      "unit": "C",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    },
    "spo2": {
      "value": 92,
      "unit": "%",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    },
    "heart_rate": {
      "value": 102,
      "unit": "beats/min",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    },
    "respiratory_rate": {
      "value": 23,
      "unit": "breaths/min",
      "measurement_status": "measured",
      "quality_flag": "needs_review",
      "missing_reason": null
    },
    "blood_pressure_systolic": {
      "value": 123,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    },
    "blood_pressure_diastolic": {
      "value": 81,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok",
      "missing_reason": null
    }
  }
}
```

會議需要確認：

- 每一個 vital field 是否都能帶自己的 `measurement_status`、`quality_flag`、`missing_reason`？
- 若六月來不及做到 per-vital quality fields，是否先使用 session-level quality fields？

## 6. 第一個 demo 案例

建議第一個案例：

```text
呼吸喘、發燒與較低血氧
```

合成案例設定：

- 年齡：`80`
- 性別：`male`
- 體溫：`38.5 C`
- SpO2：`92%`
- 心率：`102 beats/min`
- 呼吸速率：`23 breaths/min`
- 血壓：`123/81 mmHg`

這個案例適合作為第一個 demo 案例，原因如下：

- 能清楚呈現量測生命徵象為什麼會影響後續問題；
- 支援短流程、可視覺化、結構化問診；
- 可自然收斂到 staff-review handoff，不需要宣稱診斷或最終檢傷分級；
- 可以維持在 `<8` 可見問題要求內。

建議問題流程：

| # | 階段 | 問題目的 | 類型 |
| --- | --- | --- | --- |
| 1 | pre-vital intake | 主訴 | single-choice |
| 2 | pre-vital intake | 呼吸喘持續時間 | single-choice |
| 3 | pre-vital intake | 呼吸不適嚴重程度 | scale 或 single-choice |
| 4 | pre-vital intake | 相關症狀 | multi-choice |
| 5 | post-vital follow-up | 胸痛或胸口壓迫感確認 | single-choice |
| 6 | post-vital follow-up | 慢性肺病、居家氧氣或呼吸用藥脈絡 | multi-choice |
| 7 | post-vital follow-up | 藥物過敏或需 staff 確認的用藥脈絡 | multi-choice |

## 7. `staff_review_summary` 建議格式

建議欄位名稱：

```json
"staff_review_summary"
```

建議結構：

```json
{
  "status": "summary",
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": [
    "reported_shortness_of_breath",
    "measured_lower_oxygen_saturation_demo",
    "measured_fever_demo"
  ],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "合成案例：使用者回報呼吸喘。"
    ],
    "objective": [
      "合成量測生命徵象包含發燒、呼吸速率偏高，以及本 demo 情境中較低的血氧值。"
    ],
    "review_basis": [
      "回報的呼吸症狀與量測血氧線索應由工作人員檢閱。"
    ],
    "review_action": [
      "需要工作人員或臨床人員檢閱。"
    ],
    "staff_handoff_note": "請檢閱量測生命徵象與使用者回報症狀。",
    "not_claimed": [
      "本 demo 不提供診斷。",
      "本 demo 不提供治療建議。",
      "本 demo 不指定最終檢傷分級。",
      "本 demo 不寫入 HIS/EMR/FHIR。"
    ]
  }
}
```

六月 API 合約建議使用 `review_basis` 與 `review_action`。避免使用 `diagnosis`、`assessment_support`、`plan_support`，因為這些字眼容易被理解成診斷、SOAP Assessment 或 SOAP Plan。

## 8. 錯誤與 fallback 規則

如果 API、session 或 measurement quality 失敗，系統不應產生假的臨床摘要。

建議 fallback 文字：

```text
AI Triage Demo service 目前無法使用，或 measurement quality 無法支援本次 demo 摘要。請繼續使用標準工作流程。本次未產生 AI 產生的臨床摘要。
```

必要 error fields：

- `status: "error"`
- `error.code`
- `error.message`
- `http_status`
- `retry_allowed`
- `fallback_to_standard_staff_workflow: true`
- 不包含 `staff_review_summary`

建議 error examples：

- `missing_required_field`
- `unsupported_question_type`
- `invalid_session`
- `session_expired`
- `api_timeout`
- `measurement_quality_unavailable`
- `idempotency_conflict`

## 9. 會前或會中需要慧誠確認的事項

### 產品 / Johnny

- 確認六月中客戶 demo 的確切日期。
- 確認這次 demo 的成功標準是 UI 驗證、API 驗證，或工作流程驗證。
- 確認工程團隊需要 Markdown API 文件、OpenAPI、mock endpoint，或 sequence diagram。
- 確認單一工程窗口與後續溝通管道。

### 工程 / 慧誠

- 確認 iMVS 實際 vital field names 與 units。
- 確認哪些 vital fields 是 guaranteed，哪些是 optional。
- 確認 missing / failed / poor-quality measurement 的表示方式。
- 確認六月目標 iMVS device / product mode。
- 確認 UI insertion point：same app、iframe、external link、backend API、laptop API，或 static mock。
- 確認 Phase 1 questions 是否能在 measurement running 時顯示。
- 確認 iMVS 是否能呼叫 `POST /api/triage-demo/sessions/{session_key}/vitals`。
- 確認是否由 NYCU 產生 `session_key`，iMVS 後續 echo 回來。
- 確認 demo 是否允許 external HTTPS endpoint，或應採 local mock / laptop API。

### 臨床 / 許醫師

- 確認第一個 live demo case 是否採用 respiratory case。
- 確認 `SpO2 92%`、發燒與 respiratory-rate wording 是否應在較少問題後觸發 early handoff。
- 確認安全的 staff-summary wording。
- 確認 customer demo 中不可出現的 forbidden wording。

### 隱私 / 資安

- 確認六月不使用真實姓名、MRN、身分證字號、電話、raw audio，或 live chart data。
- 確認六月不連接 production HIS / EMR / FHIR endpoint。
- 確認 demo log 與 screenshot 的處理規則。

## 10. 建議會議收斂的負責人 / 日期

| 負責人 | 交付項目 | 建議期限 | 驗收方式 |
| --- | --- | --- | --- |
| 慧誠 engineering | Synthetic iMVS vital payload example 與 field dictionary | 2026-05-22 | 欄位名稱、單位、required / optional、missing / failure behavior 明確。 |
| 慧誠 engineering / UI | UI insertion decision | 2026-05-22 | 明確指定 same-app / iframe / external link / backend API / laptop API / static mock。 |
| 慧誠 engineering | Two-phase feasibility decision | 2026-05-22 | 確認 Phase 1 during measurement 與 vitals-ready endpoint 是否可行。 |
| Johnny / product | demo 日期、受眾、成功標準、engineering POC | 2026-05-21 call | 明確指定日期、受眾、預期證明項目與單一 owner。 |
| 許醫師 | Respiratory case stop rule 與 safe summary wording | 2026-05-22 | 核准第一個案例、handoff trigger 與確切 wording boundary。 |
| Jason / NYCU | 欄位確認後的 confirmed API v0.2 | 2026-05-22 | 依確認後的 field dictionary、session ownership 與 error behavior 更新草稿。 |
| Jason / NYCU | One respiratory mock adapter / static rehearsal | 2026-05-25 | 一個合成案例可跑完 request -> answer -> summary examples。 |
| 隱私 / 資安 owner | Demo data 與 endpoint boundary | 2026-05-22 | 確認 synthetic-only data、no raw audio、no production endpoint 與 log policy。 |

## 11. 建議 email 文字

主旨：

```text
AI Triage Demo：iMVS / NYCU API v0.2 5/21 Sync 會前閱讀文件
```

內文：

```text
Johnny 與慧誠 engineering team 您好，

會議前先提供 NYCU 端整理的 API v0.2 會前閱讀文件，供 5/21 sync 直接收斂工程決策。

我們建議六月 demo 先固定成一個 synthetic-data vital-aware intake loop：
iMVS 提供合成生命徵象 payload，NYCU 回傳結構化 question object 與 session_key，iMVS 回傳結構化回答，NYCU 最後回傳 staff_review_summary 給工作人員 / 臨床人員檢閱。

這份文件包含：
1. API / session loop 建議；
2. vital payload 欄位方向；
3. question object 與 answer schema；
4. staff_review_summary 欄位；
5. voice 與 HIS/FHIR writeback 的六月範圍決策；
6. 會議中需要慧誠 / 許醫師 / NYCU 確認的負責人 / 日期。

明天會議希望優先確認：
- iMVS actual field dictionary；
- UI insertion point；
- session_key ownership；
- Phase 1 during measurement 是否可行；
- first respiratory case 與 safe summary wording；
- API v0.2 confirmed version 的交付時間。

Jason 敬上
```

## 12. 建議附檔或分享資料

建議最低限度提供：

- 本會前閱讀文件；
- `2026-05-21-imvs-nycu-api-design-v0.2-draft.md`；
- `api-examples/` JSON examples；
- `2026-05-21-decision-defaults-and-owner-matrix.md`。

若只寄一份文件，建議先寄本會前閱讀文件，並保留 API examples 供會後補充。
