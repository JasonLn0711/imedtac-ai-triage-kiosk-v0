const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const dynamicEngine = require("./dynamic-engine");
const { createConfiguredRedisSessionAdapter, redisStoreEnabled } = require("./session-store");

const ROOT = path.resolve(__dirname, "../../..");
const DEMO_BOUNDARY = "Synthetic-data staff-review intake support with human-review workflow and separate production validation path.";
const DEFAULT_ALLOWED_ORIGINS = ["http://localhost", "http://localhost:5174"];
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_JSON_BODY_BYTES = Number(process.env.DEMO_MAX_JSON_BODY_BYTES || 32 * 1024);
const RATE_LIMIT_WINDOW_MS = Number(process.env.DEMO_RATE_LIMIT_WINDOW_MS || 60 * 1000);
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.DEMO_RATE_LIMIT_MAX_REQUESTS || 120);

const sessions = new Map();
const idempotencyRecords = new Map();
const rateLimitRecords = new Map();
const auditEvents = [];
let responseCounter = 0;
let sessionCounter = 0;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

const fixture = readJson("JS/fixtures/tachycardia-live-demo.json");
const startQuestionExample = readJson("handoff/api-examples/2026-05-21-start-session-response-question.json");
const summaryExample = readJson("handoff/api-examples/2026-05-21-summary-response-demo-tachycardia.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const questionSequence = dynamicEngine.defaultQuestionSequence();
const expectedTotal = dynamicEngine.expectedTotal();
const contractFields = {
  api_version: startQuestionExample.api_version,
  schema_version: startQuestionExample.schema_version,
  flow_version: fixture.flow_version,
  case_id: fixture.case_id,
  case_version: fixture.case_version,
  fixture_version: fixture.fixture_version,
  question_set_version: fixture.question_set_version,
  wording_version: startQuestionExample.wording_version
};

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function idempotencyComparableBody(body) {
  const comparable = clone(body || {});
  delete comparable.request_id;
  return comparable;
}

function hashBody(body) {
  return crypto.createHash("sha256").update(stableStringify(idempotencyComparableBody(body))).digest("hex");
}

function configuredDemoBearerToken() {
  const token = process.env.DEMO_BEARER_TOKEN;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

function headerValue(req, name) {
  const headers = (req && req.headers) || {};
  if (typeof headers.get === "function") return headers.get(name);

  const value = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
  return Array.isArray(value) ? value[0] : value;
}

function bearerTokenFromHeader(value) {
  if (!value) return null;
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function safeTokenEquals(receivedToken, expectedToken) {
  const received = Buffer.from(String(receivedToken || ""), "utf8");
  const expected = Buffer.from(String(expectedToken || ""), "utf8");
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(received, expected);
}

function demoBearerAuthChallenge() {
  return 'Bearer realm="nycu-imedtac-triage-demo"';
}

function allowedOrigins() {
  const configured = process.env.DEMO_ALLOWED_ORIGINS;
  const origins = configured && configured.trim()
    ? configured.split(",").map((origin) => origin.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
  return new Set(origins);
}

function requireDemoBearerAuth(req) {
  const expectedToken = configuredDemoBearerToken();
  if (!expectedToken) return null;

  const receivedToken = bearerTokenFromHeader(headerValue(req, "authorization"));
  if (receivedToken && safeTokenEquals(receivedToken, expectedToken)) return null;

  return errorResult(401, {}, "demo_bearer_token_required", "A valid demo bearer token is required for this rehearsal API.", {
    retryable: false,
    details: {
      required_header: "Authorization: Bearer <demo token>",
      token_storage: "Set DEMO_BEARER_TOKEN in the deployment environment; do not store tokens in repo files."
    }
  });
}

function nextResponseId(kind) {
  responseCounter += 1;
  return `resp-demo-tachy-${kind}-${String(responseCounter).padStart(3, "0")}`;
}

function nextSessionKey() {
  sessionCounter += 1;
  return `demo-session-tachy-${String(sessionCounter).padStart(3, "0")}`;
}

function expiryFrom(now = new Date()) {
  return new Date(now.getTime() + SESSION_TTL_MS).toISOString();
}

function baseResponse(body, session, kind) {
  return {
    ...contractFields,
    request_id: body.request_id || null,
    response_id: nextResponseId(kind),
    session_key: session.session_key,
    session_expires_at: session.session_expires_at,
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    demo_boundary: DEMO_BOUNDARY
  };
}

function sessionKeyHash(sessionKey) {
  return crypto.createHash("sha256").update(String(sessionKey || "")).digest("hex").slice(0, 16);
}

function appendAuditEvent(event) {
  const record = {
    timestamp: new Date().toISOString(),
    ...event
  };
  auditEvents.push(record);

  const auditPath = process.env.DEMO_AUDIT_LOG_PATH;
  if (auditPath) {
    fs.appendFileSync(auditPath, `${JSON.stringify(record)}\n`, "utf8");
  }
  return record;
}

function persistentSessionStorePath() {
  return process.env.DEMO_SESSION_STORE_FILE || null;
}

function savePersistentSessions() {
  const storePath = persistentSessionStorePath();
  if (!storePath) return;
  const payload = {
    saved_at: new Date().toISOString(),
    sessions: [...sessions.values()]
  };
  fs.writeFileSync(storePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function reloadPersistentSessions() {
  const storePath = persistentSessionStorePath();
  if (!storePath || !fs.existsSync(storePath)) return 0;
  const payload = JSON.parse(fs.readFileSync(storePath, "utf8"));
  sessions.clear();
  for (const session of payload.sessions || []) {
    sessions.set(session.session_key, session);
  }
  return sessions.size;
}

async function saveRedisSession(session) {
  const adapter = createConfiguredRedisSessionAdapter();
  if (!adapter || !session || !session.session_key) return false;
  await adapter.saveSession(session);
  return true;
}

async function loadSessionFromRedis(sessionKey) {
  const adapter = createConfiguredRedisSessionAdapter();
  if (!adapter || !sessionKey) return null;
  const session = await adapter.loadSession(sessionKey);
  if (session && session.session_key) {
    sessions.set(session.session_key, session);
    return session;
  }
  return null;
}

async function ensureSessionLoaded(sessionKey) {
  if (!sessionKey) return null;
  const existing = sessions.get(sessionKey);
  if (existing) return existing;

  if (persistentSessionStorePath()) {
    reloadPersistentSessions();
    const reloaded = sessions.get(sessionKey);
    if (reloaded) return reloaded;
  }

  return loadSessionFromRedis(sessionKey);
}

function auditResult(endpoint, body, session, result, extra = {}) {
  const lastTrace = session && session.routing_trace && session.routing_trace.length
    ? session.routing_trace[session.routing_trace.length - 1]
    : null;
  appendAuditEvent({
    endpoint,
    status_code: result.statusCode,
    response_status: result.body && result.body.status,
    request_id: body && body.request_id ? body.request_id : null,
    session_key_hash: session && session.session_key ? sessionKeyHash(session.session_key) : null,
    idempotency_key_hash: body && body.idempotency_key ? sessionKeyHash(body.idempotency_key) : null,
    routing_trace_id: lastTrace ? lastTrace.routing_trace_id : null,
    ...extra
  });
  return result;
}

function isSessionExpired(session, now = new Date()) {
  if (!session || !session.session_expires_at) return false;
  return new Date(session.session_expires_at).getTime() <= now.getTime();
}

function sessionExpiredResult(body, session) {
  session.state = "expired";
  const result = errorResult(410, body, "session_expired", "The session has expired; start a new demo session.", {
    retryable: false,
    session_key: session.session_key,
    session_expires_at: session.session_expires_at,
    session_state: "expired"
  });
  savePersistentSessions();
  return result;
}

function buildQuestionResponse(body, session, question, lastQuestionId, phaseReason) {
  const questionNumber = session.answers.length + 1;
  return {
    ...baseResponse(body, session, `question-${questionNumber}`),
    session_state: "active",
    last_question_id: lastQuestionId,
    status: "question",
    question_phase: "post_measurement_intake",
    phase_reason: phaseReason,
    progress: {
      current: questionNumber,
      expected_total: expectedTotal
    },
    question: clone(question)
  };
}

function buildSummaryResponse(body, session, lastQuestionId) {
  const response = clone(summaryExample);
  const summary = dynamicEngine.buildSummary(session);
  return {
    ...response,
    ...baseResponse(body, session, "summary"),
    session_state: "summary_ready",
    last_question_id: lastQuestionId,
    status: "summary",
    question_phase: "summary",
    progress: {
      current: expectedTotal,
      expected_total: expectedTotal
    },
    summary_visibility: summary.summary_visibility,
    handoff_required: summary.handoff_required,
    handoff_reason_codes: summary.handoff_reason_codes,
    staff_review_summary: summary.staff_review_summary,
    ...(body.debug ? { debug: {
      manifest_version: session.manifest_version,
      routing_trace_id: session.routing_trace.length ? session.routing_trace[session.routing_trace.length - 1].routing_trace_id : null,
      reason_codes: summary.handoff_reason_codes,
      selected_next_question_id: null
    } } : {})
  };
}

function errorResult(statusCode, body, code, message, options = {}) {
  const session = {
    session_key: options.session_key || null,
    session_expires_at: options.session_expires_at || null
  };
  return {
    statusCode,
    body: {
      ...contractFields,
      request_id: body && body.request_id ? body.request_id : null,
      response_id: nextResponseId("error"),
      session_key: session.session_key,
      session_expires_at: session.session_expires_at,
      status: "error",
      session_state: options.session_state || "error",
      error: {
        code,
        message,
        retryable: Boolean(options.retryable),
        details: options.details || null
      },
      recovery: options.recovery || null,
      demo_boundary: DEMO_BOUNDARY
    }
  };
}

function isSessionStoreRuntimeError(error) {
  const code = error && error.code ? String(error.code) : "";
  return code === "redis_timeout"
    || code === "redis_error"
    || code === "redis_protocol_error"
    || code === "ECONNREFUSED"
    || code === "ECONNRESET"
    || code === "ETIMEDOUT"
    || code === "ENOTFOUND";
}

function requestRuntimeErrorResult(error) {
  if (isSessionStoreRuntimeError(error)) {
    return errorResult(503, {}, "session_store_unavailable", "The configured demo session store is unavailable.", {
      retryable: true,
      details: {
        store: redisStoreEnabled() ? "redis" : "local",
        code: error && error.code ? String(error.code) : null
      }
    });
  }

  const code = error.code === "request_body_too_large" ? "request_body_too_large" : "invalid_json";
  const message = error.code === "request_body_too_large"
    ? "Request body exceeds the demo API size limit."
    : "Request body must be valid JSON.";
  return errorResult(400, {}, code, message, { retryable: false });
}

function idempotencyConflictRecovery() {
  return {
    safe_next_action: "restart_demo_session",
    owner: "imvs_ui_operator",
    ui_locking_required: true,
    instructions: [
      "Do not reuse this idempotency_key for a different answer.",
      "Do not auto-submit the changed answer with a new idempotency_key.",
      "Keep answer controls locked until the operator starts a new demo session or switches to labeled fallback.",
      "Start a new demo session through POST /api/triage-demo/sessions."
    ]
  };
}

function withIdempotency(scope, body, compute, options = {}) {
  const idempotencyKey = body && body.idempotency_key;
  if (!idempotencyKey) return compute();

  const recordKey = `${scope}:${idempotencyKey}`;
  const bodyHash = hashBody(body);
  const existing = idempotencyRecords.get(recordKey);
  if (existing && existing.bodyHash !== bodyHash) {
    return errorResult(409, body, "idempotency_conflict", "The same idempotency_key was reused with a different request body.", {
      retryable: false,
      session_key: options.session_key || null,
      session_expires_at: options.session_expires_at || null,
      session_state: options.session_state || "error",
      details: {
        idempotency_key: idempotencyKey,
        expected_body_hash: existing.bodyHash,
        received_body_hash: bodyHash
      },
      recovery: idempotencyConflictRecovery()
    });
  }
  if (existing) return clone(existing.result);

  const result = compute();
  idempotencyRecords.set(recordKey, { bodyHash, result: clone(result) });
  return result;
}

function validateCase(body) {
  if (body.case_id && body.case_id !== fixture.case_id) {
    return `unsupported case_id ${body.case_id}`;
  }
  if (body.measurement_state && body.measurement_state !== "complete") {
    return "measurement_state must be complete for the current post-measurement demo contract";
  }
  if (body.vitals_ready === false) {
    return "vitals_ready must be true for the current post-measurement demo contract";
  }
  return null;
}

function createSession(body = {}) {
  const caseError = validateCase(body);
  if (caseError) return errorResult(422, body, "invalid_start_session_request", caseError, { retryable: false });

  return withIdempotency("sessions", body, () => {
    const session = {
      session_key: nextSessionKey(),
      session_expires_at: expiryFrom(),
      state: "active",
      answers: [],
      start_request: clone(body),
      vitals: clone(body.vitals || fixture.vitals),
      patient_context: clone(body.patient_context || fixture.profile),
      demo_script: clone(body.demo_script || fixture.live_demo_controls)
    };
    dynamicEngine.initializeSession(session);
    sessions.set(session.session_key, session);
    savePersistentSessions();

    const response = buildQuestionResponse(
      body,
      session,
      dynamicEngine.getQuestion(session.current_question_id),
      null,
      "Measurement is complete and the demo heart-rate cue is available, so the tachycardia live intake question set can start."
    );
    return auditResult("POST /api/triage-demo/sessions", body, session, { statusCode: 200, body: response });
  });
}

async function createSessionAsync(body = {}) {
  const result = createSession(body);
  if (result.statusCode === 200 && result.body && result.body.session_key) {
    await saveRedisSession(sessions.get(result.body.session_key));
  }
  return result;
}

function selectedOptionIds(body) {
  return body && body.answer && Array.isArray(body.answer.selected_option_ids)
    ? body.answer.selected_option_ids
    : [];
}

function validateAnswer(question, body) {
  if (!body.question_id) return "question_id is required";
  if (body.question_id !== question.id) {
    return `expected question_id ${question.id}, received ${body.question_id}`;
  }
  const selectedIds = selectedOptionIds(body);
  if (selectedIds.length === 0) return "answer.selected_option_ids must contain at least one option id";
  if (selectedIds.length > question.max_selections) {
    return `selected_option_ids exceeds max_selections ${question.max_selections}`;
  }
  if (question.none_option_id && selectedIds.includes(question.none_option_id) && selectedIds.length > 1) {
    return `${question.none_option_id} cannot be combined with another option`;
  }
  const allowedOptionIds = new Set(question.options.map((option) => option.id));
  const invalidIds = selectedIds.filter((optionId) => !allowedOptionIds.has(optionId));
  if (invalidIds.length) return `unknown option id(s): ${invalidIds.join(", ")}`;
  return null;
}

function submitAnswer(sessionKey, body = {}) {
  const session = sessions.get(sessionKey);
  if (!session) {
    return errorResult(404, body, "invalid_session", "The session_key was not found or is no longer available.", {
      retryable: false,
      session_key: sessionKey
    });
  }
  if (isSessionExpired(session)) {
    return auditResult("POST /api/triage-demo/sessions/{session_key}/answers", body, session, sessionExpiredResult(body, session));
  }
  return withIdempotency(`answers:${session.session_key}`, body, () => {
    if (session.state === "summary_ready") {
      return errorResult(409, body, "session_summary_ready", "The session has already reached summary status; start a new session for another answer path.", {
        retryable: false,
        session_key: session.session_key,
        session_expires_at: session.session_expires_at
      });
    }

    const question = dynamicEngine.getQuestion(session.current_question_id);
    if (!question) {
      session.state = "summary_ready";
      return errorResult(409, body, "session_summary_ready", "The session has no remaining questions.", {
        retryable: false,
        session_key: session.session_key,
        session_expires_at: session.session_expires_at
      });
    }

    const answerError = validateAnswer(question, body);
    if (answerError) {
      return errorResult(422, body, "invalid_answer", answerError, {
        retryable: false,
        session_key: session.session_key,
        session_expires_at: session.session_expires_at
      });
    }

    const selectedIds = selectedOptionIds(body);
    const { answerRecord, decision } = dynamicEngine.applyAnswerAndSelectNext(session, question, selectedIds);

    session.answers.push({
      ...answerRecord,
      answer: clone(body.answer),
      request_id: body.request_id || null,
      idempotency_key: body.idempotency_key || null
    });
    savePersistentSessions();

    if (decision.status === "summary") {
      session.state = "summary_ready";
      session.current_question_id = null;
      savePersistentSessions();
      return auditResult("POST /api/triage-demo/sessions/{session_key}/answers", body, session, { statusCode: 200, body: buildSummaryResponse(body, session, question.id) });
    }

    session.current_question_id = decision.selected_next_question_id;
    savePersistentSessions();
    return auditResult("POST /api/triage-demo/sessions/{session_key}/answers", body, session, {
      statusCode: 200,
      body: buildQuestionResponse(
        body,
        session,
        dynamicEngine.getQuestion(session.current_question_id),
        question.id,
        decision.phase_reason
      )
    });
  }, {
    session_key: session.session_key,
    session_expires_at: session.session_expires_at,
    session_state: session.state
  });
}

async function submitAnswerAsync(sessionKey, body = {}) {
  await ensureSessionLoaded(sessionKey);
  const result = submitAnswer(sessionKey, body);
  const session = sessions.get(sessionKey);
  if (session) await saveRedisSession(session);
  return result;
}

function getSummary(sessionKey, body = {}) {
  const session = sessions.get(sessionKey);
  if (!session) {
    return errorResult(404, body, "invalid_session", "The session_key was not found or is no longer available.", {
      retryable: false,
      session_key: sessionKey
    });
  }
  if (isSessionExpired(session)) {
    return auditResult("GET /api/triage-demo/sessions/{session_key}/summary", body, session, sessionExpiredResult(body, session));
  }
  if (session.state !== "summary_ready") {
    return errorResult(409, body, "session_not_summary_ready", "The session has not reached summary status yet.", {
      retryable: false,
      session_key: session.session_key,
      session_expires_at: session.session_expires_at,
      session_state: session.state
    });
  }
  const lastAnswer = session.answers[session.answers.length - 1];
  return auditResult("GET /api/triage-demo/sessions/{session_key}/summary", body, session, { statusCode: 200, body: buildSummaryResponse(body, session, lastAnswer.question_id) });
}

async function getSummaryAsync(sessionKey, body = {}) {
  await ensureSessionLoaded(sessionKey);
  const result = getSummary(sessionKey, body);
  const session = sessions.get(sessionKey);
  if (session) await saveRedisSession(session);
  return result;
}

function answerCandidates(sessionKey, body = {}) {
  const session = sessions.get(sessionKey);
  if (!session) {
    return errorResult(404, body, "invalid_session", "The session_key was not found or is no longer available.", {
      retryable: false,
      session_key: sessionKey
    });
  }
  if (isSessionExpired(session)) {
    return auditResult("POST /api/triage-demo/sessions/{session_key}/answer-candidates", body, session, sessionExpiredResult(body, session));
  }
  if (body.input && (body.input.raw_audio || body.input.audio || body.input.audio_base64)) {
    return errorResult(422, body, "raw_audio_not_accepted", "Raw audio is not accepted or retained by this demo candidate endpoint.", {
      retryable: false,
      session_key: session.session_key,
      session_expires_at: session.session_expires_at
    });
  }
  if (session.state !== "active") {
    return errorResult(409, body, "session_summary_ready", "The session is no longer accepting answer candidates; start a new session.", {
      retryable: false,
      session_key: session.session_key,
      session_expires_at: session.session_expires_at
    });
  }
  if (body.question_id && body.question_id !== session.current_question_id) {
    return errorResult(422, body, "invalid_answer_candidate_request", `expected question_id ${session.current_question_id}, received ${body.question_id}`, {
      retryable: false,
      session_key: session.session_key,
      session_expires_at: session.session_expires_at
    });
  }

  return auditResult("POST /api/triage-demo/sessions/{session_key}/answer-candidates", body, session, {
    statusCode: 200,
    body: {
      ...baseResponse(body, session, "answer-candidates"),
      ...dynamicEngine.answerCandidatesForCurrentQuestion(session, body.input || {}),
      session_state: session.state,
      official_answer_submission: "POST /api/triage-demo/sessions/{session_key}/answers",
      transcript_retention: "transcript is used for candidate matching only in this demo contract; raw audio is not accepted or retained"
    }
  });
}

async function answerCandidatesAsync(sessionKey, body = {}) {
  await ensureSessionLoaded(sessionKey);
  return answerCandidates(sessionKey, body);
}

function rateLimitKey(req) {
  const token = bearerTokenFromHeader(headerValue(req, "authorization"));
  return token ? `token:${sessionKeyHash(token)}` : `origin:${headerValue(req, "origin") || "unknown"}`;
}

function requireRateLimit(req) {
  if (process.env.DEMO_RATE_LIMIT_DISABLED === "1") return null;
  const now = Date.now();
  const key = rateLimitKey(req);
  const record = rateLimitRecords.get(key) || { windowStart: now, count: 0 };
  if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    record.windowStart = now;
    record.count = 0;
  }
  record.count += 1;
  rateLimitRecords.set(key, record);
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return errorResult(429, {}, "rate_limited", "Too many demo API requests in the current rate-limit window.", {
      retryable: true,
      details: {
        window_ms: RATE_LIMIT_WINDOW_MS,
        max_requests: RATE_LIMIT_MAX_REQUESTS
      }
    });
  }
  return null;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    if (Buffer.byteLength(req.body, "utf8") > MAX_JSON_BODY_BYTES) {
      throw Object.assign(new Error("request_body_too_large"), { code: "request_body_too_large" });
    }
    return JSON.parse(req.body || "{}");
  }

  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_JSON_BODY_BYTES) {
      throw Object.assign(new Error("request_body_too_large"), { code: "request_body_too_large" });
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function setCorsHeaders(req, res) {
  const origin = req.headers && req.headers.origin;
  if (allowedOrigins().has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "600");
}

function sendResult(res, result) {
  res.statusCode = result.statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(result.body));
}

function resetMockState() {
  sessions.clear();
  idempotencyRecords.clear();
  rateLimitRecords.clear();
  auditEvents.length = 0;
  responseCounter = 0;
  sessionCounter = 0;
}

function getSessionSnapshot(sessionKey) {
  const session = sessions.get(sessionKey);
  return session ? clone(session) : null;
}

function forceExpireSession(sessionKey) {
  const session = sessions.get(sessionKey);
  if (session) {
    session.session_expires_at = new Date(Date.now() - 1000).toISOString();
    savePersistentSessions();
  }
}

function getAuditEvents() {
  return clone(auditEvents);
}

module.exports = {
  ALLOWED_ORIGINS: new Set(DEFAULT_ALLOWED_ORIGINS),
  DEMO_BOUNDARY,
  MAX_JSON_BODY_BYTES,
  allowedOrigins,
  answerCandidates,
  answerCandidatesAsync,
  contractFields,
  createSessionAsync,
  demoBearerAuthChallenge,
  expectedTotal,
  forceExpireSession,
  getAuditEvents,
  fixture,
  getSessionSnapshot,
  getSummary,
  getSummaryAsync,
  questionSequence,
  createSession,
  requireDemoBearerAuth,
  requireRateLimit,
  readJsonBody,
  requestRuntimeErrorResult,
  reloadPersistentSessions,
  redisStoreEnabled,
  submitAnswer,
  submitAnswerAsync,
  errorResult,
  setCorsHeaders,
  sendResult,
  resetMockState
};
