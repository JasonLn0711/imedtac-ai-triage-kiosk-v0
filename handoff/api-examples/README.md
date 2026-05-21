# API Examples

These examples support the iMVS / NYCU June demo API v0.2 draft.

## June Required Flow

Use these files for the current `post_measurement_only` contract:

- `2026-05-21-start-session-request-demo-respiratory.json`
- `2026-05-21-start-session-response-question.json`
- `2026-05-21-submit-answer-request-demo-respiratory.json`
- `2026-05-21-next-question-response-demo-respiratory.json`
- `2026-05-21-post-vital-question-response-demo-respiratory.json`
- `2026-05-21-summary-response-demo-respiratory.json`
- `2026-05-21-error-response-demo-api-timeout.json`
- `2026-05-21-error-response-demo-invalid-session.json`
- `2026-05-21-error-response-demo-measurement-quality-unavailable.json`
- `2026-05-21-error-response-demo-missing-required-field.json`
- `2026-05-21-error-response-demo-unsupported-question-type.json`

The required June request pattern is:

```text
POST /api/triage-demo/sessions
  workflow_mode=post_measurement_only
  measurement_state=complete
  vitals_ready=true
  vitals=<measured or synthetic vital payload>

POST /api/triage-demo/sessions/{session_key}/answers
  session_key=<NYCU session key>
```

## Future Two-Phase Mode

`2026-05-21-update-vitals-request-demo-respiratory.json` is retained only as a
future `parallel_measurement_intake` example. It is not required for the June
customer-demo integration unless a later stakeholder decision reopens the
two-phase during-measurement workflow.
