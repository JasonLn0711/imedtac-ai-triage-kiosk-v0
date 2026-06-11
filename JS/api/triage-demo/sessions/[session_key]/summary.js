const {
  demoBearerAuthChallenge,
  errorResult,
  getSummaryAsync,
  requireDemoBearerAuth,
  requireRateLimit,
  requestRuntimeErrorResult,
  sendResult,
  setCorsHeaders
} = require("../../../lib/triage-demo-contract");

function sessionKeyFromRequest(req) {
  if (req.query && req.query.session_key) return req.query.session_key;
  const match = String(req.url || "").match(/\/api\/triage-demo\/sessions\/([^/?#]+)\/summary/);
  return match ? decodeURIComponent(match[1]) : null;
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendResult(res, errorResult(405, {}, "method_not_allowed", "Use GET /api/triage-demo/sessions/{session_key}/summary.", { retryable: false }));
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
    sendResult(res, await getSummaryAsync(sessionKeyFromRequest(req), {
      request_id: req.query ? req.query.request_id || null : null,
      debug: req.query ? req.query.debug === "true" : false
    }));
  } catch (error) {
    sendResult(res, requestRuntimeErrorResult(error));
  }
};
