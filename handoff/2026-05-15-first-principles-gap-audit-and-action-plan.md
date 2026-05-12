# First-Principles Gap Audit And Action Plan

Date: 2026-05-15 discussion addendum  
Status: internal action plan; use to harden the Friday discussion before any
customer-facing version

## Core Judgment

The missing piece is not another clinical-source table. The missing piece is a
set of non-negotiable gates that prevent the demo from becoming an accidental
clinical, regulatory, privacy, or integration claim.

From first principles, any vital-aware AI triage system has five primitive
objects:

1. measured signals;
2. patient-reported symptoms;
3. source-governed reasoning about what to ask next;
4. a human reviewer;
5. a workflow consequence.

If any one of those is unclear, the demo can become misleading even if the UI
looks good and the source list is impressive.

## What We Had Not Emphasized Enough

### 1. The Human Handoff Contract

We have said "clinician-review summary," but we have not yet fully defined:

- who reviews it;
- when they review it;
- what the patient sees while waiting;
- whether the patient can leave the kiosk after a red-flag answer;
- whether the output goes to nurse, physician, front desk, or only demo screen;
- who is responsible if staff review is suggested but not performed.

Recommendation:

> Make "human handoff contract" a Friday decision, not a future implementation
> detail.

Minimum decision:

```text
For v0, red-flag combinations produce staff-review wording only. The demo does
not issue emergency orders or final triage levels. 慧誠 / clinician reviewer must
approve the exact patient-facing and staff-facing wording.
```

### 2. The Data Lifecycle

We have said synthetic data, but we have not yet made the data lifecycle
explicit enough.

The demo needs answers to:

- What is captured?
- Is anything stored?
- Where is it stored?
- How long is it retained?
- Can screenshots contain health information?
- Can ASR audio be saved?
- Can logs include chart numbers or timestamps?
- Who can access the data?
- What happens if real patient data is accidentally entered?

Recommendation:

> For v0, define a synthetic-only data policy and block real identifiers from
> fixtures, screenshots, logs, and demos.

This matters because a US-facing customer may immediately map the conversation
to PHI, business associate obligations, de-identification, and security review.

### 3. Measurement Reliability And Missing Values

Vital-aware triage depends on measured values. But measured values can be:

- missing;
- optional by SKU;
- stale;
- unit-mismatched;
- failed;
- repeated;
- manually entered;
- taken from a device with calibration or error issues.

Recommendation:

> Treat the vital-sign adapter as a safety component, not just a parser.

Minimum behavior:

- never infer normal from missing;
- preserve original value and unit;
- mark optional fields as unavailable;
- separate "not measured" from "normal";
- define whether repeat measurement is suggested;
- do not make glucose-dependent flow mandatory if glucose is optional.

### 4. Human Factors

The patient may be older, anxious, symptomatic, low-literacy, non-native
English-speaking, or unable to use voice. The UI may be used in a public space.

Recommendation:

> The first demo should be touch-first and staff-review-oriented. ASR should be
> optional, not required for the safety story.

Minimum human-factors rules:

- short questions;
- one question per screen;
- clear back/confirm;
- no source citations shown to patient;
- no diagnosis labels;
- no anxiety-provoking AI conclusion;
- staff-assist path;
- clinician/debug view separate from patient view.

### 5. Validation Is Not The Same As Source Governance

A source can justify why a question is reasonable. It does not prove the system
works.

Recommendation:

> Present source governance as a prerequisite for validation, not as validation.

Validation ladder:

1. source-governed synthetic demo;
2. clinician tabletop review;
3. retrospective case simulation;
4. supervised pilot with human override;
5. formal product validation and regulatory/security review.

### 6. Change Control

AI demos drift easily. Prompts, thresholds, source rows, question text, and
summary wording can change without anyone noticing.

Recommendation:

> Freeze v0 as a versioned deterministic workflow.

Minimum rule:

- every question has `question_id`;
- every source has `source_id`;
- every flow has a version;
- every threshold and wording change gets review;
- LLM is not allowed to invent routing or escalation text in v0.

### 7. Cybersecurity And Deployment Mode

The moment the system is embedded into a kiosk, calls an API, or touches
hospital network context, cybersecurity becomes part of the product story.

Recommendation:

> Keep the June demo standalone or read-only unless 慧誠 explicitly approves a
> stronger integration mode.

Minimum boundary:

- no production endpoint;
- no live hospital auth;
- no real HIS/EMR writeback;
- no credentials in repo;
- no hidden cloud dependency without disclosure;
- no raw audio retention;
- future connected demo needs threat model and incident contact path.

### 8. Sales Claim Discipline

Even if the code is safe, the pitch can overclaim.

Recommendation:

> Create approved and forbidden language before any customer-facing discussion.

Approved:

- "vital-aware triage-support workflow"
- "source-governed follow-up questions"
- "clinician-review summary"
- "synthetic-data capability demo"
- "not diagnosis or autonomous triage"

Forbidden unless separately cleared:

- "FDA-approved"
- "clinical-grade triage"
- "AI decides emergency level"
- "automated ED referral"
- "validated all-specialty triage"
- "production HIS/EMR integration"

### 9. The Real Competitive Claim

The strongest product claim is not "we have an AI chatbot."

The strongest claim is:

> 慧誠 owns the measurement workflow. That means the AI layer can start from
> objective measured context rather than only free-text symptoms.

Recommendation:

> Keep every artifact centered on "measurement-to-review workflow," not chatbot
> intelligence.

### 10. The Go / No-Go Rule

We need a simple rule for what happens after Friday.

Recommendation:

```text
Go to clickable demo only if:
- synthetic payload is accepted;
- target SKU / guaranteed fields are known;
- output wording is approved;
- reviewer owner is named;
- two flows are enough for June.

No-go / stay in memo mode if:
- they want real patient data immediately;
- they want autonomous triage level;
- they cannot name a reviewer;
- they require live HIS/EMR integration;
- they expect all-specialty clinical coverage by June.
```

## Immediate Execution Done

I created:

- `workstreams/06-first-principles-must-do-gates.md`
- `data/source_registry.csv`
- `data/question_registry.csv`
- `data/flow_registry.csv`
- `demo/fixtures/chest-pain-high-bp-low-spo2.json`
- `demo/fixtures/fever-urinary.json`
- `data/README.md`
- `demo/fixtures/README.md`

This turns the first-principles concerns into a live workstream with
non-negotiable gates.

I also added this handoff addendum so the Friday discussion has a concise
decision-focused version.

## Immediate Next Artifacts To Build If Approved

The next concrete artifact is not more scaffolding. It is a reviewer pass:

1. confirm or replace the proposed source rows;
2. approve or soften `REV-001` staff-review wording;
3. name the clinical/company review owner;
4. decide whether the two synthetic flows are enough for June;
5. decide whether to proceed to a browser-only clickable demo.

## Final Recommendation

Do not let Friday become a prototype-status meeting.

Make it a decision meeting:

```text
Can we agree that the June path is:
synthetic vital payload
-> two source-governed flows
-> deterministic question router
-> clinician-review summary
-> no real patient data
-> no diagnosis / treatment / final triage level
-> no HIS/EMR writeback
?
```

If yes, a small clickable demo is reasonable. If no, stay with memo, source
registry, and reviewer alignment.
