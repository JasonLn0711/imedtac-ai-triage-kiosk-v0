---
id: 2026-05-21-duobao-style-tachycardia-live-demo-question-set
title: "Duobao-Style Tachycardia Live Demo Question Set"
date: 2026-05-21
topic: ai-triage
type: handoff
status: clinical-review draft
audience: Jason / Duobao / imedtac engineering / NYCU demo team
source:
  - ../source/2026-05-15-imedtac-second-sync-and-duobao-followup/duobao-demo-case-draft.md
  - ../source/2026-05-20-duobao-demo-cases-question-design/question-design.md
  - ../source/2026-05-20-duobao-demo-cases-question-design/demo-cases.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
  - ../docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md
  - https://www.heart.org/en/health-topics/arrhythmia/about-arrhythmia/tachycardia--fast-heart-rate
  - https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack
  - https://medlineplus.gov/atrialfibrillation.html
  - https://media.emscimprovement.center/documents/Emergency_Severity_Index_Handbook.pdf
---

# Duobao-Style Tachycardia Live Demo Question Set

## Recommendation

The first live-performable June demo lane should be:

```text
iMVS measured vital payload
-> elevated heart-rate cue
-> short choice-based palpitation / chest-tightness intake
-> staff_review_summary for human review
```

This lane follows imedtac's post-`2026-05-21` preference because heart rate is the
most controllable live vital. The respiratory low-SpO2 case should remain the
synthetic fallback / evidence demo lane because SpO2 is clinically expressive but
hard to perform reliably in a live meeting.

All content here is a synthetic-data demo question set. It supports
staff-review intake and does not output arrhythmia diagnosis, AfRVR diagnosis,
ECG order, treatment advice, final triage score, formal acuity score, or
production HIS / EMR writeback.

## Pattern Learned From Duobao

| Duobao pattern | How this set preserves it |
| --- | --- |
| Start from chief complaint and duration. | Q1 and Q2 anchor the branch before deeper symptom narrowing. |
| Use symptom-specific branches. | Q3 and Q4 use the chest-tightness / palpitation branch from Duobao's question design. |
| Ask a post-vital trigger question after the measurement cue. | Q5 explicitly connects the measured heart-rate cue with current symptoms. |
| Keep past history / medication / allergy as handoff context. | Q6 and Q7 collect rhythm-history, medication, and allergy context for staff confirmation. |
| SOAP shape is useful but must be normalized. | The output maps Subjective and Objective into `staff_review_summary`, then uses `review_basis` and `review_action` instead of Assessment / Plan. |
| Diagnosis-shaped case labels are design anchors only. | `AfRVR` remains an internal source anchor; runtime wording says palpitation / chest tightness with elevated heart-rate cue. |

## Medical Grounding Used

| Source | Used for | Design control |
| --- | --- | --- |
| `AHA-TACHYCARDIA-FAST-HR` | Palpitations, chest discomfort, shortness of breath, dizziness, sweating, fainting, nausea as tachycardia-related symptom families. | Supports symptom options only; it does not diagnose the cause of tachycardia. |
| `AHA-HEART-ATTACK` | Chest discomfort, upper-body radiation, shortness of breath, cold sweat, nausea, tiredness, lightheadedness, rapid or irregular heartbeat. | Supports warning-symptom screening only; no ACS diagnosis or emergency order is generated. |
| `MEDLINEPLUS-AFIB` | Palpitations, trouble breathing, chest pain, dizziness/fainting, low blood pressure as AFib symptom context. | Supports history/symptom context only; no AFib diagnosis is generated. |
| `ENA-ESI-V5` | Vital signs can reveal instability and must be contextualized with history, medications, and presentation. | Supports staff-review routing and medication-context questions only; no formal triage score is assigned. |

## Demo Persona And Case Design

| Field | Draft value |
| --- | --- |
| `case_id` | `demo-tachycardia-live-001` |
| `flow_version` | `tachycardia-live-demo-flow-v0.2-draft` |
| `question_set_version` | `tachycardia-question-set-v0.2-draft` |
| Runtime-safe label | Palpitation / chest tightness with elevated heart-rate cue |
| Internal clinical anchor | Duobao's AfRVR-style case |
| Synthetic case anchor | `76 y/o female`, palpitations and chest tightness for half a day, HR `150 bpm`, SpO2 `98%`, BP `102/68 mmHg`, T `36.5 C` |
| Live demo persona | English-speaking adult demo visitor. The measured heart rate can come from an on-site participant, but symptoms, age, history, and answers remain synthetic. |
| Control comparison | Healthy/control run with normal-looking heart rate and no chest-tightness answers. |
| Fallback mode | Local scripted or synthetic fixture run if live HR cannot be raised, the participant should not exercise, or device quality is unstable. |

Live-demo safety control: do not require any staff member to exercise for the
demo. Use voluntary participation only, and keep the synthetic fixture available
so the product story does not depend on a person's physiology in the meeting.

## Patient-Facing Question Set

The preferred June version stays within `7` visible questions and uses only
`single_choice` / `multi_choice`. The wording below is English-first for the US
customer demo. Duobao / clinical owner should review the exact wording before it
is sent to imedtac as final.

| # | API question id | Type | Patient-facing question | Options | Required / skip policy | Purpose and summary effect |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `tachy-chief-concern` | `single_choice` | What is the main reason you are using the kiosk today? | `heart_racing` = Heart racing / palpitations; `chest_tightness` = Chest tightness / pressure; `breathing_or_dizzy` = Shortness of breath or dizziness; `other_or_not_sure` = Other / not sure | Required. No silent skip. | Anchors the cardiopulmonary branch and records chief concern. |
| 2 | `tachy-onset` | `single_choice` | When did this start? | `within_1_hour` = Within the last hour; `few_hours` = A few hours ago; `half_day` = About half a day; `more_than_1_day_or_not_sure` = More than one day / not sure | Required. No silent skip. | Adds onset and duration context to the staff summary. |
| 3 | `tachy-current-feeling` | `multi_choice` | Which descriptions fit what you feel now? | `heart_racing` = Heart racing or pounding; `chest_heavy` = Chest tightness or heaviness; `chest_pressure_pain` = Chest pressure or pain; `burning_sharp_or_not_sure` = Burning, sharp discomfort, or not sure | Required. Allow one or more. | Preserves Duobao's quality/location branch while using touch choices. |
| 4 | `tachy-associated-symptoms` | `multi_choice` | Are any of these happening with it? | `short_breath` = Shortness of breath; `sweating_nausea_fatigue` = Sweating, nausea, or unusual fatigue; `dizzy_faint` = Dizziness, lightheadedness, or fainting; `radiating_or_none` = Pain spreading to arm / jaw / back, or none of these | Required. Allow one or more. If imedtac needs a cleaner `none` option, split this into Q4a/Q4b. | Captures warning-symptom family for staff review without diagnosing. |
| 5 | `tachy-post-vital-heart-rate-cue` | `single_choice` | The kiosk received a high heart-rate reading for this demo. How do you feel right now? | `still_racing` = My heart still feels fast; `chest_still_heavy` = My chest still feels heavy / tight; `both` = Both; `neither_or_not_sure` = Neither now / not sure | Required. No silent skip. | Makes the vital-aware differentiator visible after measurement. |
| 6 | `tachy-heart-history-meds` | `multi_choice` | Have you been told you have a heart rhythm problem, or do you take heart / blood-pressure medicine? | `known_rhythm_problem` = Known rhythm problem; `heart_bp_medicine` = Heart or blood-pressure medicine; `no_known` = No known history / medicine; `staff_confirm` = Not sure, staff should confirm | Required with `staff_confirm` option. | Adds history/medication context that helps staff interpret the heart-rate cue. |
| 7 | `tachy-medication-allergy-confirm` | `multi_choice` | Do you have medication allergies or medicines staff should confirm? | `med_allergy` = Medication allergy; `regular_medicines` = Regular medicines; `none_known` = None known; `not_sure` = Not sure | Optional if time is tight; otherwise required with `not_sure`. | Preserves Duobao's universal handoff context without free text. |

MVP rendering note: if iMVS confirms a strict four-option no-scroll limit, keep
Q1, Q2, Q5, Q6, and Q7 as above. For Q4, the cleaner implementation is to split
warning symptoms into two shorter multi-choice questions and merge Q6/Q7 into
one staff-confirmation question so the total remains at seven.

## Example Answer Path

```json
{
  "case_id": "demo-tachycardia-live-001",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "vitals": {
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
  "answers": {
    "tachy-chief-concern": ["heart_racing"],
    "tachy-onset": ["half_day"],
    "tachy-current-feeling": ["heart_racing", "chest_heavy"],
    "tachy-associated-symptoms": ["short_breath"],
    "tachy-post-vital-heart-rate-cue": ["both"],
    "tachy-heart-history-meds": ["known_rhythm_problem"],
    "tachy-medication-allergy-confirm": ["not_sure"]
  }
}
```

## Staff-Review Summary Shape

```json
{
  "summary_visibility": "staff_only",
  "handoff_required": true,
  "handoff_reason_codes": [
    "measured_elevated_heart_rate_demo",
    "reported_palpitations",
    "reported_chest_tightness",
    "reported_shortness_of_breath",
    "staff_review_needed"
  ],
  "staff_review_summary": {
    "format": "review_summary_demo",
    "subjective": [
      "Synthetic demo patient reports heart racing with chest heaviness for about half a day.",
      "Selected associated symptom: shortness of breath.",
      "Patient selected known rhythm problem; medication and allergy details should be confirmed by staff."
    ],
    "objective": [
      "Demo vital payload includes HR 150 bpm, SpO2 98%, BP 102/68 mmHg, and temperature 36.5 C.",
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
      "Separate validation path before clinical use"
    ]
  }
}
```

Forbidden output for this case:

- no `AfRVR` or arrhythmia diagnosis;
- no ACS / heart-attack diagnosis;
- no ECG order;
- no medication or treatment recommendation;
- no final triage score or formal acuity score;
- no production HIS / EMR / FHIR writeback.

## Items We Should Add To The Plan

| Item | Recommendation |
| --- | --- |
| Live HR may not reach the synthetic target. | Keep three modes: `live_measured`, `synthetic_override`, and `local_scripted_fallback`. The presenter should know which mode is active. |
| Staff exercise may be unsafe or impractical. | Do not depend on exercise. Use voluntary participation only and keep the synthetic fixture ready. |
| Device artifact can look like a medical signal. | Preserve `measurement_status` and `quality_flag`; if quality is uncertain, the summary should say staff should review measurement quality. |
| Patient-facing wording could alarm the user. | Patient questions should say "high heart-rate reading for this demo" or "heart-rate cue", not "dangerous tachycardia". |
| Staff preview and patient UI need separation. | `staff_review_summary` should be `staff_only`; patient-facing UI should show only the next action selected by imedtac's workflow owner. |
| Skip behavior affects safety. | Required questions should include `Not sure` / `Unable to answer` / `Staff should confirm`; avoid a silent skip on Q1-Q5. |
| UI template capacity is still unknown. | Ask imedtac to confirm max options, label length, variable option counts, no-scroll behavior, and whether `none_option_id` can enforce mutual exclusion. |
| The live demo needs two scripts. | Prepare both "control/normal-looking run" and "elevated-HR cue run" so the differentiator is visible. |
| Clinical owner still controls thresholds. | Treat HR values and stop rules as demo cues until Duobao / company clinical owner approves exact wording and thresholds. |

## System Design Impact

The question-set update affects configuration and routing, not the fundamental
system architecture.

| Layer | Impact |
| --- | --- |
| Workflow | Keep `post_measurement_only`: iMVS measures first, then NYCU starts the question loop. |
| Question router | Add a tachycardia / palpitation route that uses `heart_rate_bpm` plus symptom answers to choose Q3-Q5 and the summary reason codes. |
| Source governance | Add tachycardia-specific source IDs and question rows so every visible question has a review path. |
| UI templates | The case needs `single_choice` and `multi_choice` only, but option count and `none` handling need imedtac confirmation. |
| Summary generator | Add cardiopulmonary handoff reason codes and keep output staff-only. |
| Demo operations | Add mode selection: live measured run, synthetic override, and local scripted fallback. |
| Runtime default | Respiratory can remain the synthetic fallback fixture; tachycardia becomes the first live-performance lane after review. |

## API Contract Impact

The two endpoints remain stable:

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

The case update changes versioned payload values:

```json
{
  "flow_version": "tachycardia-live-demo-flow-v0.2-draft",
  "case_id": "demo-tachycardia-live-001",
  "case_version": "demo-tachycardia-live-001-v0.2",
  "question_set_version": "tachycardia-question-set-v0.2-draft",
  "wording_version": "staff-summary-wording-v0.2-clinical-draft"
}
```

Recommended optional question-object fields:

| Field | Why it matters |
| --- | --- |
| `question.required` | Distinguishes required Q1-Q5 from optional staff-context questions. |
| `question.allow_not_sure` | Lets UI support uncertainty without a silent skip. |
| `question.allow_skip` | Should be `false` for Q1-Q5; can be `true` only for non-critical staff-context questions if imedtac requires skip. |
| `question.max_selections` | Needed for `multi_choice` rendering and validation. |
| `question.none_option_id` | Needed if "None of these" must be mutually exclusive. |
| `question.trigger_reason_codes` | Lets imedtac log why a question appeared. |
| `question.summary_effect` | Explains how an answer contributes to `staff_review_summary`. |

Recommended optional start-session context:

```json
{
  "demo_script": {
    "mode": "live_measured",
    "fallback_mode": "local_scripted_demo",
    "case_id": "demo-tachycardia-live-001"
  }
}
```

If imedtac does not implement a generic skip button, the existing
`answer.selected_option_ids` payload is enough because each required question
has explicit `not_sure` / `staff_confirm` style options. If imedtac implements a
generic skip button, Endpoint 2 should add:

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

## Review Questions For Duobao / imedtac

1. Is the English wording "heart racing", "chest heaviness", and "heart-rate cue"
   acceptable for the US customer demo?
2. Should the synthetic anchor stay at HR `150 bpm`, or should the live demo
   target use a lower measured-HR cue plus explicit synthetic fallback?
3. Should Q5 immediately end in `staff_review_summary` if the user selects
   `both`, or should Q6-Q7 still be asked for handoff completeness?
4. Can iMVS render Q4 with the grouped warning-symptom option, or should Q4 be
   split into two shorter multi-choice questions?
5. Should Q7 be required, optional, or merged into Q6 for a faster live demo?
