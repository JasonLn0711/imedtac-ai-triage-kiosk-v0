from __future__ import annotations

from .models import FlowState


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, FlowState] = {}

    def get(self, session_key: str | None) -> FlowState | None:
        return self._sessions.get(session_key or "")

    def put(self, flow_state: FlowState) -> None:
        self._sessions[flow_state.session_key] = flow_state

    def clear(self) -> None:
        self._sessions.clear()
