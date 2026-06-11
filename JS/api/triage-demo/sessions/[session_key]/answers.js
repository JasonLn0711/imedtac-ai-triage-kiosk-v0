const {
  demoBearerAuthChallenge,
  errorResult,
  readJsonBody,
  requireDemoBearerAuth,
  requireRateLimit,
  requestRuntimeErrorResult,
  sendResult,
  setCorsHeaders,
  submitAnswerAsync
} = require("../../../lib/triage-demo-contract");

function sessionKeyFromRequest(req) {
  if (req.query && req.query.session_key) return req.query.session_key;
  const match = String(req.url || "").match(/\/api\/triage-demo\/sessions\/([^/?#]+)\/answers/);
  return match ? decodeURIComponent(match[1]) : null;
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendResult(res, errorResult(405, {}, "method_not_allowed", "Use POST /api/triage-demo/sessions/{session_key}/answers.", { retryable: false }));
    return;
  }

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

  try {
    const sessionKey = sessionKeyFromRequest(req);
    sendResult(res, await submitAnswerAsync(sessionKey, await readJsonBody(req)));
  } catch (error) {
    sendResult(res, requestRuntimeErrorResult(error));
  }
};
