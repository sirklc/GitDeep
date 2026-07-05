"""Tüm kredi hareketlerinin TEK geçidi.

Kurallar:
- Ledger (credit_transactions) append-only'dir; bakiye users.credit_balance'ta
  denormalize tutulur ve her değişim ledger insert'iyle AYNI transaction'da yapılır.
- Negatif bakiye, UPDATE'in WHERE koşuluyla DB seviyesinde engellenir.
- idempotency_key unique constraint'i çifte işlem (webhook replay, task retry)
  son savunma hattıdır.
"""

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.db.models import AnalysisJob, CreditReason, CreditTransaction, Payment, User


class InsufficientCredits(Exception):
    pass


def _apply(
    db: Session,
    user_id: int,
    delta: int,
    reason: CreditReason,
    *,
    job_id: str | None = None,
    payment_id: str | None = None,
    idempotency_key: str | None = None,
) -> int:
    """Bakiyeyi atomik günceller + ledger satırı ekler. balance_after döner.

    Commit ÇAĞIRANIN sorumluluğundadır — böylece kredi hareketi, onu tetikleyen
    iş kaydıyla (job/payment) aynı transaction'da kalır.
    """
    if idempotency_key is not None:
        existing = db.scalar(
            select(CreditTransaction).where(
                CreditTransaction.idempotency_key == idempotency_key
            )
        )
        if existing is not None:
            return existing.balance_after

    row = db.execute(
        update(User)
        .where(User.id == user_id, User.credit_balance + delta >= 0)
        .values(credit_balance=User.credit_balance + delta)
        .returning(User.credit_balance)
    ).first()
    if row is None:
        raise InsufficientCredits(f"user={user_id} delta={delta}")
    balance_after = int(row[0])

    db.add(
        CreditTransaction(
            user_id=user_id,
            delta=delta,
            balance_after=balance_after,
            reason=reason,
            job_id=job_id,
            payment_id=payment_id,
            idempotency_key=idempotency_key,
        )
    )
    db.flush()
    return balance_after


def grant_signup_bonus(db: Session, user: User, amount: int) -> int:
    return _apply(
        db,
        user.id,
        amount,
        CreditReason.signup_bonus,
        idempotency_key=f"signup:{user.id}",
    )


def charge_for_analysis(db: Session, user_id: int, job: AnalysisJob) -> int:
    """Analiz başlarken tarife kadar düşer. Yetersizse InsufficientCredits."""
    return _apply(
        db,
        user_id,
        -job.credits_charged,
        CreditReason.analysis_charge,
        job_id=job.id,
        idempotency_key=f"charge:{job.id}",
    )


def refund_for_analysis(db: Session, job: AnalysisJob) -> int:
    """Başarısız analizde iade. idempotency_key sayesinde retry'da çifte iade imkânsız."""
    return _apply(
        db,
        job.user_id,
        job.credits_charged,
        CreditReason.analysis_refund,
        job_id=job.id,
        idempotency_key=f"refund:{job.id}",
    )


def grant_for_payment(db: Session, payment: Payment) -> int:
    """Ödeme webhook'unda kredi yükleme. provider_ref idempotency anahtarıdır."""
    return _apply(
        db,
        payment.user_id,
        payment.credits,
        CreditReason.purchase,
        payment_id=payment.id,
        idempotency_key=f"{payment.provider.value}:{payment.provider_ref}",
    )
