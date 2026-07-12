from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.analysis.schemas import AxisResult


class AnalysisSubmitRequest(BaseModel):
    repo_url: str


class AnalysisSubmitResponse(BaseModel):
    job_id: int
    status: str


class AnalysisJobResponse(BaseModel):
    id: int
    repo_url: str
    status: str
    axes: list[AxisResult] | None
    overall_score: float | None
    executive_summary: str | None
    error: str | None
    created_at: datetime
    completed_at: datetime | None

    @classmethod
    def from_job(cls, job) -> "AnalysisJobResponse":
        return cls(
            id=job.id,
            repo_url=job.repo_url,
            status=job.status,
            axes=job.axes,
            overall_score=job.overall_score,
            executive_summary=job.executive_summary,
            error=job.error,
            created_at=job.created_at,
            completed_at=job.completed_at,
        )
