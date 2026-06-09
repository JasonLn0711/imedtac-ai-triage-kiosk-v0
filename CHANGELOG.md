# Changelog

## Unreleased - 2026-06-08

- Added the 2026-06-08 dynamic-engine SDD / implementation / test spec to
  `docs/`.
- Recorded the first-principles cloud-backend decision for the dynamic engine:
  imedtac frontend keeps the stable session API while NYCU backend owns answer
  effects, derived flags, routing policy, routing trace, and summary assembly.
- Added internal v0.3 tachycardia dynamic-engine data files for question
  manifest, answer effects, routing policy, summary templates, and local vector
  index.
- Added `api/lib/dynamic-engine/` and wired the contract API to choose the next
  tachycardia question from deterministic backend policy instead of fixed array
  position.
- Added additive `GET /summary` and `POST /answer-candidates` backend helpers;
  official answer submission remains `/answers` with stable option ids.
- Added manifest build/check scripts, vector-index builder, body-size guard,
  TTL expiry, rate limiting, audit events, and a file-backed persistent session
  store for restart rehearsal.
- Added Docker and compose deployment artifacts for the backend rehearsal API.
- Added dynamic-path, answer-candidate, cloud/security/reliability,
  performance, unit-module, and E2E tests for the spec gates.
- Added two-path rehearsal packet, clinical wording review checklist, dynamic
  engine test report, deployment notice draft, and completion audit.
- Updated runtime/governance docs, acceptance criteria, and README to make the
  internal v0.3 dynamic layer discoverable while preserving the externally
  communicated v0.2 API version fields.

## Unreleased - 2026-05-21

- Archived the 2026-05-21 imedtac engineering-sync corrected transcript and
  user-provided meeting record under
  `source/2026-05-21-imedtac-engineering-sync/`.
- Archived the 2026-05-21 Jason / 多寶 post-imedtac internal sync corrected
  transcript and meeting record under
  `source/2026-05-21-duobao-post-imedtac-internal-sync/`.
- Archived Prof. Wu's 2026-05-21 LINE patent-protection instruction under
  `source/2026-05-21-wu-line-ai-triage-patent-protection/`.
- Archived Prof. Wu's 2026-05-21 AI-Triage IP / career planning phone call
  under `source/2026-05-21-wu-ai-triage-ip-and-career-call/`.
- Added the post-sync meeting record and closeout handoff.
- Updated docs to mark `post_measurement_only` as the June integration default,
  with two-phase intake preserved as a future optimized path.
- Updated handoff/API docs with the no-formal-triage-level boundary, reusable
  iMVS question-template requirement, and next-week iMVS machine review gate.
- Updated project routing to treat the AI-Triage patent disclosure as a
  cooperation-protection gate before deeper implementation transfer to imedtac.
- Added call-derived rules for lab API as know-how boundary, meeting-note idea
  attribution, product co-development contract questions, postdoc runway, and
  June deep-cultivation proposal timing.
- Updated the two-endpoint API reply to use external-facing `貴司` language and
  explicit `not_sure` answer behavior instead of a generic no-reason bypass.
- Added the June API contract-freeze rule: the sent
  `2026-05-21-imedtac-two-endpoint-api-reply.md` file is the small fixed
  implementation baseline, and its endpoint paths, field names, field meanings,
  requiredness, enum values, answer semantics, and minimum version identifiers
  require an explicit recorded change request before either engineering team
  changes them.
- Re-scoped the external API reply into a small fixed June demo contract and
  moved the complete trace-friendly API design into
  `docs/2026-05-22-future-complete-api-design-plan.md`.
- Preserved Jason's `2026-05-22 12:17` sent Gmail API reply as the external
  baseline evidence under `source/2026-05-22-nycu-sent-api-reply-email/`.
- Preserved the Microsoft Teams API follow-up transcript and Jason's
  `2026-05-22 12:24` reply under
  `source/2026-05-21-imedtac-teams-api-followup/`, aligning the Teams record
  with the sent-email API baseline and explicit `Not sure` answer behavior.

## v0.2.0 - 2026-05-19

- Added automated version manifest and version check / bump scripts.
- Added two-phase question-flow design: pre-vital intake during measurement,
  vitals-ready payload, post-vital follow-up, and staff-review summary.
- Added API v0.2 draft fields for session state, retry/idempotency,
  measurement quality, staff-only summary visibility, handoff flags, and stable
  error behavior.
- Added runtime/API forbidden-phrase smoke check for expert-reviewed wording
  boundaries.

## v0.1.0 - 2026-05-18

- Initial synthetic-data clickable kiosk demo baseline.
- Choice-only governed question flow with staff-review summary boundary.
