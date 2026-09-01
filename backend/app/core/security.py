"""FACTSETU — Password hashing (Argon2) + JWT."""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Argon2 via passlib + argon2-cffi
try:
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
    _has_argon2 = True
except Exception:  # pragma: no cover
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
    _has_argon2 = False
    logger.warning("argon2 not available, falling back to pbkdf2_sha256")


WEAK_PASSWORDS = {"password", "12345678", "factsetu", "qwerty123", "123456789", "letmein"}


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception:
        return False


def validate_password_requirements(password: str) -> Optional[str]:
    if len(password) < 8:
        return "Password must be at least 8 characters"
    if password.lower() in WEAK_PASSWORDS:
        return "Password is too common"
    if len(password) > 128:
        return "Password must be at most 128 characters"
    return None


def create_access_token(user_id: str, email: str, role: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.auth_jwt_expire_days)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
    return token


def decode_access_token(token: str) -> Optional[dict]:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
