from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    locale: str = Field(default="en", pattern="^(tr|en)$")
    turnstile_token: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    turnstile_token: str = ""


class UserOut(BaseModel):
    id: int
    email: EmailStr
    locale: str
    email_verified: bool
    credit_balance: int
    created_at: datetime

    model_config = {"from_attributes": False}

    @classmethod
    def from_user(cls, user) -> "UserOut":
        return cls(
            id=user.id,
            email=user.email,
            locale=user.locale,
            email_verified=user.email_verified_at is not None,
            credit_balance=user.credit_balance,
            created_at=user.created_at,
        )


class MessageOut(BaseModel):
    message: str
