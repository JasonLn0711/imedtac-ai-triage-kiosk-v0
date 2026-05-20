# imedtac Need-Fit Meeting Execution Plan

Date: 2026-05-15 Friday meeting prep
Meeting: `AI triage 可行性討論`, `13:00-14:00 Asia/Taipei`
Purpose: keep the Friday discussion aligned to 慧誠智醫's explicit need while
using `510(k)` and Prof. Wu's GPT product-design DOCX only as supporting
material.

## One-Line Meeting Goal

Help 慧誠 decide whether the June demo should be a vital-aware, English,
kiosk-adjacent triage-support workflow, and identify the minimum technical,
clinical, and source-governance decisions needed to move from research answer
to demo execution.

## 2026-05-14 Attendee Role Update - 多寶醫師

Jason will invite 多寶醫師 to the Friday `2026-05-15 13:00-14:00` meeting.
Use his participation for clinical feasibility calibration, not as formal
clinical sign-off.

多寶醫師's requested role:

1. Explain whether the proposed modular method can plausibly extend across
   specialties from a physician workflow perspective.
2. Evaluate whether Prof. Wu's GPT-suggested `家醫科 / 一般內科` entry point is
   a more feasible first demo frame than claiming broad all-specialty clinical
   coverage.
3. Identify which first clinical frame is more defensible for a June demo:
   `家醫科 / 一般內科`, urgent-care-style internal medicine, emergency-triage
   support, or another bounded scope.
4. Name the clinical review gaps that must stay unresolved after Friday:
   threshold validation, red-flag wording, output label, review owner, and
   specialty-module roadmap.

Jason's current pre-meeting hypothesis is that the `家醫科 / 一般內科` frame has
higher feasibility than a direct all-specialty promise, because it matches the
kiosk's general vital-sign measurements and keeps the demo broad enough for
慧誠 while still bounded enough for source governance. This is a hypothesis to
ask 多寶醫師 to confirm, revise, or reject.

## What 慧誠 Actually Asked For

From the `2026-05-12` company follow-up and later Friday scheduling context,
慧誠's explicit need is not a broad regulatory review. They asked for:

| 慧誠 need | What we should answer Friday | What not to lead with |
| --- | --- | --- |
| All-specialty triage method | Use one shared intake / router / source registry core, then add specialty modules. | Do not claim complete all-specialty coverage is already built. |
| Vital-sign integration | Show how BP, SpO2, Temp, HR, respiration, BMI, and optional glucose change question priority and review summary emphasis. | Do not present unvalidated thresholds as final clinical rules. |
| AI model integration | Split ASR, symptom normalization, retrieval / source registry, rule routing, and LLM summary roles. | Do not make the LLM the autonomous triage decision-maker. |
| FDA or medical-society examples | Use FDA for intended-use / CDS boundary, and use ESI / AHA / CDC / ADA / AUA / local protocol for question families and vital-impact examples. | Do not treat FDA as the symptom questionnaire source. |
| June customer demo feasibility | Propose a safe v0: English symptom intake plus synthetic or API-shaped vital context plus clinician-review summary. | Do not promise production HIS / EMR writeback, real patient data, or FDA-cleared behavior. |

## How `510(k)` And Prof. Wu's GPT DOCX Fit

Use this order in the meeting:

```text
慧誠 explicit questions
-> Friday architecture / vital-impact answer
-> source-governance boundary
-> optional 510(k) product-scope discipline
-> optional GPT DOCX design hypothesis
```

Do not use this order:

```text
510(k) findings
-> GPT product design
-> then try to fit 慧誠 afterward
```

The supporting roles are:

| Material | Best use | Limit |
| --- | --- | --- |
| `510(k)` scan | Product-scope discipline: intended use, function boundary, predicate/comparator language, safe claims. | It does not tell us the full question set or exact vital thresholds. |
| Prof. Wu GPT DOCX | Product-design hypothesis: family medicine / general internal medicine, 10-question intake, LLM + rule-engine split, four review levels. | GPT output is not clinical authority; thresholds need source mapping and clinician sign-off. |
| 多寶 clinical calibration | Medical plausibility check: explain all-specialty feasibility and judge whether the `家醫科 / 一般內科` entry point is the more feasible first demo frame. | Informal clinical input; still needs formal owner for threshold/output wording. |
| 慧誠 iMVS materials | Technical fit: kiosk workflow, measured fields, API-shaped payload, web-service insertion point. | They do not by themselves validate triage logic. |

## Recommended Friday Position

Say this early:

> We should treat the June version as a market / product capability demo: English
> symptom intake, vital-sign-aware question routing, and clinician-review
> summary. The demo should show how iMVS measured data makes the triage workflow
> more useful than a generic chatbot, while staying clearly outside diagnosis,
> autonomous acuity decision, and production HIS / EMR writeback.

This answers 慧誠's business need without overclaiming clinical readiness.

## 60-Second Opening Script

> I organized the initial answer around your three questions: modular
> all-specialty triage, physiological-data integration, and which FDA or
> medical-society sources can support the logic. My recommendation is to build
> one shared intake and routing core, then attach specialty modules. The vital
> signs from iMVS should enter after measurement and change question priority,
> red-flag prompts, and the clinician-review summary. For the June demo, I
> would keep the output as triage support and staff/clinician review summary,
> not diagnosis or an autonomous triage level. FDA and `510(k)` materials help
> control intended-use language; clinical question logic still needs ESI,
> medical-society, public-health, or local protocol support.

## 20-Minute Core Flow

Use this if time is tight or if the meeting starts drifting.

| Time | Segment | What to say | Desired decision |
| --- | --- | --- | --- |
| 0-2 min | Confirm need | "I will answer the three items from your follow-up: modular method, vital integration, source examples." | Confirm scope. |
| 2-6 min | Architecture | "The AI layer should start after iMVS measurement, using an API-shaped vital payload." | Agree insertion point: after measurement. |
| 6-10 min | Modular method | "All specialties share intake, vital adapter, router, source registry, and summary; modules add scoped question rows." Ask 多寶醫師 to comment on clinical feasibility. | Agree modular architecture and clinical caveat. |
| 10-15 min | Vital impact | "Vitals change question priority and summary emphasis, not final diagnosis." | Agree vital-aware behavior. |
| 15-18 min | First demo frame | "My current hypothesis is that `家醫科 / 一般內科` is a safer first frame than claiming all-specialty coverage. 多寶醫師, does that match clinical workflow reality?" | Decide whether to use family medicine / general internal medicine as first June frame. |
| 18-20 min | Minimum asks | Ask target SKU, guaranteed fields, synthetic payload permission, output wording owner, and whether June needs a clickable demo next. | Decide next work package. |

## 60-Minute Full Flow

Use this if the meeting runs the full hour.

| Time | Segment | Output |
| --- | --- | --- |
| 0-5 min | Restate 慧誠 need and June business goal. | Everyone agrees this is a June market demo / capability demo, not production clinical triage. |
| 5-12 min | Current iMVS insertion point. | AI starts after measurement; live HIS / EMR writeback is out of v0. |
| 12-22 min | All-specialty modular architecture. | Shared core plus specialty modules; no one huge prompt. |
| 22-30 min | 多寶醫師 clinical feasibility check. | Clarify whether all-specialty should stay a roadmap and whether `家醫科 / 一般內科` is the first credible demo frame. |
| 30-40 min | Vital-to-question matrix. | BP, SpO2, Temp, HR, respiration, BMI, optional glucose each get a demo-safe role. |
| 40-47 min | Source-governance strategy. | FDA boundary vs medical-society / ESI / local protocol question logic. |
| 47-50 min | June demo options. | Choose memo only, clickable mock, or kiosk-adjacent embedded/link-out demo. |
| 50-57 min | Decision questions. | Target device, fields, synthetic payload, output wording, sign-off owner. |
| 57-60 min | Close. | Confirm next artifact and owner list. |

## Need-Fit Talking Points

### 1. If 慧誠 asks: "Can this cover all specialties?"

Answer:

> Architecturally yes, but clinically not all at once. The practical approach is
> a shared intake and routing core with specialty modules. For June, we should
> demonstrate the method with one or two high-value modules, probably emergency
> / internal-medicine-style fever/respiratory/chest-pain flows, because vital
> signs matter most there.

Avoid:

```text
We already have all-specialty triage.
```

Ask 多寶醫師 directly:

> From a physician workflow perspective, is `家醫科 / 一般內科` the more feasible
> first demo frame, with all-specialty coverage presented as a modular roadmap?
> Or should the first frame be emergency / urgent-care triage support instead?

### 2. If 慧誠 asks: "How do vital signs change AI triage?"

Answer:

> Vitals should affect three things: which question is asked next, what gets
> highlighted in the clinician summary, and whether the patient should be kept
> for staff review in the demo workflow. In v0, vitals should not independently
> produce diagnosis, treatment advice, or final emergency level.

Use examples:

| Vital context | Question priority change |
| --- | --- |
| High BP plus chest symptoms | Ask chest pain, shortness of breath, neuro/vision/speech warning signs earlier. |
| Low SpO2 plus cough or dyspnea | Ask respiratory distress and chest-pain questions earlier. |
| Fever plus HR/RR concern | Ask infection, respiratory, urinary, dehydration, and confusion/weakness questions earlier. |
| BMI / height / weight | Add chronic/metabolic context to summary; do not use as urgent trigger alone. |

### 3. If 慧誠 asks: "Can we use FDA examples?"

Answer:

> Yes, but FDA is mainly for intended-use, CDS boundary, transparency, software
> risk, and product-scope language. For the actual symptom questions and vital
> red flags, we should use medical-society, emergency-medicine, public-health,
> or local clinical protocol sources.

Then mention:

- FDA / `510(k)`: intended-use and product boundary.
- ESI / emergency medicine: vitals affecting acuity or review concern.
- AHA: high BP and chest/cardiovascular warning signs.
- CDC: fever/respiratory emergency warning signs.
- ADA: glucose-related symptoms if glucose is available.
- AUA / local protocol: urinary branch if needed.

### 4. If 慧誠 asks: "Can we demo this in June?"

Answer:

> Yes, if we keep the demo as a controlled capability demonstration: synthetic
> or API-shaped vital values, English question flow, source-labeled routing
> examples, and clinician-review summary. It should not use real patient data,
> not write to production HIS / EMR, and not claim final clinical triage.

Offer three v0 options:

| Option | Fit | Risk |
| --- | --- | --- |
| Memo / slide only | Fastest for Friday and internal alignment. | Not enough for customer demo. |
| Clickable mock with synthetic vitals | Best next step for June capability story. | Needs UI/output wording review. |
| Kiosk-adjacent link / iframe / mock API handoff | Best product fit if 慧誠 can provide target device and integration mode. | Needs technical coordination and test device access. |

## Minimum Decisions To Get From Friday

Do not leave the meeting without trying to answer these:

1. What is the June demo target: memo, clickable mock, or kiosk-adjacent demo?
2. Which iMVS SKU / OS / runtime is the target?
3. Which fields are guaranteed: BP, SpO2, HR, respiration, Temp, Height,
   Weight, BMI, Glucose?
4. Can v0 use synthetic iMVS-shaped values?
5. What output wording is acceptable: `triage-support summary`,
   `staff-review suggestion`, `recommended care level`, or another phrase?
6. Who signs off on clinical source family, thresholds, and red-flag wording?
7. Is there a US partner/customer product, competitor, or `510(k)` reference
   that they want us to compare against?

## What To Bring Into The Meeting

Primary:

- `handoff/2026-05-15-friday-discussion-brief.md`
- the five-slide outline inside that file;
- the vital-to-question table from `handoff/2026-05-15-vital-aware-triage-feasibility-source-governance.md`;
- 多寶 calibration notes from `source/2026-05-13-duobao-line-imedtac-vital-sign-triage/source.md`.

Supplemental only if asked:

- `510(k)` comparator scan template from
  `handoff/2026-05-15-source-registry-and-example-flows.md`;
- Prof. Wu GPT product-design source packet:
  `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/source.md`;
- first-principles gap audit:
  `handoff/2026-05-15-first-principles-gap-audit-and-action-plan.md`;
- reviewer packet under `handoff/reviewer-packet/`.

## Safe And Unsafe Language

Use:

- "vital-aware intake workflow"
- "triage-support summary"
- "staff / clinician review"
- "source-governed question routing"
- "demo-only synthetic vital payload"
- "market / product capability demo"
- "requires clinical sign-off before production"

Avoid:

- "diagnosis"
- "AI decides emergency level"
- "FDA-approved"
- "FDA-cleared"
- "`510(k)`-cleared demo"
- "predicate-equivalent"
- "clinical-grade triage"
- "automatic ED referral"
- "production HIS / EMR writeback"

## After-Meeting Outputs

The next artifact depends on what 慧誠 decides:

| Friday decision | Next output |
| --- | --- |
| They want only research alignment. | Clean up the Friday brief into a shareable memo. |
| They want a June clickable demo. | Create `demo/` implementation plan with synthetic iMVS payload, two flows, and safe output wording. |
| They want kiosk integration. | Create an integration spec: target SKU, OS/browser, link/iframe/API handoff, payload shape, no-writeback boundary. |
| They ask about FDA / US customer positioning. | Fill the `510(k)` comparator scan with the named product/reference. |
| They ask to use GPT DOCX thresholds. | Convert each threshold into registry candidate rows and mark every row `clinician-signoff-needed`. |
| They want all-specialty coverage. | Define module roadmap, but commit only to 1-2 demo modules first. |

## Bottom Line

The Friday meeting should land one practical decision:

```text
Are we building a June demo that shows iMVS vital signs can drive safer,
source-governed English symptom intake and clinician-review summaries?
```

If yes, the next engineering step is a small controlled clickable demo with
synthetic iMVS-shaped vitals and two source-governed flows, not a broad
production AI triage system.
