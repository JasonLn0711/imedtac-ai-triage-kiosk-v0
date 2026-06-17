# AI Triage Dynamic Engine SDD / Implementation Plan / Test Specification

Version: v0.3-draft
Date: 2026-06-08
Scope: 慧誠智醫 iMVS frontend 呼叫 NYCU / cloud backend triage engine
Primary case lane: tachycardia / high-heart-rate synthetic-data demo

## 1. Decision Summary

可以把後端 engine 放在 cloud backend server 上，讓慧誠智醫的 frontend 透過 HTTPS API 呼叫。這個分工也比較穩：frontend 專心做量測、顯示題目、收答案、顯示 summary；backend 負責 session、routing、AI retrieval / reranking、summary assembly、audit trace。

核心 API 不需要改：

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
GET  /api/triage-demo/sessions/{session_key}/summary
```

新增能力放在 backend engine 內部。ASR / free-text 可以先用 optional helper endpoint 支援，不阻斷現有 touchscreen flow：

```http
POST /api/triage-demo/sessions/{session_key}/answer-candidates
```

這個 helper 只把 transcript 對應到目前題目的 allowed option ids，回傳候選答案與 confidence。frontend 必須讓使用者或工作人員確認後，才送正式 `/answers`。

建議採用 AI-supported governed routing：

```text
iMVS frontend
-> cloud API gateway
-> session API
-> dynamic triage engine
   -> deterministic policy
   -> Qwen3 Embedding candidate retrieval
   -> Qwen3 Reranker candidate reranking
   -> safety gate / manifest filter
   -> selected next question
-> staff_review_summary assembler
```

AI 有參與三件事：答案語意對應、下一題候選題 retrieval / reranking、summary phrase template retrieval。最後選題由 deterministic safety gate 決定，避免 model 自行產生診斷、治療建議、正式檢傷級別或未審核的病人題目。

## 2. System Goals

### 2.1 Product Goals

1. 維持現有 imedtac frontend integration 成本最低。
2. 讓 tachycardia demo 明顯感覺到動態問答。
3. 讓 AI engine 參與答題方式與題目選擇。
4. 讓所有輸出仍然是 staff-review intake support。
5. 保留可稽核的 routing_trace，方便 clinical / engineering review。
6. 支援未來 ASR / free-text 輸入，同時保留穩定 option.id contract。

### 2.2 Safety Goals

系統不得輸出以下內容：

- 診斷結論。
- 治療建議。
- ECG / lab / medication order。
- 正式檢傷級別。
- 科別建議。
- 緊急處置指令。
- 未審核的病人題目。

所有臨床解釋都應進入 `staff_review_summary`，並標示為工作人員確認事項。

### 2.3 Engineering Goals

- Backend 可部署在 cloud。
- Core endpoints 維持不變。
- AI inference 服務可水平拆分。
- session state 可由 in-memory 遷移到 Redis / Postgres。
- question manifest、answer effects、routing policy、summary templates 可版本化。
- 所有 AI decision support 均有 fallback。

## 3. Cloud Backend Feasibility

### 3.1 Recommended Deployment Pattern

```text
慧誠智醫 iMVS frontend
  -> HTTPS + bearer token / JWT
  -> API Gateway / CORS allowlist
  -> Triage Session API
  -> Dynamic Engine
       -> Session Store
       -> Question Manifest Store
       -> Embedding Service
       -> Reranker Service
       -> Vector Store
       -> Summary Template Store
  -> staff_review_summary
```

Frontend 不需要知道 engine 是否使用 Qwen3、pgvector、reranker 或 deterministic policy。它只需要遵守既有 API contract：start session、submit answer、read summary。

### 3.1.1 Render To Lab GPU Inference Bridge

For the June demo evolution, Render can remain the public backend
orchestrator while heavier AI inference runs on a lab GPU server:

```text
Frontend / iMVS
  -> Render Backend
  -> REST API / HTTPS
  -> Lab GPU Server
  -> Qwen3 Embedding / Qwen3 Reranker
  -> Render Backend
  -> Frontend / iMVS
```

Render is linked to the GitHub repo and redeploys backend code from the
configured branch. That backend code may call a lab GPU FastAPI service by
reading environment variables such as `LAB_GPU_BASE_URL`,
`LAB_GPU_API_KEY`, `LAB_GPU_TIMEOUT_MS`, and `LAB_GPU_ENABLED`.

The key requirement is network reachability from Render to the lab GPU server.
Acceptable demo paths include public HTTPS with firewall control, Cloudflare
Tunnel, Tailscale Funnel, ngrok / frp, or a VPS reverse proxy. The recommended
demo path is:

```text
Render Backend
  -> HTTPS
  -> Cloudflare Tunnel
  -> Lab GPU Server FastAPI
```

This keeps model weights and GPU runtime under lab control while preserving the
same frontend-facing Render API contract. The Render backend remains the final
authority for deterministic policy, reviewed manifest filtering, routing trace,
summary assembly, auth/CORS/session behavior, and fallback when the GPU service
is unavailable or returns invalid candidates. The lab GPU service returns
candidate ids, scores, model version, index version, and latency metadata; it
does not return diagnosis, treatment, formal triage level, or unreviewed
patient-facing questions.

For reboot-stable operation, the lab GPU server should not require manually
opening ports after every restart. The target operations pattern is FastAPI on
`127.0.0.1:8000` plus `cloudflared` installed as a systemd service, with Render
calling one fixed HTTPS hostname through `LAB_GPU_BASE_URL`. The runbook is
`handoff/2026-06-09-lab-gpu-cloudflare-tunnel-runbook.md`.

### 3.2 Demo Cloud Stack

建議最小可部署版本：

| Layer | Suggested component | Reason |
| --- | --- | --- |
| API runtime | Existing Node.js / Express / Next API, or FastAPI | 保留現有 API contract |
| Session store | Redis with TTL | 支援 30-minute session、重啟不丟 session |
| Registry store | JSON files first, Postgres later | demo 速度快，之後可治理 |
| Vector store | pgvector / Qdrant / Milvus Lite | 小型 question bank 足夠 |
| Embedding model | Qwen3-Embedding-0.6B default | 快速、成本低、可升級 |
| Reranker model | Qwen3-Reranker-0.6B default | top-k reranking，延遲可控 |
| Audit store | Postgres / append-only JSONL | 保留 routing_trace 與 request_id |
| Observability | structured logs + request_id | demo 問題可追蹤 |
| Lab GPU inference bridge | Render outbound HTTPS to lab FastAPI, preferably through Cloudflare Tunnel | 保留 Render API 穩定性，同時把 Qwen3 inference 放在實驗室 GPU |

### 3.3 Production Path

真實病人資料上線前，需要另外做：資料治理、PHI / 個資保護、資安審查、audit log retention、臨床驗證、model / policy change control、醫院網路與 HIS / EMR / FHIR integration design。

目前 demo 文件的定位是 synthetic-data vital-aware intake support。cloud backend 可用在 demo；production 需要獨立 validation path。

## 4. Architecture

### 4.1 Runtime Flow: Touchscreen Answer

```text
1. iMVS 完成 vital measurement。
2. Frontend POST /sessions，送 vitals + capabilities。
3. Backend 建立 session，回傳第一題。
4. User 點選 option。
5. Frontend POST /answers，送 question_id + selected_option_ids。
6. Backend 將 option ids 映射到 effects / flags。
7. Backend 用 policy + AI candidate retrieval/reranking 決定下一題。
8. Backend 回傳下一題或 staff_review_summary。
```

### 4.2 Runtime Flow: ASR / Free-text Answer

```text
1. Frontend 取得 ASR transcript。
2. Frontend POST /answer-candidates。
3. Backend 僅在 current_question.allowed_options 內比對。
4. Embedding retrieve candidate option ids。
5. Reranker score transcript-option pairs。
6. Backend 回傳 candidate option ids + confidence + explanation。
7. Frontend highlight candidate，要求 user / staff confirmation。
8. Frontend POST /answers，仍然只送 stable selected_option_ids。
```

控制點：ASR transcript 不直接改變 session answer。正式答案仍以 option.id 為準。

### 4.3 Runtime Flow: Next Question Selection

```text
1. Build context query from vitals + selected effects + unanswered goals。
2. Retrieve top-k reviewed questions from question_index。
3. Rerank candidate questions。
4. Apply manifest constraints:
   - demo_allowed = true
   - reviewed / source-backed
   - question type supported by frontend
   - option count 2-9
   - label length within UI constraint
   - no repeated question unless explicitly allowed
5. Apply deterministic routing policy priority。
6. Return selected question。
7. Record routing_trace。
```

AI retrieves and ranks. Policy chooses and gates.

## 5. Component Design

### 5.1 Triage Session API

Responsibilities:

- Validate bearer token / JWT。
- Validate request body and `idempotency_key`。
- Create / load session by `session_key`。
- Return typed renderable question object。
- Lock answer order by current `question_id`。
- Return stable error codes。

### 5.2 Session Store

Suggested shape:

```json
{
  "session_key": "demo_...",
  "case_id": "demo-tachycardia-live-001",
  "state": "active",
  "session_expires_at": "2026-06-08T10:30:00+08:00",
  "vitals": {
    "heart_rate": 130,
    "spo2": 97,
    "blood_pressure": "128/82"
  },
  "answers": [
    {
      "question_id": "tachy-current-feeling",
      "selected_option_ids": ["heart_racing", "chest_heavy"],
      "option_effects": ["reported_palpitations", "reported_chest_tightness"],
      "input_method": "touch",
      "timestamp": "...",
      "idempotency_key": "..."
    }
  ],
  "derived_flags": {
    "elevated_heart_rate_demo": true,
    "reported_palpitations": true,
    "reported_chest_tightness": true,
    "selected_short_breath": false,
    "selected_dizzy_faint": false
  },
  "routing_trace": []
}
```

### 5.3 Question Manifest

Runtime source should be a versioned JSON manifest generated from reviewed registry files.

```json
{
  "manifest_version": "tachycardia.v0.3",
  "questions": [
    {
      "id": "tachy-associated-symptoms",
      "type": "multi_choice",
      "text": "Are any of these happening with it?",
      "review_status": "demo_reviewed",
      "demo_allowed": true,
      "clinical_scope": "staff_review_intake_support",
      "source_refs": ["TACHY-004"],
      "options": [
        {
          "id": "short_breath",
          "label": "Shortness of breath",
          "effects": ["associated_short_breath"],
          "synonyms": ["喘", "喘不過氣", "breathless", "short of breath"]
        },
        {
          "id": "dizzy_faint",
          "label": "Dizzy or fainting",
          "effects": ["associated_dizzy_faint"],
          "synonyms": ["頭暈", "快昏倒", "lightheaded", "almost fainted"]
        },
        {
          "id": "none_of_these",
          "label": "None of these",
          "effects": ["associated_symptoms_none_selected"],
          "mutually_exclusive": true
        }
      ]
    }
  ]
}
```

### 5.4 Answer Effects

Each option id maps to semantic effects and reason codes.

```json
{
  "tachy-associated-symptoms.short_breath": {
    "effects": ["associated_short_breath"],
    "reason_codes": ["selected_short_breath_with_high_hr"]
  },
  "tachy-associated-symptoms.dizzy_faint": {
    "effects": ["associated_dizzy_faint"],
    "reason_codes": ["selected_dizzy_or_faint_with_high_hr"]
  },
  "tachy-associated-symptoms.none_of_these": {
    "effects": ["associated_symptoms_none_selected"],
    "reason_codes": ["no_listed_associated_symptoms_selected"]
  }
}
```

### 5.5 Routing Policy

Policy priority:

| Priority | Condition | Selected behavior |
| --- | --- | --- |
| P0 | invalid / expired / stale question | stable error |
| P1 | chest pressure/pain + short breath / dizzy | warning-symptom review question |
| P2 | chest pressure/pain only | chest detail / current-state follow-up |
| P3 | short breath / dizzy selected | associated symptom staff-confirm follow-up |
| P4 | none_of_these selected | heart-rate cue + history / meds path |
| P5 | not sure selected | staff-confirm wording |
| P6 | default | next reviewed tachycardia lane question |

Pseudo-code:

```ts
function selectNextQuestion(session, currentQuestion, selectedOptionIds) {
  const effects = mapOptionEffects(currentQuestion.id, selectedOptionIds);
  const updated = updateDerivedFlags(session, effects);

  const aiCandidates = retrieveAndRerankQuestions({
    vitals: updated.vitals,
    derived_flags: updated.derived_flags,
    answered_question_ids: updated.answers.map(a => a.question_id),
    manifest_version: updated.manifest_version
  });

  const safeCandidates = filterByManifestAndUiConstraints(aiCandidates);
  const policyDecision = applyRoutingPolicy(updated, safeCandidates);

  recordRoutingTrace({
    from_question_id: currentQuestion.id,
    selected_option_ids: selectedOptionIds,
    effects,
    ai_candidate_question_ids: aiCandidates.map(q => q.id),
    safe_candidate_question_ids: safeCandidates.map(q => q.id),
    selected_next_question_id: policyDecision.next_question_id,
    reason_codes: policyDecision.reason_codes
  });

  return policyDecision;
}
```

### 5.6 AI Retrieval / Reranking Service

Recommended default:

- Embedding: Qwen3-Embedding-0.6B。
- Reranker: Qwen3-Reranker-0.6B。
- Upgrade path: 4B if accuracy is insufficient; 8B only if GPU budget and latency are acceptable。

Question candidate query example:

```json
{
  "case_id": "demo-tachycardia-live-001",
  "vitals": { "heart_rate": 130, "spo2": 97 },
  "effects": ["reported_chest_tightness", "associated_short_breath"],
  "unanswered_goals": ["warning_symptom_review", "history_meds"],
  "ui_capabilities": { "question_types": ["single_choice", "multi_choice"], "max_options": 9 }
}
```

Candidate scoring:

```text
final_candidate_score =
  0.35 * reranker_score
+ 0.25 * embedding_similarity
+ 0.25 * clinical_policy_need_score
+ 0.15 * unanswered_goal_score
- duplicate_penalty
- unsupported_ui_penalty
```

Policy may override score when a higher-priority safety branch applies.

### 5.7 Summary Assembler

Summary is assembled from facts in session state and approved templates.

Sections:

```text
subjective: selected answer effects and patient-provided context
objective: measured vitals present in this session
review_basis: measured vital cue + selected answer families
review_actions: staff confirmation checklist
handoff_reason_codes: stable reason codes
scope_controls: demo boundary
```

Rule: if a symptom or vital value is missing from this session, summary must not present it as fact.

## 6. API Design

### 6.1 Existing Start Session

```http
POST /api/triage-demo/sessions
```

Response remains compatible:

```json
{
  "session_key": "demo_abc123",
  "session_state": "active",
  "status": "question",
  "progress": { "current": 1, "expected_total": 7 },
  "question": {
    "id": "tachy-chief-concern",
    "type": "single_choice",
    "text": "What feels most important right now?",
    "options": [
      { "id": "heart_racing", "label": "Heart racing" },
      { "id": "chest_heavy", "label": "Chest tightness" }
    ]
  }
}
```

### 6.2 Existing Submit Answer

```http
POST /api/triage-demo/sessions/{session_key}/answers
```

Compatible request:

```json
{
  "question_id": "tachy-current-feeling",
  "answer": {
    "selected_option_ids": ["heart_racing", "chest_heavy"],
    "scale_value": null
  },
  "idempotency_key": "answer-003"
}
```

Backward-compatible optional metadata:

```json
{
  "question_id": "tachy-current-feeling",
  "answer": {
    "selected_option_ids": ["chest_heavy"],
    "scale_value": null,
    "input_method": "asr_confirmed",
    "transcript_id": "transcript_ephemeral_123"
  },
  "idempotency_key": "answer-003"
}
```

### 6.3 Optional ASR / Free-text Candidate Endpoint

```http
POST /api/triage-demo/sessions/{session_key}/answer-candidates
```

Request:

```json
{
  "question_id": "tachy-associated-symptoms",
  "input": {
    "method": "asr",
    "locale": "zh-TW",
    "transcript": "我覺得喘不過氣，也有點頭暈",
    "asr_confidence": 0.86
  }
}
```

Response:

```json
{
  "status": "candidates",
  "question_id": "tachy-associated-symptoms",
  "allowed_option_space": ["short_breath", "sweating_nausea_fatigue", "dizzy_faint", "none_of_these"],
  "candidates": [
    {
      "option_id": "short_breath",
      "label": "Shortness of breath",
      "confidence": 0.91,
      "needs_confirmation": true
    },
    {
      "option_id": "dizzy_faint",
      "label": "Dizzy or fainting",
      "confidence": 0.84,
      "needs_confirmation": true
    }
  ],
  "recommended_ui_action": "highlight_candidates_require_confirmation"
}
```

### 6.4 Debug Metadata

For demo stability, routing metadata should remain internal by default. Add a debug flag for NYCU review only:

```json
{
  "debug": {
    "routing_trace_id": "rt_...",
    "reason_codes": ["associated_warning_symptom_selected"],
    "ai_candidate_question_ids": ["tachy-warning-symptom-review", "tachy-heart-history-meds"],
    "selected_next_question_id": "tachy-warning-symptom-review"
  }
}
```

Do not require imedtac frontend to render debug metadata.

## 7. Implementation Plan

### Phase 0: Contract Freeze And Cloud Skeleton

Deliverables:

- Keep existing endpoints and response shape。
- Add cloud deployment environment variables。
- Add health check endpoint。
- Add Redis session adapter behind the existing session-store interface。
- Add structured logging with `request_id`, `session_key`, `idempotency_key`。

Acceptance:

- Existing contract tests pass unchanged。
- iMVS frontend can call the same endpoint paths。
- A restarted API instance can still serve summary lookup when Redis / persistent session store is enabled。

### Phase 1: Deterministic Dynamic Engine

Deliverables:

- `data/question_manifest.tachycardia.v0.3.json`
- `data/answer_effects.tachycardia.v0.3.json`
- `data/routing_policy.tachycardia.v0.3.json`
- `data/summary_templates.tachycardia.v0.3.json`
- Runtime modules:
  - `answerEffectMapper`
  - `derivedFlagUpdater`
  - `routingPolicyEngine`
  - `summaryAssembler`
  - `routingTraceRecorder`

Acceptance:

- Same HR context, different answers produce visible next-question or summary differences。
- Summary values match current session vitals。
- No forbidden clinical outputs。

### Phase 2: Manifest / Registry Hardening

Deliverables:

- Manifest schema validator。
- Build script from registry CSV to manifest JSON。
- Validation for option count, label length, source refs, option id uniqueness。
- CI check that blocks unreviewed runtime question rows。

Acceptance:

- Runtime cannot serve a question missing manifest approval。
- Runtime cannot serve unsupported option count or invalid option IDs。

### Phase 3: AI Retrieval / Reranker Support

Deliverables:

- Embedding service wrapper。
- Vector index builder for question rows and option rows。
- Reranker service wrapper。
- Retrieval API used internally by routing engine。
- AI fallback path if model service fails。

Acceptance:

- If AI service is healthy, engine retrieves and reranks candidate questions。
- If AI service fails, deterministic policy still returns safe next question。
- AI cannot select a question outside manifest。

### Phase 4: ASR / Free-text Option Matching

Deliverables:

- Optional `/answer-candidates` endpoint。
- Transcript normalizer。
- Current-question-only option matcher。
- Confidence policy:
  - `>= 0.82`: highlight candidate and require confirmation。
  - `0.60-0.82`: show ambiguous candidates and ask user / staff to choose。
  - `< 0.60`: recommend `not_sure` / staff confirmation path。
- No raw audio retention policy。

Acceptance:

- Transcript maps only to current question options。
- Ambiguous transcript never auto-submits answer。
- Official `/answers` call still submits stable option IDs。

### Phase 5: Cloud Deployment

Deliverables:

- Dockerfile / compose file。
- Separate API and AI service containers, or single container for demo。
- Optional Render-to-lab-GPU inference bridge through `LAB_GPU_BASE_URL` and
  `LAB_GPU_API_KEY` environment variables。
- Secret management for tokens。
- CORS allowlist for imedtac frontend origins。
- Rate limiting and request body size limit。
- Observability dashboard / logs。

Acceptance:

- iMVS machine can call cloud API。
- Render backend can call the configured lab GPU inference URL, or cleanly
  record deterministic fallback when it is disabled, unreachable, slow, or
  returns invalid candidates。
- p95 tap-flow latency target: under 800 ms after session start, excluding cold start。
- p95 AI candidate retrieval + rerank target: under 1500 ms for top-k <= 20 on 0.6B model。
- Fallback path returns in under 800 ms when AI service is unavailable。

### Phase 6: Review And Release

Deliverables:

- Two-path rehearsal packet。
- Clinical wording review checklist。
- Test report。
- Deployment notice to imedtac before every release。

Acceptance:

- Clinical reviewer approves patient-facing question wording and summary templates。
- Engineering tests pass。
- imedtac confirms frontend compatibility。

## 8. Test Specification

### 8.1 Test Pyramid

```text
Unit tests
  -> manifest schema
  -> option effect mapping
  -> routing policy
  -> summary assembler
  -> AI score normalization

Contract tests
  -> /sessions
  -> /answers
  -> /summary
  -> idempotency
  -> stable error codes

Integration tests
  -> session + routing + AI fallback
  -> session + ASR candidate endpoint
  -> vector retrieval + reranking + policy gate

E2E tests
  -> Path A: palpitations + none associated symptoms
  -> Path B: chest pressure + shortness of breath + dizziness
```

### 8.2 Unit Tests

| Test ID | Area | Input | Expected |
| --- | --- | --- | --- |
| UT-MAN-001 | Manifest schema | valid tachycardia manifest | passes |
| UT-MAN-002 | Manifest schema | option count 10 | fails |
| UT-MAN-003 | Manifest schema | duplicate option.id | fails |
| UT-MAN-004 | Manifest schema | missing source_ref | fails |
| UT-EFF-001 | Effects | `short_breath` | maps to `associated_short_breath` |
| UT-EFF-002 | Effects | `none_of_these` with another option | fails or removes mutually exclusive conflict |
| UT-FLAG-001 | Flags | HR 130 | `elevated_heart_rate_demo=true` |
| UT-FLAG-002 | Flags | missing HR | no measured HR claim |
| UT-ROUTE-001 | Routing | short_breath + dizzy | selects warning-symptom follow-up |
| UT-ROUTE-002 | Routing | none_of_these | selects heart-rate cue/history path |
| UT-ROUTE-003 | Routing | AI returns unapproved question | filters candidate out |
| UT-SUM-001 | Summary | selected short_breath | summary includes staff-review phrase |
| UT-SUM-002 | Summary | no SpO2 in vitals | summary omits measured SpO2 claim |
| UT-SUM-003 | Summary | no forbidden terms | summary contains no diagnosis/treatment/formal acuity |

### 8.3 Contract Tests

| Test ID | Endpoint | Scenario | Expected |
| --- | --- | --- | --- |
| CT-API-001 | POST /sessions | valid request | returns `session_key`, `status=question` |
| CT-API-002 | POST /sessions | missing bearer token | stable auth error |
| CT-API-003 | POST /answers | valid current question answer | returns next question or summary |
| CT-API-004 | POST /answers | stale `question_id` | stable stale-question error |
| CT-API-005 | POST /answers | invalid option id | stable validation error |
| CT-IDEMP-001 | POST /answers | same idempotency key, same body | returns cached response |
| CT-IDEMP-002 | POST /answers | same idempotency key, changed body | returns `idempotency_conflict` |
| CT-SUM-001 | GET /summary | active session | returns `session_not_summary_ready` |
| CT-SUM-002 | GET /summary | completed session | returns `staff_review_summary` |
| CT-SUM-003 | GET /summary | expired session | returns `session_expired` |

### 8.4 Dynamic Path Tests

#### RT-DYN-001: Low-concern path

Input path:

```text
Vitals: HR 130, SpO2 97, BP 128/82
Q1: heart_racing
Q2: onset_today
Q3: heart_racing
Q4: none_of_these
```

Expected:

- Next question emphasizes heart-rate cue, rhythm history, medication context, or staff confirmation。
- Summary includes: selected no listed associated symptoms。
- Summary objective uses HR 130, SpO2 97, BP 128/82。
- Summary does not contain diagnosis, treatment, formal triage level, department recommendation。

#### RT-DYN-002: Warning-symptom path

Input path:

```text
Vitals: HR 130, SpO2 97, BP 128/82
Q1: chest_heavy
Q2: onset_today
Q3: chest_heavy
Q4: short_breath + dizzy_faint
```

Expected:

- Next question differs from RT-DYN-001, or phase reason differs visibly。
- Summary includes selected shortness of breath and dizziness/fainting context for staff review。
- `routing_trace.reason_codes` includes `associated_warning_symptom_selected` or equivalent。
- No forbidden clinical outputs。

#### RT-DYN-003: Same vitals, different answers produce different summary

Run RT-DYN-001 and RT-DYN-002 with same vital payload.

Expected:

- `staff_review_summary.subjective` differs。
- `handoff_reason_codes` differs。
- `objective` section remains equal except session identifiers / timestamps。

### 8.5 AI Retrieval / Reranking Tests

| Test ID | Scenario | Expected |
| --- | --- | --- |
| AI-RET-001 | context: HR 130 + chest_heavy + short_breath | retrieves warning-symptom candidates |
| AI-RET-002 | context: HR 130 + none_of_these | retrieves heart-rate cue / history candidates |
| AI-RET-003 | vector store unavailable | deterministic fallback path used |
| AI-RERANK-001 | top-k includes irrelevant question | reranker lowers rank or policy filters it |
| AI-RERANK-002 | top candidate unreviewed | safety gate rejects it |
| AI-RERANK-003 | top candidate unsupported UI type | safety gate rejects it |
| AI-TRACE-001 | successful AI path | routing_trace records candidate ids, selected id, reason codes |

### 8.6 ASR / Free-text Option Matching Tests

| Test ID | Transcript | Current question | Expected |
| --- | --- | --- | --- |
| ASR-OPT-001 | `我喘不過氣` | associated symptoms | candidate `short_breath`, needs confirmation |
| ASR-OPT-002 | `我頭暈快昏倒` | associated symptoms | candidate `dizzy_faint`, needs confirmation |
| ASR-OPT-003 | `沒有這些症狀` | associated symptoms | candidate `none_of_these`, needs confirmation |
| ASR-OPT-004 | `很不舒服` | associated symptoms | low confidence / ask staff |
| ASR-OPT-005 | `我胸口悶` | associated symptoms | must not map to an option absent from current question |
| ASR-OPT-006 | English: `I almost fainted` | associated symptoms | candidate `dizzy_faint` |
| ASR-OPT-007 | mixed: `喘 and dizzy` | associated symptoms | candidates `short_breath`, `dizzy_faint` |
| ASR-OPT-008 | transcript maps to multiple options | returns multi-candidate, no auto-submit |

### 8.7 Summary Tests

| Test ID | Scenario | Expected |
| --- | --- | --- |
| SUM-001 | custom HR value 118 | objective says HR 118, no stale fixture HR |
| SUM-002 | missing SpO2 | no measured SpO2 claim |
| SUM-003 | none_of_these selected | summary says no listed associated symptoms selected |
| SUM-004 | short_breath selected | summary includes shortness of breath context |
| SUM-005 | dizzy_faint selected | summary includes dizziness/fainting context |
| SUM-006 | not_sure selected | summary says staff should confirm symptom context |
| SUM-007 | summary generated after AI retrieval failure | still safe and template-based |

### 8.8 Forbidden Output Tests

Forbidden terms / patterns should fail the test unless explicitly approved for internal metadata only:

```text
AfRVR
atrial fibrillation diagnosis
heart attack diagnosis
formal triage level
ESI level
CTAS level
treatment
medication order
ECG order
go to emergency department
cardiology department recommendation
```

Expected:

- Patient-facing questions do not include diagnosis / treatment framing。
- Staff summary phrases stay within review / confirmation language。
- Internal source refs may contain clinical source names, but returned patient-facing content must remain bounded。

### 8.9 Cloud / Security / Reliability Tests

| Test ID | Scenario | Expected |
| --- | --- | --- |
| CLD-AUTH-001 | no token | rejected |
| CLD-AUTH-002 | invalid token | rejected |
| CLD-CORS-001 | allowed imedtac origin | allowed |
| CLD-CORS-002 | unknown origin | blocked |
| CLD-TTL-001 | session older than TTL | expired response |
| CLD-RESTART-001 | API restart with Redis | active session can continue |
| CLD-RESTART-002 | API restart without Redis | documented demo fallback |
| CLD-RATE-001 | excessive requests | rate-limited |
| CLD-LOG-001 | request processed | request_id, session_key hash, routing_trace_id logged |
| CLD-PRIV-001 | ASR audio uploaded accidentally | rejected or not retained |

### 8.10 Performance Tests

Targets for demo:

| Test ID | Flow | Target |
| --- | --- | --- |
| PERF-001 | POST /sessions warm path | p95 < 800 ms |
| PERF-002 | POST /answers deterministic only | p95 < 500 ms |
| PERF-003 | POST /answers with retrieval + rerank top-k <= 20 | p95 < 1500 ms |
| PERF-004 | /answer-candidates transcript <= 200 chars | p95 < 1500 ms |
| PERF-005 | AI service unavailable fallback | p95 < 800 ms |

### 8.11 Release Gate

A release can deploy to imedtac demo only when all conditions pass:

1. Existing contract tests pass。
2. Dynamic path A / B pass。
3. Summary consistency tests pass。
4. Forbidden output tests pass。
5. Routing trace tests pass。
6. AI fallback tests pass。
7. Cloud auth / CORS / TTL tests pass。
8. Clinical reviewer approves question wording and summary templates。
9. imedtac receives deployment notice。

## 9. Recommended Repository Changes

```text
api/
  lib/
    triage-demo-contract.js
    dynamic-engine/
      answer-effect-mapper.js
      derived-flag-updater.js
      routing-policy-engine.js
      summary-assembler.js
      ai-retrieval-client.js
      routing-trace-recorder.js

data/
  question_manifest.tachycardia.v0.3.json
  answer_effects.tachycardia.v0.3.json
  routing_policy.tachycardia.v0.3.json
  summary_templates.tachycardia.v0.3.json
  vector_index/

tests/
  contract/
    triage-demo-api.test.js
    tachycardia-dynamic-path.test.js
    answer-candidates-api.test.js
  unit/
    manifest-schema.test.js
    answer-effect-mapper.test.js
    routing-policy-engine.test.js
    summary-assembler.test.js
    ai-retrieval-guardrails.test.js
  e2e/
    tachycardia-path-a-low-concern.test.js
    tachycardia-path-b-warning-symptoms.test.js
```

## 10. Bottom Line

Cloud backend is feasible and recommended. The clean design is: imedtac frontend calls a stable backend API; backend owns the dynamic AI engine. Use Qwen3 Embedding + Qwen3 Reranker as a support layer for option matching and next-question candidate ranking. Use deterministic manifest / routing policy as the final authority. This gives the demo visible AI-driven adaptivity while keeping the clinical and integration boundary controlled.

## 11. References

- Uploaded project packet: `2026-06-08-ai-triage-detailed-project-overview-for-expert-review`.
- QwenLM/Qwen3-Embedding repository and model list.
- Qwen3 Embedding arXiv technical report.
- vLLM supported model documentation for Qwen3 Reranker serving.
