---
id: 2026-05-20-june-demo-question-budget
title: "June Demo Question Budget"
date: 2026-05-20
topic: ai-triage
type: decision
status: active
source:
  - ../source/2026-05-19-johnny-ai-triage-product-spec/source.md
  - ../source/2026-05-20-duobao-demo-cases-question-design/source.md
  - ../docs/2026-05-20-duobao-demo-design-consistency-review.md
---

# June Demo Question Budget

## Decision

The June demo should follow the 慧誠 / iMVS product-spec requirement for the
current customer-demo path: fewer than `8` visible patient-facing questions per
completed case flow.

Use `capabilities.max_questions = 7` in API examples and runtime contract
discussions when a hard numeric cap is needed.

## Counting Rule

Count only questions shown to the patient during the active kiosk intake:

- Phase 1 pre-vital intake questions;
- Phase 2 post-vital follow-up questions;
- universal history / medication / allergy / pregnancy questions if shown to
  the patient.

Do not count:

- measured vital-sign fields sent by iMVS;
- hidden routing metadata;
- staff-summary sections;
- source/evidence references;
- API request/response fields;
- staff-only handoff notes.

## Design Guidance

`<8` is the maximum, not the target. The preferred first respiratory demo flow
should stay around `5-7` visible questions when possible.

Use the question budget only for details that improve clinical plausibility or
demo clarity, for example:

- adding medication/allergy context;
- adding a relevant chronic disease / baseline context question;
- adding one targeted red-flag screen after vital signs are ready.

Do not expand the June runtime into an all-specialty questionnaire, collect real
identifiers, ask free-text questions, or output diagnosis / final triage /
disposition / department recommendations.

## Relationship To Earlier Source Material

Earlier company/minutes material mentioned `8-10` questions, while the
2026-05-19 慧誠 / iMVS product spec says the OPQRST dynamic questioning flow
should have a total expected question count under `8`. Johnny also clarified
that the spec logic is adjustable, but the current user decision is to follow
the 慧誠 requirement. This decision therefore updates the current June demo
design constraint:

```text
visible patient-facing question cap: <8
API hard maximum: max_questions=7
preferred first respiratory flow: 5-7
```
