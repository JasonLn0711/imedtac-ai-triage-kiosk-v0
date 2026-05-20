---
id: 2026-05-21-imedtac-meeting-q-and-a
title: "imedtac 2026-05-21 Meeting Classified Q&A"
date: 2026-05-21
topic: ai-triage
type: handoff
status: draft
audience: NYCU meeting presenter
source:
  - ./2026-05-15-imedtac-anticipated-q-and-a-zh-TW.md
  - ./2026-05-21-imedtac-engineering-sync-prep.md
  - ./2026-05-21-decision-defaults-and-owner-matrix.md
  - ./2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ../source/2026-05-20-imedtac-personal-pre-meeting-note/AI-Triage_imedtac_Pre-Meeting_Pre-Read_2026-05-21.md
---

# imedtac 2026-05-21 Meeting Classified Q&A

## Purpose

This Q&A is the classified response sheet for the `2026-05-21` imedtac
engineering sync. It consolidates earlier anticipated Q&A, the 5/21 engineering
prep, the owner matrix, the API v0.2 draft, and the personal pre-meeting notes.

Use this as a speaking aid. It is not a clinical protocol, production API
specification, regulatory submission, or customer-facing claim sheet.

## Core Position

Recommended opening:

```text
六月 demo 的主線是 synthetic-data vital-aware intake support workflow。
正常路徑是 Remote REST API Mode：iMVS 送 vital payload 與 structured answers，
NYCU 回 typed questions 與 staff_review_summary。
備援路徑是 Local Scripted Demo Mode，只用於 demo continuity，必須清楚標示不是 live AI API mode。
```

Fixed boundary:

```text
No diagnosis.
No treatment advice.
No final triage / acuity level.
No real patient identifiers.
No production HIS / EMR / FHIR writeback.
Human review remains the final decision point.
```

## A. Scope And Product Positioning

### Q1. 六月 demo 到底要展示什麼？

**Answer:**

六月 demo 展示一個最小可運作的 vital-aware intake loop：iMVS 提供合成或
iMVS-shaped vital payload，NYCU 回傳結構化動態問題，最後產生
`staff_review_summary` 給工作人員或臨床人員覆核。

**What to avoid:**

```text
不要說我們已經完成正式 AI triage product。
不要說會產生診斷、治療建議或 final triage level。
```

### Q2. 這是不是 AI triage？

**Answer:**

對內可以說這是 AI triage demo lane；對外建議更精準地說：

```text
synthetic-data vital-aware intake support demo
AI-assisted staff-review intake workflow
```

這個 demo 支援人員覆核，不是 autonomous medical decision maker。

### Q3. 能不能做 3-5 個 cases？

**Answer:**

可以作為 roadmap，但工程主線要先完成一個 respiratory full loop。建議順序是：

1. 先完成 `fever + dyspnea + lower SpO2 context` 的完整 API / UI / summary loop。
2. 再擴充 additional fixtures。
3. 不為了案例數犧牲 primary integration path。

### Q4. 六月 demo 成功的定義是什麼？

**Answer:**

```text
iMVS or mock iMVS-shaped vital payload enters NYCU intake engine;
the system produces structured follow-up questions based on answers and vital context;
the flow ends with a non-diagnostic staff_review_summary;
the UI preserves human review boundary;
local scripted fallback can continue the demo if remote API is unavailable.
```

## B. API Contract And Engineering Integration

### Q5. 還需要 API spec 嗎？

**Answer:**

需要。API spec 是六月 demo 的 primary integration contract。Fallback mode
只是 demo 風險控制，不是 API spec 的替代品。

API spec 至少要定義：

- endpoints;
- HTTP methods;
- JSON request / response;
- required / optional fields;
- field types and units;
- `session_key` rules;
- error behavior;
- timeout / retry / idempotency;
- deployment method.

### Q6. REST API、JSON、FastAPI 要怎麼說？

**Answer:**

```text
REST API 是對外溝通風格。
JSON 是雙方交換資料格式。
FastAPI 是 NYCU 端內部用來實作這組 RESTful JSON API 的 Python backend framework。
```

對方主要需要 API contract，不一定需要知道所有內部 framework 細節。但工程會議中可以簡短說：

```text
NYCU 端會先以 Python FastAPI 實作 RESTful JSON API，方便快速產生 OpenAPI / Swagger 文件並串接 intake logic。
```

### Q7. 最小 endpoint list 是什麼？

**Answer:**

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
POST /api/triage-demo/sessions/{session_key}/vitals
GET  /api/triage-demo/sessions/{session_key}/summary
```

If the team wants fewer calls, the answer / vitals endpoint can directly return
`status="summary"` with `staff_review_summary`.

### Q8. `session_key` 誰產生？

**Answer:**

NYCU 建議由 NYCU API 產生 `session_key`，iMVS 後續 echo 回來。原因是
dynamic question state、Phase 1 / Phase 2 state、answer history、retry /
idempotency handling 都在 NYCU demo engine 端。

Fallback if not accepted:

```text
若 imedtac 要產生 encounter/session id，需要提供 id format、expiry rule、restart behavior 與 retry semantics。
```

### Q9. Retry 會不會讓 question loop 跳題？

**Answer:**

使用 `request_id` + `idempotency_key`。同一個 idempotency key 重送時，
NYCU API 應回同一個結果，不讓流程前進兩次。

### Q10. session 多久過期？

**Answer:**

Demo 建議 `15-30` 分鐘。過期後回 `session_expired` 或 `invalid_session`，
不產生 summary，並讓 UI restart 或切 fallback。

## C. Payload, Vitals, And Missing Data

### Q11. iMVS vital payload 需要確認什麼？

**Answer:**

需要 imedtac engineering 確認：

- actual field names;
- units;
- required vs optional;
- missing / failed / re-measured representation;
- per-vital `measurement_status`;
- per-vital `quality_flag`;
- `missing_reason`;
- timestamp and device identifier semantics.

### Q12. Vitals 欄位建議 flat 還是 nested？

**Answer:**

建議 nested per-vital object：

```json
{
  "spo2": {
    "value": 92,
    "unit": "%",
    "measurement_status": "measured",
    "quality_flag": "needs_review",
    "missing_reason": null
  }
}
```

這比只有 `"spo2": 92` 更清楚，因為單位、品質、缺值語意都在欄位內。

### Q13. 如果 vital sign 壞掉或缺資料怎麼辦？

**Answer:**

把 vital signs 視為 optional-but-important input。若 vital missing、failed
或 quality flag abnormal，系統不硬做推論，而是走 non-vital-dependent
question flow，並在 summary 標記：

```text
vital unavailable
measurement requires confirmation
```

Core phrase:

```text
缺資料時，不推論；只標記。
```

## D. UI Integration And Demo Environment

### Q14. AI step 放在 iMVS 哪裡？

**Answer:**

需要 imedtac 決定 UI insertion point。建議會中收斂到其中一種：

- same app;
- iframe;
- external link;
- backend API only;
- laptop-adjacent demo;
- static/local scripted mock.

### Q15. Two-phase flow 是什麼？

**Answer:**

```text
Phase 1: measurement in progress, ask non-vital-dependent intake questions.
Phase 2: after vitals-ready event, ask vital-aware follow-up questions.
```

If this disrupts measurement posture or signal quality, use post-measurement-only flow.

### Q16. Demo 當天怎麼部署？

**Answer:**

Recommended primary path:

```text
iMVS UI -> HTTPS demo URL -> NYCU FastAPI backend -> intake engine -> summary
```

Recommended risk control:

```text
If external HTTPS / tunnel / backend is unavailable, switch to local scripted fallback.
```

Need to confirm:

- stable internet;
- firewall / VPN / CORS limits;
- whether browser frontend or backend calls NYCU API;
- who starts backend;
- who monitors logs;
- who decides failover.

## E. Fallback / Degraded Demo Mode

### Q17. 如果 API 臨時掛掉怎麼辦？

**Answer:**

六月 demo 分兩層：

```text
Primary: kiosk UI calls NYCU API for live session-based dynamic intake.
Fallback: UI switches to local preloaded scripted demo flow.
```

This fallback is a demo resilience mechanism, not the production architecture.

Core phrase:

```text
Fallback 是展示穩定性設計，不是臨床正式使用設計。
```

### Q18. Local fallback 會不會讓人誤會成 live AI?

**Answer:**

必須明確標記：

```text
Local Scripted Demo Mode
Scripted synthetic flow
Not live API mode
```

Suggested response/log fields:

```json
{
  "execution_mode": "local_scripted_demo",
  "fallback_used": true,
  "fallback_reason": "remote_api_timeout"
}
```

### Q19. Local fallback 要誰實作？

**Answer:**

建議 iMVS UI 端實作 local scripted fallback，NYCU 提供：

- fixed synthetic respiratory case JSON;
- scripted question flow;
- scripted staff_review_summary;
- execution-mode labels;
- fallback reason codes.

### Q20. 是否需要 demo kill switch？

**Answer:**

需要。至少要有：

```text
Restart demo session
Switch to Local Scripted Demo Mode
Clear current session
Return to Live API Mode
```

This is a demo reliability control, not feature creep.

## F. Clinical Boundary And Summary Wording

### Q21. 你們根據什麼判斷 SpO2 偏低？

**Answer:**

六月不要宣稱正式 clinical threshold。建議說：

```text
measured oxygen level is included in staff review context
```

Exact thresholds and wording require clinical owner signoff.

### Q22. 如果漏掉危險訊號怎麼辦？

**Answer:**

The system is not a final triage decision maker. If red-flag context appears,
the system should raise a staff-review handoff cue, not diagnose.

Core phrase:

```text
Red flag 的責任不是讓 AI 判斷疾病，而是讓資訊不要被安靜地埋掉。
```

### Q23. Summary wording 會不會誤導醫師？

**Answer:**

Use observed-data and staff-review wording only:

```text
patient reports dyspnea
SpO2 value received
staff review recommended
```

Avoid:

```text
diagnosis
assessment_support
plan_support
triage_level
acuity_score
likely pneumonia
needs emergency treatment
safe to go home
```

Use:

```text
staff_review_summary
review_basis
review_action
staff_handoff_note
summary_visibility: staff_only
```

### Q24. 病人會看到 summary 嗎？

**Answer:**

Recommended: no. The summary should be `staff_only`. If imedtac needs a
patient-facing display, create a separate patient-safe wording layer after
clinical review.

## G. AI Behavior, Question Logic, And Robustness

### Q25. 如果 AI 問錯問題怎麼辦？

**Answer:**

June demo uses structured / rule-constrained flow. Patient-facing questions are
selected from reviewed question bank logic, not freely generated by a model.

Recommended wording:

```text
問題不是 AI 亂想的，而是從受控規則和預先審查過的 question bank 選出來。
```

### Q26. Prompt injection 怎麼辦？

**Answer:**

Avoid free text as the main control signal in June. Use choice-based structured
input. If ASR or free text is added later, treat it as supplemental notes, not
direct control of medical logic.

### Q27. 病人亂按、答案不一致、中途停止怎麼辦？

**Answer:**

Support partial completion and staff confirmation:

```json
{
  "completion_status": "partial",
  "requires_staff_confirmation": true
}
```

Do not amplify uncertain data into conclusions. Mark it for staff review.

## H. ASR, HIS / EMR, And Future Scope

### Q28. 為什麼六月不做 ASR？

**Answer:**

ASR is valuable, but it adds recognition error, noise handling, language
support, raw-audio privacy, transcript confirmation, microphone quality, and
fallback UX risk. June should first prove:

```text
kiosk vital payload -> dynamic question flow -> staff_review_summary
```

### Q29. 為什麼六月不做 HIS / EMR writeback？

**Answer:**

Production writeback creates hospital-system integration, access control,
medical-record responsibility, cybersecurity audit, and data-governance issues.
June should prove workflow value first through staff-review summary, not write
to production medical records.

Core phrase:

```text
六月先證明 workflow value，不碰 production medical record responsibility。
```

### Q30. 正式版是不是可以全部 local 跑？

**Answer:**

Possible, but not a June decision. Local-only production would require:

- per-kiosk deployment;
- version synchronization;
- bug-fix rollout;
- log collection;
- model / question-bank update strategy;
- device performance review;
- cybersecurity controls.

June local fallback is demo insurance, not a production architecture decision.

## I. Security, Logs, And Governance

### Q31. Authentication 怎麼做？

**Answer:**

At minimum, use demo bearer token or shared demo token:

```text
Authorization: Bearer <demo-token>
```

Do not place tokens in Markdown, Git, screenshots, logs, or command history.

### Q32. CORS 會不會擋？

**Answer:**

If iMVS browser frontend calls NYCU API directly, CORS matters. Need to confirm
iMVS UI origin. NYCU backend can allowlist that origin; avoid unrestricted `*`
for formal rehearsal.

### Q33. Audit log 記什麼？

**Answer:**

Demo log should include:

- `session_key`;
- `request_id`;
- endpoint;
- response status;
- error code;
- latency;
- `api_version`;
- `flow_version`;
- `case_id`;
- `question_id`;
- `execution_mode`;
- fallback state.

Do not log real identifiers, raw audio, access tokens, or live chart content.

### Q34. 版本號要放哪些？

**Answer:**

Use:

```json
{
  "api_version": "2026-05-demo-v0.2",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2",
  "flow_version": "respiratory_demo_v0.2",
  "case_version": "respiratory_case_v0.2",
  "question_set_version": "2026-05-21-demo",
  "wording_version": "staff_summary_v0.2"
}
```

Without versioning, debugging and bilateral API alignment will be painful.

## J. Detailed Speaking Answers

Use this section when the meeting needs a fuller answer than the short Q&A
above. These answers are written to sound confident, direct, and product-minded
while preserving the demo boundary.

### 1. Product / Scope: "六月 demo 到底要展示什麼？"

**Detailed answer:**

```text
六月 demo 我們建議先聚焦在一個最小可運作的 workflow，而不是把它包成完整醫療系統。

具體來說，iMVS 端提供 synthetic or iMVS-shaped vital payload，NYCU 端根據 vital context 和結構化回答回傳下一題，最後產生 staff_review_summary 給工作人員或臨床人員覆核。

這個 demo 的價值是讓客戶看到：iMVS 不只是量測設備，也可以成為 vital-aware intake workflow 的入口。它展示的是 workflow value、integration readiness 和 staff-review support，不是 autonomous diagnosis、treatment advice 或 final triage decision。
```

**If they push for a stronger claim:**

```text
我們可以說這是 AI-assisted staff-review intake workflow，或 synthetic-data vital-aware intake support demo。這個說法比較準確，也比較安全，因為最後決策仍然在人員覆核。
```

### 2. API / Engineering: "你們 API 要怎麼讓我們接？"

**Detailed answer:**

```text
我們會提供 RESTful JSON API contract。對 imedtac engineering team 來說，最重要的不是 NYCU 內部用什麼 framework，而是你們可以清楚知道要 call 哪些 endpoint、送什麼 JSON、哪些欄位必填、型態和單位是什麼、NYCU 會回什麼 response，以及 error / timeout / retry 時怎麼處理。

NYCU 端內部建議先用 Python FastAPI 實作，因為它可以快速產生 OpenAPI / Swagger 文件，也方便接我們的 intake logic。但對外合約仍然是 REST API + JSON schema。
```

**Concrete contract to mention:**

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
POST /api/triage-demo/sessions/{session_key}/vitals
GET  /api/triage-demo/sessions/{session_key}/summary
```

**What to ask imedtac:**

```text
請確認你們工程端需要 Markdown API spec、OpenAPI / Swagger、Postman collection、mock endpoint，或 sequence diagram。NYCU 可以先提供 Markdown + JSON examples，再依你們需要補 OpenAPI。
```

### 3. Session / State: "session_key 誰產生？狀態怎麼維持？"

**Detailed answer:**

```text
NYCU 建議由 NYCU API 產生 session_key，iMVS 後續每次 answer submit 或 vitals-ready update 都 echo 同一個 session_key。

原因是 dynamic question loop 的狀態在 NYCU 端，包括目前問到哪一題、Phase 1 / Phase 2 狀態、answer history、是否已產生 summary、retry 是否重送同一個 request。讓 state owner 和 question engine 在同一端，六月 demo 會比較穩。
```

**Retry answer:**

```text
我們會用 request_id 和 idempotency_key 控制 retry。同一個 idempotency_key 重送時，API 回同一個結果，不讓 question loop 因為重送而跳兩題。
```

**If they want iMVS-owned session:**

```text
可以討論，但 imedtac 需要提供 encounter/session id format、session expiry rule、restart / abandon behavior，以及 retry semantics。否則兩邊 state 會很容易不同步。
```

### 4. Vitals / Missing Data: "欄位缺值或量測失敗怎麼辦？"

**Detailed answer:**

```text
我們會把 vital signs 當成 optional-but-important input。也就是 vital 很重要，但缺資料時系統不能硬做推論。

如果 SpO2、temperature、heart rate 或其他欄位 missing、failed、quality_flag abnormal，NYCU flow 可以回到 non-vital-dependent questions，並在 staff_review_summary 中標記 vital unavailable 或 measurement requires confirmation。

核心原則是：缺資料時，不推論；只標記。
```

**Recommended payload shape:**

```json
{
  "spo2": {
    "value": null,
    "unit": "%",
    "measurement_status": "failed",
    "quality_flag": "device_error",
    "missing_reason": "measurement_failed"
  }
}
```

**What to ask imedtac:**

```text
請 imedtac engineering 確認每個 vital 的 field name、unit、required / optional、missing / failed semantics，以及能不能每個 vital 都帶 measurement_status、quality_flag、missing_reason。
```

### 5. UI / Demo Environment: "AI triage 要放在 iMVS 哪裡？"

**Detailed answer:**

```text
這需要 imedtac 決定 UI insertion point。NYCU 端可以支援 API-based workflow，但 iMVS 端要確認這個 AI intake 是放在 same app、iframe、external link、backend API、laptop-adjacent demo，還是先用 local scripted mock。

如果 iMVS UI 支援 two-phase flow，我們建議 Phase 1 在 measurement in progress 時先問 non-vital-dependent questions；vitals-ready 後進入 Phase 2，問 vital-aware follow-up。這樣可以利用量測等待時間。

如果 Phase 1 會影響量測姿勢、signal quality 或 kiosk 操作，那就改成 post-measurement-only flow。
```

**Demo environment questions:**

```text
我們需要確認 demo 現場是否能連外網、是否能 call external HTTPS endpoint、是否有 VPN / firewall / CORS / WebView 限制、誰啟動 backend、誰監看 log、誰決定 failover。
```

### 6. Fallback / Degraded Mode: "API 掛掉怎麼辦？"

**Detailed answer:**

```text
六月 demo 我們建議採 hybrid demonstration strategy。

正常情況走 Remote REST API Mode：iMVS UI 呼叫 NYCU API，NYCU API 回 dynamic questions 和 staff_review_summary。

如果 network、tunnel、backend 或 timeout 暫時不可用，UI 可以切到 Local Scripted Demo Mode。這個 local fallback 使用預先定義的 synthetic respiratory case、固定 question flow 和固定 staff_review_summary，目的是讓 demo continuity 不被網路或 API 狀態綁死。

但 fallback 必須清楚標示為 Local Scripted Demo Mode，不代表 live AI API mode，也不是正式 production architecture。
```

**Core sentence:**

```text
Fallback 是展示穩定性設計，不是臨床正式使用設計。
```

**What to implement:**

```text
UI 至少要能標記 execution_mode: live_api 或 local_scripted_demo。
Operator 最好有 Restart demo session、Switch to fallback、Clear current session、Return to live mode 這幾個 recovery controls。
```

### 7. Clinical Boundary: "這會不會被看成診斷或分流？"

**Detailed answer:**

```text
我們會把輸出固定在 staff_review_summary，而不是 diagnosis、treatment advice 或 final triage level。

Summary 只描述 observed data 和 patient-reported symptoms，例如 patient reports dyspnea、SpO2 value received、staff review recommended。它不寫疑似肺炎、不寫治療建議、不寫 ESI level、不寫 safe to go home。

SpO2、temperature、heart rate 等 vital signs 在六月 demo 中是 review context，不是 autonomous decision。確切 threshold 和 wording 需要 clinical owner signoff。
```

**Safe field names:**

```text
staff_review_summary
review_basis
review_action
staff_handoff_note
summary_visibility: staff_only
handoff_required
handoff_reason_codes
```

### 8. AI Behavior: "如果 AI 問錯、漏掉、被 prompt injection 呢？"

**Detailed answer:**

```text
六月 demo 不讓模型自由生成 patient-facing medical questions。核心 flow 採 structured / rule-constrained question logic，問題從受控 question bank 或 predefined flow 選出，每個問題都應該能回溯到 trigger，例如 symptom answer、vital context 或 case logic。

如果未來加入 free text 或 ASR，六月階段也不會讓 free text 直接控制醫療邏輯。它最多是 supplemental note，不直接決定下一題或 summary conclusion。
```

**If asked about red flags:**

```text
Red flag 的責任不是讓 AI 判斷疾病，而是讓資訊不要被安靜地埋掉。系統只做 staff-review handoff cue，不做 diagnosis 或 final triage level。
```

### 9. Partial / Inconsistent Answers: "病人亂按或中途停止怎麼辦？"

**Detailed answer:**

```text
六月 demo 不假設每個回答都完整或一致。如果使用者中途停止、答案不一致或跳題，系統可以支援 partial completion，summary 標記 answered questions、missing questions 和 requires_staff_confirmation。

重點是不要把不確定資料放大成醫療結論，而是把不完整或不一致的地方交給 staff review。
```

**Example fields:**

```json
{
  "completion_status": "partial",
  "answered_question_ids": ["q001", "q002"],
  "missing_question_ids": ["q003"],
  "requires_staff_confirmation": true
}
```

### 10. ASR And HIS / EMR: "為什麼六月不做？"

**Detailed ASR answer:**

```text
ASR 很有價值，但六月 critical path 應該先證明 kiosk vital payload、dynamic question flow 和 staff_review_summary 可以接起來。

ASR 會新增辨識錯誤、噪音環境、語言支援、transcript confirmation、raw audio privacy、硬體麥克風品質和 fallback UX 等問題。所以建議列為 next phase，不放進六月核心交付。
```

**Detailed HIS / EMR answer:**

```text
HIS / EMR writeback 會把 demo 直接帶進 production medical record responsibility，包括權限管理、audit、資安稽核、資料治理和院內 IT 審核。

六月比較合理的範圍是產生 staff_review_summary 給人員覆核，不寫回正式病歷系統。先證明 workflow value，再開正式 integration governance path。
```

### 11. Security / Logs: "demo API 安全和追蹤怎麼做？"

**Detailed answer:**

```text
即使是 demo API，也不應該裸奔。最低限度可以用 demo bearer token 或 shared demo token，並且不把 token 寫進 Markdown、Git、截圖、logs 或 command history。

如果 iMVS browser frontend 直接 call NYCU API，需要確認 CORS origin。NYCU backend 可以 allowlist 具體 origin，不建議正式 rehearsal 使用 unrestricted wildcard。

Log 方面，demo 需要 lightweight audit log，至少記 session_key、request_id、endpoint、response status、error code、latency、api_version、flow_version、question_id、execution_mode 和 fallback state。不要 log real patient identifiers、raw audio、access tokens 或 live chart content。
```

### 12. Versioning: "為什麼要這麼多版本號？"

**Detailed answer:**

```text
因為 API field、case content、question wording、summary wording 都會改，而且這些改動可能會影響 UI、clinical wording 和 demo behavior。

如果沒有 api_version、schema_version、flow_version、case_version、question_set_version、wording_version，之後會很難知道某次 demo 用的是哪一版問題、哪一版 summary wording、哪一版 payload contract。

版本號不是多餘欄位，是讓雙方工程和臨床 review 可以對齊的最低成本控制。
```

Recommended version block:

```json
{
  "api_version": "2026-05-demo-v0.2",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2",
  "flow_version": "respiratory_demo_v0.2",
  "case_version": "respiratory_case_v0.2",
  "question_set_version": "2026-05-21-demo",
  "wording_version": "staff_summary_v0.2"
}
```

### 13. Strong Summary Answer

Use this when the meeting needs one compact, confident answer:

```text
我們六月 demo 的策略是先證明最小可運作流程：vital payload 進來，question flow 根據資料往下走，最後產生 staff_review_summary 給人員覆核。

正常情況走 NYCU Remote REST API；如果 API、network、tunnel 或 backend timeout，UI 可以切換到 local scripted fallback flow，確保 demo 不會中斷。Fallback 會清楚標記，不會被包裝成 live AI result。

這樣設計的目的，是穩定展示 workflow value，同時把正式產品之後才需要處理的 session recovery、audit log、deployment、security、ASR、HIS/EMR integration 保留下來做下一階段決策。
```

## K. Must-Ask Closeout Questions

Ask these before the call ends:

1. What is the exact June demo date, site, and audience?
2. What is the UI insertion path: same app, iframe, external link, backend API,
   laptop-adjacent demo, or static/local fallback?
3. Can Phase 1 questions be shown during measurement without disrupting signal quality?
4. What are the actual iMVS vital field names, units, required / optional rules,
   and missing / failed semantics?
5. Is NYCU-generated `session_key` acceptable?
6. Does engineering need Markdown API spec, OpenAPI, Postman collection, mock endpoint, or all of them?
7. Can the demo call external HTTPS? Any firewall, CORS, VPN, or WebView limit?
8. Can local scripted fallback live inside the kiosk UI and be clearly labeled?
9. Where will `staff_review_summary` appear, and can patients see it?
10. Who owns field dictionary, UI insertion decision, clinical wording signoff,
    local fallback, demo environment, and confirmed API v0.2 by `2026-05-22`?

## L. Closing Script

Use this to close:

```text
今天我們先把六月 demo 收斂成 synthetic-data vital-aware intake support workflow。
主路徑是 Remote REST API Mode：iMVS 送 vital payload 與 structured answers，
NYCU 回 typed questions 與 staff_review_summary。
備援路徑是 Local Scripted Demo Mode，只用於 demo continuity，必須清楚標示為 scripted synthetic flow，不代表 live AI API mode。

下一步需要 imedtac 提供 field dictionary、UI insertion decision、demo environment decision；
臨床端確認 wording；NYCU 依此更新 confirmed API v0.2。
Voice input 與 HIS/EMR writeback 不進六月 critical path，除非另開 decision。
```
