# 2026-06-25 Doebow Merge Contract Preservation

## Recommendation

Merge `origin/doebow` into `main` as a contract-compatible runtime expansion.
The merged implementation keeps the externally discussed 慧誠智醫（imedtac
Co., Ltd.）API contract stable while bringing doebow's updated question bank,
local LLM summary service, and demo summary-review frontend into the execution
repo.

## Preserved External Contract

The imedtac-facing API remains the same two-endpoint workflow:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

Terminal completion still returns `status: "summary"` with
`staff_review_summary`. Staff-notify and severe-vital paths remain wrapped as
summary-compatible terminal responses. The implementation does not introduce a
new required endpoint, required field, report URL, QR payload contract, final
triage level, diagnosis, treatment advice, or production clinical claim.

## Merged Capability

- `Question_DB/` and `Case_question/` now include doebow's broader fixed
  English question coverage and no-number-pad initial intake direction.
- Initial age and duration are rendered as single-choice buckets for the current
  imedtac MVP UI surface.
- Symptom question rows keep the supported `single_choice` / `multi_choice`
  rendering contract and stay within the maximum visible option constraint.
- `LLM_api/` is available as a local controlled demo service for subjective SOAP
  summary rewriting.
- `python_api/static/demo-ui/summary-review/` provides a demo review page that
  can render a completed `staff_review_summary` payload.
- Python contract tests now cover LLM fallback, summary-review static route,
  session expiry, body-size guard, CORS behavior, and the expanded initial
  detail-question path.

## Scope Controls

The deterministic staff-review summary remains the default production-safe demo
behavior. `LLM_SUMMARY_URL` is empty by default and must be explicitly set in
the triage API environment before the local LLM service is used. This keeps the
Render/default path independent from a developer machine LLM server.

The summary-review frontend is an additive demo surface. The local API tester
continues to display `staff_review_summary` inline by default and exposes the
review page through an explicit button. It no longer redirects automatically at
summary completion, so it does not silently replace the display surface already
communicated to imedtac.

The current API does not provide `report_url`, QR-code content, or a
cross-device summary session handoff. The review page currently accepts a
same-browser payload handoff through `window.name`. If imedtac needs their
screen to display a QR code that opens an NYCU-hosted report summary page, that
requires a separate recorded change-control decision covering URL lifetime,
session lookup, payload storage, privacy boundary, bearer/auth behavior,
expiration, and who renders the QR code.

## Verification

```text
PYTHONPATH=. uv run --project python_api python -m pytest python_api/tests -q
uv run --project LLM_api python -m pytest LLM_api/tests -q
npm test
npm run smoke
npm run build
git diff --check
```

Observed local result on 2026-06-25:

- Python API tests: 50 passed.
- LLM API tests: 2 passed.
- JS tests: 33 unit tests and 41 contract tests passed.
- Local smoke: passed.
- Build: passed.
- Whitespace check: passed.

## Next Gate

Publish the merged branch to remote `main`, then run the private-token Render
checks from a shell that has the agreed bearer token:

```bash
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online
DEMO_BEARER_TOKEN='<private token from agreed channel>' npm run smoke:online:doebow
```

The next imedtac-facing decision is whether the summary remains rendered by
iMVS from `staff_review_summary`, or whether a separately governed report URL /
QR flow should be added.
