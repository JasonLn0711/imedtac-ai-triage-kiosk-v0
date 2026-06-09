# Demo Acceptance Criteria

Status: v0 clickable demo gate
Last updated: 2026-06-08

## FIRST PRINCIPLE

Scarce resource: safe demonstrability.

The demo is acceptable only if it can be shown without implying diagnosis,
autonomous triage, clinical validation, real patient data use, or live hospital
integration.

## Functional Criteria

- The demo opens at `http://localhost:4183/app/triage-kiosk/`.
- The chest-pressure, fever/urinary, respiratory, and tachycardia live-demo
  synthetic cases are selectable.
- Each case shows a synthetic patient profile.
- Each case shows a vital payload.
- June case flows stay under `8` visible patient-facing questions; hidden
  routing metadata, vital payload fields, and staff-summary sections do not
  count toward the question budget.
- Single-choice answers advance immediately after click.
- Multi-choice answers show visible selection order, then save with
  `Save selections`.
- The right-side panel shows ranking rationale, answered fields, and a
  staff-review summary.
- Reset returns the selected case to turn `0`.
- The runtime visibly labels the active demo mode as `live_measured`,
  `synthetic_override`, or `local_scripted_demo`.
- The tachycardia live lane uses `demo-tachycardia-live-001`, HR `130 bpm`,
  and no more than `7` visible questions.

## Contract API Criteria

- `npm run mock:api` starts a local contract API on `http://localhost:4193`.
- `POST /api/triage-demo/sessions` returns `session_key`, `response_id`,
  `progress.expected_total`, and one typed question.
- `POST /api/triage-demo/sessions/{session_key}/answers` returns the next
  typed question or `status=summary`.
- `GET /api/triage-demo/sessions/{session_key}/summary` returns
  `session_not_summary_ready` before completion and `staff_review_summary` after
  completion.
- `POST /api/triage-demo/sessions/{session_key}/answer-candidates` maps an
  ephemeral transcript only within the current question's allowed option ids.
  It never submits an answer or changes session state.
- `capabilities.max_questions` is treated as a UI capacity cap; it is not the
  progress denominator.
- Same `idempotency_key` retry returns the same response without advancing the
  flow.
- iMVS enters pending answer state immediately after answer submit:
  answer-related controls are disabled / readonly, timeout retry uses the same
  answer body and `idempotency_key`, and the next screen's answer controls
  unlock only after NYCU returns the next question or summary.
- Same `idempotency_key` with a different body returns `idempotency_conflict`
  with `recovery.safe_next_action=restart_demo_session`.
- Invalid `session_key` returns stable `status=error`.
- Expired sessions return `session_expired`.
- Rate-limited clients return `rate_limited`.
- Oversized JSON request bodies return `request_body_too_large`.
- Redis-backed session-store mode can serve summary lookup after an API memory
  reset; JSON-file persistence remains the local/demo fallback.
- Audit events record request id, session-key hash, idempotency-key hash when
  present, and routing trace id after routed answers.
- The final summary response includes `staff_review_summary` and
  `summary_visibility=staff_only`.
- Same vital payload with different tachycardia answer paths produces different
  next-question or summary content while keeping objective vitals consistent.

## Governance Criteria

- Runtime is choice-only.
- Runtime does not expose `<textarea>`.
- Runtime question bank has no `type: "text"` question.
- Runtime does not capture raw ASR audio. The optional backend candidate helper
  may process an ephemeral transcript for current-question option matching, but
  confirmation through `/answers` is still required.
- Staff summary includes the demo boundary.
- Runtime output does not include:
  - diagnosis;
  - treatment advice;
  - final ESI / final acuity assignment;
  - emergency order;
  - likely disease labels such as pneumonia or sepsis;
  - safe-to-go-home or safe-to-wait wording;
  - FDA-cleared or FDA-approved claim;
  - 510(k)-cleared, 510(k)-ready, or predicate-equivalent claim;
  - HIS / EMR / FHIR writeback claim.

## Data Criteria

- Fixtures are synthetic-demo-only.
- Patient profile rows use fake demo IDs and non-identifying demographics.
- No real chart number, name, phone number, national ID, address, credential,
  token, or endpoint URL is present in tracked runtime files.
- Logs are not required for v0; if added later, they must avoid PHI and
  free-text patient answers.

## Technical Checks

Run:

```bash
npm run demo:ready
python3 scripts/check_governance_registries.py
npm run dynamic:check
```

Expected result:

```text
node tests pass
contract tests pass
smoke check passes
git diff --check passes
registry check reports OK
```

## Presentation Criteria

Presenter must say:

```text
This is a synthetic-data capability demo for vital-aware intake and
staff-review summary generation. It is not diagnosis, treatment advice, final
triage, or production integration.
```

Presenter must not say:

- AI diagnoses the patient.
- AI decides acuity.
- The demo is FDA-cleared or FDA-approved.
- The system replaces nurse or physician review.
- The output is safe for production clinical use.
