# Workstream 06 - First-Principles Must-Do Gates

Date: 2026-05-12  
Status: active risk gate for the Friday / June demo path

## Purpose

This workstream captures the things that are easy to miss if the discussion
starts from "AI triage demo" instead of first principles.

The first-principles question is:

> What must be true for a vital-aware AI kiosk demo to be useful, honest,
> reviewable, and not accidentally unsafe or overclaimed?

The answer is not only "find medical sources." The demo also needs explicit
gates for responsibility, data, measurement reliability, human factors,
validation, cybersecurity, privacy, logging, and change control.

## Non-Negotiable Gates

These gates should be treated as must-do items before any customer-facing or
company-facing demo is described as more than a market capability mock.

| Gate | Must be decided | Why it matters | Current status | Next action |
| --- | --- | --- | --- | --- |
| Intended-use sentence | One sentence that says exactly what v0 is and is not. | Prevents scope creep into diagnosis, treatment, autonomous triage, or device claims. | Drafted but not approved. | Put the sentence in the Friday decision table and ask for explicit agreement. |
| Human responsibility | Who reviews the output and what they are expected to do. | A "clinician-review summary" is meaningless unless the responsible human and workflow are named. | Not yet named. | Ask 慧誠 / Prof. Wu who the review owner is for demo wording and thresholds. |
| Stop / handoff behavior | What happens when a red-flag combination appears. | If the system flags concern but nobody knows what happens next, the workflow is unsafe theater. | Only draft wording exists. | Decide "staff review suggested" vs softer wording and whether patient waits at kiosk. |
| Vital data reliability | Which measurements are guaranteed, optional, stale, missing, or failed. | Bad or missing vitals can create false confidence. | iMVS fields are known, target SKU unknown. | Confirm SKU and guaranteed fields; define missing-value behavior. |
| Source provenance | Every patient-facing question has source family, exact source, purpose, status, and reviewer. | Prevents invented medical logic. | Registry appendix started. | Convert two example flows into structured question registry rows. |
| Demo data boundary | Synthetic only vs real hospital/patient data. | Privacy and integration risk explode if real data enters the demo. | Synthetic recommended. | Get explicit confirmation that v0 uses synthetic payloads only. |
| Logging and retention | What is logged, where, for how long, and whether it contains health info. | Logs can accidentally become PHI or sensitive patient records. | Not defined. | For v0, log only synthetic session IDs and demo responses; no identifiers. |
| Privacy / de-identification | Whether any data is PHI and whether HIPAA-like constraints apply for US-facing demo. | A US customer discussion will likely ask about PHI, retention, and sharing. | Not addressed enough. | Add a privacy slide: no real PHI in v0; future data requires agreement and de-identification method. |
| Cybersecurity / deployment | Whether the demo is standalone, embedded, networked, or connected to hospital systems. | Connected kiosk / hospital integration creates medical-device cybersecurity and hospital IT questions. | Integration mode unknown. | Ask if v0 is browser-only/link-out/same-app/API; no HIS/EMR writeback. |
| Human factors | Whether patients can understand questions, recover from mistakes, and know when staff is involved. | Kiosk users may be older, stressed, symptomatic, or low-literacy. | Not yet specified. | Keep touch-first, simple language, back/confirm, staff-review wording. |
| Clinical validation plan | What counts as evidence that the workflow is good enough for demo, pilot, and product. | Source governance is not validation. | Not yet defined. | Define staged validation: demo review -> clinician tabletop -> retrospective cases -> supervised pilot. |
| Change control | How question logic, thresholds, prompts, and sources can change after review. | AI/ML and prompt changes can silently change behavior. | Not defined. | Freeze v0 flows for demo; require versioned registry changes. |
| Claim boundary | What sales/demo people are allowed to say. | Market language can create regulatory and trust risk even if code is bounded. | Drafted in handoff docs. | Add approved/avoid phrasing to the Friday brief. |

## First-Principles Risk Decomposition

### 1. What Is The Object We Are Building?

Not a diagnosis engine.

Not a final emergency triage assignment.

Not a hospital system integration.

The object is:

```text
Measured vital signs + patient answers
-> source-governed follow-up questions
-> structured review summary for staff/clinician
```

If any stakeholder describes v0 differently, stop and re-align before building.

### 2. What Could Harm The Project?

The main harms are not only medical harms. They include:

- a patient misunderstands demo text as medical advice;
- a staff member assumes AI has already triaged the patient;
- a customer hears "FDA-approved" or "clinical-grade" when that is not true;
- a real patient identifier enters a demo log;
- a threshold appears clinical but has no reviewer;
- an LLM produces inconsistent question routing;
- a source-backed example becomes treated as a validated product rule;
- an integration demo implies HIS/EMR writeback before security review;
- an updated prompt changes behavior after clinician sign-off.

These failure modes require gates, not just better wording.

### 3. Who Is The User?

There are at least four users, and they need different outputs:

| User | Needs | Do not give them |
| --- | --- | --- |
| Patient/kiosk user | Simple questions, clear confirmation, calm staff-review instruction. | Source citations, diagnosis labels, unexplained risk scores. |
| Nurse/staff | Vitals, key answers, review signals, what was asked, what needs attention. | Opaque AI conclusion without basis. |
| Clinician/reviewer | Source family, question purpose, threshold status, positives/negatives. | Hidden prompt-only logic. |
| Company/customer | Integration story, demo boundary, data/security posture, roadmap. | Claims that imply regulatory clearance or validated clinical performance. |

### 4. What Is The Minimum Honest Demo?

Minimum honest demo:

- synthetic iMVS-shaped payload;
- two deterministic flows;
- touch input first, ASR optional or future;
- no real patient data;
- no diagnosis;
- no treatment;
- no final ESI level;
- clinician-review summary only;
- source IDs visible in reviewer/debug view;
- visible demo boundary;
- versioned source/question registry.

Anything more should be treated as post-Friday scope unless explicitly approved.

## Missing Work That Should Be Added Immediately

### A. Intended-Use Sentence

Proposed sentence:

> This v0 demo is a synthetic-data, vital-aware intake workflow that uses
> measured vital-sign context and patient-reported symptoms to generate
> source-governed follow-up questions and a clinician/staff review summary; it
> is not diagnosis, treatment advice, autonomous triage, emergency ordering, or
> production HIS/EMR integration.

This sentence should appear in:

- Friday discussion brief;
- any customer-facing slide;
- any clickable demo footer or review screen;
- any README for prototype code.

### B. Red-Flag Handoff Contract

The demo must not only say "red flag." It needs a handoff contract:

| Condition | Demo behavior | Owner to approve |
| --- | --- | --- |
| Red-flag answer + concerning vital | Show staff-review wording and include source family in summary. | Clinician/company. |
| Missing vital field | Ask symptom-only branch or mark field unavailable; do not infer normal. | Product/clinical. |
| Measurement failed or stale | Ask for repeat measurement or mark unavailable. | Product/engineering. |
| Patient cannot answer | Provide staff-assist / skip behavior. | Product/clinical. |
| Any real identifier appears | Stop demo data capture; do not save. | Privacy/security owner. |

### C. Data Lifecycle Mini-Policy

For v0:

```text
Allowed:
- synthetic payloads;
- fake session IDs;
- demo answers;
- source IDs;
- local screenshots with fake values.

Not allowed:
- real patient identifiers;
- real hospital chart numbers;
- raw ASR recordings from real patients;
- live HIS/EMR credentials;
- production endpoint URLs;
- private API tokens;
- logs containing real health data.
```

Future real-data work requires:

- written data owner;
- purpose;
- retention period;
- access control;
- de-identification or limited-data agreement;
- incident contact;
- deletion process.

### D. Validation Ladder

The project needs a staged ladder:

| Stage | Evidence | Exit criteria |
| --- | --- | --- |
| Demo | Synthetic payloads and source-governed examples. | Stakeholders agree wording and scope are safe. |
| Clinician tabletop | Clinician reviews example cases and question rows. | Reviewer approves/edits question purpose and output wording. |
| Retrospective simulation | De-identified or synthetic cases run through fixed flows. | No unsafe wording, missed required review prompts tracked. |
| Supervised pilot | Staff uses system with human override and logging. | Workflow usefulness and safety issues reviewed. |
| Productization | Formal validation, cybersecurity, privacy, regulatory, quality controls. | Separate go/no-go decision. |

Source governance is only stage 1-2 support. It is not clinical validation.

### E. Change-Control Rule

For the first demo:

- freeze two flows;
- freeze source registry rows;
- freeze output wording;
- version every change;
- do not let LLM free-generate clinical routing;
- make prompts deterministic or rule-backed;
- require reviewer sign-off before threshold/wording changes.

If the system later learns or updates from cases, that becomes a change-control
problem, not just a model-improvement feature.

## Official Boundary Sources To Keep In Mind

These are not all needed in the Friday deck, but they matter for next decisions:

- FDA CDS / Digital Health Policy Navigator: intended use, CDS boundary,
  transparency, independent review.
- FDA cybersecurity guidance / cybersecurity page: connected medical devices
  and hospital networks create cybersecurity risk; manufacturers and hospitals
  share risk-management responsibilities.
- FDA AI/ML PCCP principles: AI-enabled device changes should be focused,
  bounded, risk-based, evidence-based, transparent, and lifecycle-aware.
- HHS HIPAA de-identification guidance: health information becomes a privacy
  issue when it identifies, or can reasonably identify, an individual; future
  real data needs a de-identification or data-use plan.
- NIST AI RMF: trustworthy AI work should explicitly govern, map, measure, and
  manage AI risks.

## Immediate Actions Started In This Repo

Created this workstream as a hard gate for the Friday/June path.

Immediate follow-up files created:

1. `data/source_registry.csv`
2. `data/question_registry.csv`
3. `data/flow_registry.csv`
4. `demo/fixtures/chest-pain-high-bp-low-spo2.json`
5. `demo/fixtures/fever-urinary.json`
6. `data/README.md`
7. `demo/fixtures/README.md`
8. `handoff/reviewer-packet/`
9. `scripts/check_governance_registries.py`

Validation command:

```bash
python3 scripts/check_governance_registries.py
```

Current result:

```text
OK sources=14 questions=13 flows=2
```

Do not create prototype code before the Friday decision unless the user or
project owner explicitly asks for a clickable demo.

## Bottom Line

The work is now more disciplined:

```text
source governance
+ intended-use boundary
+ human handoff contract
+ data lifecycle policy
+ deterministic demo flows
+ validation ladder
+ change control
= defensible demo path
```

Without these gates, a polished prototype would be riskier than a careful memo.
