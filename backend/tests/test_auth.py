from app.core.security import create_email_verify_token
from app.db.models import CreditReason, CreditTransaction, User


def _register(client, email="alice@example.com", password="supersecret1"):
    return client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "locale": "en", "turnstile_token": ""},
    )


def test_register_grants_signup_bonus_and_sets_cookies(client, db_session):
    resp = _register(client)
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "alice@example.com"
    assert body["credit_balance"] == 100
    assert "gd_access" in resp.cookies

    user = db_session.query(User).filter_by(email="alice@example.com").one()
    tx = db_session.query(CreditTransaction).filter_by(user_id=user.id).one()
    assert tx.reason == CreditReason.signup_bonus
    assert tx.delta == 100


def test_register_duplicate_email_rejected(client):
    _register(client)
    resp = _register(client)
    assert resp.status_code == 409


def test_login_success_and_failure(client):
    _register(client, email="bob@example.com")
    ok = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "supersecret1", "turnstile_token": ""},
    )
    assert ok.status_code == 200

    bad = client.post(
        "/api/auth/login",
        json={"email": "bob@example.com", "password": "wrong-password", "turnstile_token": ""},
    )
    assert bad.status_code == 401


def test_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user_after_register(client):
    _register(client, email="carol@example.com")
    resp = client.get("/api/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == "carol@example.com"


def test_refresh_issues_new_access_cookie(client):
    _register(client, email="dave@example.com")
    resp = client.post("/api/auth/refresh")
    assert resp.status_code == 200
    assert "gd_access" in resp.cookies


def test_verify_email_round_trip(client, db_session):
    _register(client, email="erin@example.com")
    user = db_session.query(User).filter_by(email="erin@example.com").one()
    assert user.email_verified_at is None

    token = create_email_verify_token(user.id)
    resp = client.get(f"/api/auth/verify-email?token={token}")
    assert resp.status_code == 200

    db_session.refresh(user)
    assert user.email_verified_at is not None


def test_verify_email_rejects_invalid_token(client):
    resp = client.get("/api/auth/verify-email?token=not-a-real-token")
    assert resp.status_code == 400
