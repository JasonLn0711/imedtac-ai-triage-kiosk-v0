---
id: 2026-05-19-duobao-two-phase-vital-questioning
title: "Duobao Two-Phase Vital-Sign Questioning Insight"
date: 2026-05-19
topic: ai-triage
type: clinical-workflow-source
status: archived
source: user-provided supplemental note
related:
  - ../2026-05-15-imedtac-second-sync-and-duobao-followup/meeting-record.md
---

# Duobao Two-Phase Vital-Sign Questioning Insight

## Source Boundary

This note records Jason's `2026-05-19` supplemental clarification about what
多寶 had discussed with him a few days earlier. It should be treated as a
workflow / clinical-sanity insight for the June demo design, not as a validated
clinical protocol.

The same idea was already partially present in the `2026-05-15` meeting record:

- fixed questions can be asked during vital-sign measurement;
- dynamic questions can be selected after vital signs are available;
- the point is to keep the kiosk flow short while preserving staff-review
  safety.

## User-Provided Clarification

多寶's question-flow idea has two phases:

1. Questions that patients can answer while the kiosk is still measuring vital
   signs. These questions do not depend on numeric vital values, so the system
   can ask them immediately to understand the patient's situation.
2. Questions that should wait until vital-sign values are available. After the
   system receives the vital values, it can ask follow-up questions targeted to
   whether the values look normal or abnormal for the demo scenario.

## Design Interpretation

This is a good June-demo workflow cut because it:

- uses otherwise idle measurement time;
- shortens perceived patient wait;
- keeps the patient-facing flow choice-based and low-friction;
- makes the vital-sign differentiator visible only after the device has real
  values;
- avoids pretending that the system knows clinical meaning before the measured
  context exists;
- preserves the staff-review summary boundary.

## Derived Artifacts

- `../../docs/2026-05-19-two-phase-question-flow-design.md`
- `../../handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`
- `../../handoff/2026-05-21-imedtac-engineering-sync-prep.md`
- `../../workstreams/08-june-demo-case-and-integration-plan.md`
