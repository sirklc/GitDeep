from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.analysis.claude_client import AnalysisError, run_axis_analysis
from app.analysis.repo_context import RepoCloneError, build_repo_context, clone_repo
from app.analysis.rubrics import ARCHITECTURE
from app.analysis.schemas import AxisResult
from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import AnalysisJob, User
from app.reports.pdf import render_analysis_report_pdf
from app.schemas.analysis import AnalysisJobResponse, AnalysisSubmitRequest, AnalysisSubmitResponse
from app.tasks.analysis_tasks import orchestrate_analysis

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class AnalysisTestRunRequest(BaseModel):
    repo_url: str


@router.post("/test-run", response_model=AxisResult)
def test_run(body: AnalysisTestRunRequest) -> AxisResult:
    try:
        with clone_repo(body.repo_url) as repo_path:
            context = build_repo_context(repo_path)
    except RepoCloneError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        return run_axis_analysis(ARCHITECTURE, body.repo_url, context)
    except AnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/jobs", response_model=AnalysisSubmitResponse)
def submit_job(
    body: AnalysisSubmitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AnalysisSubmitResponse:
    job = AnalysisJob(repo_url=body.repo_url, user_id=user.id, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)

    orchestrate_analysis.delay(job.id)

    return AnalysisSubmitResponse(job_id=job.id, status=job.status)


@router.get("/jobs/{job_id}", response_model=AnalysisJobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AnalysisJobResponse:
    job = db.get(AnalysisJob, job_id)
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return AnalysisJobResponse.from_job(job)


@router.get("/jobs/{job_id}/report")
def get_job_report(
    job_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    job = db.get(AnalysisJob, job_id)
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    if job.status != "completed":
        raise HTTPException(status_code=409, detail="Report not available until analysis completes")

    pdf_bytes = render_analysis_report_pdf(job)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="gitdeep-report-{job_id}.pdf"'},
    )
