---
id: 2026-05-19-expert-review-action-plan
title: "Expert Review Action Plan"
date: 2026-05-19
topic: ai-triage
type: analysis
status: active
source: ../source/2026-05-19-expert-review-scope-api-boundary/source.md
---

# Expert Review Action Plan

## Decision

Maintain the current June demo scope:

```text
synthetic-data vital-aware intake
-> structured / choice-based dynamic questions
-> staff_review_summary
-> staff / clinician review
```

Do not expand the June critical path into:

- diagnosis;
- final triage / acuity level;
- treatment advice;
- emergency order;
- production HIS / EMR / FHIR writeback;
- real patient data;
- raw ASR audio;
- full multilingual voice workflow;
- full all-specialty triage.

## Changes To Make Before API v0.2

### Workflow phase

Adopt 多寶's two-phase workflow if 慧誠 can support it:

- Phase 1: pre-vital intake questions during measurement;
- vitals-ready payload / event;
- Phase 2: vital-aware follow-up after values are available.

Add:

- `workflow_mode`
- `measurement_state`
- `vitals_ready`
- `question_phase`
- `phase_reason`

### API fields

Add:

- `session_expires_at`
- `session_state`
- `last_question_id`
- `request_id`
- `idempotency_key`
- `measurement_timestamp`
- `device_id`
- `measurement_status`
- `quality_flag`
- `missing_reason`
- `summary_visibility`
- `handoff_required`
- `handoff_reason_codes`

Keep:

- `api_version`
- `schema_version`
- `flow_version`
- `case_id`
- `not_claimed`

Rename:

- Replace `plan_support` with `review_action`.
- Replace `assessment_support` with `review_basis` unless a named clinical
  owner explicitly approves the older API label.
- Add `staff_handoff_note` as a short display-safe string.

Add clinical-content version controls:

- `case_version`
- `fixture_version`
- `question_set_version`
- `wording_version`

Add question traceability:

- runtime `question.id`
- `registry_refs`
- `source_refs`
- `evidence_status`
- `review_owner`

### Runtime enforcement

Add runtime / smoke checks before the demo is treated as safe:

- no forbidden claim terms in runtime UI strings;
- no `diagnosis` field in API examples or summary output;
- no final triage / acuity / ESI output;
- no treatment / order / safe-to-go-home language;
- no FDA-cleared / 510(k)-ready language;
- no real identifiers, raw audio, credentials, or production endpoints.

Forbidden terms to check:

```text
diagnosis
AI diagnosis
ESI level
emergency severity
likely pneumonia
likely sepsis
needs emergency treatment
safe to go home
FDA-cleared
510(k)-cleared
clinical-grade triage
```

Implementation note: `scripts/checks/smoke-demo.js` now checks runtime strings,
demo fixtures, and API example JSON for the expert-forbidden high-risk phrases,
for `plan_support`, and for risky FDA / 510(k) readiness wording.

### Respiratory case flow

Make the first respiratory case an early staff-review handoff:

```text
Q1 chief complaint
Q2 dyspnea duration / severity
Q3 chest pain / pressure
Q4 chronic lung disease / baseline oxygen / medication context
-> staff_review_summary
```

Do not force it to ask all eight questions before summary.

### Thursday meeting closeout

Do not close the meeting without:

- 慧誠 engineering owner;
- field dictionary due date;
- UI insertion decision owner;
- environment / network constraints owner;
- 多寶 stop-rule and wording review due date;
- Jason API v0.2 due date;
- privacy/security owner for no-real-identifiers / no-raw-audio / no-production-endpoint check.

## Language Update

Prefer:

- `vital-aware intake support`
- `clinician-review summary`
- `staff_review_summary`
- `synthetic-data workflow demo`
- `comparable-product / 510(k) scope scan`

Avoid:

- `AI diagnosis`
- `final triage`
- `ESI level`
- `clinical-grade triage`
- `predicate-equivalent`
- `510(k)-ready`

## Immediate Next Actions

1. Update API examples to add the v0.2 fields and replace `plan_support`.
2. Add API question-to-registry mapping and respiratory flow registry row.
3. Add API v0.2 requirements file for the `2026-05-22` post-sync deliverable.
4. Update Thursday owner matrix with privacy/security owner.
5. Confirm whether 慧誠 can support the two-phase measurement-time question flow.
6. After Thursday sync, convert confirmed field names into API v0.2.
7. Keep the runtime forbidden-language smoke check passing before broader demo
   sharing.
