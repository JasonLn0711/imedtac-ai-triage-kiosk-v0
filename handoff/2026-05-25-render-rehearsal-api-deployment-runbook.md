# Render Rehearsal API Deployment Runbook

Status: active deployment runbook
Last updated: 2026-05-25
Audience: NYCU / Jason internal execution note for imedtac rehearsal API

## Purpose

This runbook records the Render deployment path for the NYCU-hosted rehearsal
API. The goal is to provide one stable HTTPS base URL that imedtac iMVS browser
code and NYCU testing can both call during rehearsal.

This is a deployment decision, not an API contract change. The June contract
remains:

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

## Current Render Service

Observed from the Render dashboard on `2026-05-25`:

| Field | Value |
| --- | --- |
| Service name | `nycu-imedtac-triage-demo-api` |
| Service type | Web Service |
| Runtime | Node |
| Instance type | Free |
| Repository | `JasonLn0711/ai-triage-kiosk-demo` |
| Branch | `main` |
| Render service id | `srv-d8a16je7r5hc73dvp46g` |
| Public URL | `https://nycu-imedtac-triage-demo-api.onrender.com` |
| Intended API base URL | `https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo` |

## Important Finding From First Deploy

The first Render deploy used Render's autofilled Node commands:

```bash
yarn install; yarn build
yarn start
```

This made the service live, but it ran the repo's static frontend command:

```bash
python3 -m http.server 4183
```

That is not the rehearsal API server. It can return `200` for a root request,
but it will not serve the intended API behavior at:

```http
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

Public verification on `2026-05-25`, including a post-push check after
execution merge commit `1d808e8`, confirmed this state:

| Check | Result | Interpretation |
| --- | --- | --- |
| `GET /healthz` | HTTP `404`; `x-render-origin-server: SimpleHTTP/0.6 Python/3.11.2` | Render is still running the static Python server from `yarn start`. |
| `OPTIONS /api/triage-demo/sessions` | HTTP `501`; `x-render-origin-server: SimpleHTTP/0.6 Python/3.11.2` | The public service still does not support API preflight because the Start Command has not been changed to `npm run render:start`. |

## Required Render Settings

Update the Render Web Service settings to these values before the next deploy:

| Render field | Required value |
| --- | --- |
| Build Command | `npm install && npm run render:build` |
| Start Command | `npm run render:start` |
| Health Check Path | `/healthz` |
| Root Directory | leave blank |
| Auto-Deploy | `On Commit` is acceptable for rehearsal |
| Environment Variables | none required for the first rehearsal |

The repo now defines:

```json
{
  "render:build": "npm run version:check && npm test && npm run smoke",
  "render:start": "node scripts/mock-api-server.js"
}
```

The mock API server reads Render's `PORT` environment variable and exposes:

```http
GET /healthz
```

## Deployment Sequence

1. Confirm local validation passes:

```bash
npm run demo:ready
```

2. Commit the Render API deployment prep and the imedtac rehearsal contract
   updates.

   Completed on `2026-05-25`: `61267d7`, preserved in published merge commit
   `1d808e8`.

3. Push the commit to `origin/main`.

   Completed on `2026-05-25`: `git push origin HEAD:main` updated GitHub
   `main` to `1d808e8`.

4. In Render settings, update:

```text
Build Command: npm install && npm run render:build
Start Command: npm run render:start
Health Check Path: /healthz
```

5. Trigger `Manual Deploy -> Deploy latest commit`.

6. Wait for Render logs to show the API server start message:

```text
AI triage demo mock API listening on http://localhost:<PORT>
```

7. Verify the public health endpoint:

```bash
API_BASE="https://nycu-imedtac-triage-demo-api.onrender.com"
curl -i "$API_BASE/healthz"
```

Expected result: HTTP `200` and JSON with `status: "ok"`.

8. Verify browser preflight:

```bash
curl -i -X OPTIONS "$API_BASE/api/triage-demo/sessions" \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, authorization"
```

Expected headers:

```text
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

9. Verify start-session:

```bash
curl -sS -X POST "$API_BASE/api/triage-demo/sessions" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5174" \
  --data @handoff/api-examples/2026-05-21-start-session-request-demo-tachycardia.json | jq .
```

Expected response:

```json
{
  "status": "question",
  "session_state": "active",
  "session_key": "demo-session-tachy-001"
}
```

10. Use the returned `session_key` to verify answer submission:

```bash
SESSION_KEY="<returned session_key>"
curl -sS -X POST "$API_BASE/api/triage-demo/sessions/$SESSION_KEY/answers" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5174" \
  --data @handoff/api-examples/2026-05-21-submit-answer-request-demo-tachycardia.json | jq .
```

The request file's `session_key` field is not used for routing; the URL
`session_key` is authoritative.

## Demo-Day Operating Notes

- Render Free instances spin down after inactivity. Pre-warm the service before
  rehearsal and before the customer demo.
- Process-memory session state is acceptable for this synthetic first
  rehearsal. If the instance restarts, restart the demo session.
- Do not store real patient data, credentials, live hospital identifiers, or
  production endpoint details in Render logs or repo files.
- If `idempotency_conflict` occurs, the recovery remains restart demo session
  or clearly labeled `local_scripted_demo`; do not add an answer-revision flow.

## Message To imedtac

Send this message only after the public Render endpoint passes `/healthz`,
CORS preflight, start-session, and submit-answer checks.

```text
We will provide one NYCU-hosted Render rehearsal API base URL:
https://nycu-imedtac-triage-demo-api.onrender.com/api/triage-demo

This does not change the two-endpoint API contract. It only fixes the browser
call target, CORS path, and rehearsal deployment location so both iMVS and NYCU
test against the same HTTPS endpoint.
```
