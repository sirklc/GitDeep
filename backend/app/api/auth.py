from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.db.models import User
from app.models.user_schemas import UserCreate, UserResponse, Token, RefreshRequest
from app.core.security import (
    get_password_hash, verify_password,
    create_access_token, create_refresh_token, verify_refresh_token,
    get_current_user
)
from app.core.config import settings
import httpx

from fastapi_limiter.depends import RateLimiter
from pyrate_limiter import Rate, Limiter, Duration

router = APIRouter()

# ── Cloudflare Turnstile Verification ─────────────────────────────────────────
async def verify_turnstile(token: str | None):
    """Call Cloudflare's siteverify API to validate the Turnstile token."""
    if not token:
        raise HTTPException(status_code=403, detail="CAPTCHA token is missing.")
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": settings.CLOUDFLARE_TURNSTILE_SECRET,
                "response": token,
            },
        )
    result = resp.json()
    if not result.get("success"):
        raise HTTPException(status_code=403, detail="CAPTCHA verification failed. Please try again.")

@router.post("/register", response_model=UserResponse, dependencies=[Depends(RateLimiter(Limiter(Rate(5, Duration.MINUTE))))])
async def register(user_in: UserCreate, db: Session = Depends(get_db)):
    await verify_turnstile(user_in.cf_turnstile_response)

    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    if user_in.email:
        existing_email = db.query(User).filter(User.email == user_in.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="This email is already registered.")

    hashed_password = get_password_hash(user_in.password)
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token, dependencies=[Depends(RateLimiter(Limiter(Rate(10, Duration.MINUTE))))])
async def login_access_token(
    request: Request, db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    # Turnstile token is passed as a custom form field alongside credentials
    body = await request.form()
    cf_token = body.get("cf_turnstile_response")
    await verify_turnstile(cf_token)

    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400, detail="Incorrect username or password"
        )
    
    token_data = {"sub": user.username}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token)
def refresh_access_token(body: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access + refresh token pair."""
    username = verify_refresh_token(body.refresh_token)
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": user.username}
    return {
        "access_token": create_access_token(data=token_data),
        "refresh_token": create_refresh_token(data=token_data),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Returns the currently authenticated user's profile."""
    return current_user
