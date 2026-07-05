from datetime import datetime, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

from app.core.config import settings
from app.core.security import sha256_file

_templates = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parent.parent / "templates"),
    autoescape=select_autoescape(["html"]),
)


def generate_pdf(job_id: str, repo_name: str, repo_url: str, review: dict) -> tuple[str, str]:
    """PDF üretir; (dosya yolu, SHA-256 hash) döner."""
    reports_dir = Path(settings.reports_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = reports_dir / f"{job_id}.pdf"

    html = _templates.get_template("report.html").render(
        repo_name=repo_name,
        repo_url=repo_url,
        review=review,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        integrity_note="raporun sonunda hesaplanır",
    )
    HTML(string=html).write_pdf(str(pdf_path))
    return str(pdf_path), sha256_file(str(pdf_path))
