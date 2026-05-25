# Handoff

This folder is for future handoff drafts to Prof. Wu, 慧誠智醫 / imedtac, or internal
collaborators.

## Current Safe Handoff Summary

The current useful answer is:

> The June demo should show a post-measurement iMVS vital payload entering a
> NYCU structured question loop and returning a staff-review summary. The demo
> proves vital-aware intake workflow integration, staff-review support, human
> review workflow, synthetic-data demo operation, and a separate production
> validation path.

Current main meeting packet:

- `handoff/2026-05-15-complete-meeting-packet.md`
- `handoff/2026-05-15-complete-meeting-packet-zh-TW.md` for Taiwan Traditional
  Chinese meeting use
- `handoff/2026-05-15-imedtac-anticipated-q-and-a-zh-TW.md` for anticipated
  imedtac questions and Taiwan Traditional Chinese answer wording

Current detailed discussion artifacts:

- `handoff/2026-05-20-nycu-response-to-imedtac-ai-triage-demo-api-v02.md`
  - Active copy of the user's manually edited file recorded under
    `source/2026-05-20-nycu-response-to-imedtac-user-edited/`
- `handoff/2026-05-20-imedtac-pre-meeting-api-v02-pre-read.md`
- `docs/writing-method-policy.md`
- `handoff/2026-05-21-imedtac-engineering-sync-prep.md`
- `handoff/2026-05-21-imedtac-meeting-q-and-a.md`
- `handoff/2026-05-21-imedtac-engineering-sync-closeout.md`
- `handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md`
- `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`
- `handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md`
- `handoff/2026-05-21-imedtac-engineering-open-issues-checklist.md`
- `handoff/2026-05-21-to-2026-05-25-imedtac-response-plan.md`
- `handoff/2026-05-21-decision-defaults-and-owner-matrix.md`
- `handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`
- `decisions/2026-05-22-api-contract-freeze-and-change-control.md`
- `decisions/2026-05-22-not-sure-answer-boundary.md`
- `source/2026-05-21-imedtac-teams-api-followup/teams-thread-record-2026-05-22.md`
- `source/2026-05-22-nycu-sent-api-reply-email/sent-reply-record.md`
- `docs/2026-05-22-future-complete-api-design-plan.md`
- `handoff/2026-05-25-render-rehearsal-api-deployment-runbook.md`
- `docs/2026-05-19-two-phase-question-flow-design.md`
- `docs/version-control-policy.md`
- `docs/2026-05-19-api-session-design-plain-explanation.md`
- `handoff/api-examples/` for the first iMVS / NYCU JSON request and response
  examples
- `handoff/2026-05-15-hallucination-and-source-grounding-audit.md`
- `handoff/2026-05-15-imedtac-need-fit-meeting-execution-plan.md`
- `handoff/2026-05-15-510k-comparable-product-scan.md`
- `handoff/2026-05-15-vital-aware-triage-feasibility-source-governance.md`
- `handoff/2026-05-15-source-registry-and-example-flows.md`
- `handoff/2026-05-15-friday-discussion-brief.md`
- `handoff/2026-05-15-first-principles-gap-audit-and-action-plan.md`
- `handoff/reviewer-packet/`

Current v0.2 freeze-gate additions:

- June v0.2 requires only `POST /api/triage-demo/sessions` and
  `POST /api/triage-demo/sessions/{session_key}/answers`;
- the start-session request includes the measured or synthetic iMVS vital
  payload and returns `session_key` plus the first typed question;
- the answer endpoint returns either the next typed question or
  `staff_review_summary`;
- runtime question IDs are mapped through `../data/api_question_mapping.csv`;
- respiratory early handoff is registered as
  `FLOW-RESPIRATORY-EARLY-HANDOFF`;
- tachycardia live demo is registered as `FLOW-TACHYCARDIA-LIVE-DEMO` with the
  first-lane question template in
  `2026-05-21-duobao-style-tachycardia-live-demo-question-set.md`;
- Jason's `2026-05-22 12:17` Gmail reply and `2026-05-22 12:24` Teams reply
  record that the two-endpoint packet was sent externally and that future
  endpoint, field-name, requiredness, enum, answer-behavior, or UI-constraint
  changes require a recorded change request;
- examples carry `case_version`, `fixture_version`, `question_set_version`, and
  `wording_version`;
- staff summary uses `review_basis` rather than `assessment_support`;
- error examples fall back to standard staff workflow and do not include
  generated summaries.
- answer-submit UI behavior is fixed for rehearsal: iMVS locks answer-related
  controls immediately after submit and unlocks only after NYCU returns the next
  question or `staff_review_summary`;
- `idempotency_conflict` recovery is fixed as `restart_demo_session` for the
  June demo, not answer revision or a GET current-question recovery path.
- Render rehearsal API service is created as
  `nycu-imedtac-triage-demo-api`; the intended API base URL is
  `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo`.
  Render now uses `npm run render:start`, and public `/healthz`, CORS
  preflight, start-session, and submit-answer checks passed on
  `2026-05-25 17:50 GMT+8`.
- Render outbound IP ranges (`74.220.50.0/24`, `74.220.58.0/24`) are only for
  NYCU Render service initiated outbound calls. They are not needed for the
  current iMVS browser -> NYCU API path unless a future imedtac backend
  allowlist requires NYCU service egress ranges.

Post-sync `2026-05-21` update:

- June default is now `post_measurement_only`: complete iMVS measurement first,
  send measured vital payload to NYCU, then run the structured question loop.
- Endpoint 1 and Endpoint 3 should be merged for the June integration pass.
- The two-phase vitals-ready workflow remains a future optimized path, not the
  first customer-demo default.
- Voice input is out of the June critical path.
- Prepare Remote REST API Mode plus clearly labeled Local Scripted Demo Mode.
- Johnny's post-meeting Gmail record confirms imedtac's preference to lead the
  US customer demo with a tachycardia / chest-tightness live-performance lane,
  while keeping the same two-endpoint API shape.
- The engineering open-issues checklist tracks items not fully settled by the
  API table itself: change-control, session lifecycle, idempotency, fallback UI,
  field dictionary, UI rendering limits, mock / contract test needs,
  observability, and rehearsal acceptance criteria.

Post-Duobao internal sync update:

- Do not output a formal five-level triage result in June. Put AI in
  vital-aware question selection and staff-review summary generation.
- Confirm reusable iMVS question templates before promising a scalable dynamic
  question loop: `single_choice`, `multi_choice`, numeric / scale, variable
  option counts, label limits, and no-scroll behavior.
- Schedule an actual iMVS machine review with 多寶 / 許醫師 before freezing the
  customer-visible flow.

Post-Wu patent-protection update:

- Prof. Wu asked Jason to discuss AI-Triage patents with Tomi and warned that
  NYCU should protect its own patent / IP position before teaching imedtac the
  full reusable method.
- Prof. Wu's follow-up phone call confirms lab API mode can protect know-how,
  MOU is too general for product co-development, and future meeting notes
  should attribute idea origin.
- Use `handoff/patent/2026-05-22-ai-triage-patent-disclosure-draft.md` as the
  active protection packet.
- Share API-contract details needed for the June demo; keep reusable routing,
  scoring, source-governance, prompt / embedding, and claim-structure details
  internal until Prof. Wu / Tomi clear the cooperation boundary.

## Friday Mainline Rule

The Friday main brief should answer only the company follow-up questions:

1. modular all-specialty AI triage method;
2. how physiological data enters analysis;
3. FDA / medical-society examples for vital-data impact.

Use `510(k)`, go/no-go, data lifecycle, human handoff, and prototype details as
supplemental notes only if they come up in discussion.

## Required Before External Handoff

- Confirm product / API materials from imedtac.
- Confirm whether `handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md` is enough
  for the engineering team or whether they need OpenAPI, a mock endpoint, or a
  sequence diagram.
- Apply the expert-review v0.2 deltas before sharing the next API version:
  `review_basis` / `review_action` instead of `assessment_support` /
  `plan_support`, `summary_visibility: "staff_only"`, `handoff_required`,
  `handoff_reason_codes`, session expiry / state fields, retry / idempotency
  fields, measurement-quality fields, stable error behavior, and no fake
  summary on failure.
- Preserve the current `idempotency_conflict` rule in any external reply:
  return HTTP 409 / `status: "error"`, do not advance question flow, and restart
  the demo session for rehearsal recovery.
- Use the post-sync June flow unless a later explicit decision changes it:
  complete measurement, upload vital payload, run the question loop, then show
  staff-review summary. Keep the two-phase workflow as a future optimized path.
- Confirm the nearest comparable product / `510(k)` reference, or explicitly
  mark it unavailable before Friday.
- Confirm whether v0 uses mocked vital signs or real kiosk data.
- Confirm which architecture diagram can be shared.
- Confirm source-governance wording for any clinical question examples.
- Before citing expert-cited FDA, TW Core, CDC, PDPC, or cybersecurity sources
  externally, verify exact current source text and use them only for their
  proper boundary: regulatory, interoperability, privacy, warning-sign, or
  cybersecurity context. Do not treat them as blanket approval for clinical
  triage logic.
- Remove or summarize any private / patent-sensitive implementation detail.
