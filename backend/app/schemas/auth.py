from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from datetime import datetime


class SignupRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    name: Optional[str] = Field(None, max_length=255)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        # email-validator will be used in service; just basic check here
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email format")
        if len(v) > 255:
            raise ValueError("Email too long")
        return v.strip()


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError("Invalid email format")
        return v.strip()


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: Optional[str]
    name: Optional[str]
    role: str
    provider: str
    is_active: bool
    is_verified: bool
    created_at: Optional[datetime]
    last_login_at: Optional[datetime]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MeResponse(BaseModel):
    authenticated: bool
    user: Optional[UserOut] = None
