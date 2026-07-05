import structlog
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import csrf_protect, get_verified_user, rate_limit
from app.core.config import credits_for_repo_size
from app.db.database import get_db
from app.db.models import AnalysisJob, JobStatus, User
from app.services import credits as credit_service
from app.services.credits import InsufficientCredits
from app.services.github_service import (
    RepoNotFound,
    RepoNotPublic,
    get_repo_overview,
    parse_repo_url,
)
from app.worker.tasks import analyze_repo_task

log = structlog.get_logger()

router = APIRouter(prefix="/api/analyze", tags=["analyze"])


class AnalyzeRequest(BaseModel):
    repo_url: str
    turnstile_token: str = ""


class QuoteOut(BaseModel):
    repo: str
    size_mb: float
    credits: int
    balance: int
    balance_after: int


class JobOut(BaseModel):
    job_id: str


class JobStatusOut(BaseModel):
    job_id: str
    repo: str
    status: str
    progress_step: int
    progress_total: int
    progress_message: str
    overall_score: int | None
    error_message: str | None
    credits_charged: int
    created_at: str


def _overview_or_400(repo_url: str) -> tuple[str, str, dict]:
    try:
        owner, repo_name = parse_repo_url(repo_url)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL")
    try:
        overview = get_repo_overview(owner, repo_name)
    except RepoNotFound:
        raise HTTPException(status_code=404, detail="Repository not found")
    except RepoNotPublic:
        raise HTTPException(status_code=400, detail="Only public repositories are supported")
    return owner, repo_name, overview


@router.post("/quote", response_model=QuoteOut, dependencies=[rate_limit(times=20, seconds=60)])
def quote(
    body: AnalyzeRequest,
    user: User = Depends(get_verified_user),
):
    _, _, overview = _overview_or_400(body.repo_url)
    cost = credits_for_repo_size(overview["size_mb"])
    return QuoteOut(
        repo=overview["full_name"],
        size_mb=overview["size_mb"],
        credits=cost,
        balance=user.credit_balance,
        balance_after=user.credit_balance - cost,
    )


@router.post(
    "",
    response_model=JobOut,
    dependencies=[Depends(csrf_protect), rate_limit(times=10, seconds=3600)],
)
def create_analysis(
    body: AnalyzeRequest,
    user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    # Eş zamanlı iş limiti: kullanıcı başına 1 aktif analiz
    active = db.scalar(
        select(AnalysisJob).where(
            AnalysisJob.user_id == user.id,
            AnalysisJob.status.in_([JobStatus.queued, JobStatus.processing]),
        )
    )
    if active is not None:
        raise HTTPException(status_code=409, detail="You already have an active analysis")

    owner, repo_name, overview = _overview_or_400(body.repo_url)
    cost = credits_for_repo_size(overview["size_mb"])

    # Tek transaction: job insert + kredi düşümü + ledger. Commit SONRASI enqueue.
    job = AnalysisJob(
        user_id=user.id,
        repo_url=body.repo_url.strip(),
        owner=owner,
        repo_name=repo_name,
        repo_size_mb=overview["size_mb"],
        credits_charged=cost,
        language=user.locale,
    )
    db.add(job)
    db.flush()
    try:
        credit_service.charge_for_analysis(db, user.id, job)
    except InsufficientCredits:
        db.rollback()
        raise HTTPException(status_code=402, detail="Insufficient credits")
    db.commit()

    analyze_repo_task.apply_async(args=[job.id], task_id=job.id)
    log.info("analysis_enqueued", job_id=job.id, repo=f"{owner}/{repo_name}", cost=cost)
    return JobOut(job_id=job.id)


@router.get("/history", response_model=list[JobStatusOut])
def history(
    user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
    limit: int = 20,
):
    jobs = db.scalars(
        select(AnalysisJob)
        .where(AnalysisJob.user_id == user.id)
        .order_by(AnalysisJob.created_at.desc())
        .limit(min(limit, 100))
    ).all()
    return [_job_out(j) for j in jobs]


@router.get("/{job_id}", response_model=JobStatusOut)
def job_status(
    job_id: str,
    user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    job = db.get(AnalysisJob, job_id)
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found")
    return _job_out(job)


def _job_out(job: AnalysisJob) -> JobStatusOut:
    return JobStatusOut(
        job_id=job.id,
        repo=f"{job.owner}/{job.repo_name}",
        status=job.status.value,
        progress_step=job.progress_step,
        progress_total=job.progress_total,
        progress_message=job.progress_message,
        overall_score=job.overall_score,
        error_message=job.error_message,
        credits_charged=job.credits_charged,
        created_at=job.created_at.isoformat(),
    )
