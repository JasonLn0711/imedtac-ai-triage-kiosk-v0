# Dynamic Engine Spec Coverage Audit

Date: 2026-06-08
Spec: `docs/ai-triage-dynamic-engine-sdd-implementation-test-spec.md`
Scope: backend dynamic engine for the synthetic-data tachycardia kiosk demo

## First Principle

The durable product decision is to keep the imedtac-facing API stable and place
dynamic routing inside the NYCU backend. Completion is therefore measured by
whether the backend can run the reviewed manifest, preserve the existing session
contract, produce different governed paths from the same vital payload, and
assemble staff-review summaries without diagnosis, treatment, formal triage
level, department recommendation, or unreviewed patient-facing question output.

Release to an imedtac demo environment is a separate external gate. It requires
named clinical wording/template approval and an explicit deployment notice /
compatibility confirmation with imedtac.

## Section Coverage

| Spec section | Requirement | Evidence | Current state |
| --- | --- | --- | --- |
| 1 Decision Summary | Cloud/backend engine behind stable `/sessions`, `/answers`, `/summary`; optional `/answer-candidates` helper | `decisions/2026-06-08-dynamic-engine-cloud-backend-boundary.md`; `api/triage-demo/sessions.js`; `api/triage-demo/sessions/[session_key]/answers.js`; `api/triage-demo/sessions/[session_key]/summary.js`; `api/triage-demo/sessions/[session_key]/answer-candidates.js` | repo-local complete |
| 2.1 Product Goals | Dynamic tachycardia path, AI-supported answer/route support, stable option contract, audit trace | `api/lib/dynamic-engine/`; `data/question_manifest.tachycardia.v0.3.json`; `data/vector_index/tachycardia.v0.3.json`; `tests/contract/tachycardia-dynamic-path.test.js` | repo-local complete |
| 2.2 Safety Goals | No diagnosis, treatment, orders, formal triage level, department recommendation, or unreviewed patient-facing questions | `tests/unit/summary-assembler.test.js`; `tests/contract/tachycardia-dynamic-path.test.js`; `scripts/checks/smoke-demo.js`; `scripts/validate_dynamic_manifest.py` | repo-local complete |
| 2.3 Engineering Goals | Cloud-deployable backend, versioned manifest/effects/policy/templates, Redis/persistent store path, AI fallback | `Dockerfile`; `docker-compose.yml`; `api/lib/session-store.js`; `data/*.tachycardia.v0.3.json`; `api/lib/dynamic-engine/ai-retrieval-client.js` | repo-local complete |
| 3 Cloud Backend Feasibility | API gateway/CORS/token boundary, session store, manifest store, retrieval/rerank support, audit | `api/lib/triage-demo-contract.js`; `api/lib/session-store.js`; `docker-compose.yml`; `tests/contract/cloud-security-reliability.test.js` | repo-local complete for demo stack |
| 4 Runtime Architecture | Touchscreen flow, ASR/free-text flow, next-question retrieval/reranking, deterministic policy gate | `api/lib/dynamic-engine/index.js`; `answer-candidate-matcher.js`; `ai-retrieval-client.js`; `routing-policy-engine.js` | repo-local complete |
| 5.1 Session API | Auth, request body guard, idempotency, stable errors, renderable question response | `api/lib/triage-demo-contract.js`; `tests/contract/triage-demo-api.test.js`; `tests/contract/cloud-security-reliability.test.js` | repo-local complete |
| 5.2 Session Store | Session state with vitals, answers, flags, routing trace, TTL | `api/lib/triage-demo-contract.js`; `api/lib/session-store.js`; `tests/integration/redis-session-store.test.js` | repo-local complete |
| 5.3 Question Manifest | Versioned runtime manifest generated from reviewed registry rows | `data/question_manifest.tachycardia.v0.3.json`; `scripts/build_tachy_manifest.py`; `scripts/validate_dynamic_manifest.py` | repo-local complete; clinical owner names remain external |
| 5.4 Answer Effects | Option-to-effect and reason-code map | `data/answer_effects.tachycardia.v0.3.json`; `api/lib/dynamic-engine/answer-effect-mapper.js`; `tests/unit/answer-effect-mapper.test.js` | repo-local complete |
| 5.5 Routing Policy | Priority branches, safe candidate filter, routing trace | `data/routing_policy.tachycardia.v0.3.json`; `routing-policy-engine.js`; `routing-trace-recorder.js`; `tests/unit/routing-policy-engine.test.js` | repo-local complete |
| 5.6 AI Retrieval / Reranking | Embedding/reranker wrapper, vector rows, score blend, deterministic fallback, manifest safety gate | `api/lib/dynamic-engine/ai-retrieval-client.js`; `scripts/build_vector_index.js`; `data/vector_index/tachycardia.v0.3.json`; `tests/unit/ai-retrieval-guardrails.test.js` | repo-local complete for local demo wrapper and Qwen-ready index contract |
| 5.7 Summary Assembler | Session-fact summary, approved template retrieval, missing facts omitted | `summary-assembler.js`; `summary-template-retriever.js`; `data/summary_templates.tachycardia.v0.3.json`; `tests/unit/summary-assembler.test.js` | repo-local complete |
| 6 API Design | Compatible start/answer/summary responses plus optional candidates endpoint and debug metadata | `api/lib/triage-demo-contract.js`; route files under `api/triage-demo/sessions/`; contract tests | repo-local complete |
| 7 Phase 0 | Contract freeze, cloud env, health, Redis adapter, logging | `api/lib/triage-demo-contract.js`; `api/lib/session-store.js`; `scripts/mock-api-server.js`; `Dockerfile`; `docker-compose.yml`; cloud/security tests | repo-local complete |
| 7 Phase 1 | Manifest, effects, routing policy, templates, runtime modules | `data/*.tachycardia.v0.3.json`; `api/lib/dynamic-engine/` | repo-local complete |
| 7 Phase 2 | Manifest/registry validator, build script, option/source validation, unreviewed runtime block | `scripts/build_tachy_manifest.py`; `scripts/validate_dynamic_manifest.py`; `scripts/check_governance_registries.py` | repo-local complete; named reviewer remains external |
| 7 Phase 3 | AI retrieval/reranker support, vector index, fallback | `ai-retrieval-client.js`; `build_vector_index.js`; vector index JSON; AI tests | repo-local complete for demo wrapper |
| 7 Phase 4 | `/answer-candidates`, transcript normalizer, current-question matcher, confidence policy, no raw audio retention | route file; `answer-candidate-matcher.js`; `tests/contract/answer-candidates-api.test.js`; `CLD-PRIV-001` | repo-local complete |
| 7 Phase 5 | Docker/compose, env token handling, CORS, rate limit, body limit, logs | `Dockerfile`; `docker-compose.yml`; `README.md`; `cloud-security-reliability.test.js` | repo-local complete for demo deployment; live imedtac machine call is external |
| 7 Phase 6 | Rehearsal packet, clinical checklist, test report, deployment notice, external closeout packet | `handoff/2026-06-08-dynamic-engine-two-path-rehearsal-packet.md`; clinical checklist; test report; deployment notice draft; `handoff/2026-06-08-dynamic-engine-external-release-gate-closeout.md` | repo-local artifacts complete; external signoff/send pending |

## Test Matrix Coverage

| Test family | Spec IDs | Evidence |
| --- | --- | --- |
| Unit manifest/effects/flags/routing/summary | `UT-MAN-001` through `UT-SUM-003`, plus `AI-SUM-001` extension | `tests/unit/manifest-schema.test.js`; `answer-effect-mapper.test.js`; `routing-policy-engine.test.js`; `summary-assembler.test.js` |
| Contract API and summary | `CT-API-001` through `CT-SUM-003` | `tests/contract/triage-demo-api.test.js`; `tests/contract/tachycardia-dynamic-path.test.js` |
| Dynamic paths | `RT-DYN-001` through `RT-DYN-003` | `tests/contract/tachycardia-dynamic-path.test.js`; `tests/e2e/` |
| AI retrieval / reranking / trace | `AI-RET-001` through `AI-TRACE-001` | `tests/unit/ai-retrieval-guardrails.test.js`; `tests/contract/tachycardia-dynamic-path.test.js` |
| ASR / free-text option matching | `ASR-OPT-001` through `ASR-OPT-008` | `tests/contract/answer-candidates-api.test.js` |
| Summary | `SUM-001` through `SUM-007` | `tests/unit/summary-assembler.test.js`; `tests/contract/tachycardia-dynamic-path.test.js` |
| Cloud / security / reliability | `CLD-AUTH-001` through `CLD-PRIV-001`, plus `REDIS-SESSION-001` | `tests/contract/cloud-security-reliability.test.js`; `tests/integration/redis-session-store.test.js` |
| Performance | `PERF-001` through `PERF-005` | `tests/contract/dynamic-performance.test.js` |

Spec test-ID scan result: 52 spec IDs, missing IDs: none.

## Release Gate Status

| Release gate | Evidence | Current state |
| --- | --- | --- |
| 1. Existing contract tests pass | `npm run test:contract` inside `npm run demo:ready` | complete |
| 2. Dynamic Path A / B pass | `tests/e2e/tachycardia-path-a-low-concern.test.js`; `tests/e2e/tachycardia-path-b-warning-symptoms.test.js` | complete |
| 3. Summary consistency tests pass | `tests/unit/summary-assembler.test.js`; `tests/contract/tachycardia-dynamic-path.test.js` | complete |
| 4. Forbidden output tests pass | unit, contract, and smoke checks | complete |
| 5. Routing trace tests pass | `AI-TRACE-001`; audit-log tests | complete |
| 6. AI fallback tests pass | `AI-RET-003`; `SUM-007`; `PERF-005` | complete |
| 7. Cloud auth / CORS / TTL tests pass | cloud/security/reliability tests and Redis integration test | complete |
| 8. Clinical reviewer approves question wording and summary templates | checklist prepared in `handoff/2026-06-08-dynamic-engine-clinical-wording-review-checklist.md` | pending external named reviewer |
| 9. imedtac receives deployment notice | draft prepared in `handoff/2026-06-08-dynamic-engine-deployment-notice-draft.md` | pending external send/confirmation |

## Current Verification Record

The current implementation has been verified with:

```bash
npm run demo:ready
python3 scripts/check_governance_registries.py
docker compose config
DEMO_REDIS_URL=redis://127.0.0.1:<redis-port>/0 npm run test:integration
git diff --check
```

The local Redis restart-continuity test passed with a disposable Redis
container. No Redis test container remained after cleanup.

## Boundary Conclusion

The repo-local implementation and evidence package satisfy the dynamic-engine
SDD for internal engineering rehearsal. The remaining work is not a code or
test gap: it is the external release-control layer required by the spec before
deployment to an imedtac demo environment.
