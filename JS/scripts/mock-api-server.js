#!/usr/bin/env node

const http = require("node:http");
const {
  answerCandidatesAsync,
  createSessionAsync,
  demoBearerAuthChallenge,
  errorResult,
  getSummaryAsync,
  readJsonBody,
  requireDemoBearerAuth,
  requireRateLimit,
  requestRuntimeErrorResult,
  sendResult,
  setCorsHeaders,
  submitAnswerAsync
} = require("../api/lib/triage-demo-contract");

const PORT = Number(process.env.PORT || 4193);

function sendHealth(res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({
    status: "ok",
    service: "nycu-imedtac-triage-demo-api",
    mode: "synthetic-data-rehearsal-api"
  }));
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "GET" && req.url === "/healthz") {
    sendHealth(res);
    return;
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "POST" && req.url === "/api/triage-demo/sessions") {
      const authError = requireDemoBearerAuth(req);
      if (authError) {
        res.setHeader("WWW-Authenticate", demoBearerAuthChallenge());
        sendResult(res, authError);
        return;
      }
      const rateLimitError = requireRateLimit(req);
      if (rateLimitError) {
        sendResult(res, rateLimitError);
        return;
      }
      sendResult(res, await createSessionAsync(await readJsonBody(req)));
      return;
    }

    const answerMatch = String(req.url || "").match(/^\/api\/triage-demo\/sessions\/([^/?#]+)\/answers$/);
    if (req.method === "POST" && answerMatch) {
      const authError = requireDemoBearerAuth(req);
      if (authError) {
        res.setHeader("WWW-Authenticate", demoBearerAuthChallenge());
        sendResult(res, authError);
        return;
      }
      const rateLimitError = requireRateLimit(req);
      if (rateLimitError) {
        sendResult(res, rateLimitError);
        return;
      }
      sendResult(res, await submitAnswerAsync(decodeURIComponent(answerMatch[1]), await readJsonBody(req)));
      return;
    }

    const answerCandidateMatch = String(req.url || "").match(/^\/api\/triage-demo\/sessions\/([^/?#]+)\/answer-candidates$/);
    if (req.method === "POST" && answerCandidateMatch) {
      const authError = requireDemoBearerAuth(req);
      if (authError) {
        res.setHeader("WWW-Authenticate", demoBearerAuthChallenge());
        sendResult(res, authError);
        return;
      }
      const rateLimitError = requireRateLimit(req);
      if (rateLimitError) {
        sendResult(res, rateLimitError);
        return;
      }
      sendResult(res, await answerCandidatesAsync(decodeURIComponent(answerCandidateMatch[1]), await readJsonBody(req)));
      return;
    }

    const summaryMatch = String(req.url || "").match(/^\/api\/triage-demo\/sessions\/([^/?#]+)\/summary$/);
    if (req.method === "GET" && summaryMatch) {
      const authError = requireDemoBearerAuth(req);
      if (authError) {
        res.setHeader("WWW-Authenticate", demoBearerAuthChallenge());
        sendResult(res, authError);
        return;
      }
      const rateLimitError = requireRateLimit(req);
      if (rateLimitError) {
        sendResult(res, rateLimitError);
        return;
      }
      sendResult(res, await getSummaryAsync(decodeURIComponent(summaryMatch[1]), {}));
      return;
    }

    sendResult(res, errorResult(404, {}, "not_found", "Use POST /api/triage-demo/sessions, POST /api/triage-demo/sessions/{session_key}/answers, POST /api/triage-demo/sessions/{session_key}/answer-candidates, or GET /api/triage-demo/sessions/{session_key}/summary.", { retryable: false }));
  } catch (error) {
    sendResult(res, requestRuntimeErrorResult(error));
  }
});

server.listen(PORT, () => {
  console.log(`AI triage demo mock API listening on http://localhost:${PORT}`);
});
