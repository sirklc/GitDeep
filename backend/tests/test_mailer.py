from unittest.mock import MagicMock

import pytest

from app.services import mailer


@pytest.fixture
def fake_smtp(monkeypatch):
    server = MagicMock()
    server.__enter__.return_value = server
    server.__exit__.return_value = False
    smtp_cls = MagicMock(return_value=server)
    monkeypatch.setattr(mailer.smtplib, "SMTP", smtp_cls)
    return server


def test_send_analysis_report_email_attaches_pdf_en(fake_smtp):
    mailer.send_analysis_report_email(
        to_email="dev@example.com",
        repo_url="https://github.com/example/repo",
        overall_score=82.5,
        pdf_bytes=b"%PDF-1.4 fake",
        locale="en",
    )

    assert fake_smtp.send_message.call_count == 1
    msg = fake_smtp.send_message.call_args[0][0]
    assert msg["To"] == "dev@example.com"
    assert msg["From"] == "no-reply@gitdeep.dev"
    assert "82.5" in msg["Subject"]
    assert msg.is_multipart()

    attachments = list(msg.iter_attachments())
    assert len(attachments) == 1
    assert attachments[0].get_content_type() == "application/pdf"
    assert attachments[0].get_filename() == "gitdeep-report.pdf"
    assert attachments[0].get_payload(decode=True) == b"%PDF-1.4 fake"


def test_send_analysis_report_email_locale_tr(fake_smtp):
    mailer.send_analysis_report_email(
        to_email="dev@example.com",
        repo_url="https://github.com/example/repo",
        overall_score=50.0,
        pdf_bytes=b"%PDF-1.4 fake",
        locale="tr",
    )

    msg = fake_smtp.send_message.call_args[0][0]
    assert "analiz raporun hazır" in msg["Subject"]
