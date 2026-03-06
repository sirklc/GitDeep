from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None   # optional at registration

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None  # returned on login and refresh
    token_type: str

class RefreshRequest(BaseModel):
    refresh_token: str
