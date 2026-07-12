import json
from contextlib import contextmanager
from types import SimpleNamespace
from unittest.mock import patch

import anthropic
import httpx
import pytest

from app.analysis.claude_client import AnalysisError, run_axis_analysis
from app.analysis.rubrics import ARCHITECTURE


def _fake_stream(stop_reason: str, content_text: str):
    @contextmanager
    def _stream(**kwargs):
        message = SimpleNamespace(
            stop_reason=stop_reason,
            content=[SimpleNamespace(type="text", text=content_text)],
        )
        yield SimpleNamespace(get_final_message=lambda: message)

    return _stream


def _valid_payload() -> str:
    return json.dumps(
        {
            "axis": "architecture",
            "criteria": [
                {
                    "criterion_id": c.id,
                    "score": 7,
                    "evidence": [{"file_path": "app/main.py", "observation": "obs"}],
                    "reasoning": "because",
                }
                for c in ARCHITECTURE.criteria
            ],
            "file_reports": [
                {"file_path": "app/main.py", "verdict": "clean", "summary": "Looks fine."}
            ],
            "summary": "Overall fine.",
        }
    )


def test_run_axis_analysis_returns_file_reports():
    with patch("app.analysis.claude_client._client") as mock_client:
        mock_client.messages.stream.side_effect = _fake_stream("end_turn", _valid_payload())
        result = run_axis_analysis(ARCHITECTURE, "https://github.com/example/repo", "context")

    assert result.file_reports[0].file_path == "app/main.py"
    assert result.file_reports[0].verdict == "clean"
    assert result.weighted_score > 0


def test_run_axis_analysis_raises_on_refusal():
    with patch("app.analysis.claude_client._client") as mock_client:
        mock_client.messages.stream.side_effect = _fake_stream("refusal", "{}")
        with pytest.raises(AnalysisError):
            run_axis_analysis(ARCHITECTURE, "https://github.com/example/repo", "context")


def test_run_axis_analysis_raises_on_max_tokens():
    with patch("app.analysis.claude_client._client") as mock_client:
        mock_client.messages.stream.side_effect = _fake_stream("max_tokens", "{}")
        with pytest.raises(AnalysisError):
            run_axis_analysis(ARCHITECTURE, "https://github.com/example/repo", "context")


def test_run_axis_analysis_raises_on_rate_limit():
    request = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
    response = httpx.Response(429, request=request)

    def _raise(**kwargs):
        raise anthropic.RateLimitError("rate limited", response=response, body=None)

    with patch("app.analysis.claude_client._client") as mock_client:
        mock_client.messages.stream.side_effect = _raise
        with pytest.raises(AnalysisError):
            run_axis_analysis(ARCHITECTURE, "https://github.com/example/repo", "context")
