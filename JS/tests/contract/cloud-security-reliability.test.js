const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");

function startBody(idempotencyKey = "idem-cloud-start") {
  return {
    request_id: `req-${idempotencyKey}`,
    idempotency_key: idempotencyKey,
    case_id: "demo-tachycardia-live-001",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    vitals: { heart_rate_bpm: 130 },
    capabilities: {
      question_types: ["single_choice", "multi_choice"],
      max_questions: 99,
      max_options_per_question: 9,
      variable_option_count: true,
      voice_input: false
    }
  };
}

function makeResponseRecorder() {
  const headers = {};
  return {
    headers,
    setHeader(name, value) {
      headers[name] = value;
    }
  };
}

test("CLD-CORS-001 allowed imedtac rehearsal origin receives CORS header", () => {
  const response = makeResponseRecorder();
  contract.setCorsHeaders({ headers: { origin: "http://localhost:5174" } }, response);
  assert.equal(response.headers["Access-Control-Allow-Origin"], "http://localhost:5174");
});

test("CLD-CORS-002 unknown origin is not echoed", () => {
  const response = makeResponseRecorder();
  contract.setCorsHeaders({ headers: { origin: "http://evil.example" } }, response);
  assert.equal(response.headers["Access-Control-Allow-Origin"], undefined);
});

test("configured imedtac origin can be allowed through DEMO_ALLOWED_ORIGINS", () => {
  const previous = process.env.DEMO_ALLOWED_ORIGINS;
  process.env.DEMO_ALLOWED_ORIGINS = "https://imvs-demo.imedtac.example";
  try {
    const response = makeResponseRecorder();
    contract.setCorsHeaders({ headers: { origin: "https://imvs-demo.imedtac.example" } }, response);
    assert.equal(response.headers["Access-Control-Allow-Origin"], "https://imvs-demo.imedtac.example");
  } finally {
    if (previous === undefined) delete process.env.DEMO_ALLOWED_ORIGINS;
    else process.env.DEMO_ALLOWED_ORIGINS = previous;
  }
});

test("CLD-TTL-001 expired session returns session_expired", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody("idem-expire-start"));
  contract.forceExpireSession(start.body.session_key);

  const result = contract.submitAnswer(start.body.session_key, {
    request_id: "req-expired-answer",
    idempotency_key: "idem-expired-answer",
    question_id: start.body.question.id,
    answer: { selected_option_ids: ["heart_racing"], scale_value: null }
  });

  assert.equal(result.statusCode, 410);
  assert.equal(result.body.error.code, "session_expired");
  assert.equal(result.body.session_state, "expired");
});

test("CT-SUM-003 expired summary lookup returns session_expired", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody("idem-summary-expire-start"));
  contract.forceExpireSession(start.body.session_key);
  const result = contract.getSummary(start.body.session_key, { request_id: "req-expired-summary" });

  assert.equal(result.statusCode, 410);
  assert.equal(result.body.error.code, "session_expired");
});

test("CLD-RATE-001 excessive requests are rate-limited", () => {
  contract.resetMockState();
  let result = null;
  for (let index = 0; index < 121; index += 1) {
    result = contract.requireRateLimit({
      headers: {
        origin: "http://localhost:5174",
        authorization: "Bearer repeated-rate-token"
      }
    });
  }
  assert.equal(result.statusCode, 429);
  assert.equal(result.body.error.code, "rate_limited");
});

test("CLD-LOG-001 processed request records request_id session hash and routing_trace_id", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody("idem-audit-start"));
  const answer = contract.submitAnswer(start.body.session_key, {
    request_id: "req-audit-answer",
    idempotency_key: "idem-audit-answer",
    question_id: start.body.question.id,
    answer: { selected_option_ids: ["heart_racing"], scale_value: null }
  });

  assert.equal(answer.statusCode, 200);
  const events = contract.getAuditEvents();
  assert.ok(events.some((event) => event.endpoint === "POST /api/triage-demo/sessions" && event.request_id === "req-idem-audit-start"));
  const answerEvent = events.find((event) => event.request_id === "req-audit-answer");
  assert.ok(answerEvent.session_key_hash);
  assert.ok(answerEvent.routing_trace_id);
});

test("CLD-RESTART-001 persistent session store can serve summary lookup after memory reset", () => {
  const previous = process.env.DEMO_SESSION_STORE_FILE;
  const storePath = path.join(os.tmpdir(), `ai-triage-session-store-${process.pid}.json`);
  process.env.DEMO_SESSION_STORE_FILE = storePath;
  try {
    contract.resetMockState();
    const start = contract.createSession(startBody("idem-persistent-start"));
    const sessionKey = start.body.session_key;
    let body = start.body;
    const answers = [
      ["heart_racing"],
      ["half_day"],
      ["heart_racing"],
      ["none_of_these"],
      ["still_racing"],
      ["staff_confirm"],
      ["none_known"]
    ];
    for (const [index, selected] of answers.entries()) {
      body = contract.submitAnswer(sessionKey, {
        request_id: `req-persistent-${index}`,
        idempotency_key: `idem-persistent-${index}`,
        question_id: body.question.id,
        answer: { selected_option_ids: selected, scale_value: null }
      }).body;
    }
    assert.equal(body.status, "summary");

    contract.resetMockState();
    assert.equal(contract.reloadPersistentSessions(), 1);
    const summary = contract.getSummary(sessionKey, { request_id: "req-persistent-summary" });
    assert.equal(summary.statusCode, 200);
    assert.equal(summary.body.status, "summary");
  } finally {
    if (previous === undefined) delete process.env.DEMO_SESSION_STORE_FILE;
    else process.env.DEMO_SESSION_STORE_FILE = previous;
    if (fs.existsSync(storePath)) fs.unlinkSync(storePath);
  }
});

test("CLD-RESTART-002 without persistent session store reset documents fallback as invalid session", () => {
  const previous = process.env.DEMO_SESSION_STORE_FILE;
  delete process.env.DEMO_SESSION_STORE_FILE;
  try {
    contract.resetMockState();
    const start = contract.createSession(startBody("idem-memory-start"));
    const sessionKey = start.body.session_key;
    contract.resetMockState();
    const summary = contract.getSummary(sessionKey, { request_id: "req-memory-summary" });
    assert.equal(summary.statusCode, 404);
    assert.equal(summary.body.error.code, "invalid_session");
  } finally {
    if (previous !== undefined) process.env.DEMO_SESSION_STORE_FILE = previous;
  }
});

test("request body size guard rejects oversized JSON body strings", async () => {
  await assert.rejects(
    () => contract.readJsonBody({ body: "x".repeat(contract.MAX_JSON_BODY_BYTES + 1) }),
    /request_body_too_large/
  );
});
