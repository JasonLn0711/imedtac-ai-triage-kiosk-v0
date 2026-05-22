---
id: 2026-05-21-imedtac-api-field-mvp-scope-note
title: "imedtac API Field MVP / Complete Scope Note"
date: 2026-05-21
topic: ai-triage
type: internal-design-note
status: active
source:
  - ../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
  - ../handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
  - ./2026-05-12-imvs-hardware-and-vital-units-baseline.md
  - ./2026-05-22-future-complete-api-design-plan.md
---

# imedtac API Field MVP / Complete Scope Note

本文件保存從對外 API 回覆文件移出的欄位 scope 思考。對外文件最後一欄改為
「範例與說明」，方便 imedtac 工程團隊直接對照 JSON field；本文件保留 NYCU
內部用來排六月 demo MVP、完整 API 與 imedtac 待確認事項的判斷。

## 2026-05-22 Scope Decision

六月對外 API reply 改為「小而固定」的 implementation baseline，只要求貴司實作兩個 endpoint、compact vital payload、question object、`answer.selected_option_ids`、`not_sure` option behavior、以及 `staff_review_summary`。本文件中的完整 field inventory 不再代表六月外部必接欄位；它是 NYCU 內部 future complete API planning 的來源之一。

完整 trace-friendly API 的未來規劃已另存於 `docs/2026-05-22-future-complete-api-design-plan.md`。若 future design 中的欄位要升級成外部 implementation contract，必須先有 owner、example payload、compatibility note、version impact，以及雙方記錄過的 change request。

## Scope 標籤

| Scope | 定義 |
| --- | --- |
| MVP 必要 | 六月 demo 最小可跑 two-endpoint loop 需要實作或固定回傳的欄位。 |
| MVP 建議 | 建議在 MVP 保留；可先用固定值、簡化值、placeholder 或 log-only 方式實作。 |
| 完整 API | 支援多 case、多版本、臨床審查、production validation 或後續擴充的完整設計欄位；MVP 可先以 placeholder 或固定值管理。 |
| 需 imedtac 確認 | 實作方式取決於 iMVS field dictionary、UI template、畫面限制或 demo environment。 |

## 六月預設值

| Field | Scope | 判斷 |
| --- | --- | --- |
| `workflow_mode` | MVP 必要 | 兩個 endpoint flow 的核心控制欄位。 |
| `measurement_state` | MVP 必要 | 支撐「先 vital sign、後 Q&A」的流程判斷。 |
| `vitals_ready` | MVP 必要 | Endpoint 1 啟動問答前的資料可用性旗標。 |
| `question_phase` | MVP 必要 | iMVS 依此判斷目前要顯示問題或摘要。 |
| `voice_input` | MVP 必要 | 六月版本以固定值關閉語音路徑。 |
| `question.type` | MVP 必要 / 完整 API | 六月先支援 `single_choice` / `multi_choice`；`scale` 屬完整 API 擴充。 |

## Value-Set Scope

Field keys are only half of the contract. For integration stability, every value
used by code must be classified as either fixed enum/code, stable id, display
text, or numeric/boolean/timestamp.

| Value class | Scope decision | MVP treatment |
| --- | --- | --- |
| Programmatic enum / code | Must be fixed and listed. | Freeze allowed values for state, rendering, fallback, error, measurement quality, and summary visibility. |
| Stable id | Must be fixed within `question_set_version`. | `question.id`, `option.id`, `selected_option_ids`, and `handoff_reason_codes` are codes; labels are not submitted back. |
| Display text | Do not exhaustively enumerate. | Define locale, visibility, max-length guidance, owner, and wording version; frontend displays but does not parse it. |
| Numeric / boolean / timestamp | Do not enumerate values. | Define type, unit, nullable behavior, precision/range if needed, and missing/failure representation. |

MVP fixed value baseline:

| Field | MVP fixed values |
| --- | --- |
| `status` | `question`, `summary`, `error` |
| `session_state` | `active`, `summary_ready`, `expired`, `abandoned`, `error` |
| `workflow_mode` | `post_measurement_only`; future: `parallel_measurement_intake` |
| `measurement_state` | `complete`; error/future: `failed`, `missing`, `in_progress` |
| `question_phase` | `post_measurement_intake`, `summary`; future: `pre_vital_intake`, `post_vital_followup` |
| `question.type` | `single_choice`, `multi_choice`; future: `scale` |
| `vitals.<field>.measurement_status` | `measured`, `missing`, `failed`, `manual_entry`, `not_available` |
| `vitals.<field>.quality_flag` | `ok`, `needs_review`, `device_error`, `out_of_range_demo`, `unknown` |
| `summary_visibility` | `staff_only` |
| `client_event.input_mode` | `touch`; future: `keyboard`, `voice_confirmed`, `operator_scripted` |
| `fallback.recommended_mode` | `standard_staff_workflow`, `local_scripted_demo`, `retry_remote_api` |
| `error.code` | `api_timeout`, `invalid_session`, `measurement_quality_unavailable`, `missing_required_field`, `unsupported_question_type`, `idempotency_conflict` |

For the tachycardia live lane, option IDs such as `heart_racing`,
`chest_tightness`, and `breathing_or_dizzy` are stable ids under
`tachycardia-question-set-v0.2-draft`. Labels such as
`Heart racing / palpitations` are display text and may change after 許醫師 wording
review without changing the API answer contract.

## Endpoint 1 Request

| Field | Scope | 判斷 |
| --- | --- | --- |
| `api_version` | MVP 必要 | 讓雙方鎖定同一份 API contract。 |
| `schema_version` | MVP 必要 | 讓 request / response 欄位對齊。 |
| `flow_version` | MVP 必要 | 六月至少要區分 tachycardia live lane 與 respiratory fallback lane。 |
| `case_id` | MVP 必要 | 選定本次 demo case。 |
| `case_version` | MVP 建議 | MVP 可先固定；完整 API 用於 case 內容變更追蹤。 |
| `fixture_version` | MVP 建議 | MVP 可先固定；完整 API 用於 rehearsal / regression 對帳。 |
| `question_set_version` | MVP 必要 | 許醫師調整題目時維持 endpoint 穩定。 |
| `wording_version` | MVP 必要 | 管理對外 summary wording 與 scope-control wording。 |
| `request_id` | MVP 必要 | demo rehearsal debug 需要。 |
| `idempotency_key` | MVP 必要 | 處理 timeout / retry 的核心欄位。 |
| `workflow_mode` | MVP 必要 | 固定六月流程。 |
| `measurement_state` | MVP 必要 | 支撐 measure-first demo flow。 |
| `vitals_ready` | MVP 必要 | 支撐 vital-aware question selection。 |
| `client.source` | MVP 建議 | MVP 可固定為 `imvs-demo`；完整 API 用於多 client。 |
| `client.locale` | MVP 必要 | 六月 customer demo 顯示語系控制。 |
| `patient_context.demo_patient_id` | MVP 必要 | demo session 需要 synthetic identity。 |
| `patient_context.age` | 完整 API | MVP 可依 case 固定或省略。 |
| `patient_context.sex` | 完整 API | MVP 可依 case 固定或省略。 |
| `vitals` | MVP 必要 | 兩個 endpoint flow 的主要輸入。 |
| `capabilities.question_types` | MVP 必要 | 讓 NYCU 只回 iMVS 可顯示的題型。 |
| `capabilities.max_questions` | MVP 必要 | 控制 demo 題數與畫面節奏。 |
| `capabilities.max_options_per_question` | 需 imedtac 確認 | MVP 可先採 4 個 option 的 conservative default。 |
| `capabilities.max_option_label_length` | 需 imedtac 確認 | MVP 可先採 48 字元 default。 |
| `capabilities.variable_option_count` | 需 imedtac 確認 | 完整 API 支援 variable options；MVP 可先固定選項數。 |
| `capabilities.voice_input` | MVP 必要 / 完整 API | MVP 固定 `false`；語音輸入屬後續擴充。 |

## Vital Payload

### Company-Provided Baseline

`2026-05-12` iMVS API `V1.4` already gives a concrete Vital Sign Upload
baseline. MVP implementation should not treat units as unknown from scratch.
Instead, use the company-provided field/unit mapping below and ask imedtac to
confirm only current-device deltas, optionality, and missing/failure semantics.

| Company API object | Company value field(s) | Company unit sample | MVP normalized field(s) |
| --- | --- | --- | --- |
| `NBP` | `SYS_Value`, `DIA_Value` | `mmHg` | `blood_pressure_systolic_mm_hg`, `blood_pressure_diastolic_mm_hg` |
| `SPO2` | `Value` | `%` | `spo2_percent` |
| `HR` | `BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp` | `Value` | `deg C` / source sample `°C` | `temperature_c` |
| `Glucose` | `Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight` | `Value` | `kg` | `weight_kg` |
| `Height` | `Value` | `cm` | `height_cm` |

Scope controls:

- `Respiratory rate` is not listed in the 5/12 V1.4 upload API; keep it as a
  synthetic/manual/demo-only field unless imedtac confirms a source.
- `BMI` is product/report context and can be derived from height/weight; it is
  not a confirmed V1.4 upload field.
- SpO2 and glucose appear as API fields, but the product spec marks their
  hardware modules optional in some variants; target-SKU confirmation controls
  whether they are guaranteed.

| Field | Scope | 判斷 |
| --- | --- | --- |
| `vitals.measurement_timestamp` | MVP 建議 | rehearsal debug 與 log 對帳需要。 |
| `vitals.device_id` | MVP 建議 | MVP 可固定 demo device id；完整 API 用於多設備。 |
| `vitals.<field>.value` | MVP 必要 | heart rate、SpO2 等 demo vital 的核心數值；若從 V1.4 payload 接入，需從 string 解析成 runtime number。 |
| `vitals.<field>.unit` | MVP 必要 | 工程與 UI 顯示需明確單位；baseline 為 `mmHg`、`%`、`bpm`、`deg C` / `C`、`mg/dL`、`kg`、`cm`。 |
| `vitals.<field>.measurement_status` | MVP 建議 | MVP 可先支援 `measured` / `missing`；完整 API 擴充 failed / manual_entry。 |
| `vitals.<field>.quality_flag` | MVP 建議 | MVP 可先支援 `ok` / `needs_review`；完整 API 擴充 device-quality semantics。 |
| `vitals.<field>.missing_reason` | 完整 API | MVP 可先使用 `null` 或簡化固定值。 |

## Endpoint 1 Response

| Field | Scope | 判斷 |
| --- | --- | --- |
| `session_key` | MVP 必要 | 維持 one-session question loop 的核心欄位。 |
| `request_id` | MVP 必要 | 雙方 log 對帳需要。 |
| `response_id` | MVP 建議 | rehearsal debug 需要；完整 API 用於 audit trace。 |
| `session_expires_at` | MVP 建議 | MVP 可用固定 expiry window；完整 API 用於 session lifecycle。 |
| `session_state` | MVP 必要 | iMVS 依此判斷繼續問答、顯示摘要或 fallback。 |
| `last_question_id` | MVP 建議 | 支援 debug 與 answer mismatch 檢查。 |
| `status` | MVP 必要 | iMVS 依此 render question 或 summary。 |
| `workflow_mode` | MVP 必要 | 回傳確認目前流程模式。 |
| `measurement_state` | MVP 必要 | 回傳確認 measured-vitals flow。 |
| `vitals_ready` | MVP 必要 | 回傳確認 vital payload 已進入 session。 |
| `question_phase` | MVP 必要 | iMVS 與 NYCU 對齊問答階段。 |
| `phase_reason` | 完整 API | MVP 可先固定簡短文字；完整 API 用於 explainability / debug。 |
| `progress.current` | MVP 建議 | 若 iMVS 顯示 progress，MVP 需要；否則可先 log-only。 |
| `progress.expected_total` | MVP 建議 | 用於 demo 節奏與畫面預期。 |
| `question` | MVP 必要 | Endpoint 1 的主要 response payload。 |
| `demo_boundary` | MVP 必要 | 對外 demo wording 與 operating scope 控制。 |

## Question Object

| Field | Scope | 判斷 |
| --- | --- | --- |
| `question.id` | MVP 必要 | answer request 必須帶回。 |
| `question.registry_refs` | 完整 API | MVP 可先回 placeholder；完整 API 用於 question provenance。 |
| `question.source_refs` | 完整 API | MVP 可先回 `LOCAL-PROTOCOL-TBD`。 |
| `question.evidence_status` | 完整 API | MVP 可先固定 draft / review status。 |
| `question.review_owner` | 完整 API | MVP 可先固定 `clinical_reviewer_tbd`。 |
| `question.type` | MVP 必要 | iMVS 用來選擇可重用 UI template。 |
| `question.ui_template` | MVP 必要 | 降低 hand-coded screen 需求。 |
| `question.text` | MVP 必要 | 病人端題目顯示核心欄位。 |
| `question.options` | MVP 必要 | choice-based demo 核心欄位。 |
| `question.option_count` | MVP 建議 | 支援 UI capacity check。 |
| `question.none_option_id` | 完整 API | MVP 可在有 none 選項的題目才提供。 |
| `question.required` | MVP 建議 | tachycardia live lane 需要區分 Q1-Q5 必答與 Q7 可選 / staff-confirmation 題。 |
| `question.allow_not_sure` | MVP 建議 | 用 explicit option 支援使用者不確定，避免無原因略過造成 summary 誤讀。 |
| `question.max_selections` | MVP 建議 | `multi_choice` 題需要限制選取數與互斥選項行為。 |
| `question.trigger_reason_codes` | MVP 建議 | 記錄為什麼此題出現，例如 `measured_elevated_heart_rate_demo` 或 `reported_palpitations`。 |
| `question.summary_effect` | 完整 API | 讓工程與 clinical reviewer 對齊選項如何進入 `staff_review_summary`。 |
| `question.rendering_constraints.requires_no_scroll` | 需 imedtac 確認 | MVP 可先固定 `true`。 |
| `question.rendering_constraints.max_visible_options_without_scroll` | 需 imedtac 確認 | MVP 可先採 4 個 options。 |

## Tachycardia Live-Lane Field Impact

The post-`2026-05-21` question-set update selects tachycardia / palpitation /
chest-tightness as the first live-performance lane. This affects versioned
configuration values and question metadata, not the endpoint shape.

| Field | Tachycardia live-lane value / implication |
| --- | --- |
| `flow_version` | `tachycardia-live-demo-flow-v0.2-draft` |
| `case_id` | `demo-tachycardia-live-001` |
| `case_version` | `demo-tachycardia-live-001-v0.2` |
| `question_set_version` | `tachycardia-question-set-v0.2-draft` |
| `vitals.heart_rate_bpm.unit` | `bpm`, from company-provided iMVS V1.4 baseline. |
| `vitals.heart_rate_bpm.quality_flag` | MVP should support `ok` / `needs_review`; live exercise or device artifact should never be hidden as a clean clinical conclusion. |
| `handoff_reason_codes` | Add cardiopulmonary review codes such as `measured_elevated_heart_rate_demo`, `reported_palpitations`, `reported_chest_tightness`, and `staff_review_needed`. |
| `demo_script.mode` | Optional field for rehearsal control: `live_measured`, `synthetic_override`, or `local_scripted_demo`. |

System-design conclusion: the same two endpoints can serve both respiratory and
tachycardia lanes if the router treats `flow_version`, `case_id`, and
`question_set_version` as configuration. The API schema only needs revision if
貴司 requires a generic no-reason bypass control, more question types, or stricter
UI rendering constraints than the current `single_choice` / `multi_choice`
object can express.

## API Contract Audit For Tachycardia Demo Case

Recommendation: keep the two-endpoint contract and the complete trace examples,
but do not make every trace/provenance field caller-supplied in the June MVP.
The current API is complete enough for a governed demo; it is heavier than
needed if imedtac must populate all version, source, review, and rendering
metadata on every request.

The best contract split is:

| Layer | Owner | Fields |
| --- | --- | --- |
| Caller-required MVP payload | imedtac iMVS | Session start identity, measurement state, vital values, locale, UI capability limits, answer ids, idempotency keys. |
| Server-managed session/config | NYCU | Flow/case/question/wording versions, source refs, evidence status, review owner, summary wording, progress policy, fallback rules. |
| Response trace and review metadata | NYCU response | Full provenance and scope-control fields for debugging, clinical review, and handoff packet consistency. |

### Caller-Required MVP Fields

Endpoint 1 `POST /api/triage-demo/sessions` should require from imedtac:

- `api_version`, or the same value in a negotiated request header;
- `request_id`;
- `idempotency_key`;
- `case_id`, with `demo-tachycardia-live-001` as the current live demo case;
- `workflow_mode=post_measurement_only`;
- `measurement_state=complete`;
- `vitals_ready=true`;
- `client.locale`;
- `patient_context.demo_patient_id`;
- `vitals.*.value`, `vitals.*.unit`, and at least basic status / quality values
  for the vital fields shown in the demo;
- `capabilities.question_types`, currently `single_choice` and `multi_choice`;
- `capabilities.max_questions`, currently `7`.

Endpoint 2 `POST /api/triage-demo/sessions/{session_key}/answers` should
require from imedtac:

- `api_version`, or the same negotiated version header;
- `request_id`;
- `idempotency_key`;
- `session_key`;
- `question_id`;
- `answer.selected_option_ids`;
- `client_event.input_mode`, currently `touch`;
- `client_event.answered_at` when available.

### Server-Managed Or Echo Fields

These fields are valuable, but should be server-managed or response-only for
the June MVP:

- `schema_version`;
- `flow_version`;
- `case_version`;
- `fixture_version`;
- `question_set_version`;
- `wording_version`;
- `session_expires_at`;
- `last_question_id`;
- `progress`;
- `phase_reason`;
- `question.registry_refs`;
- `question.source_refs`;
- `question.evidence_status`;
- `question.review_owner`;
- `question.summary_effect`;
- `staff_review_summary.scope_controls`.

This keeps imedtac's request implementation lean while preserving full
traceability in NYCU responses and handoff artifacts.

### Redundant Or Conditionally Redundant Fields

| Field / pair | Audit result | Recommendation |
| --- | --- | --- |
| `api_version` + `schema_version` | Often redundant for the caller. | Require `api_version`; let NYCU infer or echo `schema_version` unless imedtac wants both. |
| `case_id` + `flow_version` | Both identify routing context in the demo. | Require `case_id`; allow `flow_version` as optional trace or advanced routing override. |
| `case_version` + `fixture_version` + `question_set_version` + `wording_version` | Useful for provenance, too heavy as caller-required fields. | NYCU should bind these after `case_id` selection and echo them in responses. |
| `workflow_mode` + `measurement_state` + `vitals_ready` on every answer | Needed at session start, repetitive afterward. | Require on Endpoint 1; Endpoint 2 can rely on `session_key` and NYCU session state. |
| `question.type` + `question.ui_template` | Redundant if template name equals type. | Keep both only if imedtac has separate UI template names; otherwise `question.type` is enough. |
| `question.option_count` + `options.length` | Derivable. | Keep `option_count` only for UI capacity validation and easier kiosk debugging. |
| `summary_visibility=staff_only` | Stable June default. | Response should include it for safety; imedtac does not need to send it. |
| `answer.scale_value` | Not used by tachycardia live lane. | Omit from minimal Endpoint 2 request until a scale question is enabled. |

### Missing Or Still Needs Confirmation

The tachycardia demo case makes several integration questions more visible:

- `demo_script.mode`: keep optional, but useful for operator clarity
  (`live_measured`, `synthetic_override`, `local_scripted_demo`).
- `measurement_status` / `quality_flag`: imedtac should confirm current device
  values for missing, failed, poor quality, and manual-entry cases.
- Generic no-reason bypass control is excluded from the June v0.2 contract. If
  requested later, it should be handled as a separate change request with a new
  answer-field definition.
- `question.required`, `allow_not_sure`, `not_sure_option_id`, `max_selections`, and
  `none_option_id`: keep these if 貴司 wants NYCU to drive UI validation.
- API base URL, authentication, CORS / firewall / VPN path, and timeout budget:
  these are not clinical fields, but they are required for a real remote demo
  rehearsal.

### Lean Request Shapes

Lean Endpoint 1 request for the tachycardia live demo:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "request_id": "req-demo-tachy-start-001",
  "idempotency_key": "idem-demo-tachy-start-001",
  "case_id": "demo-tachycardia-live-001",
  "workflow_mode": "post_measurement_only",
  "measurement_state": "complete",
  "vitals_ready": true,
  "client": {
    "locale": "en-US"
  },
  "patient_context": {
    "demo_patient_id": "DEMO-TACHY-001"
  },
  "vitals": {
    "measurement_timestamp": "2026-05-21T10:00:00+08:00",
    "heart_rate_bpm": {
      "value": 150,
      "unit": "bpm",
      "measurement_status": "measured",
      "quality_flag": "needs_review"
    },
    "spo2_percent": {
      "value": 98,
      "unit": "%",
      "measurement_status": "measured",
      "quality_flag": "ok"
    },
    "blood_pressure_systolic_mm_hg": {
      "value": 102,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok"
    },
    "blood_pressure_diastolic_mm_hg": {
      "value": 68,
      "unit": "mmHg",
      "measurement_status": "measured",
      "quality_flag": "ok"
    },
    "temperature_c": {
      "value": 36.5,
      "unit": "C",
      "measurement_status": "measured",
      "quality_flag": "ok"
    }
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice"],
    "max_questions": 7
  }
}
```

Lean Endpoint 2 request:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "request_id": "req-demo-tachy-answer-001",
  "idempotency_key": "idem-demo-tachy-answer-001",
  "session_key": "demo-session-tachy-001",
  "question_id": "tachy-chief-concern",
  "answer": {
    "selected_option_ids": ["heart_racing"]
  },
  "client_event": {
    "input_mode": "touch",
    "answered_at": "2026-05-21T10:01:10+08:00"
  }
}
```

Design-system conclusion: the tachycardia update does not require a new API
endpoint. It does require iMVS to support stable choice-question rendering,
four-option no-scroll layouts, visible progress, and explicit state changes
between question and staff-summary screens. The optional `scale` template can
stay out of the June MVP unless imedtac already has a reliable widget.

## Endpoint 2 Request

| Field | Scope | 判斷 |
| --- | --- | --- |
| `api_version` | MVP 必要 | 與 Endpoint 1 contract 對齊。 |
| `schema_version` | MVP 必要 | 與 Endpoint 1 schema 對齊。 |
| `flow_version` | MVP 必要 | 避免不同 demo lane 混用 session。 |
| `case_id` | MVP 必要 | 對齊同一個 synthetic case。 |
| `case_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 audit trace。 |
| `fixture_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 rehearsal 對帳。 |
| `question_set_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 answer provenance。 |
| `wording_version` | 完整 API | MVP 由 session state 持有；完整 API 可加入 request 以強化 summary provenance。 |
| `request_id` | MVP 必要 | answer submission debug 需要。 |
| `idempotency_key` | MVP 必要 | 保護 question loop state。 |
| `session_key` | MVP 必要 | Endpoint 2 的核心 routing key。 |
| `workflow_mode` | MVP 必要 | 回傳 answer 時維持相同 workflow。 |
| `measurement_state` | MVP 必要 | 回傳 answer 時維持 measured-vitals state。 |
| `vitals_ready` | MVP 必要 | 回傳 answer 時維持 vital-ready state。 |
| `question_phase` | MVP 必要 | 讓 NYCU 驗證 answer 屬於正確階段。 |
| `question_id` | MVP 必要 | 答案與題目綁定。 |
| `answer.selected_option_ids` | MVP 必要 | 六月選項題的核心 answer payload。 |
| `answer.scale_value` | 完整 API | MVP 固定為 `null`；`scale` 待 imedtac UI 確認。 |
| `client_event.input_mode` | MVP 必要 | 六月固定 `touch`。 |
| `client_event.answered_at` | MVP 建議 | rehearsal log 與 timing debug 需要。 |

## Staff-Review Summary

| Field | Scope | 判斷 |
| --- | --- | --- |
| `summary_visibility` | MVP 必要 | 控制 summary 顯示對象。 |
| `handoff_required` | MVP 必要 | demo summary 明確進入 staff-review workflow。 |
| `handoff_reason_codes` | MVP 建議 | MVP 可先使用少數固定 codes；完整 API 用於 routing / analytics。 |
| `staff_review_summary.format` | MVP 建議 | MVP 可固定；完整 API 用於多 summary template。 |
| `staff_review_summary.subjective` | MVP 必要 | staff summary 的核心內容。 |
| `staff_review_summary.objective` | MVP 必要 | vital-aware demo 的核心內容。 |
| `staff_review_summary.review_basis` | MVP 必要 | 整理 vital + answer 的 review basis。 |
| `staff_review_summary.review_action` | MVP 必要 | 提供 staff-review workflow cue。 |
| `staff_review_summary.staff_handoff_note` | MVP 必要 | demo preview 可直接顯示的短句。 |
| `staff_review_summary.scope_controls` | MVP 必要 | 對外 demo 文件與 API payload 的 scope-control 欄位。 |

## Error / Fallback

| Field | Scope | 判斷 |
| --- | --- | --- |
| `status` | MVP 必要 | iMVS 依此進入 error / fallback handling。 |
| `error.code` | MVP 必要 | 最小 error contract。 |
| `error.message` | MVP 必要 | rehearsal debug 與 fallback 顯示需要。 |
| `error.retryable` | MVP 建議 | MVP 可先固定常見 error 的 retry rule。 |
| `fallback.recommended_mode` | MVP 必要 | demo continuity 需要。 |
| `demo_boundary` | MVP 必要 | fallback 時仍維持相同 operating scope。 |
