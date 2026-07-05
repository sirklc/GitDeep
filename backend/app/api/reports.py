from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_verified_user
from app.db.database import get_db
from app.db.models import AnalysisJob, JobStatus, User

router = APIRouter(prefix="/api/reports", tags=["reports"])


def _get_completed_job(job_id: str, user: User, db: Session) -> AnalysisJob:
    job = db.get(AnalysisJob, job_id)
    if job is None or job.user_id != user.id:
        raise HTTPException(status_code=404, detail="Report not found")
    if job.status != JobStatus.completed or job.result_json is None:
        raise HTTPException(status_code=409, detail="Report not ready")
    return job


@router.get("/{job_id}")
def report_json(
    job_id: str,
    user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    job = _get_completed_job(job_id, user, db)
    return {
        "job_id": job.id,
        "repo": f"{job.owner}/{job.repo_name}",
        "repo_url": job.repo_url,
        "overall_score": job.overall_score,
        "language": job.language,
        "result": job.result_json,
        "pdf_sha256": job.pdf_sha256,
        "created_at": job.created_at.isoformat(),
    }


@router.get("/{job_id}/pdf")
def report_pdf(
    job_id: str,
    user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    job = _get_completed_job(job_id, user, db)
    if not job.pdf_path or not Path(job.pdf_path).exists():
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(
        job.pdf_path,
        media_type="application/pdf",
        filename=f"gitdeep-{job.owner}-{job.repo_name}.pdf",
    )
