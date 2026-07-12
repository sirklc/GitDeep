from datetime import datetime, timezone

import structlog
from celery import chord, group

from app.analysis.aggregate import build_repo_analysis_result
from app.analysis.claude_client import AnalysisError, run_axis_analysis
from app.analysis.repo_context import RepoCloneError, build_repo_context, clone_repo
from app.analysis.rubrics import RUBRICS_BY_AXIS
from app.analysis.schemas import AxisResult
from app.celery_app import celery_app
from app.db.database import SessionLocal
from app.db.models import AnalysisJob, User
from app.reports.pdf import render_analysis_report_pdf
from app.services.mailer import send_analysis_report_email

log = structlog.get_logger()


def _mark_failed(job_id: int, error: str) -> None:
    db = SessionLocal()
    try:
        job = db.get(AnalysisJob, job_id)
        if job is not None:
            job.status = "failed"
            job.error = error
            job.completed_at = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()


@celery_app.task(name="analysis.orchestrate")
def orchestrate_analysis(job_id: int) -> None:
    db = SessionLocal()
    try:
        job = db.get(AnalysisJob, job_id)
        if job is None:
            log.warning("orchestrate.job_not_found", job_id=job_id)
            return
        job.status = "processing"
        db.commit()
        repo_url = job.repo_url
    finally:
        db.close()

    try:
        with clone_repo(repo_url) as repo_path:
            context = build_repo_context(repo_path)
    except RepoCloneError as exc:
        _mark_failed(job_id, str(exc))
        return

    tasks = group(run_axis_task.s(axis, repo_url, context) for axis in RUBRICS_BY_AXIS)
    chord(tasks)(aggregate_results_task.s(job_id))


@celery_app.task(name="analysis.run_axis", bind=True, max_retries=2, default_retry_delay=15)
def run_axis_task(self, axis: str, repo_url: str, repo_context: str) -> dict:
    rubric = RUBRICS_BY_AXIS[axis]
    try:
        result = run_axis_analysis(rubric, repo_url, repo_context)
    except AnalysisError as exc:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"axis": axis, "error": str(exc)}
    return {"axis": axis, "result": result.model_dump(mode="json")}


@celery_app.task(name="analysis.aggregate")
def aggregate_results_task(axis_payloads: list[dict], job_id: int) -> None:
    errors = [p["error"] for p in axis_payloads if "error" in p]
    db = SessionLocal()
    try:
        job = db.get(AnalysisJob, job_id)
        if job is None:
            return
        if errors:
            job.status = "failed"
            job.error = "; ".join(errors)
            job.completed_at = datetime.now(timezone.utc)
            db.commit()
            return

        axis_order = list(RUBRICS_BY_AXIS)
        axis_results = sorted(
            (AxisResult(**p["result"]) for p in axis_payloads),
            key=lambda a: axis_order.index(a.axis),
        )
        aggregate = build_repo_analysis_result(job.repo_url, axis_results)
        job.axes = [a.model_dump(mode="json") for a in aggregate.axes]
        job.overall_score = aggregate.overall_score
        job.executive_summary = aggregate.executive_summary
        job.status = "completed"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

        _send_report_email_best_effort(db, job)
    finally:
        db.close()


def _send_report_email_best_effort(db, job: AnalysisJob) -> None:
    if job.user_id is None:
        log.warning("aggregate.no_user_for_report_email", job_id=job.id)
        return
    user = db.get(User, job.user_id)
    if user is None:
        log.warning("aggregate.user_not_found_for_report_email", job_id=job.id, user_id=job.user_id)
        return
    try:
        pdf_bytes = render_analysis_report_pdf(job)
        send_analysis_report_email(
            to_email=user.email,
            repo_url=job.repo_url,
            overall_score=job.overall_score,
            pdf_bytes=pdf_bytes,
            locale=user.locale,
        )
    except Exception:
        log.exception("aggregate.report_email_failed", job_id=job.id, user_id=job.user_id)
