from typing import Literal

from pydantic import BaseModel, Field


class CriterionEvidence(BaseModel):
    file_path: str | None = None
    observation: str


class CriterionResult(BaseModel):
    criterion_id: str
    score: int = Field(ge=0, le=10)
    evidence: list[CriterionEvidence]
    reasoning: str


class FileReport(BaseModel):
    file_path: str
    verdict: Literal["clean", "issues"]
    summary: str


class AxisResult(BaseModel):
    axis: str
    criteria: list[CriterionResult]
    file_reports: list[FileReport]
    weighted_score: float = Field(ge=0, le=100)
    summary: str


class RepoAnalysisResult(BaseModel):
    repo_url: str
    axes: list[AxisResult]
    overall_score: float = Field(ge=0, le=100)
    executive_summary: str


def axis_json_schema() -> dict:
    return {
        "type": "object",
        "properties": {
            "axis": {"type": "string"},
            "criteria": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "criterion_id": {"type": "string"},
                        "score": {"type": "integer"},
                        "evidence": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "file_path": {"type": ["string", "null"]},
                                    "observation": {"type": "string"},
                                },
                                "required": ["observation"],
                                "additionalProperties": False,
                            },
                        },
                        "reasoning": {"type": "string"},
                    },
                    "required": ["criterion_id", "score", "evidence", "reasoning"],
                    "additionalProperties": False,
                },
            },
            "file_reports": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "file_path": {"type": "string"},
                        "verdict": {"type": "string", "enum": ["clean", "issues"]},
                        "summary": {"type": "string"},
                    },
                    "required": ["file_path", "verdict", "summary"],
                    "additionalProperties": False,
                },
            },
            "summary": {"type": "string"},
        },
        "required": ["axis", "criteria", "file_reports", "summary"],
        "additionalProperties": False,
    }
