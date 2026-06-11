const {
  createSessionAsync,
  demoBearerAuthChallenge,
  errorResult,
  readJsonBody,
  requireDemoBearerAuth,
  requireRateLimit,
  requestRuntimeErrorResult,
  sendResult,
  setCorsHeaders
} = require("../lib/triage-demo-contract");

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendResult(res, errorResult(405, {}, "method_not_allowed", "Use POST /api/triage-demo/sessions.", { retryable: false }));
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
    sendResult(res, await createSessionAsync(await readJsonBody(req)));
  } catch (error) {
    sendResult(res, requestRuntimeErrorResult(error));
  }
};
