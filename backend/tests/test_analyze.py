from unittest.mock import MagicMock

from app.core.security import create_email_verify_token
from app.db.models import User

REPO_URL = "https://github.com/octocat/hello"


def _register_and_verify(client, db_session, email="quoter@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "supersecret1", "locale": "en", "turnstile_token": ""},
    )
    user = db_session.query(User).filter_by(email=email).one()
    token = create_email_verify_token(user.id)
    client.get(f"/api/auth/verify-email?token={token}")
    return user


def _mock_overview(monkeypatch, size_mb=10.0):
    monkeypatch.setattr(
        "app.api.analyze.get_repo_overview",
        lambda owner, repo: {"full_name": f"{owner}/{repo}", "size_mb": size_mb},
    )


def _mock_apply_async(monkeypatch):
    mock = MagicMock()
    monkeypatch.setattr("app.api.analyze.analyze_repo_task.apply_async", mock)
    return mock


def _csrf_headers(client) -> dict:
    return {"X-CSRF-Token": client.cookies.get("gd_csrf")}


def test_quote_requires_verified_email(client, db_session, monkeypatch):
    _mock_overview(monkeypatch)
    client.post(
        "/api/auth/register",
        json={"email": "unverified@example.com", "password": "supersecret1", "turnstile_token": ""},
    )
    resp = client.post("/api/analyze/quote", json={"repo_url": REPO_URL})
    assert resp.status_code == 403


def test_quote_happy_path(client, db_session, monkeypatch):
    _register_and_verify(client, db_session)
    _mock_overview(monkeypatch, size_mb=10.0)
    resp = client.post("/api/analyze/quote", json={"repo_url": REPO_URL})
    assert resp.status_code == 200
    body = resp.json()
    assert body["credits"] == 50
    assert body["balance"] == 100
    assert body["balance_after"] == 50


def test_create_analysis_charges_credits_and_enqueues(client, db_session, monkeypatch):
    _register_and_verify(client, db_session, email="creator@example.com")
    _mock_overview(monkeypatch, size_mb=10.0)
    apply_async = _mock_apply_async(monkeypatch)

    resp = client.post(
        "/api/analyze", json={"repo_url": REPO_URL}, headers=_csrf_headers(client)
    )
    assert resp.status_code == 200
    job_id = resp.json()["job_id"]
    apply_async.assert_called_once_with(args=[job_id], task_id=job_id)

    balance = client.get("/api/credits/balance").json()["credit_balance"]
    assert balance == 50


def test_create_analysis_insufficient_credits(client, db_session, monkeypatch):
    _register_and_verify(client, db_session, email="poor@example.com")
    _mock_overview(monkeypatch, size_mb=600.0)  # üst tier -> 150 kredi, bakiye 100
    _mock_apply_async(monkeypatch)

    resp = client.post(
        "/api/analyze", json={"repo_url": REPO_URL}, headers=_csrf_headers(client)
    )
    assert resp.status_code == 402


def test_create_analysis_rejects_second_active_job(client, db_session, monkeypatch):
    _register_and_verify(client, db_session, email="busy@example.com")
    _mock_overview(monkeypatch, size_mb=10.0)
    _mock_apply_async(monkeypatch)

    headers = _csrf_headers(client)
    first = client.post("/api/analyze", json={"repo_url": REPO_URL}, headers=headers)
    assert first.status_code == 200

    second = client.post("/api/analyze", json={"repo_url": REPO_URL}, headers=headers)
    assert second.status_code == 409
