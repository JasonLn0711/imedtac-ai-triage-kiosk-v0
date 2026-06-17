# Lab GPU Cloudflare Tunnel Runbook

Date: 2026-06-09
Status: target operations runbook for Render-to-lab-GPU inference
Related decision: `decisions/2026-06-09-render-lab-gpu-inference-bridge.md`

## Operating Answer

Render can call the lab GPU server. The lab computer should not rely on opening
a public inbound port after every reboot. The stable demo pattern is:

```text
Render Backend
  -> fixed HTTPS URL
  -> Cloudflare Tunnel
  -> Lab GPU Server localhost:8000
  -> FastAPI / Embedding / Reranker
```

The GPU server runs two local services after boot:

```text
1. FastAPI inference service on 127.0.0.1:8000
2. cloudflared tunnel service managed by systemd
```

Render keeps a fixed environment variable:

```text
LAB_GPU_BASE_URL=https://gpu-api.yourdomain.com
LAB_GPU_API_KEY=<secret stored only in Render>
```

After GPU server reboot, Render does not need a new port, URL, or code change
as long as the lab machine reconnects to the network and both services start.

## Why Cloudflare Tunnel

Cloudflare Tunnel is the preferred demo path because the lab GPU server creates
outbound-only connections to Cloudflare. This avoids public IP dependency and
avoids opening an inbound firewall port on a school or lab network. Cloudflare
also supports running `cloudflared` as a system service so the tunnel starts at
boot and keeps running while the origin machine is online.

Alternatives remain available:

| Option | Fit | Tradeoff |
| --- | --- | --- |
| Cloudflare Tunnel | Best demo / PoC default | Requires Cloudflare-managed domain or tunnel routing setup |
| ngrok static / reserved domain | Fast personal testing | Static hostname depends on ngrok plan/configuration |
| Tailscale Funnel | Good team/private-network path | Public Funnel uses `ts.net` naming and limited public ports |
| Public IP + HTTPS port | Simple conceptually | Requires firewall/public IP handling and stronger exposure controls |
| VPS reverse proxy | Flexible | Adds one more server to operate |

## Lab GPU Server Setup Shape

FastAPI should bind only to localhost:

```bash
uvicorn app:app --host 127.0.0.1 --port 8000
```

Cloudflare Tunnel maps the public hostname to the local service:

```text
https://gpu-api.yourdomain.com -> http://127.0.0.1:8000
```

The inference service should expose narrow internal endpoints, for example:

```text
POST /api/embed
POST /api/rerank
GET  /healthz
```

The Render backend calls those endpoints over HTTPS and then applies its own
manifest safety gate, deterministic routing policy, and summary assembler.

## Cloudflare Tunnel Setup Commands

Example local-managed tunnel setup:

```bash
cloudflared tunnel create lab-gpu-api
cloudflared tunnel route dns lab-gpu-api gpu-api.yourdomain.com
cloudflared tunnel run lab-gpu-api
```

Install and enable `cloudflared` as a Linux service:

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

The exact `cloudflared` config path and tunnel credentials path depend on how
the tunnel is created. Do not commit tunnel credentials or generated secret
files into this repo.

## FastAPI Service Autostart

Create a dedicated systemd unit for the lab inference service. Example shape:

```ini
[Unit]
Description=AI Triage Lab GPU Inference API
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/opt/ai-triage-lab-gpu
EnvironmentFile=/etc/ai-triage-lab-gpu.env
ExecStart=/opt/ai-triage-lab-gpu/.venv/bin/uvicorn app:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
User=ai-triage

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-triage-lab-gpu
sudo systemctl start ai-triage-lab-gpu
sudo systemctl status ai-triage-lab-gpu
```

Minimum environment file shape:

```text
LAB_GPU_API_KEY=<same shared secret expected from Render>
MODEL_EMBEDDING_NAME=Qwen/Qwen3-Embedding-0.6B
MODEL_RERANKER_NAME=Qwen/Qwen3-Reranker-0.6B
```

Store this file outside Git and restrict permissions.

## Render Settings

Render should use stable environment variables:

```text
LAB_GPU_ENABLED=1
LAB_GPU_BASE_URL=https://gpu-api.yourdomain.com
LAB_GPU_API_KEY=<secret stored only in Render>
LAB_GPU_TIMEOUT_MS=1500
```

The Render backend must treat the lab GPU service as optional support. If the
GPU service is unreachable, slow, unauthorized, or returns invalid candidate
ids, Render should record deterministic fallback and return a safe normal API
response.

## Reboot Recovery Checklist

After reboot, the lab machine should recover without changing Render settings:

```bash
systemctl is-active cloudflared
systemctl is-active ai-triage-lab-gpu
curl -sS http://127.0.0.1:8000/healthz
curl -sS https://gpu-api.yourdomain.com/healthz
```

Expected result:

```text
cloudflared is active
FastAPI service is active
localhost healthz returns ok
public tunnel healthz returns ok
Render keeps using the same LAB_GPU_BASE_URL
```

## Security Controls

- Keep FastAPI bound to `127.0.0.1`; expose it through the tunnel, not through
  a public local port.
- Require `Authorization: Bearer <LAB_GPU_API_KEY>` on inference endpoints.
- Store API keys only in Render environment variables and the lab server's
  local secret file.
- Do not log raw patient identifiers, raw audio, bearer tokens, tunnel
  credentials, or private IPs.
- Add request body limits and short timeouts.
- Return candidate ids, scores, model version, and latency metadata only.
- Let Render perform the final reviewed-manifest and deterministic-policy gate.

## References

- Cloudflare Tunnel configuration: `https://developers.cloudflare.com/tunnel/configuration/`
- Cloudflare `cloudflared` as a service: `https://developers.cloudflare.com/tunnel/advanced/local-management/as-a-service/`
- ngrok domains: `https://ngrok.com/docs/network-edge/domains-and-tcp-addresses/`
- Tailscale Funnel: `https://tailscale.com/docs/features/tailscale-funnel`
