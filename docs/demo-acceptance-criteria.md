# Demo Acceptance Criteria

Status: v0 clickable demo gate
Last updated: 2026-05-20

## FIRST PRINCIPLE

Scarce resource: safe demonstrability.

The demo is acceptable only if it can be shown without implying diagnosis,
autonomous triage, clinical validation, real patient data use, or live hospital
integration.

## Functional Criteria

- The demo opens at `http://localhost:4183/app/triage-kiosk/`.
- The chest-pressure and fever/urinary synthetic cases are selectable.
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

## Governance Criteria

- Runtime is choice-only.
- Runtime does not expose `<textarea>`.
- Runtime question bank has no `type: "text"` question.
- Runtime does not capture ASR, audio, or free-text patient statements.
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
```

Expected result:

```text
node tests pass
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
