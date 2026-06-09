# Dynamic Engine Cloud Backend Boundary

Date: 2026-06-08
Status: active internal implementation decision
Source spec: `docs/ai-triage-dynamic-engine-sdd-implementation-test-spec.md`

## First Principle

The scarce resource is integration consistency with 慧誠智醫（imedtac Co.,
Ltd.）while still making the demo visibly dynamic. The stable product boundary
is:

```text
imedtac frontend renders questions and collects choices
-> NYCU / cloud backend owns session state, routing, answer effects, summary assembly, and audit trace
-> staff_review_summary remains the output
```

The frontend should not need to know Qwen3, vector stores, reranking, manifest
filters, answer effects, or routing policy. It should continue to call the
stable HTTPS session API.

## Decision

Place the dynamic triage engine in the cloud/backend service, behind the
existing session API. Keep the externally communicated June API surface stable:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

Additive backend helpers are allowed when they do not force imedtac frontend
changes:

```text
GET  /api/triage-demo/sessions/{session_key}/summary
POST /api/triage-demo/sessions/{session_key}/answer-candidates
```

The official answer submission path remains `/answers` with stable
`selected_option_ids`. The candidate endpoint may highlight ASR/free-text
matches, but it does not submit answers, change session state, or accept raw
audio.

## Implemented Slice

This repo now carries the Phase 1 deterministic dynamic engine:

- `data/question_manifest.tachycardia.v0.3.json`
- `data/answer_effects.tachycardia.v0.3.json`
- `data/routing_policy.tachycardia.v0.3.json`
- `data/summary_templates.tachycardia.v0.3.json`
- `api/lib/dynamic-engine/`
- contract tests for dynamic low-concern and warning-symptom paths

The backend now uses option effects and deterministic policy to choose the next
tachycardia question. Same vitals plus different answers can produce different
next questions and different staff-review summaries while preserving the
external response shape.

## AI Placement

The next AI layer is candidate support, not autonomous medical judgment:

- answer transcript -> current-question allowed option candidates;
- session context -> reviewed next-question candidates;
- reason codes -> approved staff-summary phrase candidates.

Qwen3 embedding / reranker support stays a planned Phase 3 layer until it is
implemented, measured, and covered by fallback tests. The deterministic policy
and manifest safety gate remain the final authority.

## Scope Controls

The engine must not output diagnosis, treatment advice, ECG/lab/medication
orders, formal triage level, department recommendation, or HIS/EMR/FHIR
writeback claims.

The v0.3 dynamic manifest is internal. It does not silently revise the v0.2
external API version fields already sent to imedtac.

## Validation Gates

Before deployment to an imedtac demo environment:

- existing contract tests pass;
- low-concern and warning-symptom paths pass with identical vitals;
- summaries use current session vitals and omit missing vital facts;
- answer candidates stay inside the current question option space;
- ambiguous candidates require confirmation and do not auto-submit;
- routing trace records candidate ids, selected next question id, and reason
  codes;
- forbidden-output checks remain clean;
- any external behavior change is recorded before discussion with imedtac.
