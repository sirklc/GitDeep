import datetime as dt

import bcrypt
import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def _create_token(user_id: int, secret: str, minutes: int, extra: dict | None = None) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    payload = {"sub": str(user_id), "iat": now, "exp": now + dt.timedelta(minutes=minutes)}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, secret, algorithm=settings.jwt_algorithm)


def _decode_token(token: str, secret: str, purpose: str | None = None) -> int | None:
    try:
        payload = jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError:
        return None
    if purpose is not None and payload.get("purpose") != purpose:
        return None
    try:
        return int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        return None


def create_access_token(user_id: int) -> str:
    return _create_token(user_id, settings.secret_key, settings.access_token_minutes)


def decode_access_token(token: str) -> int | None:
    return _decode_token(token, settings.secret_key)


def create_refresh_token(user_id: int) -> str:
    return _create_token(user_id, settings.refresh_secret_key, settings.refresh_token_minutes)


def decode_refresh_token(token: str) -> int | None:
    return _decode_token(token, settings.refresh_secret_key)


def create_password_reset_token(user_id: int) -> str:
    return _create_token(
        user_id,
        settings.email_link_secret,
        settings.password_reset_minutes,
        extra={"purpose": "password_reset"},
    )


def decode_password_reset_token(token: str) -> int | None:
    return _decode_token(token, settings.email_link_secret, purpose="password_reset")
