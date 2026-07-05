from datetime import datetime, timezone

import stripe
import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import csrf_protect, get_verified_user, rate_limit
from app.core.config import CREDIT_PACKAGES
from app.db.database import get_db
from app.db.models import Payment, PaymentProvider, PaymentStatus, User
from app.services import credits as credit_service
from app.services import cryptomus_gateway, stripe_gateway

log = structlog.get_logger()

router = APIRouter(prefix="/api/payments", tags=["payments"])


class PackageOut(BaseModel):
    code: str
    name: str
    credits: int
    amount_usd: float


class CheckoutRequest(BaseModel):
    package_code: str


class CheckoutOut(BaseModel):
    payment_id: str
    checkout_url: str


@router.get("/packages", response_model=list[PackageOut])
def packages():
    return [
        PackageOut(code=p.code, name=p.name, credits=p.credits, amount_usd=p.amount_usd)
        for p in CREDIT_PACKAGES.values()
    ]


def _package_or_400(package_code: str):
    package = CREDIT_PACKAGES.get(package_code)
    if package is None:
        raise HTTPException(status_code=400, detail="Unknown package_code")
    return package


@router.post(
    "/checkout/stripe",
    response_model=CheckoutOut,
    dependencies=[Depends(csrf_protect), rate_limit(times=10, seconds=3600)],
)
def checkout_stripe(
    body: CheckoutRequest,
    user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    package = _package_or_400(body.package_code)

    payment = Payment(
        user_id=user.id,
        provider=PaymentProvider.stripe,
        package_code=package.code,
        credits=package.credits,
        amount=package.amount_usd,
        currency="USD",
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.flush()

    session = stripe_gateway.create_checkout_session(package, payment, user)
    payment.provider_ref = session.id
    db.commit()

    log.info("checkout_created", provider="stripe", payment_id=payment.id, package=package.code)
    return CheckoutOut(payment_id=payment.id, checkout_url=session.url)


@router.post(
    "/checkout/cryptomus",
    response_model=CheckoutOut,
    dependencies=[Depends(csrf_protect), rate_limit(times=10, seconds=3600)],
)
def checkout_cryptomus(
    body: CheckoutRequest,
    user: User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    package = _package_or_400(body.package_code)

    payment = Payment(
        user_id=user.id,
        provider=PaymentProvider.cryptomus,
        package_code=package.code,
        credits=package.credits,
        amount=package.amount_usd,
        currency="USD",
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.flush()

    result = cryptomus_gateway.create_invoice(package, payment)
    payment.provider_ref = result["uuid"]
    db.commit()

    log.info("checkout_created", provider="cryptomus", payment_id=payment.id, package=package.code)
    return CheckoutOut(payment_id=payment.id, checkout_url=result["url"])


def _find_payment(db: Session, payment_id: str | None, provider_ref: str | None) -> Payment | None:
    if payment_id:
        payment = db.get(Payment, payment_id)
        if payment is not None:
            return payment
    if provider_ref:
        return db.scalar(select(Payment).where(Payment.provider_ref == provider_ref))
    return None


@router.post("/webhooks/stripe")
async def webhook_stripe(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        event = stripe_gateway.verify_and_parse_webhook(payload, sig_header)
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] != "checkout.session.completed":
        return {"received": True}

    session = event["data"]["object"]
    session_dict = session.to_dict()
    payment = _find_payment(
        db,
        payment_id=session_dict.get("client_reference_id")
        or (session_dict.get("metadata") or {}).get("payment_id"),
        provider_ref=session_dict.get("id"),
    )
    if payment is None or payment.status == PaymentStatus.paid:
        return {"received": True}

    payment.status = PaymentStatus.paid
    payment.paid_at = datetime.now(timezone.utc)
    payment.raw_payload = session_dict
    payment.provider_ref = session_dict.get("id", payment.provider_ref)
    credit_service.grant_for_payment(db, payment)
    db.commit()

    log.info("payment_confirmed", provider="stripe", payment_id=payment.id)
    return {"received": True}


@router.post("/webhooks/cryptomus")
async def webhook_cryptomus(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    if not cryptomus_gateway.verify_webhook_signature(body):
        raise HTTPException(status_code=400, detail="Invalid signature")

    if not cryptomus_gateway.is_paid(body.get("status", "")):
        return {"received": True}

    payment = _find_payment(db, payment_id=body.get("order_id"), provider_ref=body.get("uuid"))
    if payment is None or payment.status == PaymentStatus.paid:
        return {"received": True}

    payment.status = PaymentStatus.paid
    payment.paid_at = datetime.now(timezone.utc)
    payment.raw_payload = body
    payment.provider_ref = body.get("uuid", payment.provider_ref)
    credit_service.grant_for_payment(db, payment)
    db.commit()

    log.info("payment_confirmed", provider="cryptomus", payment_id=payment.id)
    return {"received": True}
