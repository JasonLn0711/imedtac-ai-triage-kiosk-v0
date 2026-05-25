---
id: 2026-05-25-imedtac-integration-next-steps
title: "imedtac Integration Next Steps After Teams UI / API Follow-Up"
date: 2026-05-25
topic: ai-triage
type: handoff
status: active-next-step-plan
audience: internal NYCU / Jason / 多寶 coordination; selective imedtac engineering follow-up
source:
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ../source/2026-05-25-duobao-afrvr-tachycardia-case/source.md
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./2026-05-21-imedtac-engineering-open-issues-checklist.md
---

# imedtac Integration Next Steps After Teams UI / API Follow-Up

## Recommendation

NYCU should move from document delivery to a **contract rehearsal pack** for
imedtac. The next concrete goal is:

```text
answer Ben's API questions
-> publish one case-aligned tachycardia question/option template
-> provide one browser-callable demo API base URL or mock endpoint
-> run Endpoint 1 / Endpoint 2 rehearsal with imedtac UI
```

This keeps the project in the correct operating scope: vital-aware intake
support, structured question workflow, staff-review summary, synthetic-data demo
context, and human review workflow.

## Architecture Freeze Position

This Render rehearsal deployment does **not** change the API architecture already
discussed with 慧誠智醫（imedtac Co., Ltd.）. It fixes the deployment target so
both sides call the same NYCU-hosted HTTPS endpoint.

Frozen for the first integration rehearsal:

| Area | Frozen decision |
| --- | --- |
| API shape | Two endpoints only: `POST /api/triage-demo/sessions` and `POST /api/triage-demo/sessions/{session_key}/answers`. |
| Workflow | `post_measurement_only`: iMVS completes measurement first, then starts the NYCU question loop. |
| Deployment target | NYCU-hosted Render rehearsal API: `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo`. |
| CORS | Allow `http://localhost` and `http://localhost:5174` for first rehearsal. |
| Progress display | iMVS uses `progress.expected_total` for `Question X of Y`; `capabilities.max_questions` is only a UI capacity cap. |
| Retry/idempotency | Same logical operation retries with the same body/key; changed body with same key returns `idempotency_conflict`. |
| Conflict recovery | `idempotency_conflict` recovery is restart demo session or clearly labeled fallback, not answer revision. |
| iMVS pending state | iMVS locks answer-related controls immediately after answer submit and unlocks after NYCU returns next question or summary. |
| Summary | Endpoint 2 returns `status=summary` and `staff_review_summary`; summary remains `staff_only`. |

This freeze reduces engineering burden because imedtac only needs to wire the
same two endpoint paths against one stable base URL. NYCU's internal Render
settings (`render:build`, `render:start`, `/healthz`) are operational deployment
settings and do not require imedtac API changes.

Change-control rule: after this reply is sent, any change to endpoint paths,
request/response schema, enum values, workflow mode, conflict recovery,
required CORS origins, token requirement, or summary display surface should be
explicitly re-confirmed with imedtac before implementation.

## Decisions To Send Back

### 1. `request_id` / `idempotency_key`

Reply position:

```text
request_id：每次 HTTP request 都產生新的 unique id，主要用於 log trace、debug、
以及雙方對帳。

idempotency_key：用於同一個 logical operation 的安全 retry。同一 endpoint、
同一 session/question context、同一 request body retry 時使用同一個
idempotency_key，NYCU 會回同一個結果，不讓 question flow 前進兩次。

不同題目、或使用者明確送出新的答案嘗試時，請使用新的 idempotency_key。
若同一 idempotency_key 搭配不同 request body，NYCU 會視為
idempotency_conflict，回 HTTP 409 / status=error，且不推進 question flow。
六月 demo recovery 定調為 restart demo session：iMVS 不自動換 key 重送，
operator 重新從 Endpoint 1 建立新的 demo session，或切換到已標示的 fallback。

為了降低 conflict 發生機率，iMVS 前端送出答案後應立即鎖住所有答題相關控制，
只保留與答題無關的 help / restart / fallback 類控制；等 NYCU 回下一題或
summary 後，再開啟下一題的答題控制。
```

### 2. `capabilities.max_questions` and Progress UI

Reply position:

```text
capabilities.max_questions 是 iMVS 告訴 NYCU 的問題數上限 / UI capacity cap，
不是保證最後一定會問到的題數。

UI 的 "Question X of Y" 建議使用 NYCU response 裡的 progress.expected_total
作為 Y。六月 tachycardia rehearsal lane 可以先固定 expected_total，讓 UI 的進度
顯示穩定；若未來流程有 early summary，NYCU 會用 status=summary 結束流程，而
不是要求 iMVS 自己用 max_questions 判斷。
```

### 3. Skip / Unable-To-Answer

Reply position:

```text
NYCU 同意這次 demo 不做 generic silent skip。保留 "I'm not sure" 是好的，
因為它是一個可解讀的答案狀態。

None of these 不需要做成 UI 內建固定按鈕；若某一題臨床上需要 "none" 答案，
NYCU 會把它當成該題 question.options 裡的普通 option id 回傳，例如
none_of_these。iMVS 只要依 option id 回傳即可。
```

### 4. Option Count / Label Length

Working design:

- imedtac UI current working capacity: up to `9` short options without user
  scrolling.
- NYCU first-lane target: keep most questions at `4` options for readability.
- Hard design guard: keep option labels short; avoid long sentence options.
- If a question needs more than `6` options, use grouped wording or split the
  question only when 多寶 / imedtac UI confirms the split is clearer.

### 5. Summary Preview Page

Reply position:

```text
回答完所有問題後，NYCU Endpoint 2 會回 `status=summary` 與
`staff_review_summary`。最省工程量的 demo 路徑，是 iMVS 直接在既有 result /
preview page 顯示同一份 summary payload；這樣不需要另外刻一個完整頁面。

如果 imedtac 想先快速驗證顯示效果，NYCU 也可以提供一個 demo-only 的輕量
preview page / mock page，展示同一份 summary payload。正式 rehearsal 仍建議以
iMVS 端 render payload 為主，確保 customer demo 看到的是實際串接結果。
```

Scope control:

```text
summary_visibility 維持 staff_only；summary 是 staff-review / demo preview，
不是病人診斷結果、治療建議或 final triage level。
```

### 6. Demo Environment

NYCU implementation checklist:

- Provide one HTTPS API base URL before rehearsal. Current Render rehearsal API
  is live and verified:
  `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo`.
- Allow CORS origins:
  - `http://localhost`
  - `http://localhost:5174`
- Support `OPTIONS` preflight for:
  - `Content-Type: application/json`
  - `Authorization: Bearer <demo token>` if enabled
- Decide whether bearer token is required for the first rehearsal.
- Keep tokens out of repo docs and screenshots.
- Render settings for the API service must use:
  - Build Command: `npm install && npm run render:build`
  - Start Command: `npm run render:start`
  - Health Check Path: `/healthz`
- The first Render deploy accidentally used `yarn start`, which runs the static
  frontend server. This has been corrected: Render now runs
  `node scripts/mock-api-server.js` through `npm run render:start`.
- Public verification passed on `2026-05-25 17:50 GMT+8`:
  - `GET /healthz` returned HTTP `200`.
  - CORS preflight from `http://localhost:5174` returned HTTP `204`.
  - `POST /api/triage-demo/sessions` returned `status="question"`,
    `session_state="active"`, `session_key="demo-session-tachy-001"`,
    first question `tachy-chief-concern`, and `progress.expected_total=7`.
  - `POST /api/triage-demo/sessions/demo-session-tachy-001/answers` returned
    next question `tachy-onset`.
- Outbound IP ranges shown by Render (`74.220.50.0/24`,
  `74.220.58.0/24`) are not needed for the current browser-direct path from
  iMVS to NYCU. They only matter if the NYCU Render service needs to call an
  imedtac IP-restricted backend or webhook.

## Work Plan

| Step | Concrete Output | Owner | Target |
| --- | --- | --- | --- |
| 1 | Send concise Teams reply answering Ben's two API questions and confirming the progress rule. | Jason / NYCU | Immediate |
| 2 | Update the external API reply with clarified idempotency, progress, UI capacity, and CORS notes. | Jason | `2026-05-25` |
| 3 | Deliver the first tachycardia preset question/option template aligned to 多寶's HR `130` case. | Jason + 多寶 | `2026-05-25` |
| 4 | Confirm whether summary display will use iMVS existing preview page or a temporary NYCU-hosted demo preview page. | imedtac UI + NYCU | Immediate |
| 5 | Confirm iMVS locks answer-related controls after answer submit and unlocks only after NYCU next-question / summary response. | imedtac UI | Before first rehearsal |
| 6 | Prepare the Render browser-callable rehearsal API and verify `/healthz`, CORS preflight, start-session, and submit-answer. | NYCU engineering | Achieved on `2026-05-25` |
| 7 | Run contract rehearsal: start session -> first question -> answer -> next question -> summary. | NYCU + imedtac | Before `2026-06-10` customer demo |
| 8 | Run fallback rehearsal: API timeout / invalid session / idempotency conflict -> structured error -> restart demo session or local scripted demo label. | NYCU + imedtac | Before customer demo |
| 9 | Capture UI screenshots from imedtac and update option-count / progress assumptions. | imedtac UI + Jason | After first rehearsal |

## Suggested Teams Reply

Send gate: the Render public endpoint now passes `GET /healthz`, CORS
preflight, `POST /sessions`, and one
`POST /sessions/{session_key}/answers` check from the public URL. The reply
below is ready to send after Jason confirms the timing.

```text
Ben、Johnny、Lauren 大家好，收到，謝謝，我們先把幾個工程點對齊如下：

先補充一點：以下內容不改我們前面已經對齊的兩個 endpoint API 架構。Render 只是 NYCU 端的 rehearsal deployment target，目的是讓 iMVS browser 與 NYCU 測試端都對準同一個固定 HTTPS base URL，減少 localhost / 換電腦 / port 設定造成的整合成本。

第一輪 rehearsal 我們建議 freeze 以下主架構：iMVS 完成 measurement 後呼叫 POST /api/triage-demo/sessions，之後用 POST /api/triage-demo/sessions/{session_key}/answers 送答案；NYCU 回下一題或 status=summary / staff_review_summary。若之後要改 endpoint path、schema、workflow mode、idempotency conflict recovery、CORS origin 或 summary display surface，我們會先再跟你們明確對齊後才調整。

1. request_id / idempotency_key
request_id 建議每次 HTTP request 都產生新的 unique id，主要用於 trace 與雙方 log 對帳。
idempotency_key 用於同一個 logical operation 的 retry；同一 endpoint、同一 session/question context、同一 request body retry 時使用同一個 key，NYCU 會回同一個結果，避免 question flow 前進兩次。不同題目，或使用者明確送出新的答案嘗試時，請使用新的 idempotency_key。若同一 idempotency_key 搭配不同 answer body，NYCU 會回 HTTP 409 / idempotency_conflict，且不推進 question flow；六月 demo 的 recovery 建議定調為 restart demo session，不做自動 answer revision。

我們也建議 iMVS 前端在送出答案後立刻鎖住答題相關按鈕與選項，只保留 help / restart / fallback 等與答題無關的控制；等 NYCU 回覆下一題或 summary 後，再開啟下一題答題控制。這樣可以避免使用者在 request pending 時改答案，降低 idempotency_conflict 發生機率。

2. capabilities.max_questions / Question X of Y
capabilities.max_questions 建議視為 iMVS 提供給 NYCU 的上限，不是保證最後一定會問到的題數。UI 的 Y 建議使用 NYCU response 裡的 progress.expected_total。六月 tachycardia demo lane 我們可以先讓 expected_total 在同一個 session 內維持穩定，讓進度顯示容易處理。

3. skip / I'm not sure / None of these
我們同意這次 demo 不做 generic silent skip。保留 I'm not sure 很好，因為它是可解讀的 answer state。None of these 不需要做成 UI 固定按鈕；如果某題需要 none answer，我們會把它當成該題 options 裡的一個 option id 回傳，iMVS 依 option id 回傳即可。

4. Option count / label length
選項數量的部分，我們會配合你們目前最多 9 個短選項、且不讓使用者 scroll 的排法。第一版 tachycardia preset 會盡量維持短選項與較少選項，只有必要時才接近上限。

5. Summary preview
回答完所有問題後，NYCU Endpoint 2 會回 status=summary 與 staff_review_summary。最省工程量的方式是 iMVS 直接在既有 result / preview page 顯示這份 payload；如果你們想先快速驗證畫面，我們也可以提供一個 NYCU-hosted demo-only preview / mock page，但正式 rehearsal 建議還是以 iMVS 端顯示同一份 summary payload 為主。

6. Demo environment
了解你們會由前端直接呼叫 NYCU API。我們會提供固定的 NYCU-hosted Render rehearsal API base URL：
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo

完整 endpoint 仍是：
POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions
POST https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo/sessions/{session_key}/answers

我們會把 http://localhost 與 http://localhost:5174 加入 CORS allowlist。Demo bearer token 我們會用一個簡單的 demo token 做法，之後提供實際 header 格式；實際 token 不會寫入文件或截圖。

另外，Render dashboard 上看到的 Outbound IP Addresses 是 NYCU Render service 主動往外呼叫其他外部系統時會使用的來源 IP 範圍，不是 iMVS browser 呼叫 NYCU API 時需要設定的值。這次 browser direct call 只需要 base URL、CORS origin 與 header 規則即可。若之後需要 NYCU Render service 主動呼叫你們的後端、webhook 或需要通過你們 firewall allowlist 的系統，我們再提供目前 Render 顯示的 outbound IP ranges 讓你們加入 allowlist。

我們也會把第一版 tachycardia preset questions/options 對齊多寶今天提供的 case 後整理給大家。
```

## Rehearsal Acceptance Criteria

First rehearsal is successful when:

- iMVS can call `POST /api/triage-demo/sessions` from browser origin.
- CORS preflight passes from `http://localhost` or `http://localhost:5174`.
- NYCU returns `session_key`, `response_id`, `progress`, and one typed question.
- iMVS renders `single_choice` and `multi_choice` options without user scroll.
- iMVS sends selected option ids, not labels.
- Same `idempotency_key` retry does not advance the flow twice.
- After iMVS submits an answer, answer-related controls are locked until NYCU
  returns the next question or summary.
- Same `idempotency_key` with a different answer body returns
  `idempotency_conflict`; the rehearsal recovery is restart demo session, not
  answer revision.
- NYCU returns `status=summary` and `staff_review_summary` with staff-only
  scope controls.
- iMVS renders the summary in an existing result / preview page, or NYCU-hosted
  demo preview is explicitly labeled as a temporary rehearsal surface.
- UI does not display diagnosis, treatment advice, final triage level, or
  production HIS / EMR writeback claim.

## Scope Controls

- Staff-review intake support.
- Human review workflow.
- Synthetic-data demo context.
- Interface-level API sharing.
- Separate validation path before clinical or production use.
