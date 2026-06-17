---
id: smart-health-cabin-bridge
title: "Smart Health Cabin Bridge Workstream"
date: 2026-06-17
topic: ai-triage
type: workstream-index
status: active
source:
  - ../../source/2026-06-17-imedtac-smart-health-cabin-requirements/source.md
  - ../../source/2026-06-16-imedtac-teams-question-option-adjustment/source.md
  - ../../source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md
  - ./external-authority-verification.md
---

# Smart Health Cabin Bridge Workstream

## Purpose

This folder is the transition and bridge workspace for the 北市聯醫 / Smart
Health Cabin requirements raised by 慧誠智醫（imedtac Co., Ltd.）on
`2026-06-17`.

It keeps the new requirements close to the AI Triage repo while the team
prepares for the `2026-06-23` onsite equipment review and discovery discussion.
It is not the implementation home for the Smart Health Cabin product.

## Boundary

This repo remains the execution home for the AI Triage kiosk demo lane. The
Smart Health Cabin workstream can reuse AI Triage architecture discipline,
source provenance, versioned questionnaire thinking, and staff-review reporting
patterns, but it does not change the current June AI Triage API contract.

Do not add product implementation folders here, such as:

- `app/`
- `cms/`
- `vision/`
- `hearing/`
- `smart-health-cabin-api/`

If the project moves into formal feasibility response, quotation, schedule
commitment, or implementation, create a separate execution repo such as
`imedtac-smart-health-cabin-v0`.

## Working Files

| File | Use |
| --- | --- |
| `2026-06-23-onsite-discovery-plan.md` | Meeting agenda, likely imedtac discussion topics, visit objectives, and preparation checklist. |
| `email-requirements-brief.md` | One-page source-backed brief of Johnny's email and the requirements PDF. |
| `module-a-vision-hearing-discovery.md` | Discovery plan for the vision and hearing self-measurement module. |
| `module-b-questionnaire-triage-discovery.md` | Discovery plan for the questionnaire triage / department guidance module. |
| `meeting-question-bank.md` | Questions to bring to Johnny, Jason Miao, imedtac engineering, and clinical/content owners. |
| `feasibility-response-outline.md` | Draft structure for the post-visit feasibility, schedule, and budget response. |
| `reuse-from-ai-triage.md` | Reusable AI Triage assets and boundaries that should remain separate. |
| `post-meeting-decision-log.md` | Empty decision log template for the `2026-06-23` follow-up record. |
| `expert-note-integration-review.md` | Internal review of the preserved expert tutorial note and what should or should not be merged into active materials. |
| `external-authority-verification.md` | Official / authoritative verification of standards, regulatory, measurement, interoperability, browser, and stack references from the expert note. |

## Source Bundle

Canonical source package:

```text
source/2026-06-17-imedtac-smart-health-cabin-requirements/
```

Key preserved files:

- Gmail PDF:
  `assets/2026-06-17-gmail-smart-health-cabin-software-module-requirements.pdf`
- Requirements PDF:
  `assets/2026-06-15-smart-health-cabin-software-module-requirements.pdf`
- Gmail conversion:
  `extracted/2026-06-17-gmail-smart-health-cabin-software-module-requirements-agent-readable.md`
- Requirements conversion:
  `extracted/2026-06-15-smart-health-cabin-software-module-requirements-spec-agent-readable.md`
- Expert tutorial note:
  `source/2026-06-17-smart-health-cabin-expert-tutorial-note/source.md`
- External authority verification:
  `workstreams/smart-health-cabin/external-authority-verification.md`

## Expert Note Integration Policy

The expert tutorial note is preserved in full as source context and internal
training material. Derived meeting documents may reuse its stable systems
engineering lessons:

- discovery before implementation;
- source-explicit requirements versus engineering-inferred questions;
- equipment facts before vision/hearing claims;
- clinical/content ownership before questionnaire guidance;
- RACI before schedule or budget commitment;
- narrow MVP before September delivery assumptions.

Do not copy the full tutorial into the external meeting packet. Do not convert
its regulatory, standards, technology-stack, ERD, or API examples into project
commitments until official source text, intended use, device facts, and imedtac
/ hospital ownership are confirmed.

Verified source corrections now live in `external-authority-verification.md`.
Use that file as the internal fact baseline before citing FDA CDS, IMDRF SaMD,
ISO/IEC standards, vision/hearing measurement standards, FHIR/TW Core,
privacy context, browser media APIs, or implementation-stack examples in any
meeting packet or feasibility response.

## Decision Gate

After the `2026-06-23` meeting, decide whether this remains a bridge workstream
or becomes a separate repo. The new repo threshold is met if imedtac asks for
any of the following:

- formal feasibility response;
- cost or schedule estimate;
- source-code deliverable planning;
- prototype or implementation;
- CMS / ERD / API design work;
- hospital-facing or pilot-facing delivery package.
