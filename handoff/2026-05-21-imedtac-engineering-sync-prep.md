---
id: 2026-05-21-imedtac-engineering-sync-prep
title: "慧誠 Thursday Engineering Sync Prep"
date: 2026-05-21
topic: ai-triage
type: handoff
status: draft
source:
  - ../source/2026-05-19-johnny-line-thursday-engineering-sync/source.md
  - ../source/2026-05-19-duobao-line-thursday-engineering-sync/source.md
  - ../source/2026-05-19-johnny-direct-line-thursday-engineering-sync/source.md
  - ../source/2026-05-19-johnny-ai-triage-product-spec/source.md
  - ../source/2026-05-19-expert-review-scope-api-boundary/source.md
  - ../source/2026-05-20-duobao-demo-cases-question-design/source.md
---

# 慧誠 Thursday Engineering Sync Prep

## FIRST PRINCIPLE

- Scarce resource: June demo execution bandwidth and stakeholder trust.
- Meeting job: freeze the smallest API/session contract that lets 慧誠's iMVS
  UI call the NYCU AI triage demo loop.
- Clinical job: let 多寶 help define safe question scope, stop rules, and
  staff-review wording.
- Boundary: demo-only triage support; no diagnosis, treatment, final acuity
  assignment, real patient data, or production HIS / EMR / FHIR writeback.

## Meeting Frame

This Thursday sync is not a general product ideation meeting. Johnny explicitly
said the engineering team needs an API design document. Therefore the useful
meeting output is a short list of frozen decisions:

1. iMVS vital payload shape.
2. NYCU question object shape.
3. `session_key` ownership and answer-loop behavior.
4. Staff-summary output shape and safe wording.
5. What is in / out for the mid-June customer demo.
6. Who owns the next artifact and when it is delivered.

The sync time is now `2026-05-21 10:00` Asia/Taipei. Johnny provided Microsoft
Teams meeting access details in the LINE group source. Keep the password in the
local source record only.

Johnny also clarified in direct LINE that the spec's triage standards and
presentation logic were first discussed with AI and can be adjusted in practice.
Therefore, treat the spec as a negotiable starting point, not a fixed clinical
protocol.

Expert review on `2026-05-19` confirmed the current scope cut is appropriate:
for June, keep this as `synthetic-data vital-aware intake + staff-review
summary`, not a clinical triage product. The expert's required additions are
runtime enforcement, clinical stop rule, payload field dictionary, failure
fallback, and locked UI/API wording.

多寶 workflow update: use a two-phase question design if 慧誠's kiosk UI can
support it. Phase 1 asks non-vital-dependent questions while the patient is
being measured; Phase 2 begins after iMVS sends measured vital values and asks
vital-aware follow-up questions. This can save patient time without weakening
the staff-review boundary.

Runtime update on `2026-05-20`: the kiosk now includes the Duobao-aligned
respiratory early-handoff case as a runnable third demo case. It starts in
measurement-in-progress mode, uses a visible `Vitals ready` transition, and
keeps the visible patient-facing flow at `7` questions maximum. Use this as the
meeting demo path instead of discussing the case only from static docs.

## Roles

| Person / team | Meeting role | What they should decide |
| --- | --- | --- |
| Johnny Fang | Product / coordination owner | June demo target, UI readiness, engineer owner, when API doc is needed. |
| 慧誠 engineering design team | iMVS integration owner | Payload fields, UI insertion point, call sequence, environment, network, failure handling. |
| Jason | NYCU demo/API owner | Proposed session API, synthetic case flow, runtime boundary, mock adapter plan. |
| 多寶 | Clinical sanity-check owner | Case plausibility, stop rules, safe summary wording, what must be left to staff/clinician review. |

## Proposed Agenda

1. Confirm target demo story.
   - Mid-June customer demo.
   - Vital-sign kiosk context -> guided intake -> staff-review summary.
   - No real HIS writeback, diagnosis, treatment, or final triage level.

2. Confirm iMVS integration point.
   - Where does AI triage appear in the iMVS flow?
   - After all vitals are measured, or while measurement is ongoing?
   - Same web app, iframe, external link, backend API, or demo-only handoff?
   - Can Phase 1 questions be shown during safe measurement idle time?

3. Freeze API/session loop.
   - Start session with demo patient context and `measurement_state`.
   - Return typed question object plus `session_key`.
   - Submit answer plus `session_key`.
   - Return next question or staff-review summary.
   - If using two-phase flow, add a vitals-ready update after measurement.

4. Freeze question UI object.
   - `single_choice`, `multi_choice`, `scale`.
   - `options`, `none_option_id`, `progress`, `evidence_refs`.
   - No free-text input unless separately approved.

5. Clinical stop rule with 多寶.
   - What can kiosk ask?
   - What makes the system stop and show staff-review language?
   - What words are forbidden in patient-facing and doctor-facing output?
   - Which spec standards / presentation logic items should be adjusted because
     they came from AI-assisted drafting rather than confirmed clinical review?

6. Decide voice input status.
   - Recommended: out of the critical path for June.
   - If included, require transcript confirmation, retry/failover, privacy rule,
     and no real patient audio retention.

7. Confirm next artifacts and dates.
   - Jason: API v0.2 draft.
   - 慧誠 engineering: sample payload, field dictionary, UI insertion point.
   - 多寶: one case stop-rule / safe wording review.

## What Jason Should Prepare

Prepared artifact:

- `handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md`
- `handoff/api-examples/`
- `handoff/2026-05-21-decision-defaults-and-owner-matrix.md`
- `docs/2026-05-19-two-phase-question-flow-design.md`
- `app/triage-kiosk/index.html` for the runnable two-phase respiratory demo.

### 1. One-page API design document

Bring a compact version of the proposed contract:

```text
POST /api/triage-demo/sessions
  input: client + demo_patient_context + vitals + capabilities
  output: session_key + progress + typed question

POST /api/triage-demo/sessions/{session_key}/answers
  input: question_id + selected options or scale value + input metadata
  output: next question OR staff_review_summary

POST /api/triage-demo/sessions/{session_key}/vitals
  input: measured vital payload when measurement completes
  output: post-vital follow-up question OR staff_review_summary
```

Use these field names in the first draft:

- `session_key`
- `status`: `question` or `summary`
- `progress.current`
- `progress.expected_total`
- `question.id`
- `question.type`
- `question.text`
- `question.options`
- `answer.selected_option_ids`
- `answer.scale_value`
- `summary_visibility`: `staff_only`
- `handoff_required`
- `handoff_reason_codes`
- `workflow_mode`
- `measurement_state`
- `vitals_ready`
- `question_phase`
- `phase_reason`
- `staff_review_summary.subjective`
- `staff_review_summary.objective`
- `staff_review_summary.review_basis`
- `staff_review_summary.review_action`
- `staff_review_summary.staff_handoff_note`
- `staff_review_summary.not_claimed`

### 2. One synthetic vital payload

Use one respiratory case first:

```json
{
  "demo_patient_id": "DEMO-RESP-001",
  "age": 80,
  "sex": "male",
  "chief_complaint": "Shortness of breath",
  "vitals": {
    "measurement_timestamp": "2026-05-21T10:00:00+08:00",
    "device_id": "IMVS-DEMO-001",
    "measurement_status": "measured",
    "quality_flag": "needs_review",
    "missing_reason": null,
    "temperature_c": 38.5,
    "spo2_percent": 92,
    "heart_rate_bpm": 102,
    "respiratory_rate_per_min": 23,
    "blood_pressure_systolic_mm_hg": 123,
    "blood_pressure_diastolic_mm_hg": 81,
    "height_cm": null,
    "weight_kg": null,
    "glucose_mg_dl": null
  }
}
```

### 3. One staff-summary wording example

Use conservative wording:

```text
Synthetic demo case.
Patient reports shortness of breath.
Measured vitals include fever, elevated respiratory rate, and lower SpO2 than expected.
Staff should review the respiratory complaint and measured vitals.
This demo does not diagnose, recommend treatment, assign a final triage level, or write to HIS/EMR.
```

### 4. One decision checklist

Bring this checklist and force closure:

- [ ] Vital payload fields and units.
- [ ] Whether Phase 1 questions can run during measurement.
- [ ] Vitals-ready event / endpoint shape.
- [ ] `session_key` generated by NYCU or iMVS.
- [ ] Question type enum.
- [ ] Progress semantics.
- [ ] Summary field name: not `diagnosis`.
- [ ] Final summary visibility: `staff_only`.
- [ ] Handoff flags: `handoff_required` and `handoff_reason_codes`.
- [ ] No `plan_support`; use `review_action` or `staff_handoff_note`.
- [ ] No `assessment_support` unless a named clinical owner approves that exact
      label; default to `review_basis`.
- [ ] Voice in / out for June.
- [ ] Demo compute path: external server / laptop / local mock.
- [ ] UI insertion path.
- [ ] One engineer contact and communication channel.
- [ ] Date when confirmed API v0.2 is expected.

Current draft reply timing:

```text
5/20 can provide API design skeleton / sample JSON.
5/21 Thursday sync can freeze fields and clinical boundary.
5/22 can provide API design v0.2 after field names are confirmed.
```

Use `handoff/2026-05-21-decision-defaults-and-owner-matrix.md` as the meeting
closeout sheet. The call should not end until the payload/UI/engineering owner,
API v0.2 owner, and 多寶 wording-review owner have due dates.

After expert review, the closeout also needs a privacy/security owner for the
no-real-identifiers / no-raw-audio / no-production-endpoint check.

Meeting logistics already captured:

- 多寶 said he is available.
- 多寶's email was shared with Johnny and the product-spec email was forwarded
  to him.
- Meeting time: Thursday `2026-05-21 10:00` Asia/Taipei.
- Platform: Microsoft Teams.
- Meeting access details: preserved in
  `source/2026-05-19-johnny-line-thursday-engineering-sync/source.md`.

## What 多寶 Should Prepare

多寶 does not need to solve the whole medical product. His highest-value role is
to protect the clinical boundary.

Ask 多寶 to prepare answers to these:

- Is `fever + dyspnea + low SpO2` the best first demo case?
- Which vital signs should visibly affect follow-up questions in this case?
- Which questions are safe for kiosk-level intake?
- Which findings should stop the flow and trigger staff review?
- How should we write "concerning signals" without diagnosing pneumonia,
  arrhythmia, shock, or emergency severity?
- Are trauma, chronic disease, and allergy worth adding to the first demo, or
  should they wait until the respiratory / abdominal / tachycardia flows work?
- Which triage standards / presentation logic in 慧誠's spec should be revised,
  softened, or marked as `clinical-review-needed` before the June demo?

Suggested clinical stop-rule language:

```text
The kiosk may collect symptom context and measured-vital context.
It should stop at staff-review summary when vitals or reported symptoms raise concern.
It should not provide diagnosis, treatment, final triage level, or discharge advice.
```

## Questions For Johnny

- What exact date is the mid-June customer demo?
- Is the customer expecting a clickable UI demo, a technical integration demo,
  or a clinical workflow demo?
- What is the minimum API document the engineering team needs: OpenAPI spec,
  sample JSON only, sequence diagram, or mock endpoint?
- By what date do they need the first API design document?
- Does the June demo need to run inside iMVS, or can it open a separate NYCU demo
  screen?
- Should the output be English only, bilingual, or Chinese internal / English
  customer-facing?
- Who is the engineering point of contact after the meeting?

## Questions For 慧誠 Engineering

### iMVS Payload

- Can they provide one synthetic or de-identified vital payload example?
- What exact field names do they currently use for:
  - SpO2
  - heart rate
  - temperature
  - respiratory rate, if available
  - blood pressure systolic / diastolic
  - height
  - weight
  - BMI
  - glucose, if available
- What are the units?
- Which fields are guaranteed vs optional?
- How do they represent missing, failed, or re-measured values?

### Integration Path

- Is the AI step called from frontend, middleware, or backend?
- Can Phase 1 questions be displayed while measurement is ongoing?
- Which measurement steps have safe idle time for touch questions?
- Does answering questions risk measurement posture or signal quality?
- Can iMVS send a `measurement_state=complete` / `vitals_ready=true` event?
- Can the June demo call an external HTTPS endpoint?
- Is there a CORS / firewall / VPN constraint?
- Does the demo machine have stable internet?
- If network fails, is local mock fallback acceptable?
- Does iMVS need a QR/report output after the AI step?

### Session And State

- Should NYCU generate `session_key`, or should iMVS send an encounter/session
  id?
- How long should a session stay alive?
- What happens if the user presses back, restarts, or abandons the flow?
- Should answer history be stored on iMVS side, NYCU side, both, or neither for
  the demo?
- Does the engineering team need idempotency keys for retry?

### Question Rendering

- Can iMVS render:
  - single-choice buttons;
  - multi-choice buttons;
  - scale input;
  - progress indicator;
  - "none of these" mutually exclusive option?
- Does iMVS need the question text and options in English, Chinese, or both?
- Do option ids need to be stable across sessions?
- Can the UI show phase progress, for example `intake 1/2` then
  `follow-up 1/2`?

### Summary Output

- Where will the doctor/staff summary be displayed?
- Do they want SOAP sections or a shorter demo summary?
- Can we name the final field `staff_review_summary` rather than `diagnosis`?
- Can the API and UI use `review_action` / `staff_handoff_note` instead of
  `plan_support`?
- Can the summary be marked `summary_visibility: "staff_only"`?
- Should `evidence_refs` be visible in the UI or kept as backend/debug data?

## Questions For 多寶 During The Meeting

- For the first respiratory case, what is the safe "staff should review" phrase?
- Is "lower SpO2 than expected" acceptable, or should we avoid interpreting the
  number without local protocol?
- Are fever + dyspnea + low SpO2 enough to show vital-aware triage without
  naming pneumonia?
- What patient-facing questions should be avoided because they imply diagnosis?
- For tachycardia / chest tightness, should the flow stop earlier than other
  cases?
- Which case type should be the second case after respiratory: abdominal pain +
  fever, tachycardia/chest tightness, or low-acuity URI?

## Things Not Yet Discussed Enough

These are important enough to raise if time allows.

### 1. Error And Fallback Behavior

The API contract needs failure behavior, not only success JSON:

- timeout;
- invalid session;
- unsupported question type;
- missing vital field;
- network unavailable;
- user abandons the flow;
- API returns summary too early or too late.

For June, define a simple fallback:

```text
If AI API is unavailable, iMVS shows a demo-safe fallback screen and does not
pretend a clinical result was generated.
```

### 2. Payload Versioning

Add:

- `api_version`
- `schema_version`
- `flow_version`
- `case_id`

Without versioning, even small field changes will break iMVS and NYCU alignment.

### 3. Units And Normalization

Do not rely on implied units. Freeze units explicitly:

- temperature: Celsius vs Fahrenheit;
- glucose: mg/dL vs mmol/L;
- blood pressure: split systolic / diastolic, not free-text only;
- SpO2: percent;
- height / weight: cm / kg or inch / lb.

### 4. No Real Identifiers

The June demo should not send:

- real patient name;
- national ID;
- MRN;
- phone number;
- raw audio;
- real medical record content.

Use `demo_patient_id` only.

### 5. Evidence Mapping Honesty

The spec mentions BMJ Best Practice, UpToDate, NICE, and Merck Manual. Do not
claim those sources support all questions unless the exact source text is
mapped. For June, it is safer to return:

```json
"evidence_refs": ["LOCAL-PROTOCOL-TBD"]
```

Then state that source mapping is a post-demo validation gate.

### 6. Output Naming Risk

If the API field is named `diagnosis`, downstream teams may build UI and claims
around diagnosis. Freeze safer names now:

- `staff_review_summary`
- `review_basis`
- `clinical_review_note`

### 7. Voice Input Risk

Voice sounds impressive but introduces:

- ASR latency;
- noisy environment failure;
- transcript error;
- patient confirmation UX;
- audio retention / privacy;
- hardware microphone quality;
- weak CPU / no GPU constraints.

Recommendation: keep voice outside the critical path for June. If included, it
must be an optional demo branch with typed/choice fallback.

### 8. What Counts As Done

Define demo acceptance before building:

```text
Done means one synthetic case can complete:
vital payload -> question 1 -> answer -> question 2... -> staff-review summary,
with visible progress and no forbidden clinical claim.
```

### 9. Runtime / UI Wording Lock

Problem: the clinical boundary can fail through field names, button labels, or
presenter language even if the design document is conservative.

Meeting rule:

- prefer `vital-aware intake support`, `staff_review_summary`, and
  `clinician-review summary`;
- avoid `AI diagnosis`, `ESI level`, `emergency severity`,
  `clinical-grade triage`, `FDA-cleared`, `510(k)-cleared`, and `510(k)-ready`;
- use `comparable-product / 510(k) scope scan` only when discussing regulatory
  research, not demo readiness.

## Suggested Meeting Close

End by reading back these decisions:

```text
For June, we will deliver a synthetic-data vital-aware structured intake demo.
iMVS sends a mock/synthetic vital payload. NYCU returns typed questions with a
session key. iMVS returns answers with the same session key. NYCU returns either
the next question or a staff-review summary. The demo does not diagnose, assign
final triage level, recommend treatment, or write to HIS/EMR. Voice and HIS
writeback are future-state unless separately approved.
```
