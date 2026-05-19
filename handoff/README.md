# Handoff

This folder is for future handoff drafts to Prof. Wu, 慧誠, or internal
collaborators.

## Current Safe Handoff Summary

The current useful answer is:

> The first task is not to build a generic chatbot. The first task is to find
> the insertion point in 慧誠's existing vital-sign measurement workflow and show
> that measured vital signs can drive dynamic triage-support questioning and a
> clinician-readable summary. The product-scope layer should start from a
> `510(k)` / comparable-product scan if 慧誠 can provide the nearest US partner
> product, customer reference, competitor, or FDA number.

Current main meeting packet:

- `handoff/2026-05-15-complete-meeting-packet.md`
- `handoff/2026-05-15-complete-meeting-packet-zh-TW.md` for Taiwan Traditional
  Chinese meeting use
- `handoff/2026-05-15-huicheng-anticipated-q-and-a-zh-TW.md` for anticipated
  Huicheng questions and Taiwan Traditional Chinese answer wording

Current detailed discussion artifacts:

- `handoff/2026-05-21-huicheng-engineering-sync-prep.md`
- `handoff/2026-05-21-imvs-nycu-api-design-v0.1.md`
- `handoff/2026-05-21-decision-defaults-and-owner-matrix.md`
- `handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`
- `docs/2026-05-19-two-phase-question-flow-design.md`
- `docs/version-control-policy.md`
- `docs/2026-05-19-api-session-design-plain-explanation.md`
- `handoff/api-examples/` for the first iMVS / NYCU JSON request and response
  examples
- `handoff/2026-05-15-hallucination-and-source-grounding-audit.md`
- `handoff/2026-05-15-huicheng-need-fit-meeting-execution-plan.md`
- `handoff/2026-05-15-510k-comparable-product-scan.md`
- `handoff/2026-05-15-vital-aware-triage-feasibility-source-governance.md`
- `handoff/2026-05-15-source-registry-and-example-flows.md`
- `handoff/2026-05-15-friday-discussion-brief.md`
- `handoff/2026-05-15-first-principles-gap-audit-and-action-plan.md`
- `handoff/reviewer-packet/`

Current v0.2 freeze-gate additions:

- runtime question IDs are mapped through `../data/api_question_mapping.csv`;
- respiratory early handoff is registered as
  `FLOW-RESPIRATORY-EARLY-HANDOFF`;
- examples carry `case_version`, `fixture_version`, `question_set_version`, and
  `wording_version`;
- staff summary uses `review_basis` rather than `assessment_support`;
- error examples fall back to standard staff workflow and do not include
  generated summaries.

## Friday Mainline Rule

The Friday main brief should answer only the company follow-up questions:

1. modular all-specialty AI triage method;
2. how physiological data enters analysis;
3. FDA / medical-society examples for vital-data impact.

Use `510(k)`, go/no-go, data lifecycle, human handoff, and prototype details as
supplemental notes only if they come up in discussion.

## Required Before External Handoff

- Confirm product / API materials from 慧誠.
- Confirm whether `handoff/2026-05-21-imvs-nycu-api-design-v0.1.md` is enough
  for the engineering team or whether they need OpenAPI, a mock endpoint, or a
  sequence diagram.
- Apply the expert-review v0.2 deltas before sharing the next API version:
  `review_basis` / `review_action` instead of `assessment_support` /
  `plan_support`, `summary_visibility: "staff_only"`, `handoff_required`,
  `handoff_reason_codes`, session expiry / state fields, retry / idempotency
  fields, measurement-quality fields, stable error behavior, and no fake
  summary on failure.
- Confirm whether 慧誠 can support the two-phase question flow: Phase 1
  pre-vital intake during measurement, vitals-ready update, then Phase 2
  vital-aware follow-up. If this disrupts measurement quality, use the
  post-measurement fallback.
- Confirm the nearest comparable product / `510(k)` reference, or explicitly
  mark it unavailable before Friday.
- Confirm whether v0 uses mocked vital signs or real kiosk data.
- Confirm which architecture diagram can be shared.
- Confirm source-governance wording for any clinical question examples.
- Remove or summarize any private / patent-sensitive implementation detail.
