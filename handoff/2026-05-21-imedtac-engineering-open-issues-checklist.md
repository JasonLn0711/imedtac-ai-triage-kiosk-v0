---
id: 2026-05-21-imedtac-engineering-open-issues-checklist
title: "貴司工程整合 Open Issues / Integration Checklist"
date: 2026-05-21
topic: ai-triage
type: handoff
status: active
audience: internal NYCU / Jason coordination; selective 貴司 engineering follow-up
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
  - ./2026-05-21-to-2026-05-25-imedtac-response-plan.md
---

# 貴司工程整合 Open Issues / Integration Checklist

## First Principle

目前最稀缺的資源不是再增加醫療邏輯，而是讓貴司與 NYCU 在 `2026-05-25` 前取得同一份可執行的工程邊界。

六月 demo 的工程主線應固定為：

```text
iMVS 完成 vital-sign measurement
-> iMVS 呼叫 NYCU start-session endpoint，送 measured vital payload
-> NYCU 回 session_key 與第一題 typed question
-> iMVS 用同一個 session_key 送 answer
-> NYCU 回下一題或 staff_review_summary
```

問答集、選項、必答規則與 summary wording 可以繼續由許醫師審查調整；但除非題型、answer payload、`not_sure` answer behavior、early handoff behavior 或 UI template 能力改變，否則不應讓 endpoint shape 反覆變動。

## Current Contract Position

- 六月 required endpoints 維持兩個：
  - `POST /api/triage-demo/sessions`
  - `POST /api/triage-demo/sessions/{session_key}/answers`
- 六月 default values：
  - `workflow_mode = "post_measurement_only"`
  - `measurement_state = "complete"`
  - `vitals_ready = true`
  - `question_set_version`
  - `wording_version`
- 完整 trace-friendly API 欄位保留在
  `docs/2026-05-22-future-complete-api-design-plan.md`，不作為六月第一版外部
  必接欄位。

## P0 Blocking Issues

這些項目會直接影響貴司工程團隊能否開始穩定串接。

| ID | Issue | Decision / Input Needed | Owner | Target | Acceptance Check |
| --- | --- | --- | --- | --- | --- |
| P0-01 | API change-control rule | 確認送出的 `2026-05-21-imedtac-two-endpoint-api-reply.md` 是 small fixed implementation baseline；題目、選項、順序與 wording 透過版本欄位更新。 | NYCU / Jason | `2026-05-22` | API 回覆文件明確說明小固定 contract 不因聊天或會議口頭訊息變更；完整 API 欄位留在 future design planning。 |
| P0-02 | Vital Upload API field dictionary | 以 `2026-05-12` iMVS API `V1.4` 的 `NBP/SPO2/HR/Temp/Glucose/Height/Weight` 與 units 作為 baseline；貴司確認 current demo machine / GitHub 格式的 field-name delta、required/optional、missing/failed/poor-quality 表示方式。 | 貴司 engineering | `2026-05-22` ask | 至少確認 heart rate、SpO2、temperature、blood pressure、height、weight 是否沿用 V1.4；respiratory rate 是否提供要明確。 |
| P0-03 | Retry safety | 六月先固定 `idempotency_key`；完整 conflict taxonomy 可留在 future API planning。 | NYCU propose; 貴司 confirm | `2026-05-22` draft | Rehearsal retry 不會讓 question flow 前進兩次。 |
| P0-04 | Demo fallback decision | 確認 remote API 不可用時是否切 Local Scripted Demo Mode。 | 貴司 UI + NYCU | `2026-05-24` | Demo operator 能清楚知道目前是 live API 或 local scripted run。 |
| P0-05 | Engineering environment path | 確認 browser direct call、貴司 backend proxy、CORS、firewall、VPN、token / shared secret。 | 貴司 engineering | `2026-05-24` | rehearsal 前有 base URL / network path / auth assumption。 |
| P0-06 | Demo acceptance criteria | 定義「串接完成」的最小可驗證流程。 | NYCU + 貴司 | `2026-05-24` | rehearsal 能跑完 vital payload -> first question -> answer -> next question -> summary -> fallback check。 |

## P1 Important Integration Issues

這些項目不一定阻擋 API 文件送出，但會影響 demo 畫面、工程量與 rehearsal
成功率。

| ID | Issue | Decision / Input Needed | Owner | Target | Acceptance Check |
| --- | --- | --- | --- | --- | --- |
| P1-01 | UI rendering constraints | iMVS 單題最多 options、option label 字數、是否需 no-scroll、是否支援 progress。 | 貴司 UI / engineering | `2026-05-22` ask | API examples 不超過 UI 容量；必要時調整 question template。 |
| P1-02 | Question template support | 確認 `single_choice`、`multi_choice`、`scale`、variable option count、none-of-these behavior。 | 貴司 UI / engineering | `2026-05-22` ask | NYCU question object 與 iMVS reusable template 可對應。 |
| P1-03 | Not-sure / unable-to-answer policy | required 題不使用 generic no-reason bypass；不確定情境優先用 `Not sure` / `Unable to answer` option id。 | 許醫師 + NYCU | `2026-05-25` | 每題標示 required/optional、`question.allow_not_sure` 與 `question.not_sure_option_id`。 |
| P1-04 | Mock server / contract test packet | 是否需要 NYCU 提供 mock endpoint 或只提供 JSON examples。 | 貴司 engineering ask; NYCU implement if needed | `2026-05-24` decision | 貴司可在 NYCU 正式部署前先串 UI。 |
| P1-05 | Observability / debug logging | 六月小 contract 至少保留 `request_id`、`session_key`、`case_id`；`response_id` / `flow_version` 可留在 future trace layer。 | both teams | rehearsal 前 | 出錯時能判斷是 payload、network、session state、question engine 或 UI 問題。 |
| P1-06 | Staff-summary display location | 確認 `staff_review_summary` 放在 staff / doctor / customer preview，不放成病人診斷結果。 | 貴司 UI + NYCU | `2026-05-24` | UI copy 不含 diagnosis、treatment、final triage level、production HIS/EMR claim。 |
| P1-07 | Demo lane choice | tachycardia live-performance lane 與 respiratory synthetic fallback 的主次與 wording。 | Jason + 許醫師 + Johnny | drafted | Monday 第一版 preset questions/options 可作為 review draft。 |
| P1-08 | Live HR demo mode / fallback | 確認 demo script 是否標示 `live_measured`、`synthetic_override`、或 `local_scripted_demo`，避免 demo 成敗依賴現場心跳值。 | NYCU propose; 貴司 confirm | rehearsal 前 | Presenter script 和 payload 都能顯示目前 mode；live HR 不適合時可切 scripted fixture。 |

## P2 Safety / Product Boundary Issues

這些項目應該留在內部追蹤，並在對外回覆時轉成簡潔、安全的工程語言。

| ID | Issue | Needed Control | Owner | When To Reopen |
| --- | --- | --- | --- | --- |
| P2-01 | Early handoff / stop condition | 若某些 vital 或 answer combination 需要直接 staff review，API 應使用 `handoff_required`、`handoff_reason_codes`、`session_state`、`next_action`。 | NYCU + clinical reviewer | 當第一版問題集確定後。 |
| P2-02 | Patient-facing summary boundary | 若貴司要讓病人看到 summary，需要另做 patient-safe copy；不可直接使用 staff-review summary。 | 貴司 UI + NYCU | 當貴司要求 patient-facing result page。 |
| P2-03 | Real patient data | 六月維持 synthetic/demo data；若要 real data，需另開 privacy、security、clinical governance 路徑。 | Prof. Wu / 智德萬 / 貴司 / legal | 任何 real identifier 或 PHI request 出現時。 |
| P2-04 | HIS / EMR / FHIR writeback | 六月不做 production writeback；可展示 preview / export story，但不可暗示已整合正式醫院系統。 | 貴司 + NYCU | 當 customer 要求 production integration。 |
| P2-05 | Patent / reusable-method transfer | 對貴司分享 interface-level API 與 demo examples；routing / scoring / source-governance / prompt / embedding / reusable framework details 保留內部。 | Prof. Wu / Tomi / 智德萬 + Jason | 深入技術教學或 co-development 前。 |
| P2-06 | Live participant safety | 不要求任何人為 demo 做運動或追求特定心跳值；現場只使用自願量測，必要時切 synthetic fixture。 | Jason + 貴司 demo owner | 任何 live-performance rehearsal 前。 |
| P2-07 | Measurement artifact handling | 若 live HR quality 不穩或可能是 device artifact，summary 應以 `quality_flag=needs_review` 呈現，不當作乾淨臨床結論。 | 貴司 engineering + NYCU | 接上真機量測品質欄位時。 |

## Minimal Rehearsal Acceptance Criteria

第一次 end-to-end rehearsal 應以「可跑完、可除錯、可 fallback」為準，不以
臨床完整性為準。

- iMVS 或 mock client 能送出 measured / synthetic vital payload。
- NYCU 回 `session_key` 與第一題 typed question。
- iMVS 能 render `single_choice` / `multi_choice` question。
- iMVS 能送 `answer.selected_option_ids` 與 `idempotency_key`。
- NYCU 能回下一題或 `staff_review_summary`。
- 相同 `idempotency_key` retry 不會讓流程前進兩次。
- `session_key` expired / invalid 時有穩定 error response。
- remote API unavailable 時，iMVS 能切換到清楚標示的 fallback。
- summary display 不含 diagnosis、treatment、final triage level、HIS / EMR
  writeback claim。
- 雙方 log 能用 `request_id` / `session_key` 對帳。

## Suggested Message To 貴司 Engineering

```text
Ben、Lauren、Johnny 大家好，補充一點工程串接邊界：

我們建議六月先 freeze 一份小而固定的兩個 endpoint contract。許醫師接下來若調整題目、選項、題目順序、必答規則或 staff summary wording，會透過 question_set_version 與 wording_version 管理，不會要求貴司重新串接 endpoint。

更完整的 trace-friendly API、session lifecycle、fallback taxonomy、question provenance 與 future two-phase endpoint 會留在 NYCU future design planning。真正會需要更新外部 API schema 的情況，主要是題型能力改變、answer payload 改變、需要 generic no-reason bypass control、需要 early handoff / stop behavior，或 iMVS UI template 能力與目前假設不同。這些我們會列成 open issues 與貴司工程團隊逐項確認。
```

## Next Actions

| Action | Owner | Target |
| --- | --- | --- |
| Add API change-control section to the external API reply file. | Jason | done in this planning pass |
| Send the two-endpoint API reply first. | Jason / NYCU | `2026-05-22` |
| Ask 貴司 for the P0/P1 engineering input packet. | Jason | `2026-05-22` |
| Discuss `not_sure` / required-question policy with 許醫師. | Jason + 許醫師 | night of `2026-05-21` or morning of `2026-05-22` |
| Decide whether mock endpoint is needed or JSON examples are enough. | 貴司 engineering + NYCU | before first rehearsal |
| Run first rehearsal against Remote REST API Mode or Local Scripted Demo Mode. | both teams | before `2026-06-10` customer demo |
