from fastapi import Cookie, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_access_token
from app.db.database import get_db
from app.db.models import User

ACCESS_COOKIE = "gd_access"
REFRESH_COOKIE = "gd_refresh"


def set_auth_cookies(response: Response, user_id: int) -> None:
    access = create_access_token(user_id)
    refresh = create_refresh_token(user_id)
    common = dict(httponly=True, secure=settings.cookie_secure, samesite="lax", path="/")
    response.set_cookie(ACCESS_COOKIE, access, max_age=settings.access_token_minutes * 60, **common)
    response.set_cookie(REFRESH_COOKIE, refresh, max_age=settings.refresh_token_minutes * 60, **common)


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/")


def get_current_user(
    gd_access: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    user_id = decode_access_token(gd_access) if gd_access else None
    if user_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
