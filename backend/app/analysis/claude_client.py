import json

import anthropic
from pydantic import BaseModel

from app.analysis.prompts import build_axis_prompt
from app.analysis.rubrics import Rubric
from app.analysis.schemas import AxisResult, CriterionResult, FileReport, axis_json_schema
from app.core.config import settings

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


class AnalysisError(Exception):
    pass


class _AxisResultDraft(BaseModel):
    axis: str
    criteria: list[CriterionResult]
    file_reports: list[FileReport]
    summary: str


def run_axis_analysis(rubric: Rubric, repo_url: str, repo_context: str) -> AxisResult:
    prompt = build_axis_prompt(rubric, repo_url)
    user_message = f"{prompt}\n\nRepository context:\n{repo_context}"

    try:
        with _client.messages.stream(
            model="claude-opus-4-8",
            max_tokens=64000,
            thinking={"type": "adaptive"},
            output_config={
                "effort": "high",
                "format": {"type": "json_schema", "schema": axis_json_schema()},
            },
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            response = stream.get_final_message()
    except anthropic.NotFoundError as exc:
        raise AnalysisError(f"Claude API: model not found ({exc.message})") from exc
    except anthropic.RateLimitError as exc:
        raise AnalysisError(f"Claude API: rate limited ({exc.message})") from exc
    except anthropic.APIStatusError as exc:
        raise AnalysisError(f"Claude API error {exc.status_code}: {exc.message}") from exc
    except anthropic.APIConnectionError as exc:
        raise AnalysisError(f"Claude API: connection failed ({exc})") from exc

    if response.stop_reason == "refusal":
        raise AnalysisError("Claude refused the analysis request")
    if response.stop_reason == "max_tokens":
        raise AnalysisError("Claude response truncated (max_tokens hit)")

    text_blocks = [block.text for block in response.content if block.type == "text"]
    if not text_blocks:
        raise AnalysisError("Claude response contained no text block")

    draft = _AxisResultDraft.model_validate(json.loads(text_blocks[-1]))

    weighted_score = rubric.weighted_score({c.criterion_id: c.score for c in draft.criteria})

    return AxisResult(
        axis=draft.axis,
        criteria=draft.criteria,
        file_reports=draft.file_reports,
        weighted_score=weighted_score,
        summary=draft.summary,
    )
