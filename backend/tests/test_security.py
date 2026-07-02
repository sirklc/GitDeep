import pytest
from fastapi import HTTPException
from jose import jwt

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_refresh_token,
)


def test_password_hash_roundtrip():
    hashed = get_password_hash("s3cret-password")
    assert hashed != "s3cret-password"
    assert verify_password("s3cret-password", hashed)
    assert not verify_password("wrong-password", hashed)


def test_access_token_contains_sub_and_type():
    token = create_access_token({"sub": "alice"})
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == "alice"
    assert payload["type"] == "access"
    assert "exp" in payload


def test_refresh_token_roundtrip():
    token = create_refresh_token({"sub": "alice"})
    assert verify_refresh_token(token) == "alice"


def test_access_token_rejected_as_refresh_token():
    # An access token must not pass refresh verification (different key + type)
    token = create_access_token({"sub": "alice"})
    with pytest.raises(HTTPException):
        verify_refresh_token(token)


def test_garbage_refresh_token_rejected():
    with pytest.raises(HTTPException):
        verify_refresh_token("not-a-jwt")


class FakeRequest:
    def __init__(self, headers=None):
        self.headers = headers or {}


def test_get_optional_user_without_header_returns_none():
    from app.core.security import get_optional_user

    assert get_optional_user(FakeRequest(), db=None) is None


def test_get_optional_user_with_invalid_token_returns_none():
    from app.core.security import get_optional_user

    request = FakeRequest({"Authorization": "Bearer not-a-valid-jwt"})
    assert get_optional_user(request, db=None) is None


def test_get_optional_user_rejects_refresh_token():
    from app.core.security import get_optional_user

    # A refresh token must not authenticate as an access token
    token = create_refresh_token({"sub": "alice"})
    request = FakeRequest({"Authorization": f"Bearer {token}"})
    assert get_optional_user(request, db=None) is None
