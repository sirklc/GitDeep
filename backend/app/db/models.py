import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class CreditReason(str, enum.Enum):
    signup_bonus = "signup_bonus"
    analysis_charge = "analysis_charge"
    analysis_refund = "analysis_refund"
    purchase = "purchase"


class JobStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


class PaymentProvider(str, enum.Enum):
    stripe = "stripe"
    cryptomus = "cryptomus"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    expired = "expired"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    locale: Mapped[str] = mapped_column(String(5), default="en")
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Denormalize bakiye — gerçek kaynak credit_transactions ledger'ıdır;
    # her değişim ledger insert'iyle aynı transaction'da yapılır.
    credit_balance: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    transactions: Mapped[list["CreditTransaction"]] = relationship(back_populates="user")
    jobs: Mapped[list["AnalysisJob"]] = relationship(back_populates="user")


class CreditTransaction(Base):
    """Append-only kredi ledger'ı. Satırlar asla güncellenmez/silinmez."""

    __tablename__ = "credit_transactions"
    __table_args__ = (UniqueConstraint("idempotency_key", name="uq_credit_tx_idem"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    delta: Mapped[int] = mapped_column(Integer)
    balance_after: Mapped[int] = mapped_column(Integer)
    reason: Mapped[CreditReason] = mapped_column(Enum(CreditReason))
    job_id: Mapped[str | None] = mapped_column(ForeignKey("analysis_jobs.id"))
    payment_id: Mapped[str | None] = mapped_column(ForeignKey("payments.id"))
    idempotency_key: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="transactions")


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    # Celery task_id ile aynı değer — tek kimlik.
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    repo_url: Mapped[str] = mapped_column(String(500))
    owner: Mapped[str] = mapped_column(String(200))
    repo_name: Mapped[str] = mapped_column(String(200))
    repo_size_mb: Mapped[float | None] = mapped_column()
    credits_charged: Mapped[int] = mapped_column(Integer, default=50)
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.queued)
    progress_step: Mapped[int] = mapped_column(Integer, default=0)
    progress_total: Mapped[int] = mapped_column(Integer, default=8)
    progress_message: Mapped[str] = mapped_column(String(500), default="")
    overall_score: Mapped[int | None] = mapped_column(Integer)
    result_json: Mapped[dict | None] = mapped_column(JSON)
    language: Mapped[str] = mapped_column(String(5), default="en")
    pdf_path: Mapped[str | None] = mapped_column(String(500))
    pdf_sha256: Mapped[str | None] = mapped_column(String(64))
    email_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="jobs")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    provider: Mapped[PaymentProvider] = mapped_column(Enum(PaymentProvider))
    # Stripe checkout.session.id / Cryptomus uuid — webhook idempotency anahtarı.
    provider_ref: Mapped[str | None] = mapped_column(String(255), unique=True)
    package_code: Mapped[str] = mapped_column(String(50))
    credits: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus), default=PaymentStatus.pending
    )
    raw_payload: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
