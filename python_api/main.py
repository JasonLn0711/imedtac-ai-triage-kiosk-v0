from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
try:
    from . import triage_contract as contract
except ImportError:  # pragma: no cover - supports running main.py from python_api/
    import triage_contract as contract


STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="AI Triage Demo API",
    description="Synthetic-data staff-review intake support API for the AI triage kiosk demo.",
    version="0.2.0",
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def cors_headers(request: Request) -> dict[str, str]:
    headers = {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "600",
    }
    origin = request.headers.get("origin")
    if origin in contract.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Vary"] = "Origin"
    return headers


def json_result(request: Request, result: dict) -> JSONResponse:
    return JSONResponse(
        result["body"],
        status_code=result["statusCode"],
        headers=cors_headers(request),
    )


async def read_json_body(request: Request) -> dict:
    raw = (await request.body()).strip()
    if not raw:
        return {}
    value = json.loads(raw)
    return value if isinstance(value, dict) else {}


def auth_error(request: Request) -> dict | None:
    return contract.require_demo_bearer_auth(dict(request.headers))


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/healthz")
async def healthz() -> dict:
    return {
        "status": "ok",
        "service": "nycu-imedtac-triage-demo-api",
        "mode": "synthetic-data-rehearsal-api",
    }


@app.options("/api/triage-demo/sessions")
async def start_session_options(request: Request) -> Response:
    return Response(status_code=204, headers=cors_headers(request))


@app.options("/api/triage-demo/sessions/{session_key}/answers")
async def submit_answer_options(request: Request, session_key: str) -> Response:
    return Response(status_code=204, headers=cors_headers(request))


@app.post("/api/triage-demo/sessions")
async def start_session(request: Request) -> JSONResponse:
    error = auth_error(request)
    if error:
        response = json_result(request, error)
        response.headers["WWW-Authenticate"] = contract.demo_bearer_auth_challenge()
        return response

    try:
        body = await read_json_body(request)
    except json.JSONDecodeError:
        return json_result(request, contract.error_result(400, {}, "invalid_json", "Request body must be valid JSON.", {"retryable": False}))

    return json_result(request, contract.create_session(body))


@app.post("/api/triage-demo/sessions/{session_key}/answers")
async def submit_answer(request: Request, session_key: str) -> JSONResponse:
    error = auth_error(request)
    if error:
        response = json_result(request, error)
        response.headers["WWW-Authenticate"] = contract.demo_bearer_auth_challenge()
        return response

    try:
        body = await read_json_body(request)
    except json.JSONDecodeError:
        return json_result(request, contract.error_result(400, {}, "invalid_json", "Request body must be valid JSON.", {"retryable": False}))

    return json_result(request, contract.submit_answer(session_key, body))
