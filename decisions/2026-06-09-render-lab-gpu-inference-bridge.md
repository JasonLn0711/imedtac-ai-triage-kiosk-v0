# Render To Lab GPU Inference Bridge

Date: 2026-06-09
Status: active target architecture decision
Related spec: `docs/ai-triage-dynamic-engine-sdd-implementation-test-spec.md`

## First Principle

The scarce resource is stable external integration with 慧誠智醫（imedtac Co.,
Ltd.）while preserving the lab's ability to run heavier AI inference on
controlled GPU hardware. The clean ownership split is:

```text
Render backend owns public API orchestration, session state, routing state,
and staff-review response assembly.

Lab GPU server owns model inference for embedding and reranking.
```

GitHub stores the deployable backend code. Render pulls the GitHub branch and
runs the backend service. The lab GPU server is not deployed by Render; it is an
upstream inference dependency called by the Render backend over a secured HTTPS
or tunnel endpoint.

## Decision

Use Render as the cloud API gateway / orchestrator for the demo backend, and
allow it to call a lab-hosted GPU inference server for Qwen3 Embedding and
Qwen3 Reranker work.

```text
Frontend / iMVS
  -> Render Backend
  -> REST API / HTTPS
  -> Lab GPU Server
  -> Embedding / Reranker
  -> Render Backend
  -> Frontend / iMVS
```

This means the current Render backend can call back to the lab GPU server,
wait for candidate results, apply the backend deterministic policy / safety
gate, and then return the normal API response to the frontend.

## Render And GitHub Behavior

Pushing the GitHub repo to the Render-linked branch can deploy code that calls
the lab GPU server. The required code pattern is an outbound server-side HTTP
call from the Render backend:

```js
await fetch(`${process.env.LAB_GPU_BASE_URL}/api/rerank`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.LAB_GPU_API_KEY}`
  },
  body: JSON.stringify(payload)
});
```

Render does not need direct access to the GPU hardware. Render only needs a
network-reachable URL for the lab inference API and environment variables for
its base URL and credential. The repository must not store the real URL token,
API key, tunnel secret, or private network credential.

Recommended Render environment variables:

```text
LAB_GPU_BASE_URL=https://<lab-gpu-inference-host>
LAB_GPU_API_KEY=<secret stored only in Render>
LAB_GPU_TIMEOUT_MS=1500
LAB_GPU_ENABLED=1
```

## Lab GPU Server Requirement

The lab GPU server must be reachable by Render. Acceptable demo paths are:

```text
1. Public IP + firewall rule + HTTPS
2. Cloudflare Tunnel to a local FastAPI service
3. Tailscale Funnel
4. ngrok / frp
5. VPS reverse proxy to the lab machine
```

The recommended demo path is:

```text
Render Backend
  -> HTTPS
  -> Cloudflare Tunnel
  -> Lab GPU Server FastAPI
```

This avoids opening a public inbound port on the lab network while still giving
Render a stable HTTPS target.

## Reboot-Stable Operations Decision

The lab GPU server should not depend on manually opening a port after every
reboot. The stable operations pattern is:

```text
No public inbound port on the lab GPU server.
FastAPI binds to localhost:8000.
cloudflared runs as a systemd service.
Render calls one fixed HTTPS hostname.
```

Recommended service layout:

```text
Render Backend
  -> https://gpu-api.yourdomain.com
  -> Cloudflare Tunnel
  -> 127.0.0.1:8000 on Lab GPU Server
  -> FastAPI / Embedding / Reranker
```

Minimum autostart requirements:

```text
1. GPU server starts FastAPI inference service at boot.
2. GPU server starts Cloudflare Tunnel at boot.
3. Render keeps using the same LAB_GPU_BASE_URL.
```

The operational runbook is
`handoff/2026-06-09-lab-gpu-cloudflare-tunnel-runbook.md`.

## Lab GPU FastAPI Shape

The lab service should expose narrow internal inference endpoints. The first
minimum useful endpoint can be:

```python
from fastapi import FastAPI, Header, HTTPException

app = FastAPI()

@app.post("/api/rerank")
def rerank(payload: dict, authorization: str | None = Header(default=None)):
    # Verify bearer token.
    # Run Qwen3 Embedding / Qwen3 Reranker.
    # Return reviewed candidate ids and scores, not clinical advice.
    return {
        "ranked_questions": []
    }
```

The lab service should return candidates and scores only. It should not return
diagnosis, treatment advice, formal triage level, department recommendation, or
patient-facing unreviewed clinical questions.

## Backend Control Boundary

The Render backend remains responsible for:

- `/sessions`, `/answers`, `/answer-candidates`, and `/summary` API contract;
- CORS, bearer-token gate, request validation, idempotency, and session TTL;
- session state, selected answers, derived flags, and routing trace;
- deterministic routing policy and manifest safety gate;
- template-based `staff_review_summary`;
- fallback when the lab GPU server is unavailable, slow, or returns invalid
  output.

The lab GPU server is responsible for:

- embedding candidate retrieval;
- reranking top-k candidate questions or option matches;
- returning model version, index version, scores, and latency metadata;
- keeping model weights and GPU runtime outside the public Render service.

## Failure And Fallback Rule

AI inference is a support layer. The Render backend must continue to produce a
safe deterministic response if the lab GPU path fails.

Required fallback cases:

- `LAB_GPU_ENABLED` is unset or disabled;
- lab GPU URL is unreachable;
- request times out;
- bearer token is rejected;
- response schema is invalid;
- returned candidate ids are not in the reviewed manifest;
- GPU service returns a candidate that fails the backend safety gate.

Fallback response should preserve the existing API shape and record
`ai_status`, `reason_codes`, and routing trace details for review.

## Security Controls

- Store `LAB_GPU_API_KEY` only in Render environment variables and the lab
  server secret store.
- Do not commit tunnel URLs with secret paths, bearer tokens, private IPs, or
  live credentials.
- Prefer HTTPS with bearer token for the first demo path.
- Add request size limits and timeouts on both Render and lab GPU services.
- Log request ids, model version, index version, latency, and candidate ids;
  do not log raw patient identifiers, raw audio, or real patient data.

## Spec Implication

The SDD should describe the current JavaScript Render backend as the demo
contract/runtime harness and the lab GPU FastAPI service as the target
inference layer. This keeps the frontend contract stable while allowing the AI
implementation to move to Python/GPU without changing imedtac-facing endpoints.
