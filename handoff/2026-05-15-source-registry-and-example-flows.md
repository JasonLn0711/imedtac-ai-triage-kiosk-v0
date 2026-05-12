# Source Registry And Example Flows For Vital-Aware Triage

Date: 2026-05-15 discussion appendix draft  
Parent artifact:
`handoff/2026-05-15-vital-aware-triage-feasibility-source-governance.md`  
Status: source registry and example-flow appendix; not production logic

## Purpose

This appendix turns the source-governance position into an actionable review
table. It answers:

> If iMVS measured vitals are available, which follow-up questions become more
> important, what source family supports that question, and what still needs
> clinician/company sign-off?

The goal is not to lock a final triage rule. The goal is to make the Friday
discussion concrete enough that 慧誠 and clinical reviewers can approve,
replace, or reject each branch.

## Evidence Status Legend

| Status | Meaning | Allowed Friday use |
| --- | --- | --- |
| `source-backed` | An official or professional source directly supports the warning-sign family or vital-sign role. | Can be used as an example if still labeled demo-only. |
| `source-family hypothesis` | The source family is appropriate, but exact text / version / clause still needs extraction. | Can be discussed as a research direction, not as an approved rule. |
| `clinician-signoff-needed` | Threshold, wording, routing, or escalation behavior depends on local clinical workflow. | Must not be presented as final clinical logic. |
| `demo-only` | Useful for market or workflow illustration but not enough for clinical justification. | Can appear in mock data or architecture, not as medical evidence. |

## Source Registry V0

| Source ID | Source | Use in this project | Source-backed point | Limits |
| --- | --- | --- | --- | --- |
| `FDA-CDS-FAQ-2022` | FDA Clinical Decision Support Software FAQ | Defines CDS boundary and multi-function product framing. | FDA published final CDS guidance to clarify which CDS functions may be excluded from the device definition; FDA also recommends using the Digital Health Policy Navigator for multi-function products. | Does not define symptom questions, ED triage thresholds, or vital-sign logic. |
| `FDA-DHPN-STEP6` | FDA Digital Health Policy Navigator, Step 6 | Defines CDS question set: patient medical information, recommendations/options, HCP review, and directive/time-critical concerns. | Medical information can include symptoms, test results, clinical practice guidelines, peer-reviewed studies, textbooks, labeling, and government recommendations. | Navigator output is not a formal device determination; not a clinical source for questionnaire content. |
| `ENA-ESI-V5` | Emergency Nurses Association, Emergency Severity Index Handbook, 5th edition | Supports the claim that vitals can change acuity/review concern in ED triage. | ESI includes a decision point for whether vital signs warrant reassessment of acuity; high-risk vital-sign discussion includes HR/RR and SpO2. | ESI is an ED triage framework and assumes trained clinical users. Do not turn it into autonomous kiosk triage without clinical approval. |
| `AHA-HBP-911-2025` | American Heart Association, high-blood-pressure emergency guidance | Supports BP-plus-symptom red-flag questioning. | Very high BP with symptoms such as chest pain, shortness of breath, neurologic weakness/numbness, vision change, or difficulty speaking is treated as an emergency warning context. | Exact wording and local emergency behavior need target-market review. |
| `AHA-HEART-ATTACK-2024` | American Heart Association, heart attack warning signs | Supports chest-pain and cardiopulmonary warning-sign question families. | Chest discomfort, upper-body discomfort, shortness of breath, cold sweat, nausea, rapid/irregular heartbeat, unusual tiredness, and lightheadedness are warning-sign families. | Does not decide diagnosis, EKG interpretation, or triage level. |
| `AHA-ACS-2024` | American Heart Association, acute coronary syndrome overview | Supports urgent review framing for chest pain and related symptoms. | ACS can involve chest discomfort, radiation to neck/jaw/shoulder/arm/stomach/back, shortness of breath, dizziness/lightheadedness, nausea, and sweating; suspected ACS requires immediate medical help. | Do not use as a complete chest-pain pathway. |
| `CDC-FLU-WARN-2024` | CDC, flu signs/symptoms and emergency warning signs | Supports fever/respiratory red-flag question families. | Emergency warning signs include breathing difficulty, chest/abdominal pain or pressure, persistent dizziness/confusion/inability to arouse, seizure, not urinating, severe weakness, or worsening chronic condition. | Flu page is useful for public-health warning signs, not for all-cause fever triage. |
| `ADA-HYPO-SX` | American Diabetes Association, hypoglycemia symptoms and treatment | Supports low-glucose or diabetes branch symptom questions. | Low blood glucose symptoms can include shakiness, anxiety, sweating/chills, confusion, fast heartbeat, lightheadedness/dizziness, hunger, nausea, sleepiness, weakness, or low energy. | General patient education source; product threshold and routing need clinician sign-off. |
| `ADA-SEVERE-HYPO` | American Diabetes Association, severe hypoglycemia | Supports emergency-review concern for severe glucose-related symptoms. | Severe hypoglycemia is an emergency context; confusion, loss of consciousness, extreme weakness, seizure, and coma are severe warning signs. | Do not generate self-treatment instructions in kiosk demo without review. |
| `ADA-HYPER-SX` | American Diabetes Association, hyperglycemia | Supports high-glucose branch symptom families. | Hyperglycemia can be serious; ketoacidosis warning symptoms include shortness of breath, fruity breath, nausea/vomiting, and very dry mouth. | Source does not establish iMVS-specific glucose triage rule. |
| `AUA-RUTI-2025` | American Urological Association recurrent uncomplicated UTI guideline | Supports urinary-symptom source-family routing and exclusion of systemic illness from uncomplicated UTI framing. | Fever and flank pain are relevant systemic/upper-tract concern signals in urinary symptom context. | rUTI guideline is not an all-patient ED triage guideline; exact branch needs urology/emergency review. |
| `LOCAL-PROTOCOL-TBD` | Hospital / company / clinician protocol | Final authority for demo threshold, output wording, and workflow behavior. | Local reviewer can decide whether a branch says "staff review suggested" or uses softer wording. | Not yet provided. Must not be invented. |

## Data Field Registry V0

| iMVS-like field | Clinical meaning for demo | Parser / adapter rule | Governance rule |
| --- | --- | --- | --- |
| `NBP` | Non-invasive blood pressure. | Parse systolic/diastolic as numbers plus unit; preserve original string in summary. | Very high BP should not by itself become diagnosis; pair with symptom questions and clinician-review wording. |
| `SPO2` | Oxygen saturation. | Parse percentage; handle missing optional field. | Concerning SpO2 should prioritize respiratory/cardiopulmonary questions; exact threshold needs sign-off. |
| `HR` | Heart rate, likely measured with BP or SpO2 device depending iMVS config. | Parse bpm; tolerate API typo-like unit strings. | Use as instability context with symptoms/other vitals; not standalone decision rule. |
| `Temp` | Body temperature. | Parse Celsius/Fahrenheit if specified; preserve unit. | Route fever/hypothermia context toward infection/systemic-risk questions only after threshold review. |
| `Glucose` | Optional point-of-care glucose. | Treat as optional; parse value and unit; show unavailable if absent. | Do not assume availability; glucose branch requires device and clinician sign-off. |
| `Height` / `Weight` / `BMI` | Anthropometric context. | Parse numeric values and units; compute BMI only if source fields and units are clean. | Context/summary only in v0 unless a specialty module has approved logic. |

## Example Flow 1 - Chest Pain With High BP Or Low SpO2

### Use Case

This flow illustrates how vitals can shorten a generic intake and prioritize
clinician-review signals.

### Synthetic Input

```json
{
  "CHART_NO": "DEMO-001",
  "SAVE_DATETIME": "2026-05-15 09:20:00",
  "STATION_NAME": "iMVS-DEMO",
  "NBP": {
    "Systolic": "188",
    "Diastolic": "122",
    "Unit": "mmHg"
  },
  "SPO2": {
    "Value": "91",
    "Unit": "%"
  },
  "HR": {
    "Value": "112",
    "Unit": "bpm"
  },
  "Temp": {
    "Value": "36.8",
    "Unit": "C"
  },
  "Glucose": null,
  "Height": {
    "Value": "172",
    "Unit": "cm"
  },
  "Weight": {
    "Value": "78",
    "Unit": "kg"
  }
}
```

### Patient Input

```text
Chief concern: chest pressure
Duration: started this morning
```

### Question Routing

| Step | Question / prompt | Trigger | Source row | Evidence status | Output effect |
| --- | --- | --- | --- | --- | --- |
| 1 | "Are you having chest pain or pressure right now?" | Chief concern includes chest pressure. | `AHA-HEART-ATTACK-2024`, `AHA-ACS-2024` | `source-backed` | Confirms active cardiopulmonary complaint. |
| 2 | "Does the discomfort spread to your arm, shoulder, back, neck, jaw, stomach, or upper body?" | Chest complaint. | `AHA-HEART-ATTACK-2024`, `AHA-ACS-2024` | `source-backed` | Adds warning-sign context to summary. |
| 3 | "Are you short of breath?" | Chest complaint plus low SpO2 context. | `AHA-HEART-ATTACK-2024`, `CDC-FLU-WARN-2024`, `ENA-ESI-V5` | `source-backed` family | Raises clinician-review signal. |
| 4 | "Do you feel weak, numb, lightheaded, confused, sweaty, or unusually tired?" | Very high BP / HR / cardiopulmonary symptom context. | `AHA-HBP-911-2025`, `AHA-HEART-ATTACK-2024`, `ENA-ESI-V5` | `source-backed` family | Adds red-flag positives/negatives. |
| 5 | "Did this start suddenly, get worse, or happen at rest?" | Chest complaint severity framing. | `AHA-ACS-2024` | `source-backed` family | Captures escalation context without diagnosing. |
| 6 | "Please wait for staff review before leaving the kiosk area." | Red-flag vital + symptom combination. | `LOCAL-PROTOCOL-TBD` plus source families above. | `clinician-signoff-needed` | Must be approved wording. |

### Demo Summary Output

```text
Triage-support summary - demo only

Measured context:
- BP 188/122 mmHg; repeat / local protocol review needed.
- SpO2 91%; oxygenation context should be reviewed.
- HR 112 bpm.
- Temp 36.8 C.

Patient-reported concern:
- Chest pressure since this morning.
- Follow-up answers: [demo responses inserted here].

Review signals:
- Chest pressure plus very high BP and low SpO2 created a source-governed
  cardiopulmonary red-flag question path.
- Source families used: AHA high-BP emergency guidance, AHA heart
  attack/ACS warning signs, ENA ESI high-risk vital-sign framing.

Suggested workflow:
- Staff review suggested before patient leaves the kiosk area.
- This is not a diagnosis, treatment recommendation, or final triage level.
```

### What This Flow Can Claim

- Vitals changed question priority.
- The flow asked fewer generic questions and prioritized cardiopulmonary red
  flags.
- The summary preserved reviewability by showing measured vitals, patient
  answers, and source families.

### What This Flow Cannot Claim Yet

- It cannot assign an ESI level.
- It cannot diagnose ACS, stroke, hypertensive emergency, PE, or respiratory
  failure.
- It cannot tell the patient what treatment to take.
- It cannot use exact BP/SpO2/HR thresholds as product rules until reviewed.

## Example Flow 2 - Fever With Urinary Or Respiratory Symptoms

### Use Case

This flow illustrates how temperature can choose between routine symptom intake
and systemic-risk review questions.

### Synthetic Input

```json
{
  "CHART_NO": "DEMO-002",
  "SAVE_DATETIME": "2026-05-15 09:35:00",
  "STATION_NAME": "iMVS-DEMO",
  "NBP": {
    "Systolic": "102",
    "Diastolic": "66",
    "Unit": "mmHg"
  },
  "SPO2": {
    "Value": "96",
    "Unit": "%"
  },
  "HR": {
    "Value": "108",
    "Unit": "bpm"
  },
  "Temp": {
    "Value": "38.7",
    "Unit": "C"
  },
  "Glucose": null
}
```

### Patient Input

```text
Chief concern: fever and painful urination
Duration: 2 days
```

### Question Routing

| Step | Question / prompt | Trigger | Source row | Evidence status | Output effect |
| --- | --- | --- | --- | --- | --- |
| 1 | "How long have you had fever or chills?" | Elevated temperature / fever complaint. | `CDC-FLU-WARN-2024`, local infection protocol needed. | `source-family hypothesis` | Establishes duration and trend. |
| 2 | "Do you have pain or burning when urinating, urinary urgency, or frequent urination?" | Urinary complaint. | `AUA-RUTI-2025` | `source-family hypothesis` | Confirms urinary symptom branch. |
| 3 | "Do you have back or flank pain, vomiting, severe weakness, dizziness, or confusion?" | Fever plus urinary symptoms. | `AUA-RUTI-2025`, `CDC-FLU-WARN-2024` | `source-family hypothesis` | Identifies systemic/upper-tract concern signals. |
| 4 | "Are you short of breath, coughing, or having chest pain?" | Fever can also be respiratory/systemic context. | `CDC-FLU-WARN-2024`, respiratory source to verify. | `source-backed` warning-sign family | Keeps respiratory warning signs visible. |
| 5 | "Are you urinating less than usual or unable to keep fluids down?" | Fever, possible dehydration/systemic illness. | `CDC-FLU-WARN-2024` | `source-backed` warning-sign family | Adds dehydration / review signal. |
| 6 | "This summary should be reviewed by staff because fever is paired with urinary/systemic symptoms." | Fever plus urinary symptoms plus possible systemic signal. | `LOCAL-PROTOCOL-TBD` | `clinician-signoff-needed` | Needs approved wording. |

### Demo Summary Output

```text
Triage-support summary - demo only

Measured context:
- Temp 38.7 C.
- HR 108 bpm.
- BP 102/66 mmHg.
- SpO2 96%.

Patient-reported concern:
- Fever and painful urination for 2 days.
- Follow-up answers: [demo responses inserted here].

Review signals:
- Fever plus urinary symptoms caused the question router to ask about flank
  pain, vomiting, severe weakness, dizziness/confusion, respiratory symptoms,
  and hydration/urination.
- Source families used: CDC emergency warning signs, AUA urinary-symptom
  source family, local clinician protocol pending.

Suggested workflow:
- Staff review wording requires company / clinician sign-off.
- This is not a diagnosis of UTI, pyelonephritis, sepsis, or any other disease.
```

### What This Flow Can Claim

- Temperature can route the intake toward infection/systemic-risk questions.
- The urinary branch can ask about flank pain and systemic symptoms as a review
  signal.
- CDC-style emergency warning signs help structure fever/respiratory/dehydration
  review questions.

### What This Flow Cannot Claim Yet

- It cannot diagnose UTI, pyelonephritis, sepsis, influenza, or pneumonia.
- It cannot decide antibiotic need.
- It cannot define exact fever or HR thresholds without clinical protocol.
- It cannot replace local hospital triage policy.

## Source Registry Gaps To Close

Before the artifact becomes customer-facing:

1. Confirm whether ESI may be named directly in a company demo or should be
   described generically as an emergency-triage framework.
2. Extract exact source passages for:
   - SpO2 and respiratory distress;
   - adult HR/RR/vital reassessment;
   - fever plus urinary/flank pain;
   - glucose abnormality plus altered mental status / severe weakness.
3. Decide whether thresholds are shown to customers or kept internal.
4. Decide whether patient-facing wording can say "staff review suggested" or
   must say "please wait for staff."
5. Get a named clinical reviewer for every source-backed example row.

## Proposed Review Checklist

For each future patient-facing question:

| Field | Required before customer-facing use |
| --- | --- |
| `question_id` | Stable ID. |
| `patient_text` | Plain English text. |
| `trigger_vital` | Which measured field activates or prioritizes it. |
| `trigger_symptom` | Which patient complaint activates it. |
| `source_id` | Registry source row. |
| `source_version_or_date` | Publication / review date / version. |
| `source_support_summary` | One-sentence paraphrase of source support. |
| `clinical_purpose` | Why the question is asked. |
| `output_effect` | What changes in the summary, not treatment. |
| `review_owner` | Clinician / company owner. |
| `evidence_status` | `source-backed`, `source-family hypothesis`, `clinician-signoff-needed`, or `demo-only`. |
| `demo_allowed` | Yes/no. |

## Bottom Line

The Friday discussion can now be framed as a reviewable system:

```text
iMVS measured field
-> parser / adapter
-> symptom context
-> source registry row
-> follow-up question
-> clinician-review summary
-> sign-off owner
```

That is the rigorous path between "we have vital signs" and "vital signs change
AI triage questioning" without overclaiming diagnosis or regulatory clearance.

