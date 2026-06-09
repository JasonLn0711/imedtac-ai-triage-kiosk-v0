# Architecture Insertion And Clinical Grounding

## Core Correction

The urgent question is not "how do we put AI into the kiosk."

The urgent question is:

> Where is the right insertion point for AI triage inside 慧誠智醫's existing
> vital-sign measurement and hospital-integration workflow?

慧誠智醫 is best treated as a medical device integration and hospital workflow
company:

- kiosk hardware,
- medical device integration,
- middleware / gateway,
- HIS / EMR / FHIR integration,
- deployment,
- hospital integration.

AI is a new capability layer on top of that system. The product question is not
chatbot design. It is AI triage product architecture.

## What We Are Building Toward

The target is **AI-assisted intake + triage workflow**, not diagnosis.

The sellable product story is closer to:

```text
patient arrives
-> vital signs are measured
-> AI asks symptom questions
-> AI dynamically follows up
-> AI produces a structured summary
-> nurse / clinician reviews quickly
```

It is not:

```text
AI tells the patient what disease they have
```

That distinction changes the regulatory, clinical, product, and sales boundary.

## Existing Workflow Hypothesis

慧誠 already has a measurement-centered workflow:

```mermaid
flowchart TD
  A[Patient login / identity] --> B[Vital sign measurement]
  B --> C[BP / SpO2 / Temp / Height / Weight]
  C --> D[Gateway / Middleware]
  D --> E[Web service UI]
  D --> F[RESTful API]
  F --> G[FHIR / HIS / EMR path]
  E --> H[Measurement summary]
```

The first design task is to understand this workflow precisely enough to insert
AI without breaking the product.

## Company-Provided iMVS Hardware And Unit Baseline

慧誠智醫 already provided an iMVS product-spec and API baseline on
`2026-05-12`. The canonical extraction is
`docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md`.

The baseline matters because the AI adapter should begin from imedtac's known
measurement station shape, not from a generic vital-sign schema.

Company-provided measurement modules:

| Module | Company-provided baseline | Adapter role |
| --- | --- | --- |
| Blood pressure / pulse | A&D TM2657; blood pressure display range `0-299 mmHg`; pulse `40-180/min`; blood pressure accuracy `+/- 3 mmHg`; pulse accuracy `+/- 5%`. | `NBP` maps to systolic/diastolic blood pressure; `HR.BP_Value` maps to heart-rate context. |
| Body temperature | Rossmax HC700 BT; display range `34.4 C - 42.2 C`; Bluetooth transmission. | `Temp` maps to `temperature_c` and infection/fever-context question routing. |
| Blood oxygen | Optional Rossmax SB-210 in the product spec; API sample includes `SPO2`. | `SPO2` maps to `spo2_percent`; confirm target SKU before treating it as guaranteed. |
| Height / weight | Nagata height/weight sensors; height range `10-300 cm`; weight range `100 g - 200 kg`. | `Height` and `Weight` map to context fields; BMI is derived only when both are present. |
| Blood glucose | Optional Rossmax HT-100B in the product spec; API sample includes `Glucose`. | `Glucose` maps to `glucose_mg_dl`; keep diabetes/metabolic branch optional until device availability is confirmed. |

Company-provided Vital Sign Upload API units:

| API object | Source unit | Normalized runtime field |
| --- | --- | --- |
| `NBP.SYS_Value`, `NBP.DIA_Value` | `mmHg` | `blood_pressure_systolic_mm_hg`, `blood_pressure_diastolic_mm_hg` |
| `SPO2.Value` | `%` | `spo2_percent` |
| `HR.BP_Value` | `bpm` | `heart_rate_bpm` |
| `Temp.Value` | `deg C` / source sample `°C` | `temperature_c` |
| `Glucose.Value` | `mg/dL` | `glucose_mg_dl` |
| `Weight.Value` | `kg` | `weight_kg` |
| `Height.Value` | `cm` | `height_cm` |

The June design should preserve these units explicitly in payloads and staff
review summaries. The open 5/21 engineering confirmation is narrower: whether
the current demo device and current Vital Upload implementation still match the
V1.4 field names, which modules are guaranteed, and how missing/failed/quality
states are represented.

## Preferred Insertion Point

The most plausible v0 insertion point is **after measurement completes**.

```text
login
-> measure BP / SpO2 / temperature / height / weight
-> AI triage starts with vital context
-> dynamic symptom questioning
-> structured triage-support summary
-> nurse / physician review
-> future HIS / EMR handoff
```

This is safer and more product-aligned than starting with AI before measurement,
because it uses the company's differentiating asset: real measured vital signs.

## 2026-06-08 Dynamic Backend Decision

The dynamic triage engine should sit behind the NYCU / cloud backend API, not
inside the imedtac frontend. This preserves the strongest product split:

```text
imedtac iMVS frontend
-> stable HTTPS session API
-> NYCU dynamic triage engine
   -> versioned question manifest
   -> answer effects and derived flags
   -> deterministic routing policy
   -> optional AI candidate retrieval / reranking
   -> manifest safety gate
   -> staff-review summary assembler
```

The frontend continues to render typed questions, collect selected option ids,
and show `staff_review_summary`. The backend owns routing state, reason codes,
candidate traces, AI support, fallback behavior, and summary assembly. This
keeps the demo visibly adaptive while avoiding a frontend rewrite or a silent
change to the externally communicated endpoint structure.

The current implemented slice is deterministic v0.3 routing for the
tachycardia live-demo lane. AI retrieval / reranking remains the next support
layer and must stay candidate-only: the final next-question decision remains
reviewed manifest plus deterministic policy.

```mermaid
flowchart TD
  A[Patient Login] --> B[Vital Sign Measurement]
  B --> C[Vital Signal API]
  C --> D[AI Triage Engine]
  E[Symptom Input<br/>Voice or Touch] --> D
  D --> F[Dynamic Questioning]
  F --> G[Clinical Evidence Mapping]
  G --> H[Structured Summary]
  H --> I[Nurse / Physician]
```

## Vital-Aware Dynamic Triage

The differentiator is not a generic symptom chatbot. It is:

> vital-aware dynamic questioning

Many symptom checkers only use text. 慧誠 has vital-sign devices. The demo should
show that BP, SpO2, temperature, BMI, and similar measurements can change the
question path and the urgency framing.

```mermaid
flowchart TD
  A[Patient Login] --> B[Vital Measurement]

  B --> C[BP]
  B --> D[SpO2]
  B --> E[Temperature]
  B --> F[Height / Weight]

  C --> G[Triage AI Engine]
  D --> G
  E --> G
  F --> G

  H[Patient Speech / ASR / Touch Input] --> G

  G --> I[Dynamic Question Selection]
  I --> J[Patient Answers]
  J --> G

  G --> K[Triage Support Summary]
  K --> L[Nurse Review]
  K --> M[Doctor Review]
  K --> N[Future FHIR / HIS / EMR Handoff]
```

Example design intuition:

| Scenario | Vital context | Questioning impact |
| --- | --- | --- |
| Chest pain with normal SpO2, normal BP, stable HR | lower immediate physiologic alarm | ask duration, radiation, exertion, medication, reflux/anxiety-like context, and red flags |
| Chest pain with low SpO2, hypotension, abnormal temperature, or severe distress | higher escalation concern | shorten questioning, alert staff, ask emergency red flags, consider ECG / immediate clinician review path |
| Fever with abnormal vitals | infection / systemic risk concern | ask infectious symptoms, duration, risk factors, dehydration, respiratory or urinary symptoms |
| Urinary symptom with fever or flank pain | possible upper-tract / systemic concern | escalate from simple symptom intake to clinician review path |

These examples are not clinical rules yet. They are product architecture
examples that require source-backed clinical evidence mapping before product
claims.

## Clinical Grounding

The next core work is not coding. It is clinical evidence mapping.

The workflow is:

```text
symptom
-> clinical guideline / authority source
-> triage logic
-> questioning flow
-> escalation criteria
-> structured summary
```

The important product question is:

> Why are we asking this question, and what source supports it?

This becomes a question provenance system.

## FDA Boundary

Do not treat FDA as the source of the symptom questionnaire.

FDA is more likely to matter for:

- intended use,
- software risk,
- validation,
- cybersecurity,
- quality system expectations,
- clinical evidence and safety claims.

The symptom / triage logic will often need to come from specialty and clinical
sources such as:

- AHA / ACC for cardiovascular contexts,
- ACEP / emergency medicine triage sources,
- ESI / Emergency Severity Index materials,
- CDC guidance when relevant,
- AUA / EAU for urology contexts,
- NICE or other jurisdiction-specific clinical guidance,
- hospital / company-provided protocols,
- clinician-approved local workflows.

This repo must not cite exact guideline clauses until the source has been
verified and recorded. The task is to build traceable clinical grounding, not to
invent medical logic.

## Question Provenance Template

Every production-facing question should eventually have metadata like this:

| Field | Meaning |
| --- | --- |
| `question_id` | Stable internal identifier |
| `question_text` | Patient-facing question |
| `symptom_context` | Symptom or branch where the question appears |
| `vital_trigger` | Vital-sign condition that makes the question relevant |
| `source_name` | Guideline / protocol / authority source |
| `source_version` | Year, version, or publication identifier |
| `source_excerpt_or_clause` | Exact support text, after source verification |
| `clinical_purpose` | Why the question is asked |
| `escalation_effect` | How the answer can affect triage support |
| `review_owner` | Clinician / company / academic reviewer |
| `status` | draft, source-verified, clinician-reviewed, demo-only, retired |

Example row shape:

| Question | Trigger | Source | Purpose | Status |
| --- | --- | --- | --- | --- |
| Do you have chest pain radiating to your arm, jaw, back, or shoulder? | chest pain plus cardiovascular concern | source to verify, likely cardiovascular / emergency medicine guideline family | cardiac risk screening | draft, not source-verified |
| Do you feel short of breath? | chest pain, low SpO2, respiratory complaint, or distress | source to verify, likely emergency / respiratory guideline family | respiratory or cardiopulmonary escalation screening | draft, not source-verified |
| Do you have fever with flank pain or urinary symptoms? | urinary symptoms plus temperature elevation | source to verify, likely urology / infectious disease guideline family | identify possible complicated urinary condition requiring review | draft, not source-verified |

## Vital-To-Question Impact Table

The demo needs a simple, source-governed way to show how vital signs influence
question flow.

| Vital signal | Potential impact on question flow | Clinical evidence status |
| --- | --- | --- |
| Low SpO2 | respiratory / cardiopulmonary escalation branch; shorten low-risk questioning | source mapping required |
| High or low BP | cardiovascular risk branch; ask chest pain, neuro symptoms, distress, medication context | source mapping required |
| Fever / abnormal temperature | infection branch; ask duration, source symptoms, systemic warning signs | source mapping required |
| BMI / height / weight | metabolic and risk-context questions, not immediate standalone triage claim | source mapping required |
| Heart rate, if available | live-performable tachycardia / palpitation branch; ask current heart-racing feeling, chest tightness, warning-symptom family, rhythm-history / medication context, then generate staff-review summary | `AHA-TACHYCARDIA-FAST-HR`, `AHA-HEART-ATTACK`, `MEDLINEPLUS-AFIB`, and `ENA-ESI-V5` now support demo question-family mapping; exact thresholds and stop rules still require clinician/company signoff |

## MVP Scope Guardrail

Scope explosion risk is high: ASR, multilingual, all-specialty logic, FDA,
FHIR, HIS, dynamic triage, cloud, local CPU, and vital fusion can all expand at
once.

The first version should be deliberately narrow:

- English only,
- urgent-care lite,
- one kiosk workflow,
- CPU-only by default,
- touch input for June; ASR stays a later expansion path,
- limited vital-sign set,
- small symptom-category set,
- no diagnosis,
- no autonomous medical decision,
- dynamic questioning,
- vital-aware routing,
- structured summary for clinician review.

## Immediate Work Products

1. Product integration diagram:
   - where AI starts;
   - what data it receives;
   - what it returns;
   - whether it writes anywhere.
2. Question-to-source mapping table:
   - symptom;
   - question;
   - vital trigger;
   - source;
   - purpose;
   - evidence status.
3. Vital-to-routing rule sketch:
   - how BP / SpO2 / temperature / BMI affect follow-up questions;
   - what remains demo-only until verified.
4. API boundary:
   - JSON / RESTful payload hypothesis;
   - mocked vital-sign input for demo;
   - no live HIS / EMR write path for v0.

## Key Product Test

慧誠 is not only testing whether the AI works. They are testing whether the team
has product thinking:

- modularity,
- productization,
- multilingual path,
- go-to-market demo discipline,
- integration awareness,
- incremental development,
- clinical and regulatory defensibility.

The repo should therefore prioritize integration architecture, evidence
traceability, and v0 scope control before UI polish or model expansion.
