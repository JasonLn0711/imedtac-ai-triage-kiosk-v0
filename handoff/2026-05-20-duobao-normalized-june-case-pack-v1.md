---
id: 2026-05-20-duobao-normalized-june-case-pack-v1
title: "Duobao Normalized June Demo Case Pack v1"
date: 2026-05-20
topic: ai-triage
type: handoff
status: clinical-review draft
audience: Duobao, Johnny Fang, imedtac engineering, NYCU demo team
source:
  - ../source/2026-05-20-duobao-demo-cases-question-design/source.md
  - ../docs/2026-05-20-duobao-demo-design-consistency-review.md
  - ../decisions/2026-05-20-june-demo-question-budget.md
  - ./2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
---

# Duobao Normalized June Demo Case Pack v1

## Purpose

This pack converts 多寶's `2026-05-20` demo cases and question design into a
June-safe demo case pack that can be reviewed by 多寶 and then implemented in
the existing iMVS / NYCU demo API.

The goal is not to import the full question bank. The goal is to create a small
reviewable bridge:

```text
多寶 clinical draft
-> demo-safe case labels
-> fewer-than-8 visible questions
-> post-measurement June question flow
-> staff_review_summary
-> explicit clinical-review questions
```

Post-`2026-05-21` sync note: the June integration default is now
`post_measurement_only`. The two-phase flow remains a future optimized path,
but the next imedtac rehearsal should start from measured vital payload ->
question loop -> staff-review summary.

Post-Duobao internal sync note: treat 多寶's diagnosis-shaped case labels and
draft triage levels as internal design anchors only. The customer-visible loop
should demonstrate vital-aware question selection and staff-review summary
generation, not AI assignment of formal triage level.

## Boundary

All cases are synthetic demo cases. They are not real patient data, not clinical
guidance, not diagnosis output, not treatment advice, not final triage / acuity
assignment, and not production HIS / EMR content.

The current June question budget follows the 慧誠 / iMVS product spec:

```text
visible patient-facing question cap: <8
API hard maximum: capabilities.max_questions = 7
preferred first respiratory flow: 5-7 questions
```

Only visible patient-facing questions count. Vitals, hidden routing metadata,
staff-summary fields, evidence refs, and API fields do not count.

## Design Reasoning Record

### Why normalize instead of directly importing 多寶's files?

多寶's files are clinically useful, but they are written as a broad clinical /
product design. Direct import would create three risks:

- the runtime could accidentally ask for real names or other identifiers;
- the output could drift into triage level, disposition, department, or action
  recommendation;
- the full universal + symptom-specific + post-vital questionnaire can exceed
  the 慧誠 product-spec question budget.

Normalization preserves the clinical signal while keeping the demo within the
current product and safety boundary.

### Why keep diagnosis-shaped labels internally?

Labels like `Pneumonia`, `AfRVR`, and `Acute Cholecystitis` are useful for
clinical design discussion because they explain why the synthetic vitals and
symptoms were chosen. They should not be shown as system conclusions. Runtime
labels should describe patient-facing symptoms and vital cues instead.

### Why keep the two-phase flow as future optimized path?

The two-phase flow can keep a future demo fast without pretending to interpret
vital signs before they exist:

```text
Phase 1: ask non-vital-dependent questions during measurement
-> vitals-ready payload
-> Phase 2: ask one or two vital-aware follow-up questions
-> staff_review_summary
```

After the `2026-05-21` engineering sync, it should not be the first June
integration default. Use post-measurement first, then reopen two-phase after the
basic imedtac payload -> NYCU answer loop works.

### Why keep each flow under seven questions?

The product spec says the dynamic OPQRST-style flow should have a total expected
question count under `8`. The current implementation should therefore treat
`7` as the hard maximum and use the extra budget only for clinically useful
context such as medication, allergy, chronic disease, or one targeted red-flag
screen.

### Why rewrite SOAP?

多寶's SOAP structure is useful, but `Assessment` and `Plan` can sound like
clinical conclusions or medical actions. For June, map the structure into:

| Draft concept | June-safe field |
| --- | --- |
| Subjective | `staff_review_summary.subjective` |
| Objective | `staff_review_summary.objective` |
| Assessment | `review_basis` |
| Plan | `review_action` / `staff_handoff_note` |

Do not show `Potential Triage Level`, `Suggested Acuity`,
`Suggested Disposition`, `Recommended Department`, or `Immediate Actions`
unless a future clinical / company owner explicitly approves that product
scope.

## Case Priority

Post-`2026-05-21` imedtac update: the first customer-demo lane should lead with
the live-performable tachycardia / palpitation / chest-tightness scenario. The
section order below still preserves the original normalized case-pack order, but
the active first-lane handoff now lives at
`handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md`.

| Priority | Internal clinical label | Runtime-safe case label | Why this order |
| --- | --- | --- | --- |
| 1 | AfRVR | Palpitation / chest tightness with very fast heart rate | Best first live demo after the 5/21 sync: heart rate is controllable enough for live performance and shows vital-aware question selection clearly. |
| 2 | Pneumonia | Shortness of breath with fever and lower oxygen saturation | Strong synthetic fallback: SpO2 is clinically expressive but difficult to control reliably in a live meeting. |
| 3 | URI | Fever, cough, and runny nose contrast case | Useful contrast case for showing that not every flow should look urgent; must not imply safe-to-go-home or low-acuity clearance. |
| 4 | Acute cholecystitis | Fever with right upper abdominal pain | Future expansion case: useful for pain-location and fever context but less tied to live vital-sign performance. |

## Case 1: Shortness Of Breath With Fever And Lower Oxygen Saturation

### Source Anchor

- Internal label from 多寶: `Pneumonia`
- Runtime-safe label: `Shortness of breath with fever and lower oxygen saturation`
- Synthetic profile: `80 y/o male`
- Synthetic vitals: `T 38.5 C`, `HR 102`, `RR 23`, `SpO2 92%`, `BP 123/81`

### Question Flow

| # | Phase | Question | Type | Why ask it |
| --- | --- | --- | --- | --- |
| 1 | pre-vital intake | What is the main reason you are using the kiosk today? | single choice | Anchors the branch without interpreting vitals. |
| 2 | pre-vital intake | How long have you felt short of breath? | single choice | Captures duration for staff review. |
| 3 | pre-vital intake | How severe does your breathing feel right now? | scale or single choice | Adds patient-reported severity without assigning acuity. |
| 4 | pre-vital intake | Which symptoms are present? Cough, fever/chills, chest discomfort, none of these. | multi choice | Preserves 多寶's cough/fever association while staying choice-only. |
| 5 | post-vital follow-up | Are you having chest pain or pressure right now? | single choice | Screens a staff-review cue after lower SpO2 / respiratory context is visible. |
| 6 | post-vital follow-up | Do you have chronic lung disease, use home oxygen, or use breathing medicines? | multi choice | Adds baseline respiratory context for staff review. |
| 7 | post-vital follow-up | Do you have medication allergies or medicines staff should confirm? | multi choice | Carries useful handoff context without free text. |

### Staff Review Summary Shape

```text
Subjective:
- Synthetic patient reports shortness of breath for 2 days.
- Patient-selected symptoms include cough / fever context according to answers.

Objective:
- Synthetic measured vitals include temperature 38.5 C, HR 102, RR 23, SpO2 92%, BP 123/81.

Review basis:
- Reported respiratory symptom plus measured oxygen-saturation cue should be reviewed by staff.
- Respiratory-rate cue is displayed as synthetic review context, not as a validated threshold.

Review action:
- Please review measured vitals and reported respiratory symptoms.

Not claimed:
- No pneumonia diagnosis.
- No final triage / acuity level.
- No treatment recommendation.
- No HIS / EMR writeback.
```

### 多寶 Review Questions

- Is seven questions enough for this respiratory case?
- Should chronic lung disease / home oxygen be kept in the June flow?
- How should `RR 23` be worded: abnormal, elevated cue, or review-only context?
- Should `SpO2 92%` trigger immediate summary after fewer questions?

## Case 2: Fever With Right Upper Abdominal Pain

### Source Anchor

- Internal label from 多寶: `Acute Cholecystitis`
- Runtime-safe label: `Fever with right upper abdominal pain`
- Synthetic profile: `40 y/o male`
- Synthetic vitals: `T 38.5 C`, `HR 98`, `RR 16`, `SpO2 99%`, `BP 123/81`

### Question Flow

| # | Phase | Question | Type | Why ask it |
| --- | --- | --- | --- | --- |
| 1 | pre-vital intake | What is the main reason you are using the kiosk today? | single choice | Anchors the abdominal pain / fever branch. |
| 2 | pre-vital intake | How long have you had the abdominal pain or fever? | single choice | Captures duration without diagnosis. |
| 3 | pre-vital intake | Which part of your abdomen hurts? | single choice | Preserves 多寶's location question and supports RUQ context. |
| 4 | pre-vital intake | How severe is the pain right now? | scale | Uses product-spec scale input and 多寶's NRS design. |
| 5 | post-vital follow-up | Do you have nausea, vomiting, diarrhea, or none of these? | multi choice | Captures associated symptoms. |
| 6 | post-vital follow-up | Are you feeling chills or have you taken fever-reducing medicine recently? | multi choice | Converts 多寶's fever follow-up into choice-only handoff context. |
| 7 | post-vital follow-up | Do you have medication allergies or medicines staff should confirm? | multi choice | Adds staff handoff context. |

### Staff Review Summary Shape

```text
Subjective:
- Synthetic patient reports fever with right upper abdominal pain for 1 day.
- Patient-selected pain location, severity, and associated symptoms are listed.

Objective:
- Synthetic measured vitals include temperature 38.5 C with otherwise listed vitals.

Review basis:
- Fever plus localized abdominal pain should be reviewed by staff.

Review action:
- Please review measured vitals, pain location, pain score, and associated symptoms.

Not claimed:
- No cholecystitis diagnosis.
- No imaging, surgery, medication, or department recommendation.
- No final triage / acuity level.
```

### 多寶 Review Questions

- Should nausea/vomiting/diarrhea be one multi-choice question or split?
- Should fever-reducing medicine be asked in June, or kept for later?
- Is pain score required for this case, or is pain location enough?

## Case 3: Palpitation / Chest Tightness With Very Fast Heart Rate

### Source Anchor

- Internal label from 多寶: `AfRVR`
- Runtime-safe label: `Palpitation / chest tightness with very fast heart rate`
- Synthetic profile: `76 y/o female`
- Synthetic vitals: `T 36.5 C`, `HR 150`, `RR 16`, `SpO2 98%`, `BP 102/68`

### Question Flow

| # | Phase | Question | Type | Why ask it |
| --- | --- | --- | --- | --- |
| 1 | pre-vital intake | What is the main reason you are using the kiosk today? | single choice | Anchors palpitation / chest tightness. |
| 2 | pre-vital intake | When did the palpitation or chest tightness start? | single choice | Captures duration. |
| 3 | pre-vital intake | Which descriptions fit? Heart racing, chest tightness, pressure, sharp pain, none of these. | multi choice | Preserves 多寶's symptom descriptors. |
| 4 | pre-vital intake | Do you have shortness of breath, sweating, dizziness, fainting, or none of these? | multi choice | Captures associated symptoms before vital interpretation. |
| 5 | post-vital follow-up | Is your heart still racing or does your chest still feel heavy now? | single choice | Connects patient-reported current status with HR cue. |
| 6 | post-vital follow-up | Do you have known heart rhythm problems or heart medicines staff should confirm? | multi choice | Adds relevant handoff context without diagnosing arrhythmia. |
| 7 | post-vital follow-up | Do you have medication allergies or medicines staff should confirm? | multi choice | Staff handoff context. |

### Staff Review Summary Shape

```text
Subjective:
- Synthetic patient reports palpitation and chest tightness for half a day.
- Patient-selected associated symptoms are listed.

Objective:
- Synthetic measured vitals include HR 150, BP 102/68, SpO2 98%, RR 16, T 36.5 C.

Review basis:
- Very fast heart-rate cue plus reported palpitation / chest tightness should be reviewed by staff.

Review action:
- Please review measured heart rate and reported cardiopulmonary symptoms.

Not claimed:
- No AfRVR or arrhythmia diagnosis.
- No ECG order or emergency order.
- No final triage / acuity level.
```

### 多寶 Review Questions

- Should HR 150 trigger immediate staff-summary stop before question 7?
- Should "known heart rhythm problems" be included, or is it too clinically specific for June?
- Is "chest feels heavy" acceptable patient-facing English?

## Case 4: Fever, Cough, And Runny Nose Contrast Case

### Source Anchor

- Internal label from 多寶: `URI`
- Runtime-safe label: `Fever, cough, and runny nose contrast case`
- Synthetic profile: `26 y/o female`
- Synthetic vitals: `T 37.5 C`, `HR 98`, `RR 21`, `SpO2 98%`, `BP 124/76`

### Question Flow

| # | Phase | Question | Type | Why ask it |
| --- | --- | --- | --- | --- |
| 1 | pre-vital intake | What is the main reason you are using the kiosk today? | single choice | Anchors fever / cough / runny nose. |
| 2 | pre-vital intake | How long have you had these symptoms? | single choice | Captures duration. |
| 3 | pre-vital intake | Which symptoms are present? Runny nose, sore throat, cough, fever, body aches, none of these. | multi choice | Preserves 多寶's URI symptom inventory. |
| 4 | pre-vital intake | Are you short of breath, having chest pain, wheezing, or none of these? | multi choice | Screens respiratory/chest warning context without diagnosis. |
| 5 | post-vital follow-up | Are you feeling chills or did you take fever-reducing medicine recently? | multi choice | Adds fever context after temperature cue. |
| 6 | post-vital follow-up | Do you have medication allergies or medicines staff should confirm? | multi choice | Keeps handoff context while staying under budget. |

### Staff Review Summary Shape

```text
Subjective:
- Synthetic patient reports fever for 2 days with cough and runny nose.
- Patient-selected respiratory and fever-context answers are listed.

Objective:
- Synthetic measured vitals include T 37.5 C, HR 98, RR 21, SpO2 98%, BP 124/76.

Review basis:
- Fever / respiratory symptom context is displayed for staff review.
- Temperature and respiratory-rate values are synthetic review cues, not validated threshold rules.

Review action:
- Please review measured vitals and reported symptoms.

Not claimed:
- No URI diagnosis.
- No safe-to-go-home statement.
- No medication recommendation.
- No final triage / acuity level.
```

### 多寶 Review Questions

- Should exactly `T 37.5 C` be called fever, borderline temperature, or simply a temperature cue?
- Should `RR 21` be mentioned at all in the staff summary?
- Does this contrast case help the demo, or should June focus only on more vital-aware cases?

## Cross-Case Review Checklist For 多寶

Ask 多寶 to review only the following high-value items first:

| Review item | Why it matters |
| --- | --- |
| Are the four runtime-safe case labels acceptable? | Avoids diagnosis-shaped system output. |
| Is each case clinically plausible with the listed synthetic vitals? | Prevents demo cases from feeling artificial. |
| Are `5-7` visible questions enough for each case? | Keeps the 慧誠 product-spec question budget. |
| Which vital cues require exact threshold signoff? | Prevents invented clinical rules. |
| Should any case stop early and hand off before all seven questions? | Supports safer staff-review behavior. |
| Are medication/allergy questions needed in every case? | Saves question budget if not needed. |
| Can the staff-only summary mention internal diagnosis labels? | Recommended default is no. |

## Engineering Translation Plan

Implementation status as of `2026-05-20`: Case 1 has been translated into the
clickable kiosk runtime as `respiratory-low-spo2-early-handoff`. The runtime
uses the pre-sync two-phase flow, starts with measurement in progress, exposes a
`Vitals ready` transition, and caps the visible patient-facing sequence at `7`
questions. After the `2026-05-21` sync, this runtime should be adapted or
wrapped for a post-measurement June rehearsal before customer-demo use.

Completed items:

1. Convert Case 1 into one checked fixture:
   `demo/fixtures/respiratory-low-spo2-early-handoff.json`.
2. Ensure the runtime question sequence stays under `max_questions=7`.
3. Add / update registry rows only for visible questions used in Case 1.
4. Wire the Case 1 runtime questions to
   `data/api_question_mapping.csv`, `data/question_registry.csv`, and
   `FLOW-RESPIRATORY-EARLY-HANDOFF`.
5. Keep the current tachycardia staff-summary API example in
   `handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json`
   aligned with `review_basis`, `review_action`, and `scope_controls`.
6. Run the current gates:

```bash
python3 scripts/check_governance_registries.py
npm run demo:ready
```

Post-`2026-05-21` addendum:

- The tachycardia live-performance lane now has a clinical-review draft packet:
  `handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md`.
- The governance registries now include tachycardia source rows, seven visible
  tachycardia question rows, API question mappings, and
  `FLOW-TACHYCARDIA-LIVE-DEMO`.
- The synthetic fixture is `demo/fixtures/tachycardia-live-demo.json`; it is a
  rehearsal/control artifact, not real patient data.

Next after 多寶 / 慧誠 review:

1. Ask 多寶 to approve or edit the seven visible tachycardia questions.
2. Ask imedtac engineering whether iMVS can render the question templates used
   here: `single_choice`, `multi_choice`, variable option counts, and no-scroll
   display limits. Keep numeric / scale as a future template only if imedtac
   confirms support.
3. Decide whether the respiratory fixture remains the first synthetic fallback
   or becomes the second demo lane after tachycardia review.

## What Not To Do Yet

- Do not implement all 15 symptom branches.
- Do not expose diagnosis labels as runtime answers.
- Do not add patient real-name collection.
- Do not add final triage level, acuity, department, disposition, or treatment.
- Do not implement ASR / free text until privacy and workflow boundaries are
  explicitly cleared.
