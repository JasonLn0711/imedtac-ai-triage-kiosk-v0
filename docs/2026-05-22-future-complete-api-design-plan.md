---
id: 2026-05-22-future-complete-api-design-plan
title: "Future Complete API Design Plan"
date: 2026-05-22
topic: ai-triage
type: internal-design-plan
status: active
source:
  - ../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
  - ./2026-05-21-imedtac-api-field-mvp-scope-note.md
  - ../decisions/2026-05-22-api-contract-freeze-and-change-control.md
---

# Future Complete API Design Plan

## Purpose

This note preserves the fuller API design as a future implementation plan. The June customer demo should use a small, fixed contract; the complete trace-friendly API belongs here until the team has a real need, UI support, rehearsal evidence, and owner approval for the extra fields.

## First Principle

The June demo needs a stable connection surface, not a production-style platform contract. The complete API is still valuable, but its role is to guide staged growth after the first demo loop works.

The operating split is:

- June demo contract: small, fixed, readable, and enough for iMVS to complete the two-endpoint loop.
- Future complete API: traceable, versioned, clinically reviewable, and ready for multi-case expansion, rehearsal audit, UI variants, fallback handling, provenance, and validation planning.

## Layer 1: June Small Fixed Contract

This is the only contract that should be sent as the immediate implementation baseline.

Fixed surface:

- `POST /api/triage-demo/sessions`
- `POST /api/triage-demo/sessions/{session_key}/answers`
- `workflow_mode = "post_measurement_only"`
- start request with `api_version`, `request_id`, `idempotency_key`, `workflow_mode`, `measurement_state`, `vitals_ready`, `client.locale`, `vitals`, and compact UI capabilities;
- response with `session_key`, `status`, `question_set_version`, `wording_version`, and either a `question` object or `staff_review_summary`;
- `question` object with `id`, `type`, `text`, `options`, `required`, `allow_not_sure`, `not_sure_option_id`, and `max_selections` when needed;
- `answer.selected_option_ids` as the answer payload for choice questions;
- `not_sure` or question-specific `*_not_sure` option IDs for uncertainty;
- `staff_review_summary` as staff-review workflow output, not diagnosis, treatment, final triage level, or production writeback.

## Layer 2: Complete Trace-Friendly API

These fields are future design controls. They can be implemented gradually, echoed by NYCU, or kept server-managed. They should not be required from 貴司 for the first June demo unless a later recorded change request promotes them into the implementation baseline.

### Version And Fixture Controls

- `schema_version`
- `flow_version`
- `case_version`
- `fixture_version`
- `question_set_version`
- `wording_version`

Use these when multiple case lanes, fixtures, rehearsals, and wording versions must be compared. For the small June contract, `api_version`, `question_set_version`, and `wording_version` are enough for external alignment; NYCU can manage the remaining values internally.

### Session Lifecycle And Audit

- `response_id`
- `session_state`
- `session_expires_at`
- `progress.current`
- `progress.expected_total`
- retry and idempotency conflict behavior
- lightweight audit fields for `request_id`, endpoint, status, latency, and contract version

Use this layer when the demo needs repeatable rehearsal logs, page refresh recovery, session expiry behavior, or mock/contract tests.

### Vital Payload Quality And Field Dictionary

- `vitals.measurement_timestamp`
- `vitals.device_id`
- `vitals.<field>.measurement_status`
- `vitals.<field>.quality_flag`
- `vitals.<field>.missing_reason`
- adapter mapping from iMVS `NBP`, `SPO2`, `HR`, `Temp`, `Glucose`, `Weight`, and `Height`
- respiratory-rate handling if 貴司 later confirms a measured or manual source

Use this layer when the current iMVS device field dictionary is confirmed and the team needs to distinguish measured, missing, failed, poor-quality, manual-entry, and synthetic values.

### Question Provenance And Review Metadata

- `question.registry_refs`
- `question.source_refs`
- `question.evidence_status`
- `question.review_owner`
- `question.trigger_reason_codes`
- `question.summary_effect`
- `question.rendering_constraints`

Use this layer when questions move from demo wording into source-governed clinical review. It should support reviewer accountability and explain why a question appears, but it does not need to be rendered by iMVS in the first demo.

### Answer Expansion

- scale input after 貴司 confirms a reliable UI template;
- future typed free-text only after privacy, safety, and review controls are defined;
- client event metadata such as `client_event.input_mode`;
- any generic no-reason bypass control only through a future change request, because the June demo uses explicit `not_sure` option IDs.

### Summary, Handoff, And Fallback Controls

- `summary_visibility`
- `review_basis`
- `review_action`
- `handoff_required`
- `handoff_reason_codes`
- `next_action`
- `demo_boundary`
- `error.code`
- `error.retryable`
- `fallback.recommended_mode`
- `execution_mode = "live_api"` or `"local_scripted_demo"`

Use this layer when the team needs robust degraded-mode behavior, local scripted fallback, richer staff handoff, or clearer separation between live API and scripted demo mode.

## Layer 3: Backend Dynamic Engine

The `2026-06-08` dynamic-engine plan promotes the hard part of question
routing into the NYCU / cloud backend while preserving the frontend-facing
session contract.

Implemented internal v0.3 surfaces:

- `data/question_manifest.tachycardia.v0.3.json`
- `data/answer_effects.tachycardia.v0.3.json`
- `data/routing_policy.tachycardia.v0.3.json`
- `data/summary_templates.tachycardia.v0.3.json`
- `api/lib/dynamic-engine/`

The operating split is:

```text
imedtac frontend: render typed questions, collect selected option ids, show summary
NYCU backend: session state, effects, derived flags, routing policy, routing_trace, summary assembly
```

The backend may add optional helper APIs when they are strictly additive:

```text
GET  /api/triage-demo/sessions/{session_key}/summary
POST /api/triage-demo/sessions/{session_key}/answer-candidates
```

These helpers do not replace the official `/answers` path. The
`answer-candidates` helper only maps an ephemeral transcript to the current
question's allowed option ids and requires user or staff confirmation before
`/answers` is called.

AI retrieval and reranking are the planned next support layer. The final
selection remains deterministic policy plus manifest safety gate, so a model
cannot introduce an unreviewed patient-facing question or clinical output.

Promotion gate: keep the v0.3 dynamic-engine version internal until a recorded
change request promotes any new behavior into the imedtac external contract.

## Layer 4: Future Optimized Workflow

The post-`2026-05-21` decision keeps the June demo as post-measurement only. The earlier two-phase design remains a future optimized workflow.

Future endpoint:

```text
POST /api/triage-demo/sessions/{session_key}/vitals
```

Future use:

```text
iMVS starts a session during measurement
-> NYCU may ask non-vital-dependent questions
-> iMVS sends vitals-ready update after measurement
-> NYCU switches to vital-aware follow-up
-> NYCU returns staff_review_summary
```

Promotion gate: do not reintroduce this endpoint until 貴司 confirms a safe measurement-time UI insertion point, the demo can tolerate more session state, and the team has time to rehearse the two-phase behavior.

## Promotion Rules

A future field can move into the external implementation contract only when all of the following are true:

- it has a clear owner;
- it changes runtime behavior or rehearsal safety in a useful way;
- 貴司 can render or send it without custom one-off UI work;
- the field has an example payload and expected response;
- it has a compatibility note and version impact;
- it is recorded in the API reply, decision file, or open-issues checklist before either team implements it.

## Practical Planning Rule

Keep the first demo small. Use the complete API as a roadmap, not as a burden on the first integration pass.
