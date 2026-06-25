# LLM API

Local Hugging Face summary service for the AI triage kiosk demo.

## Configuration

Create `.env` in `LLM_api/` from the repo-root `.env.example`.

```text
HF_TOKEN=
LLM_MODEL_ID=google/medgemma-4b-it
LLM_HOST=127.0.0.1
LLM_PORT=8091
LLM_SUMMARY_URL=
```

`HF_TOKEN` is used for gated Hugging Face models. `LLM_MODEL_ID` can be changed
to another compatible Hugging Face instruction model. The triage API uses the
deterministic staff-review summary by default. Set `LLM_SUMMARY_URL` in the
triage API environment only when this local service is intentionally enabled
for a controlled demo run.

## Run

```bash
uv run uvicorn main:app --host "${LLM_HOST:-127.0.0.1}" --port "${LLM_PORT:-8091}"
```

or from the repo root:

```bash
./Start_LLM_server.sh
```
