---
id: 2026-05-19-expert-review-v02-freeze-gate
title: "Expert Review On API v0.2 Freeze Gate"
date: 2026-05-19
topic: ai-triage
type: expert-review
status: archived
source: user-provided expert reply
---

# Expert Review On API v0.2 Freeze Gate

## Source Boundary

This note preserves the user's second expert feedback packet on the June demo
scope, two-phase flow, API v0.2 readiness, clinical boundary, version control,
and Thursday meeting closeout. Treat it as project execution guidance and a
freeze-gate checklist, not as a clinical protocol or final API contract.

Official references cited by the expert were checked on `2026-05-19` and are
recorded in `data/source_registry.csv` for regulatory/privacy boundary use.
They are not symptom-questionnaire sources.

## Expert Judgment

The expert's headline judgment:

```text
The scope can move forward, but API v0.2 is not frozen yet.
```

The recommended June demo cut remains:

```text
synthetic-data vital-aware intake support
-> staff-review summary
```

The demo should show how measured vital signs affect follow-up questions and
staff handoff context. It should not claim diagnosis, final acuity assignment,
treatment recommendation, production HIS/EMR/FHIR writeback, real-patient data
use, or raw ASR audio handling.

## Scorecard

| Item | Judgment | Score |
| --- | ---: | ---: |
| Scope cut | Suitable for June demo | 90/100 |
| Two-phase question flow | Worth doing, with fallback | 85/100 |
| API v0.2 | Direction correct, details need hardening | 78/100 |
| Clinical boundary | Mostly safe, wording must be locked | 82/100 |
| Version control | Enough structure, needs case/question traceability | 80/100 |
| Thursday meeting readiness | Can meet, but must force owner/date | 75/100 |

## Required v0.2 Corrections

1. Mark API v0.2 as draft until field names, UI insertion point, clinical
   wording, fallback, and owner/date closeout are confirmed.
2. Fix JSON example timestamps so answers cannot occur after
   `session_expires_at`.
3. Map runtime API question IDs such as `chief-concern`,
   `breathing-duration`, `chest-pain-pressure`, and `lung-history-context` to
   registry question IDs, source references, evidence status, and review owner.
4. Add the respiratory early-handoff flow to the flow registry so
   `flow_version` is not floating outside governance.
5. Prefer per-vital quality fields. If June implementation keeps session-level
   quality, document that per-vital quality is a v0.3 hardening item.
6. Add error examples for `missing_required_field`,
   `unsupported_question_type`, `measurement_quality_unavailable`, and
   `api_timeout`. Every error must avoid `staff_review_summary`, avoid
   fabricated clinical output, and fall back to standard staff workflow.
7. Rename `assessment_support` to a safer field such as `review_basis` or
   `staff_review_context` if 多寶 accepts the change.
8. Add `case_version` / `fixture_version`, plus question and wording version
   tracking, because case content and summary wording can change clinical
   meaning.

## Two-Phase Flow Conditions

Preferred path:

```text
Phase 1: vital measurement in progress, ask non-vital-dependent questions
Phase 2: vitals_ready=true and quality flag available, ask vital-aware follow-up
```

Safety conditions:

- Phase 1 may ask chief concern, onset, duration, patient-reported symptoms,
  and support needs.
- Phase 1 must not interpret SpO2, BP, temperature, or other measured values.
- Questions must not disrupt blood pressure, SpO2, or temperature measurement
  posture/signal quality.
- Phase 2 starts only when `vitals_ready=true` and measurement quality status
  is available.
- Measurement failure must not imply normal vitals; it should fall back to
  staff review.
- Output stays staff-only and non-diagnostic.

Keep `post_measurement_only` as the fallback if iMVS cannot safely ask Phase 1
questions during measurement.

## External Claim Boundary

Preferred external wording:

```text
This is a synthetic-data capability demo showing how measured vital signs can
support structured follow-up questions and a staff-review summary. It does not
diagnose, recommend treatment, assign final triage level, or write to
production HIS/EMR/FHIR.
```

Avoid:

- `AI decides acuity`
- `clinical triage product`
- `diagnosis engine`
- `emergency referral`
- `ESI level`
- `FDA-cleared`
- `FDA-ready`
- `510(k)-ready`
- `predicate-equivalent`

## Thursday Meeting Closeout

The expert recommended forcing owner/date/fallback for:

| Category | Must close |
| --- | --- |
| Payload | iMVS field names, units, required/optional, missing/failure representation. |
| UI | Whether Phase 1 can run during measurement without disrupting quality. |
| Session | `session_key` ownership, expiry, retry, idempotency. |
| Two-phase | Whether `/sessions/{session_key}/vitals` is supported. |
| Clinical | Respiratory case, stop rule, and staff-summary wording owner. |
| Summary | `staff_review_summary` schema and staff-only display location. |
| Security | HTTPS/CORS/token/log/screenshot/no-PHI boundary. |
| Demo path | Local mock, external API, iframe, same app, or fallback screen. |
| Rehearsal | One respiratory synthetic loop before expanding cases. |

## Derived Work

- `../../handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`
- `../../data/api_question_mapping.csv`
- `../../data/flow_registry.csv`
- `../../data/version_manifest.json`
