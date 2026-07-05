"""Stripe Checkout entegrasyonu — kart ile kredi satın alma."""

import stripe

from app.core.config import CreditPackage, settings
from app.db.models import Payment, User

stripe.api_key = settings.stripe_secret_key


def create_checkout_session(package: CreditPackage, payment: Payment, user: User) -> stripe.checkout.Session:
    return stripe.checkout.Session.create(
        mode="payment",
        client_reference_id=payment.id,
        customer_email=user.email,
        metadata={
            "payment_id": payment.id,
            "user_id": str(user.id),
            "package_code": package.code,
        },
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"GitDeep {package.name} — {package.credits} kredi",
                    },
                    "unit_amount": int(round(package.amount_usd * 100)),
                },
                "quantity": 1,
            }
        ],
        success_url=f"{settings.frontend_url}/{user.locale}/billing?status=success&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.frontend_url}/{user.locale}/billing?status=cancelled",
    )


def verify_and_parse_webhook(payload: bytes, sig_header: str) -> stripe.Event:
    return stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
