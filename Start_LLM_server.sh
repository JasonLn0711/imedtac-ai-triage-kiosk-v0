cd ./LLM_api
uv run uvicorn main:app --host "${LLM_HOST:-127.0.0.1}" --port "${LLM_PORT:-8091}"
