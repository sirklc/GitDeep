"""Cryptomus entegrasyonu — kripto ile kredi satın alma. Resmi Python SDK yok, httpx ile ham REST çağrısı."""

import base64
import hashlib
import hmac
import json

import httpx

from app.core.config import CreditPackage, settings
from app.db.models import Payment

API_BASE = "https://api.cryptomus.com/v2"
PAID_STATUSES = {"paid", "paid_over"}


def _sign(payload: dict) -> str:
    body_json = json.dumps(payload, separators=(",", ":"))
    encoded = base64.b64encode(body_json.encode()).decode()
    return hashlib.md5((encoded + settings.cryptomus_api_key).encode()).hexdigest()


def create_invoice(package: CreditPackage, payment: Payment) -> dict:
    body = {
        "amount": f"{package.amount_usd:.2f}",
        "currency": "USD",
        "order_id": payment.id,
        "url_callback": f"{settings.backend_base_url}/api/payments/webhooks/cryptomus",
    }
    response = httpx.post(
        f"{API_BASE}/payment",
        json=body,
        headers={
            "merchant": settings.cryptomus_merchant_id,
            "sign": _sign(body),
            "Content-Type": "application/json",
        },
        timeout=15,
    )
    response.raise_for_status()
    return response.json()["result"]


def verify_webhook_signature(payload: dict) -> bool:
    body = {k: v for k, v in payload.items() if k != "sign"}
    expected = _sign(body)
    provided = payload.get("sign", "")
    return hmac.compare_digest(expected, provided)


def is_paid(status: str) -> bool:
    return status in PAID_STATUSES
