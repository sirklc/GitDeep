import smtplib
import ssl
from email.message import EmailMessage
from pathlib import Path

import structlog
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.core.config import settings

log = structlog.get_logger()

_templates = Environment(
    loader=FileSystemLoader(Path(__file__).resolve().parent.parent / "templates"),
    autoescape=select_autoescape(["html"]),
)


def _send(msg: EmailMessage) -> None:
    if settings.smtp_tls == "ssl":
        with smtplib.SMTP_SSL(
            settings.smtp_host, settings.smtp_port, context=ssl.create_default_context()
        ) as server:
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
        if settings.smtp_tls == "starttls":
            server.starttls(context=ssl.create_default_context())
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


def send_verification_email(to_email: str, token: str, locale: str) -> None:
    verify_url = f"{settings.frontend_url}/{locale}/verify-email?token={token}"
    if locale == "tr":
        subject = "GitDeep — email adresini doğrula"
        body = (
            f"GitDeep hesabını doğrulamak için linke tıkla (24 saat geçerli):\n\n"
            f"{verify_url}\n\nBu kaydı sen başlatmadıysan bu emaili yok say."
        )
    else:
        subject = "GitDeep — verify your email"
        body = (
            f"Click the link to verify your GitDeep account (valid for 24 hours):\n\n"
            f"{verify_url}\n\nIf you didn't sign up, ignore this email."
        )

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)
    _send(msg)
    log.info("verification_email_sent", to=to_email)


def send_report_email(
    to_email: str,
    locale: str,
    job_id: str,
    repo_name: str,
    overall_score: int,
    recommendations: list[str],
    pdf_path: str | None,
) -> None:
    report_url = f"{settings.frontend_url}/{locale}/reports/{job_id}"
    template = _templates.get_template(f"email_{locale}.html")
    html = template.render(
        repo_name=repo_name,
        overall_score=overall_score,
        recommendations=recommendations,
        report_url=report_url,
    )

    if locale == "tr":
        subject = f"GitDeep raporu hazır: {repo_name} — {overall_score}/100"
        text = f"{repo_name} analizi tamamlandı. Rapor: {report_url}"
    else:
        subject = f"Your GitDeep report is ready: {repo_name} — {overall_score}/100"
        text = f"Analysis of {repo_name} is complete. Report: {report_url}"

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    if pdf_path and Path(pdf_path).exists():
        msg.add_attachment(
            Path(pdf_path).read_bytes(),
            maintype="application",
            subtype="pdf",
            filename=f"gitdeep-{repo_name}.pdf",
        )

    _send(msg)
    log.info("report_email_sent", to=to_email, job_id=job_id)
