from __future__ import annotations

import httpx

from python_api.triage_v1.llm_summary_client import request_subjective_summary


def test_request_subjective_summary_is_disabled_without_url(monkeypatch):
    monkeypatch.delenv("LLM_SUMMARY_URL", raising=False)

    result = request_subjective_summary({"patient_record": {}})

    assert result is None


class FakeResponse:
    def __init__(self, status_code=200, body=None, json_error=False):
        self.status_code = status_code
        self._body = body if body is not None else {}
        self._json_error = json_error

    def json(self):
        if self._json_error:
            raise ValueError("bad json")
        return self._body


class FakeClient:
    def __init__(self, response=None, error=None):
        self.response = response or FakeResponse()
        self.error = error

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def post(self, url, json):
        if self.error:
            raise self.error
        return self.response


def test_request_subjective_summary_returns_valid_llm_response(monkeypatch):
    monkeypatch.setenv("LLM_SUMMARY_URL", "http://llm.test/api")
    monkeypatch.setattr(
        "python_api.triage_v1.llm_summary_client.httpx.Client",
        lambda timeout: FakeClient(FakeResponse(body={"subjective": ["53 y/o M"], "model_id": "test/model"})),
    )

    result = request_subjective_summary({"patient_record": {}})

    assert result is not None
    assert result.subjective == ["53 y/o M"]
    assert result.model_id == "test/model"


def test_request_subjective_summary_falls_back_on_timeout(monkeypatch):
    monkeypatch.setenv("LLM_SUMMARY_URL", "http://llm.test/api")
    monkeypatch.setattr(
        "python_api.triage_v1.llm_summary_client.httpx.Client",
        lambda timeout: FakeClient(error=httpx.TimeoutException("timeout")),
    )

    assert request_subjective_summary({"patient_record": {}}) is None


def test_request_subjective_summary_falls_back_on_non_200(monkeypatch):
    monkeypatch.setenv("LLM_SUMMARY_URL", "http://llm.test/api")
    monkeypatch.setattr(
        "python_api.triage_v1.llm_summary_client.httpx.Client",
        lambda timeout: FakeClient(FakeResponse(status_code=503, body={"detail": "loading"})),
    )

    assert request_subjective_summary({"patient_record": {}}) is None


def test_request_subjective_summary_falls_back_on_malformed_json(monkeypatch):
    monkeypatch.setenv("LLM_SUMMARY_URL", "http://llm.test/api")
    monkeypatch.setattr(
        "python_api.triage_v1.llm_summary_client.httpx.Client",
        lambda timeout: FakeClient(FakeResponse(json_error=True)),
    )

    assert request_subjective_summary({"patient_record": {}}) is None


def test_request_subjective_summary_falls_back_on_empty_subjective(monkeypatch):
    monkeypatch.setenv("LLM_SUMMARY_URL", "http://llm.test/api")
    monkeypatch.setattr(
        "python_api.triage_v1.llm_summary_client.httpx.Client",
        lambda timeout: FakeClient(FakeResponse(body={"subjective": []})),
    )

    assert request_subjective_summary({"patient_record": {}}) is None
