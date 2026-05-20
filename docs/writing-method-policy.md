---
id: writing-method-policy
title: "Writing Method Policy"
date: 2026-05-20
topic: ai-triage
type: policy
status: active
---

# Writing Method Policy

## Core Rule

Every article, handoff note, pre-read, meeting packet, README section, and
company-facing artifact in this repo must use a confident, affirmative,
product-minded writing style.

This repo does not use defensive writing. It does not open with apologies,
permission-seeking language, repeated caveats, or self-minimizing explanations.

## Required Structure

Use this order:

```text
positive thesis
-> concrete demo / workflow capability
-> API, evidence, or governance control
-> human-review boundary
-> owner/date or next decision
```

Do not use this order:

```text
disclaimers
-> apologies
-> uncertainty
-> vague possibility
-> buried ask
```

## Boundary Language

Boundaries are design controls. They should make the project more credible,
not smaller.

Write:

```text
The June demo is scoped to one synthetic vital-aware intake loop that produces
a staff-review summary for human review.
```

Avoid:

```text
This is only a small prototype and we are not sure whether it is useful.
```

## 慧誠智醫-Facing Material

For 慧誠智醫-facing material, including the `2026-05-20` API v0.2 pre-read:

- lead with a clear recommendation;
- describe the demo as a concrete product capability;
- state API/session decisions directly;
- ask for owner/date closeout explicitly;
- use `demo` rather than over-translating it as a weaker generic phrase;
- use the official English company name: first formal mention
  `慧誠智醫（imedtac Co., Ltd.）`, later English shorthand `imedtac`;
- do not use `imedtac` as the English company name except in historical file
  paths, copied source titles, or quoted source material;
- place scope controls after the positive recommendation;
- never make the document sound defensive.

Recommended opening pattern:

```text
我們建議六月 demo 固定成一個 synthetic-data vital-aware intake loop：
iMVS 提供合成生命徵象 payload，NYCU 回傳結構化 question object 與
session_key，iMVS 回傳結構化回答，NYCU 最後回傳 staff_review_summary
給工作人員 / 臨床人員檢閱。
```

## Forbidden Writing Postures

Avoid these patterns unless quoting a source:

- "maybe this can";
- "only a prototype";
- "small prototype";
- "we are not sure";
- "we are not claiming anything";
- "if this is useful";
- "hopefully";
- starting a company-facing document with a long disclaimer list;
- apologizing for the demo boundary;
- burying the recommended decision after caveats.

## Safety Boundary

Confident writing must still preserve the clinical and regulatory boundary.

Do not claim:

- diagnosis;
- treatment advice;
- final triage / acuity level;
- autonomous clinical decision-making;
- production HIS / EMR / FHIR writeback;
- FDA clearance or 510(k)-ready status;
- real patient-data processing.

Use:

```text
staff-review summary
vital-aware intake support
synthetic-data demo
human-review boundary
owner/date closeout
```
