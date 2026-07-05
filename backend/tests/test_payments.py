from types import SimpleNamespace

from app.core.security import create_email_verify_token
from app.db.models import CreditTransaction, Payment, PaymentProvider, PaymentStatus, User


class FakeStripeObject(dict):
    def to_dict(self):
        return dict(self)


def _register_and_verify(client, db_session, email="payer@example.com"):
    client.post(
        "/api/auth/register",
        json={"email": email, "password": "supersecret1", "locale": "en", "turnstile_token": ""},
    )
    user = db_session.query(User).filter_by(email=email).one()
    token = create_email_verify_token(user.id)
    client.get(f"/api/auth/verify-email?token={token}")
    return user


def _csrf_headers(client) -> dict:
    return {"X-CSRF-Token": client.cookies.get("gd_csrf")}


def test_packages_lists_configured_packages(client):
    resp = client.get("/api/payments/packages")
    assert resp.status_code == 200
    codes = {p["code"] for p in resp.json()}
    assert codes == {"starter", "pro", "bulk"}


def test_checkout_stripe_creates_pending_payment(client, db_session, monkeypatch):
    _register_and_verify(client, db_session)
    fake_session = SimpleNamespace(id="cs_test_123", url="https://checkout.stripe.com/pay/cs_test_123")
    monkeypatch.setattr(
        "app.api.payments.stripe_gateway.create_checkout_session",
        lambda package, payment, user: fake_session,
    )

    resp = client.post(
        "/api/payments/checkout/stripe",
        json={"package_code": "starter"},
        headers=_csrf_headers(client),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["checkout_url"] == fake_session.url

    payment = db_session.get(Payment, body["payment_id"])
    assert payment.status == PaymentStatus.pending
    assert payment.provider_ref == "cs_test_123"
    assert payment.credits == 100


def test_checkout_unknown_package_rejected(client, db_session):
    _register_and_verify(client, db_session, email="badpkg@example.com")
    resp = client.post(
        "/api/payments/checkout/stripe",
        json={"package_code": "does-not-exist"},
        headers=_csrf_headers(client),
    )
    assert resp.status_code == 400


def test_stripe_webhook_idempotent_credit_grant(client, db_session, monkeypatch):
    user = _register_and_verify(client, db_session, email="webhook@example.com")
    payment = Payment(
        id="pay_1",
        user_id=user.id,
        provider=PaymentProvider.stripe,
        provider_ref=None,
        package_code="starter",
        credits=100,
        amount=5.0,
        status=PaymentStatus.pending,
    )
    db_session.add(payment)
    db_session.commit()

    fake_event = {
        "type": "checkout.session.completed",
        "data": {
            "object": FakeStripeObject(
                {"id": "cs_test_999", "client_reference_id": "pay_1", "metadata": {"payment_id": "pay_1"}}
            )
        },
    }
    monkeypatch.setattr(
        "app.api.payments.stripe_gateway.verify_and_parse_webhook",
        lambda payload, sig: fake_event,
    )

    balance_before = db_session.get(User, user.id).credit_balance

    first = client.post("/api/payments/webhooks/stripe", headers={"stripe-signature": "test"}, json={})
    assert first.status_code == 200
    second = client.post("/api/payments/webhooks/stripe", headers={"stripe-signature": "test"}, json={})
    assert second.status_code == 200

    db_session.refresh(payment)
    assert payment.status == PaymentStatus.paid

    user_row = db_session.get(User, user.id)
    assert user_row.credit_balance == balance_before + 100

    granted = (
        db_session.query(CreditTransaction)
        .filter_by(payment_id="pay_1")
        .all()
    )
    assert len(granted) == 1


def test_cryptomus_webhook_idempotent_credit_grant(client, db_session, monkeypatch):
    user = _register_and_verify(client, db_session, email="crypto@example.com")
    payment = Payment(
        id="pay_2",
        user_id=user.id,
        provider=PaymentProvider.cryptomus,
        provider_ref=None,
        package_code="pro",
        credits=300,
        amount=12.0,
        status=PaymentStatus.pending,
    )
    db_session.add(payment)
    db_session.commit()

    monkeypatch.setattr(
        "app.api.payments.cryptomus_gateway.verify_webhook_signature", lambda body: True
    )

    payload = {"order_id": "pay_2", "uuid": "crypto-uuid-1", "status": "paid", "sign": "irrelevant"}
    first = client.post("/api/payments/webhooks/cryptomus", json=payload)
    assert first.status_code == 200
    second = client.post("/api/payments/webhooks/cryptomus", json=payload)
    assert second.status_code == 200

    db_session.refresh(payment)
    assert payment.status == PaymentStatus.paid

    user_row = db_session.get(User, user.id)
    assert user_row.credit_balance == 100 + 300  # signup bonus + kredi paketi

    granted = db_session.query(CreditTransaction).filter_by(payment_id="pay_2").all()
    assert len(granted) == 1
