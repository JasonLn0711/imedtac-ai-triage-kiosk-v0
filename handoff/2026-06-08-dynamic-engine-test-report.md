# Dynamic Engine Test Report

Date: 2026-06-08
Status: current verification report
Scope: `ai-triage-dynamic-engine-sdd-implementation-test-spec.md`

## Summary

The dynamic-engine implementation now covers deterministic routing, manifest
validation, answer effects, approved summary-template retrieval, summary
assembly, current-question answer candidates backed by option-index rows, AI
retrieval/reranker fallback, session expiry, Redis-backed session restart
support with JSON-file fallback, CORS, bearer-token gate, rate limit,
request-size guard, audit events, performance targets, and two E2E tachycardia
paths.

## Commands

Run before release:

```bash
npm run demo:ready
python3 scripts/check_governance_registries.py
docker compose config
```

Run the Redis-backed restart check when a Redis service is available:

```bash
DEMO_REDIS_URL=redis://127.0.0.1:<redis-port>/0 npm run test:integration
```

## Current Evidence

| Gate | Evidence command | Expected |
| --- | --- | --- |
| Version sync | `npm run version:check` | OK |
| Dynamic manifest build/check | `npm run dynamic:check` | OK |
| Unit tests | `npm run test:unit` | pass; includes vector question/option row invariant, AI-RERANK-002, and AI-SUM-001 |
| Contract tests | `npm run test:contract` | pass; includes CT-API-004/005, PERF-003, AI-TRACE-001, SUM-007 |
| Integration tests | `npm run test:integration` | pass; Redis case skips unless `DEMO_REDIS_URL` is set |
| E2E paths | `npm run test:e2e` | pass |
| Smoke | `npm run smoke` | pass |
| Build | `npm run build` | pass |
| Whitespace | `git diff --check` | no output |
| Governance registry | `python3 scripts/check_governance_registries.py` | OK |
| Compose config | `docker compose config` | valid API + Redis deployment config |
| Redis restart continuity | `DEMO_REDIS_URL=redis://127.0.0.1:<redis-port>/0 npm run test:integration` | pass with disposable Redis container |

## Release Gate Mapping

| Spec gate | Evidence |
| --- | --- |
| Existing contract tests pass | `tests/contract/triage-demo-api.test.js` |
| Dynamic Path A / B pass | `tests/e2e/tachycardia-path-a-low-concern.test.js`, `tests/e2e/tachycardia-path-b-warning-symptoms.test.js` |
| Summary consistency tests pass | `tests/contract/tachycardia-dynamic-path.test.js`, `tests/unit/summary-assembler.test.js` including AI-SUM-001, SUM-006, and SUM-007 |
| Forbidden output tests pass | `tests/contract/tachycardia-dynamic-path.test.js`, `tests/unit/summary-assembler.test.js`, `scripts/checks/smoke-demo.js` |
| Routing trace tests pass | `tests/contract/tachycardia-dynamic-path.test.js` including AI-TRACE-001, `tests/contract/cloud-security-reliability.test.js` |
| AI fallback tests pass | `tests/unit/ai-retrieval-guardrails.test.js`, `tests/contract/dynamic-performance.test.js`, `tests/contract/tachycardia-dynamic-path.test.js` |
| Cloud auth / CORS / TTL tests pass | `tests/contract/triage-demo-api.test.js`, `tests/contract/cloud-security-reliability.test.js`, `tests/integration/redis-session-store.test.js` |
| Clinical reviewer approves wording | Pending named reviewer signoff; checklist prepared in `handoff/2026-06-08-dynamic-engine-clinical-wording-review-checklist.md` |
| imedtac receives deployment notice | Draft prepared in `handoff/2026-06-08-dynamic-engine-deployment-notice-draft.md` |

## Current Boundary

The implementation is ready for internal engineering rehearsal. Company-facing
deployment still needs a named clinical wording review and an explicit
deployment notice before release.
