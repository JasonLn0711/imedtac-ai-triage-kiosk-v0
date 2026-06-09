# Dynamic Engine External Release Gate Closeout

Date: 2026-06-08
Status: ready for human approval actions
Scope: `tachycardia.v0.3` backend dynamic engine before imedtac demo release

## First Principle

The backend implementation is ready for internal engineering rehearsal. Release
to a 慧誠智醫（imedtac Co., Ltd.）demo environment becomes ready when the two
external controls are closed: named clinical wording/template approval, then
explicit deployment notice / frontend compatibility confirmation.

This packet does not change the externally communicated v0.2 API contract. It
keeps `/sessions` and `/answers` stable and treats `/summary` and
`/answer-candidates` as additive rehearsal helpers.

## Gate 8: Clinical Reviewer Approval

Approval target:

```text
data/question_manifest.tachycardia.v0.3.json
data/answer_effects.tachycardia.v0.3.json
data/routing_policy.tachycardia.v0.3.json
data/summary_templates.tachycardia.v0.3.json
```

Reviewer packet:

```text
handoff/2026-06-08-dynamic-engine-clinical-wording-review-checklist.md
handoff/2026-06-08-dynamic-engine-two-path-rehearsal-packet.md
handoff/2026-06-08-dynamic-engine-test-report.md
docs/2026-06-08-dynamic-engine-spec-coverage-audit.md
```

Approval statement to collect:

```text
Reviewer name:
Reviewer role:
Review date:
Decision: approved for synthetic-data demo wording / approved with edits / hold
Required wording edits:
Next validation layer:
```

Closeout action after approval:

1. Record reviewer name, date, decision, and required edits in the clinical
   wording review checklist.
2. Apply any wording edits to the manifest/templates.
3. Rebuild and verify:

```bash
npm run dynamic:build
npm run demo:ready
python3 scripts/check_governance_registries.py
```

## Gate 9: imedtac Deployment Notice

Notice target:

```text
handoff/2026-06-08-dynamic-engine-deployment-notice-draft.md
```

Send-control record to collect before release:

```text
Approved sender:
Approval date:
Recipient / channel:
Frontend compatibility response:
Confirmed CORS origin:
Bearer-token delivery channel:
Demo API base URL:
Release decision: proceed / hold
```

Closeout action after send / confirmation:

1. Preserve the sent-message record under `source/` with credentials redacted.
2. Record the confirmed CORS Origin and API base URL in the deployment notice
   or a dated source record.
3. Keep bearer tokens and private links out of Git, Markdown, logs,
   screenshots, and planning notes.
4. Re-run:

```bash
npm run demo:ready
docker compose config
```

## Release Decision Rule

Proceed to imedtac demo-environment release only when:

```text
Gate 1-7: engineering verification complete
Gate 8: named clinical reviewer approval recorded
Gate 9: imedtac deployment notice sent and compatibility confirmed
Credentials: shared only through private channel
Git: no private token, credential, raw patient data, or live integration secret
```

If any item is missing, keep the status as internal engineering rehearsal
ready, not external demo release ready.
