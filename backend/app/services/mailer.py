import smtplib
import ssl
from email.message import EmailMessage

import structlog

from app.core.config import settings

log = structlog.get_logger()


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


def _build(from_addr: str, to_email: str, subject: str, text: str) -> EmailMessage:
    msg = EmailMessage()
    msg["From"] = from_addr
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(text)
    return msg


def send_password_reset_email(to_email: str, token: str, locale: str) -> None:
    """support@ kutusundan gider — hesap/güvenlik konulu e-postalar bu adresten atılır."""
    reset_url = f"{settings.frontend_url}/{locale}/reset-password?token={token}"
    if locale == "tr":
        subject = "GitDeep — şifre sıfırlama"
        text = (
            f"Şifreni sıfırlamak için linke tıkla (bu link {settings.password_reset_minutes} dakika geçerli):\n\n"
            f"{reset_url}\n\nBu isteği sen yapmadıysan bu emaili yok say."
        )
    else:
        subject = "GitDeep — reset your password"
        text = (
            f"Click the link to reset your password (valid for {settings.password_reset_minutes} minutes):\n\n"
            f"{reset_url}\n\nIf you didn't request this, ignore this email."
        )
    _send(_build(settings.email_from_support, to_email, subject, text))
    log.info("password_reset_email_sent", to=to_email)


def send_newsletter_confirmation(to_email: str, locale: str) -> None:
    """newsletter@ kutusundan gider — bültene kayıt onayı."""
    if locale == "tr":
        subject = "GitDeep bültenine hoş geldin"
        text = "GitDeep bültenine abone oldun. Yeni özellikler ve duyurular için takipte kal!"
    else:
        subject = "Welcome to the GitDeep newsletter"
        text = "You're subscribed to the GitDeep newsletter. Stay tuned for updates and new features!"
    _send(_build(settings.email_from_newsletter, to_email, subject, text))
    log.info("newsletter_confirmation_sent", to=to_email)
