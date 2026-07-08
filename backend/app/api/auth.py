import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import REFRESH_COOKIE, clear_auth_cookies, get_current_user, set_auth_cookies
from app.core.security import (
    create_password_reset_token,
    decode_password_reset_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageOut,
    RegisterRequest,
    ResetPasswordRequest,
    UserOut,
)
from app.services.mailer import send_password_reset_email

log = structlog.get_logger()

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut)
def register(body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(email=email, hashed_password=hash_password(body.password), locale=body.locale)
    db.add(user)
    db.commit()
    db.refresh(user)

    set_auth_cookies(response, user.id)
    return UserOut.from_user(user)


@router.post("/login", response_model=UserOut)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")

    set_auth_cookies(response, user.id)
    return UserOut.from_user(user)


@router.post("/logout", response_model=MessageOut)
def logout(response: Response):
    clear_auth_cookies(response)
    return MessageOut(message="logged out")


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.from_user(user)


@router.post("/refresh", response_model=MessageOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(REFRESH_COOKIE)
    user_id = decode_refresh_token(token) if token else None
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    set_auth_cookies(response, user.id)
    return MessageOut(message="refreshed")


@router.post("/forgot-password", response_model=MessageOut)
def forgot_password(
    body: ForgotPasswordRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is not None:
        token = create_password_reset_token(user.id)
        background.add_task(send_password_reset_email, user.email, token, body.locale)
    # Kayıtlı olmayan e-postaları ifşa etmemek için sonuç her durumda aynıdır.
    return MessageOut(message="if_exists_sent")


@router.post("/reset-password", response_model=MessageOut)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    user_id = decode_password_reset_token(body.token)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.hashed_password = hash_password(body.password)
    db.commit()
    return MessageOut(message="password_reset")
