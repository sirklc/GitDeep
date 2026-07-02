import os
import json
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import RepositorySubmission, RepoAnalysisStatus
from app.services.analysis_orchestrator import AnalysisOrchestrator
from app.db.database import get_db
from app.db.models import RepoAnalysisRecord, User
from app.core.security import get_current_user, get_optional_user
from app.core.config import settings
from github import RateLimitExceededException
from fastapi_limiter.depends import RateLimiter

router = APIRouter()
orchestrator = AnalysisOrchestrator()

@router.get("/config")
def get_public_config():
    """Returns public configuration values for the frontend (e.g. Turnstile site key)."""
    return {
        "turnstile_site_key": settings.CLOUDFLARE_TURNSTILE_SITE_KEY,
    }


@router.post("/analyze", response_model=RepoAnalysisStatus)
def analyze_repository(
    submission: RepositorySubmission, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    url = submission.url
    parts = url.strip("/").split("/")
    if len(parts) < 2 or "github.com" not in url:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")
        
    owner = parts[-2]
    repo = parts[-1]
    
    # Check for recent analysis in the database (last 6 hours)
    from datetime import datetime, timedelta
    six_hours_ago = datetime.utcnow() - timedelta(hours=6)
    
    recent_record = db.query(RepoAnalysisRecord).filter(
        RepoAnalysisRecord.repo_name == f"{owner}/{repo}",
        RepoAnalysisRecord.created_at >= six_hours_ago
    ).order_by(RepoAnalysisRecord.created_at.desc()).first()

    if recent_record:
        # Parse chart_data from stored metrics_json instead of returning empty dicts
        stored = json.loads(recent_record.metrics_json) if recent_record.metrics_json else {}
        chart_data = {
            "activity_trend": stored.get("activity_trend", {}),
            "intent_breakdown": stored.get("intent_breakdown", {}),
        }
        return RepoAnalysisStatus(
            status="success",
            message=recent_record.summary_text,
            details=stored,
            chart_data=chart_data,
            pdf_url=recent_record.pdf_url,
            health_score=recent_record.health_score,
        )
    
    try:
        from app.celery_worker import analyze_repo_task
        task = analyze_repo_task.delay(url, owner, repo, current_user.id if current_user else None)
        return RepoAnalysisStatus(
            status="processing",
            message="Analysis started in background",
            details={"task_id": task.id},
        )
    except RateLimitExceededException:
        raise HTTPException(status_code=429, detail="GitHub API Rate Limit exceeded! Unauthenticated requests are limited to 60 per hour.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/{task_id}")
def get_analysis_status(task_id: str):
    from app.celery_worker import celery_app
    task_result = celery_app.AsyncResult(task_id)
    
    if task_result.state == 'PENDING':
        return {"status": "pending", "message": "Waiting in queue...", "result": None}
    elif task_result.state == 'PROCESSING':
        info = task_result.info or {}
        step, total = info.get('step', 0), info.get('total', 0)
        progress = round(step / total * 100) if total else None
        return {
            "status": "processing",
            "message": info.get('status', 'Processing...'),
            "progress": progress,
            "result": None,
        }
    elif task_result.state == 'SUCCESS':
        return {"status": "success", "message": "Analysis complete", "result": task_result.result}
    elif task_result.state == 'FAILURE':
        return {"status": "failed", "message": str(task_result.info.get('exc_message', 'Unknown error')), "result": None}
    else:
        return {"status": task_result.state.lower(), "message": "Unknown state", "result": None}

@router.get("/history")
def get_public_history(db: Session = Depends(get_db)):
    """Public endpoint: returns the last 20 analyses across all users for the history carousel."""
    records = db.query(RepoAnalysisRecord).order_by(
        RepoAnalysisRecord.created_at.desc()
    ).limit(20).all()
    history = []
    for r in records:
        history.append({
            "id": r.id,
            "repo_name": r.repo_name,
            "status": r.health_status,
            "score": r.health_score,
            "summary": r.summary_text,
            "analyzed_at": r.created_at.isoformat(),
            "pdf_url": r.pdf_url
        })
    return {"history": history}

@router.get("/me/history")
def get_user_analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve the recent historical analyses for the logged in user."""
    records = db.query(RepoAnalysisRecord).filter(
        RepoAnalysisRecord.user_id == current_user.id
    ).order_by(RepoAnalysisRecord.created_at.desc()).limit(10).all()
    history = []
    for r in records:
        history.append({
            "id": r.id,
            "repo_name": r.repo_name,
            "status": r.health_status,
            "score": r.health_score,
            "summary": r.summary_text,
            "analyzed_at": r.created_at.isoformat(),
            "pdf_url": r.pdf_url
        })
    return {"history": history}
