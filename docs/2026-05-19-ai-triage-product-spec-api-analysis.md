---
id: 2026-05-19-ai-triage-product-spec-api-analysis
title: "AI Triage Product Spec API Analysis"
date: 2026-05-19
topic: ai-triage
type: analysis
status: draft
source_bundle: ../source/2026-05-19-johnny-ai-triage-product-spec/
---

# AI Triage Product Spec API Analysis

## FIRST PRINCIPLE

- Scarce resource: mid-June demo execution bandwidth and stakeholder trust.
- Canonical source: `source/2026-05-19-johnny-ai-triage-product-spec/`.
- Near-term product job: make the AI triage demo contractable with 慧誠's iMVS
  UI / API team.
- Boundary: demo-only triage support and clinician-review summary; no
  diagnosis, treatment, final triage level, real patient data, or production
  HIS writeback.

## What Changed

The project is no longer only asking "can we build a credible demo?" 慧誠 is now
asking for the API shape needed to connect their iMVS workflow to the NYCU AI
question/summary service.

The later standalone PDF named
`iMVS AI Triage 智慧檢傷分流系統_20260515.pdf` was verified as byte-identical to
the archived product-spec PDF in the source bundle. It is therefore not a
second spec version; it is the same `V 1.0` product document referenced by the
email.

The `2026-05-19` email creates three concrete interface questions:

1. What vital-sign payload should iMVS upload to NYCU?
2. What question object should NYCU return, including type, options, progress,
   and session key?
3. How should iMVS send an answer plus session key and receive the next question
   or final output?

多寶 workflow clarification adds a fourth interface question:

4. Can iMVS start Phase 1 questions while measurements are still running, then
   send a vitals-ready payload for Phase 2 vital-aware follow-up?

The linked spec adds product-level acceptance criteria that mostly align with a
choice-first demo: OPQRST-like dynamic questions, fewer than eight questions,
progress display, single-choice, multi-choice, scale input, and a demo doctor
AI-result page.

Current June design calibration follows this 慧誠 / iMVS requirement: fewer
than `8` visible patient-facing questions per completed case flow.

## Demo Scope Cut

| Spec area | June demo stance | Reason |
| --- | --- | --- |
| Vital-sign upload | Include with synthetic or mock iMVS-shaped payload. | This is the core differentiator and the API question 慧誠 is asking now. |
| Two-phase question flow | Prefer if UI can support it. | Saves patient time: non-vital questions run during measurement; vital-aware questions wait until values are ready. |
| Dynamic question loop | Include as deterministic session flow. | Matches AC06-AC10 and current runtime direction. |
| Progress indicator / question budget | Include. | AC07 is explicit and low-risk. |
| Single-choice / multi-choice | Include. | Already aligned with v0 choice-only runtime. |
| Scale input | Add or stub for pain/severity. | AC11 is explicit; useful for OPQRST. |
| Voice input | Defer unless explicitly approved for demo. | Email says it depends on team progress; current repo boundary excludes ASR from v0. |
| Doctor AI result page | Include as demo staff-summary page. | AC14 is demo-specific and near-term. |
| SOAP/HIS return path | Demo visualization only; no real writeback. | Email says grey-text HIS return flow is not implemented for mid-June. |
| Evidence mapping | Show source placeholders or reviewer-only evidence refs. | AC16 matters for trust, but real clinical-source mapping remains a governance gate. |
| Diagnosis / final triage | Exclude. | Repo boundary and safety rules forbid autonomous clinical claims. |

## Proposed V0 API Contract

Use one small session-based contract for June. Keep it JSON-only and make every
clinical claim demo-bounded.

### 1. Start Session

```http
POST /api/triage-demo/sessions
```

```json
{
  "client": {
    "source": "imvs-demo",
    "site": "demo",
    "locale": "en-US"
  },
  "patient_context": {
    "demo_patient_id": "DEMO-001",
    "age": 58,
    "sex": "male",
    "identity_mode": "demo"
  },
  "vitals": {
    "temperature_c": 38.5,
    "spo2_percent": 92,
    "heart_rate_bpm": 102,
    "respiratory_rate_per_min": 23,
    "blood_pressure_systolic_mm_hg": 123,
    "blood_pressure_diastolic_mm_hg": 81,
    "height_cm": null,
    "weight_kg": null,
    "glucose_mg_dl": null
  },
  "capabilities": {
    "question_types": ["single_choice", "multi_choice", "scale"],
    "max_questions": 7,
    "voice_input": false
  }
}
```

Response:

```json
{
  "session_key": "demo-session-uuid",
  "status": "question",
  "progress": {
    "current": 1,
    "expected_total": 8
  },
  "question": {
    "id": "chief-concern",
    "type": "single_choice",
    "text": "What is the main reason you are using the kiosk today?",
    "options": [
      {"id": "breathing", "label": "Shortness of breath"},
      {"id": "chest", "label": "Chest discomfort"},
      {"id": "fever", "label": "Fever or infection concern"},
      {"id": "other", "label": "Something else"}
    ],
    "none_option_id": null,
    "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
    "demo_boundary": "This is a synthetic-data demo question for staff-review intake support."
  }
}
```

### 2. Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
```

```json
{
  "question_id": "chief-concern",
  "answer": {
    "selected_option_ids": ["breathing"],
    "scale_value": null
  },
  "client_event": {
    "answered_at": "2026-05-19T16:52:00+08:00",
    "input_mode": "touch"
  }
}
```

Response can either return the next question:

```json
{
  "session_key": "demo-session-uuid",
  "status": "question",
  "progress": {
    "current": 2,
    "expected_total": 4
  },
  "question": {
    "id": "breathing-duration",
    "type": "single_choice",
    "text": "How long have you felt short of breath?",
    "options": [
      {"id": "today", "label": "Started today"},
      {"id": "days", "label": "A few days"},
      {"id": "week_plus", "label": "More than a week"}
    ],
    "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
    "demo_boundary": "Staff should review this answer with the measured vitals."
  }
}
```

or return a demo staff-summary:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "respiratory-early-handoff-flow-v0.2-draft",
  "session_key": "demo-session-uuid",
  "session_state": "summary_ready",
  "status": "summary",
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": [
    "reported_shortness_of_breath",
    "measured_lower_oxygen_saturation_demo"
  ],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "Patient reports shortness of breath."
    ],
    "objective": [
      "Synthetic measured vitals include fever, increased respiratory rate, and lower oxygen saturation than expected for this demo scenario."
    ],
    "review_basis": [
      "Staff should review the respiratory complaint and measured vitals."
    ],
    "review_action": [
      "Staff or clinician review required."
    ],
    "staff_handoff_note": "Please review measured vitals and reported symptoms.",
    "not_claimed": [
      "This demo does not diagnose.",
      "This demo does not recommend treatment.",
      "This demo does not assign a final triage level.",
      "This demo does not write to HIS/EMR."
    ]
  },
  "evidence_refs": ["LOCAL-PROTOCOL-TBD"],
  "demo_boundary": "Synthetic-data capability demo only."
}
```

## Immediate Gaps

| Gap | Why it matters | Next action |
| --- | --- | --- |
| iMVS vital-field names | Contract must match 慧誠's actual payload. | Ask for one de-identified or synthetic example payload and field dictionary. |
| Payload quality fields | Expert review flagged missing/failure semantics as an engineering blocker. | Add `measurement_timestamp`, `device_id`, `measurement_status`, `quality_flag`, and `missing_reason`; ask 慧誠 to freeze exact semantics. |
| Two-phase UI feasibility | 多寶's workflow idea depends on asking safe questions during measurement. | Ask whether the kiosk can display Phase 1 questions without disrupting posture/signal quality and whether iMVS can send a vitals-ready event. |
| Session-key ownership | Determines whether iMVS or NYCU stores state. | For demo, NYCU can issue `session_key`; iMVS echoes it back. |
| Retry/idempotency | A duplicated answer retry could advance the dynamic flow twice. | Add `request_id` and `idempotency_key`. |
| Session state | The API needs explicit expiry and last-question recovery. | Add `session_expires_at`, `session_state`, and `last_question_id`. |
| Question type enum | Needed for UI rendering. | Freeze `single_choice`, `multi_choice`, and `scale` first. |
| Progress semantics | AC07 asks for visible progress. | Return `current`, `expected_total`, and optional `remaining_estimate`. |
| "Diagnosis" field wording | Company email uses `診斷等格式`. | Rename our output as `summary` / `staff_review_summary` with `review_basis`, not `diagnosis`. |
| `plan_support` wording | Expert review flagged SOAP `Plan` wording as risky. | Replace with `review_action` and `staff_handoff_note`. |
| Scale widget | Spec AC11 needs it; current v0 may not fully cover it. | Add or stub a pain/severity scale after core question manifest gate. |
| Evidence mapping | Spec AC16 asks for source links. | For demo, expose `evidence_refs` and mark unresolved rows as `LOCAL-PROTOCOL-TBD`. |
| Voice input | Spec AC12 is detailed, but email says it is conditional. | Keep out of live v0 unless a separate ASR data/privacy decision is made. |
| HIS/FHIR writeback | Spec mentions it, email excludes it from June. | Demo a doctor-view page only; no real writeback. |

## Recommended Reply To 慧誠

Use this stance in the next technical sync:

- We can discuss and freeze the vital payload shape now.
- For June, NYCU can return typed question objects with `session_key`,
  `question_id`, `type`, `options`, and `progress`.
- iMVS can submit answer objects with the same `session_key`; NYCU returns either
  the next question or a demo staff-summary JSON.
- We recommend wording the final field as `staff_review_summary`, with
  `summary_visibility: "staff_only"`, `handoff_required`, `review_basis`, `review_action`, and
  `staff_handoff_note`, not `diagnosis` or `plan_support`, for the June customer
  demo.
- Voice can remain optional; if shown, it should have transcript confirmation
  and fallback, and should not store real patient audio.
- HIS return / FHIR writeback should stay grey-text / future-state for June.

## Planning Recommendation

This creates a narrow W21/W22 plan:

1. Freeze the demo API contract and send 慧誠 a concrete question list.
2. Map the current runtime questions to the contract and registry manifest.
3. Add the missing AC07 progress and AC11 scale-widget audit / implementation.
4. Add the v0.2 expert-review fields: session expiry/state, retry keys,
   measurement quality, staff-only visibility, handoff flags, and stable error
   behavior.
5. Add two-phase flow fields: `workflow_mode`, `measurement_state`,
   `vitals_ready`, `question_phase`, and `phase_reason`; use a vitals-ready
   endpoint if 慧誠 can support it.
6. Build a mock iMVS adapter using synthetic vital payloads.
7. Rehearse the loop with one early-handoff respiratory case before expanding
   to `3-5` cases.

Do not start a broad product rewrite, real identity integration, real HIS
integration, or ASR sprint until the API contract, clinical wording, and demo
boundary are signed off.
