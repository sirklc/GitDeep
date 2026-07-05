import pytest

from app.db.models import AnalysisJob, CreditReason, CreditTransaction, Payment, PaymentProvider, PaymentStatus, User
from app.services import credits as credit_service
from app.services.credits import InsufficientCredits


def _make_user(db_session, balance: int = 0) -> User:
    user = User(email=f"u{id(object())}@example.com", hashed_password="x", credit_balance=balance)
    db_session.add(user)
    db_session.flush()
    return user


def test_apply_idempotency_returns_same_balance(db_session):
    user = _make_user(db_session, balance=100)
    first = credit_service._apply(
        db_session, user.id, -10, CreditReason.analysis_charge, idempotency_key="charge:job1"
    )
    second = credit_service._apply(
        db_session, user.id, -10, CreditReason.analysis_charge, idempotency_key="charge:job1"
    )
    assert first == second == 90
    rows = (
        db_session.query(CreditTransaction)
        .filter(CreditTransaction.idempotency_key == "charge:job1")
        .all()
    )
    assert len(rows) == 1


def test_apply_rejects_negative_balance(db_session):
    user = _make_user(db_session, balance=5)
    with pytest.raises(InsufficientCredits):
        credit_service._apply(db_session, user.id, -10, CreditReason.analysis_charge)


def test_grant_signup_bonus(db_session):
    user = _make_user(db_session, balance=0)
    balance = credit_service.grant_signup_bonus(db_session, user, 100)
    assert balance == 100
    tx = db_session.query(CreditTransaction).filter_by(user_id=user.id).one()
    assert tx.reason == CreditReason.signup_bonus
    assert tx.delta == 100


def test_charge_and_refund_for_analysis(db_session):
    user = _make_user(db_session, balance=50)
    job = AnalysisJob(
        user_id=user.id,
        repo_url="https://github.com/o/r",
        owner="o",
        repo_name="r",
        credits_charged=50,
    )
    db_session.add(job)
    db_session.flush()

    balance_after_charge = credit_service.charge_for_analysis(db_session, user.id, job)
    assert balance_after_charge == 0

    balance_after_refund = credit_service.refund_for_analysis(db_session, job)
    assert balance_after_refund == 50

    # İkinci refund çağrısı idempotency ile no-op olmalı.
    balance_after_second_refund = credit_service.refund_for_analysis(db_session, job)
    assert balance_after_second_refund == 50


def test_grant_for_payment(db_session):
    user = _make_user(db_session, balance=0)
    payment = Payment(
        user_id=user.id,
        provider=PaymentProvider.stripe,
        provider_ref="cs_test_123",
        package_code="starter",
        credits=100,
        amount=5.0,
        status=PaymentStatus.paid,
    )
    db_session.add(payment)
    db_session.flush()

    balance = credit_service.grant_for_payment(db_session, payment)
    assert balance == 100

    # Webhook replay: aynı payment tekrar işlenirse kredi ikinci kez verilmemeli.
    balance_again = credit_service.grant_for_payment(db_session, payment)
    assert balance_again == 100
