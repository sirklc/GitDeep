from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    locale: str = "en"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    locale: str = "en"


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=72)


class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr
    locale: str = "en"


class UserOut(BaseModel):
    id: int
    email: str
    locale: str

    @classmethod
    def from_user(cls, user) -> "UserOut":
        return cls(id=user.id, email=user.email, locale=user.locale)


class MessageOut(BaseModel):
    message: str
