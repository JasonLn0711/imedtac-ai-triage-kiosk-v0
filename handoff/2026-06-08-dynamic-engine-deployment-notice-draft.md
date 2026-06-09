# Dynamic Engine Deployment Notice Draft

Date: 2026-06-08
Status: draft, not sent
Audience: 慧誠智醫（imedtac Co., Ltd.）engineering alignment

## Recommended Notice

We recommend keeping the first rehearsal frontend contract unchanged:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

The NYCU backend has added an internal dynamic tachycardia engine that can vary
the next question and staff-review summary based on selected option ids while
preserving the same renderable question object and `staff_review_summary`
response shape.

Two additive helper endpoints are available for rehearsal when useful:

```text
GET  /api/triage-demo/sessions/{session_key}/summary
POST /api/triage-demo/sessions/{session_key}/answer-candidates
```

The `answer-candidates` helper is optional. It only maps an ephemeral transcript
to the current question's allowed option ids and requires user or staff
confirmation before the official `/answers` call.

## Scope Controls

This remains a synthetic-data staff-review intake support demo. It does not
diagnose, recommend treatment, assign a formal triage level, order ECG/lab/
medication, recommend a department, or write to HIS/EMR/FHIR.

## Compatibility Notes

- Existing `/sessions` and `/answers` endpoint paths remain unchanged.
- Existing v0.2 API version fields remain unchanged for the first external
  contract.
- The v0.3 label is internal to the backend dynamic manifest and routing
  implementation.
- CORS origins default to `http://localhost` and `http://localhost:5174` for
  first rehearsal and can be set through `DEMO_ALLOWED_ORIGINS` when imedtac
  provides the browser Origin header.
- Bearer-token handling remains environment controlled; no token is stored in
  repo files.
- Session restart continuity is supported through Redis in cloud rehearsal;
  the local JSON session store remains a demo fallback.

## Ask

Please confirm whether the frontend team wants to test only the existing
touchscreen `/answers` path first, or also rehearse the optional
`answer-candidates` helper for ASR/free-text candidate highlighting.
