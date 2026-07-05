import base64
import hashlib
import hmac
import time
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from app.core.config import settings

# Argon2id — parola hashleme endüstri standardı (OWASP önerisi).
_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return _hasher.verify(hashed, password)
    except VerifyMismatchError:
        return False


def _create_token(user_id: int, minutes: int, secret: str, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(minutes=minutes),
    }
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: int) -> str:
    return _create_token(user_id, settings.access_token_minutes, settings.secret_key, "access")


def create_refresh_token(user_id: int) -> str:
    return _create_token(
        user_id, settings.refresh_token_minutes, settings.refresh_secret_key, "refresh"
    )


def decode_token(token: str, *, refresh: bool = False) -> int | None:
    """Geçerliyse user_id döner, değilse None."""
    secret = settings.refresh_secret_key if refresh else settings.secret_key
    expected_type = "refresh" if refresh else "access"
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None
    if payload.get("type") != expected_type:
        return None
    try:
        return int(payload["sub"])
    except (KeyError, ValueError):
        return None


def token_fingerprint(token: str) -> str:
    """Loglama/denetim için token'ın SHA-256 parmak izi (token asla loglanmaz)."""
    return hashlib.sha256(token.encode()).hexdigest()[:16]


# --- HMAC-SHA256 imzalı email doğrulama linki ---

def create_email_verify_token(user_id: int) -> str:
    expires = int(time.time()) + settings.email_link_hours * 3600
    payload = f"{user_id}:{expires}"
    sig = hmac.new(
        settings.email_link_secret.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()
    raw = f"{payload}:{sig}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def verify_email_token(token: str) -> int | None:
    """Geçerli ve süresi dolmamışsa user_id döner."""
    try:
        raw = base64.urlsafe_b64decode(token.encode()).decode()
        user_id_str, expires_str, sig = raw.rsplit(":", 2)
        payload = f"{user_id_str}:{expires_str}"
    except Exception:
        return None
    expected = hmac.new(
        settings.email_link_secret.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(sig, expected):
        return None
    if int(expires_str) < time.time():
        return None
    return int(user_id_str)


def sha256_file(path: str) -> str:
    """PDF bütünlük hash'i."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()
