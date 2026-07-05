"""8 adımlı analiz pipeline'ı.

Her adımda hem Celery state hem DB güncellenir (restart-safe).
Hata → kredi iadesi (idempotent) → status=refunded.
Klonlanan kod ASLA execute edilmez; klon her durumda silinir.
"""

from datetime import datetime, timedelta, timezone

import structlog

from app.core.config import settings
from app.db.database import SessionLocal
from app.db.models import AnalysisJob, JobStatus
from app.services import credits as credit_service
from app.services import repo_fetcher
from app.services.claude_client import review_repo, select_critical_files
from app.services.github_service import get_commit_messages, get_repo_overview
from app.services.mailer import send_report_email
from app.services.report_pdf import generate_pdf
from app.services.static_scan import (
    MANIFEST_FILES,
    ScanResult,
    is_scannable,
    parse_manifest,
    scan_content,
)
from app.worker.celery_app import celery_app

log = structlog.get_logger()

TOTAL_STEPS = 8


@celery_app.task(bind=True, name="analyze_repo")
def analyze_repo_task(self, job_id: str) -> dict:
    db = SessionLocal()
    clone_dir: str | None = None
    try:
        job = db.get(AnalysisJob, job_id)
        if job is None:
            raise RuntimeError(f"Job {job_id} not found")
        if job.status not in (JobStatus.queued, JobStatus.processing):
            return {"status": job.status.value}  # retry'da tamamlanmışsa dokunma

        def progress(step: int, message: str) -> None:
            job.status = JobStatus.processing
            job.progress_step = step
            job.progress_message = message
            db.commit()
            self.update_state(
                state="PROCESSING",
                meta={"step": step, "total": TOTAL_STEPS, "message": message},
            )

        # --- Cache: aynı repo son N saatte tamamlandıysa sonucu kopyala ---
        cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.analysis_cache_hours)
        cached = (
            db.query(AnalysisJob)
            .filter(
                AnalysisJob.owner == job.owner,
                AnalysisJob.repo_name == job.repo_name,
                AnalysisJob.status == JobStatus.completed,
                AnalysisJob.finished_at >= cutoff,
                AnalysisJob.id != job.id,
            )
            .order_by(AnalysisJob.finished_at.desc())
            .first()
        )
        if cached is not None:
            progress(7, "Cached result")
            job.result_json = cached.result_json
            job.overall_score = cached.overall_score
            job.language = cached.language
            job.pdf_path = cached.pdf_path
            job.pdf_sha256 = cached.pdf_sha256
            _finalize_and_email(db, self, job)
            return {"status": "completed", "cached": True}

        # 1. GitHub metadata
        progress(1, "Fetching GitHub metadata")
        overview = get_repo_overview(job.owner, job.repo_name)
        commit_messages = get_commit_messages(job.owner, job.repo_name)
        job.repo_size_mb = overview["size_mb"]

        # 2. Klon (bare + shallow — kod çalıştırılmaz)
        progress(2, "Cloning repository")
        clone_dir = repo_fetcher.clone_bare(overview["clone_url"])

        # 3. Tree + README + manifest'ler
        progress(3, "Reading tree and manifests")
        tree = repo_fetcher.list_tree(clone_dir)
        tree_lines = [f"{path} ({size}B)" for path, size in tree]

        readme = ""
        for path, _ in tree:
            if path.lower() in ("readme.md", "readme.rst", "readme.txt", "readme"):
                readme = repo_fetcher.read_blob(clone_dir, path) or ""
                break

        manifests: dict[str, str] = {}
        for path, size in tree:
            name = path.rsplit("/", 1)[-1]
            if name in MANIFEST_FILES and path.count("/") <= 1 and size < 200_000:
                content = repo_fetcher.read_blob(clone_dir, path)
                if content:
                    manifests[path] = content

        # 4. Statik tarama (secret + dependency) — saf string işleme
        progress(4, "Static security scan")
        scan = ScanResult()
        for path, size in tree:
            if size > settings.max_file_read_kb * 1024 or not is_scannable(path):
                continue
            if scan.scanned_files >= 2000:
                break
            content = repo_fetcher.read_blob(clone_dir, path)
            if content is None:
                continue
            scan.scanned_files += 1
            scan.secrets.extend(scan_content(path, content))
            deps = parse_manifest(path, content)
            if deps:
                scan.dependencies[path] = deps

        # 5. Claude çağrı 1 — kritik dosya seçimi
        progress(5, "Selecting critical files (LLM)")
        selection = select_critical_files(tree_lines, readme, manifests)
        tree_paths = {path for path, _ in tree}
        valid_files = [f for f in selection.critical_files if f in tree_paths]

        # 6. Claude çağrı 2 — RepoReviewer
        progress(6, "Deep review (LLM)")
        selected: dict[str, str] = {}
        total_kb = 0
        for path in valid_files:
            content = repo_fetcher.read_blob(clone_dir, path, settings.max_selected_file_kb)
            if content is None:
                continue
            kb = len(content) // 1024
            if total_kb + kb > settings.max_selected_total_kb:
                break
            selected[path] = content
            total_kb += kb

        static_findings = [
            {"rule": s.rule, "file": s.file, "line": s.line, "masked_value": s.masked}
            for s in scan.secrets[:50]
        ]
        stats_for_llm = {k: v for k, v in overview.items() if k != "clone_url"}
        review = review_repo(
            github_stats=stats_for_llm,
            commit_messages=commit_messages,
            static_findings=static_findings,
            dependencies=scan.dependencies,
            readme=readme,
            selected_files=selected,
            detected_language=selection.detected_language,
        )

        # 7. Sonuç + PDF
        progress(7, "Generating PDF report")
        review_dict = review.model_dump()
        review_dict["static_findings"] = static_findings
        review_dict["project_type"] = selection.project_type
        job.result_json = review_dict
        job.overall_score = review.overall_score
        job.language = review.language
        pdf_path, pdf_hash = generate_pdf(
            job.id, f"{job.owner}/{job.repo_name}", job.repo_url, review_dict
        )
        job.pdf_path = pdf_path
        job.pdf_sha256 = pdf_hash
        db.commit()

        # 8. Email + tamamla
        _finalize_and_email(db, self, job)
        return {"status": "completed"}

    except Exception as exc:
        log.error("analysis_failed", job_id=job_id, error=str(exc))
        db.rollback()
        job = db.get(AnalysisJob, job_id)
        if job is not None and job.status not in (JobStatus.completed, JobStatus.refunded):
            job.status = JobStatus.failed
            job.error_message = str(exc)[:2000]
            job.finished_at = datetime.now(timezone.utc)
            db.commit()
            try:
                credit_service.refund_for_analysis(db, job)
                job.status = JobStatus.refunded
                db.commit()
            except Exception as refund_exc:
                db.rollback()
                log.error("refund_failed", job_id=job_id, error=str(refund_exc))
        raise
    finally:
        if clone_dir is not None:
            repo_fetcher.cleanup(clone_dir)
        db.close()


def _finalize_and_email(db, task, job: AnalysisJob) -> None:
    """Adım 8: email gönder (hata task'i fail ETMEZ), job'ı tamamla."""
    job.status = JobStatus.completed
    job.progress_step = TOTAL_STEPS
    job.progress_message = "Completed"
    job.finished_at = datetime.now(timezone.utc)
    db.commit()
    task.update_state(
        state="PROCESSING",
        meta={"step": TOTAL_STEPS, "total": TOTAL_STEPS, "message": "Sending email"},
    )

    if job.email_sent_at is not None:
        return  # retry'da çift gönderme
    try:
        user = job.user
        recommendations = (job.result_json or {}).get("top_recommendations", [])
        send_report_email(
            to_email=user.email,
            locale=user.locale,
            job_id=job.id,
            repo_name=f"{job.owner}/{job.repo_name}",
            overall_score=job.overall_score or 0,
            recommendations=recommendations,
            pdf_path=job.pdf_path,
        )
        job.email_sent_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as exc:
        log.warning("report_email_failed", job_id=job.id, error=str(exc))
