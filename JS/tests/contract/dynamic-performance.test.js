const assert = require("node:assert/strict");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");

function p95(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)];
}

function ms(start) {
  return Number(process.hrtime.bigint() - start) / 1_000_000;
}

function startBody(index) {
  return {
    request_id: `req-perf-start-${index}`,
    idempotency_key: `idem-perf-start-${index}`,
    case_id: "demo-tachycardia-live-001",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    vitals: { heart_rate_bpm: 130, spo2_percent: 97 },
    capabilities: {
      question_types: ["single_choice", "multi_choice"],
      max_questions: 99,
      max_options_per_question: 9,
      variable_option_count: true,
      voice_input: false
    }
  };
}

test("PERF-001 POST /sessions warm path p95 stays under 800 ms", () => {
  contract.resetMockState();
  const durations = [];
  for (let index = 0; index < 30; index += 1) {
    const started = process.hrtime.bigint();
    const result = contract.createSession(startBody(index));
    durations.push(ms(started));
    assert.equal(result.statusCode, 200);
  }
  assert.ok(p95(durations) < 800, `p95=${p95(durations)}ms`);
});

test("PERF-002 POST /answers deterministic path p95 stays under 500 ms", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody("answer"));
  const durations = [];
  for (let index = 0; index < 30; index += 1) {
    const session = contract.createSession(startBody(`answer-${index}`));
    const started = process.hrtime.bigint();
    const result = contract.submitAnswer(session.body.session_key, {
      request_id: `req-perf-answer-${index}`,
      idempotency_key: `idem-perf-answer-${index}`,
      question_id: start.body.question.id,
      answer: { selected_option_ids: ["heart_racing"], scale_value: null }
    });
    durations.push(ms(started));
    assert.equal(result.statusCode, 200);
  }
  assert.ok(p95(durations) < 500, `p95=${p95(durations)}ms`);
});

test("PERF-003 POST /answers with retrieval and rerank top-k <= 20 p95 stays under 1500 ms", () => {
  contract.resetMockState();
  const durations = [];
  for (let index = 0; index < 30; index += 1) {
    const session = contract.createSession(startBody(`retrieval-${index}`));
    const started = process.hrtime.bigint();
    const result = contract.submitAnswer(session.body.session_key, {
      request_id: `req-perf-retrieval-${index}`,
      idempotency_key: `idem-perf-retrieval-${index}`,
      question_id: session.body.question.id,
      answer: { selected_option_ids: ["chest_tightness"], scale_value: null }
    });
    durations.push(ms(started));
    assert.equal(result.statusCode, 200);
    const snapshot = contract.getSessionSnapshot(session.body.session_key);
    assert.ok(snapshot.routing_trace[0].ai_candidate_question_ids.length <= 20);
    assert.equal(snapshot.routing_trace[0].ai_status, "local_embedding_reranker_ready");
  }
  assert.ok(p95(durations) < 1500, `p95=${p95(durations)}ms`);
});

test("PERF-004 /answer-candidates transcript <= 200 chars p95 stays under 1500 ms", () => {
  contract.resetMockState();
  const durations = [];
  for (let index = 0; index < 30; index += 1) {
    const session = contract.createSession(startBody(`candidate-${index}`));
    const started = process.hrtime.bigint();
    const result = contract.answerCandidates(session.body.session_key, {
      request_id: `req-perf-candidate-${index}`,
      question_id: session.body.question.id,
      input: { method: "asr", transcript: "heart racing" }
    });
    durations.push(ms(started));
    assert.equal(result.statusCode, 200);
  }
  assert.ok(p95(durations) < 1500, `p95=${p95(durations)}ms`);
});

test("PERF-005 AI unavailable fallback returns under 800 ms", () => {
  const previous = process.env.DEMO_AI_FORCE_FAILURE;
  process.env.DEMO_AI_FORCE_FAILURE = "1";
  try {
    contract.resetMockState();
    const session = contract.createSession(startBody("fallback"));
    const started = process.hrtime.bigint();
    const result = contract.submitAnswer(session.body.session_key, {
      request_id: "req-perf-fallback",
      idempotency_key: "idem-perf-fallback",
      question_id: session.body.question.id,
      answer: { selected_option_ids: ["heart_racing"], scale_value: null }
    });
    assert.equal(result.statusCode, 200);
    assert.ok(ms(started) < 800);
  } finally {
    if (previous === undefined) delete process.env.DEMO_AI_FORCE_FAILURE;
    else process.env.DEMO_AI_FORCE_FAILURE = previous;
  }
});
