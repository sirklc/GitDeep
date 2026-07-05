from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import (
    REFRESH_COOKIE,
    clear_auth_cookies,
    get_current_user,
    rate_limit,
    set_auth_cookies,
)
from app.core.config import settings
from app.core.security import (
    create_email_verify_token,
    decode_token,
    hash_password,
    verify_email_token,
    verify_password,
)
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import LoginRequest, MessageOut, RegisterRequest, UserOut
from app.services import credits as credit_service
from app.services.mailer import send_verification_email
from app.services.turnstile import verify_turnstile

log = structlog.get_logger()

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserOut,
    dependencies=[rate_limit(times=5, seconds=60)],
)
async def register(
    body: RegisterRequest,
    request: Request,
    response: Response,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if not await verify_turnstile(body.turnstile_token, request.client.host if request.client else None):
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed")

    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(body.password),
        locale=body.locale,
        credit_balance=0,
    )
    db.add(user)
    db.flush()
    credit_service.grant_signup_bonus(db, user, settings.signup_bonus_credits)
    db.commit()

    token = create_email_verify_token(user.id)
    background.add_task(send_verification_email, user.email, token, user.locale)

    set_auth_cookies(response, user.id)
    return UserOut.from_user(user)


@router.post(
    "/login",
    response_model=UserOut,
    dependencies=[rate_limit(times=10, seconds=60)],
)
async def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    if not await verify_turnstile(body.turnstile_token, request.client.host if request.client else None):
        raise HTTPException(status_code=400, detail="CAPTCHA verification failed")

    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    set_auth_cookies(response, user.id)
    return UserOut.from_user(user)


@router.post("/refresh", response_model=MessageOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(REFRESH_COOKIE)
    user_id = decode_token(token, refresh=True) if token else None
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    set_auth_cookies(response, user.id)
    return MessageOut(message="refreshed")


@router.post("/logout", response_model=MessageOut)
def logout(response: Response):
    clear_auth_cookies(response)
    return MessageOut(message="logged out")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.from_user(user)


@router.get("/verify-email", response_model=MessageOut)
def verify_email(token: str, db: Session = Depends(get_db)):
    user_id = verify_email_token(token)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    if user.email_verified_at is None:
        user.email_verified_at = datetime.now(timezone.utc)
        db.commit()
    return MessageOut(message="verified")


@router.post(
    "/resend-verification",
    response_model=MessageOut,
    dependencies=[rate_limit(times=3, seconds=300)],
)
def resend_verification(
    background: BackgroundTasks,
    user: User = Depends(get_current_user),
):
    if user.email_verified_at is not None:
        return MessageOut(message="already verified")
    token = create_email_verify_token(user.id)
    background.add_task(send_verification_email, user.email, token, user.locale)
    return MessageOut(message="sent")
