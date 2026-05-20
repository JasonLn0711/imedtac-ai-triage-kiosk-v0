---
id: 2026-05-15-june-demo-case-pack-v0
title: "June AI-Triage Demo Case Pack v0"
date: 2026-05-15
topic: ai-triage
type: handoff
status: draft
source_bundle: ../source/2026-05-15-imedtac-second-sync-and-duobao-followup/
---

# June AI-Triage Demo Case Pack v0

## Boundary

All cases here are synthetic demo cases. They are not real patient data, not
clinical guidance, and not validated triage rules.

The demo output should be a clinician-review intake summary, not a diagnosis or
autonomous triage decision.

Company-side minutes after the meeting add a useful constraint: keep the
question count short, use touch options plus partial voice input, and consider
case families such as trauma, chronic disease, and allergy. Earlier source
material mentioned `8-10`; the later 慧誠 / iMVS product spec says fewer than
`8`. The current June decision follows the product-spec requirement: fewer than
`8` visible patient-facing questions per completed case flow. Those case
families should be confirmed against the vital-sign story before implementation.

多寶's first case draft is preserved at
`source/2026-05-15-imedtac-second-sync-and-duobao-followup/duobao-demo-case-draft.md`.
Use it as a clinical design anchor, not as customer-facing diagnosis output.

多寶's later structured case and question-design files are preserved at
`source/2026-05-20-duobao-demo-cases-question-design/`, with the consistency
review at `docs/2026-05-20-duobao-demo-design-consistency-review.md`. Use those
files as a broader clinical-design inventory. Do not directly import their
real-name question, triage level, suggested acuity, disposition, department, or
immediate-action wording into runtime.

The normalized follow-up case pack is:

- `handoff/2026-05-20-duobao-normalized-june-case-pack-v1.md`

Use that file as the active June case-design bridge before implementing new
fixtures or expanding the runtime question bank.

## Case Table

| Case | Demo purpose | Vital signs to use | Kiosk-level questions | Stop rule |
| --- | --- | --- | --- | --- |
| Fever + cough / shortness of breath | Show temperature + SpO2 affecting follow-up. | Temp, SpO2, HR | Chief complaint, fever duration, cough, shortness of breath, chest pain, chronic disease, allergy. | Stop after respiratory red flags and hand staff a summary. Do not diagnose pneumonia / flu / COVID. |
| Abdominal pain + fever | Show location + pain score + fever. | Temp, HR, BP | Chief complaint, pain location, pain score, fever, vomiting, chronic disease, allergy. | Stop after location and red-flag context. Do not diagnose cholecystitis / appendicitis. |
| Chest tightness / palpitations + very fast HR | Show vital-sign-driven staff-review signal. | HR, BP, SpO2 | Chest discomfort, shortness of breath, dizziness/fainting, onset, chronic disease, medication/allergy. | If HR is very high or symptoms are concerning, show staff-review language only. Do not name arrhythmia or assign acuity. |
| Low SpO2 + dyspnea | Show clear vital abnormality plus symptom confirmation. | SpO2, HR, Temp | Shortness of breath, chest pain, fever/cough, chronic lung/heart disease, onset. | Hand off promptly to staff-review summary. No autonomous emergency instruction until wording is approved. |
| High BP / chronic-disease context | Match realistic kiosk self-measurement story. | BP, BMI/weight, HR | Headache/chest pain, dizziness, chronic disease, medication, allergy. | Present chronic-risk context and reported symptoms only. Do not recommend medication changes. |
| Allergy / mild trauma candidate | Matches company example categories, but vital-sign linkage must be designed carefully. | Temp, HR, BP, SpO2 if respiratory allergy | Exposure/allergen or injury mechanism, breathing symptoms, swelling, pain score, allergy history. | Use only if it demonstrates vital-aware intake. Do not diagnose anaphylaxis, fracture, or wound severity. |

## 多寶 Draft Cases

| Internal scenario label | Patient | Vital signs | Chief complaint | Draft level | Demo-safe use |
| --- | --- | --- | --- | --- | --- |
| Acute cholecystitis | `40 y/o M` | `T/P/R 38.5/98/16`, `SpO2 99%`, `BP 123/81` | Fever with RUQ abdominal pain for 1 day | `3` | Build the abdominal pain + fever flow. Output RUQ pain, fever, pain/context answers, and clinician-review signal; do not diagnose cholecystitis. |
| AfRVR | `76 y/o F` | `T/P/R 36.5/150/16`, `SpO2 98%`, `BP 102/68` | Palpitation and chest tightness for half day | `2` | Build the tachycardia / chest-tightness review flow. Output HR, symptoms, history, and staff-review signal; do not name arrhythmia as system conclusion. |
| Pneumonia | `80 y/o M` | `T/P/R 38.5/102/23`, `SpO2 92%`, `BP 123/81` | Dyspnea for 2 days | `2` | Build the fever + dyspnea + low-SpO2 flow. Output respiratory complaint, fever, SpO2, comorbidities, and review signal; do not diagnose pneumonia. |
| URI | `26 y/o F` | `T/P/R 37.5/98/21`, `SpO2 98%`, `BP 124/76` | Fever for 2 days, cough and runny nose | `5` | Build the low-acuity contrast case. Output URI-like symptoms in patient language and routine review summary; do not say safe to go home. |

## First Case To Implement

Start with:

```text
Fever + dyspnea + low SpO2
```

Minimum payload:

```json
{
  "case_id": "demo-fever-dyspnea-low-spo2-001",
  "status": "synthetic_demo_only",
  "age": 80,
  "sex": "male",
  "chief_complaint": "I feel short of breath",
  "vitals": {
    "temperature_c": 38.5,
    "spo2_percent": 92,
    "heart_rate_bpm": 102,
    "respiratory_rate_per_min": 23,
    "blood_pressure": "123/81"
  }
}
```

Question sequence:

1. What brings you in today?
2. How long have you felt short of breath?
3. Do you have fever or chills?
4. Are you coughing?
5. Do you have chest pain or pressure?
6. Do you have any chronic diseases, such as diabetes or high blood pressure?
7. Are you allergic to any medicine?
8. Is there anything short you want staff to know?

Clinician-review summary shape:

```text
Synthetic demo case.
Patient reports shortness of breath.
Measured vitals include fever, elevated respiratory rate, and lower SpO2 than expected.
Patient reports / denies shortness of breath and chest pain according to answers.
Staff should review the respiratory complaint and measured vitals.
This demo does not diagnose, recommend treatment, or assign final triage level.
```

## What 多寶 Can Fill Next

For each case:

- realistic age / sex;
- chief complaint wording in patient language;
- plausible vital-sign pattern;
- `5-7` visible kiosk-level questions, with `5-6` preferred for the first
  respiratory flow when possible;
- one sentence of staff-facing concern;
- one sentence of what the system must not claim.

## What Jason Can Build Next

- Convert each case into JSON-shaped fixtures.
- Build one guided question-flow screen.
- Build one summary screen.
- Add an API contract draft:
  - input: `vitals + fixed answers + optional ASR text`;
  - output: `next_question` or `summary`.
- Keep a remote-compute option for ASR / LLM-style behavior during the June demo.
