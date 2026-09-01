"""FACTSETU — AuthService (signup/login/logout/me)."""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.security import hash_password, verify_password, validate_password_requirements, create_access_token
from app.models.user import User
from app.models.enums import AuthProvider, UserRole


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def signup(db: Session, email: str, password: str, name: Optional[str] = None) -> User:
    # validate email via email-validator
    try:
        from email_validator import validate_email, EmailNotValidError

        validate_email(email, check_deliverability=False)
    except Exception as e:
        raise AuthError(f"Invalid email: {e}", status_code=400)

    err = validate_password_requirements(password)
    if err:
        raise AuthError(err, status_code=400)

    email_n = _normalize_email(email)
    if len(email_n) > 255:
        raise AuthError("Email too long", status_code=400)

    existing = db.query(User).filter(User.email == email_n).first()
    if existing:
        raise AuthError("An account with this email already exists", status_code=409)

    user = User(
        email=email_n,
        display_name=name.strip() if name and name.strip() else None,
        password_hash=hash_password(password),
        provider=AuthProvider.email,
        role=UserRole.USER,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AuthError("An account with this email already exists", status_code=409)
    db.refresh(user)
    # update last_login
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return user


def login(db: Session, email: str, password: str) -> User:
    email_n = _normalize_email(email)
    user = db.query(User).filter(User.email == email_n).first()
    # Generic error to avoid account enumeration
    if not user or not user.password_hash:
        raise AuthError("Invalid credentials", status_code=401)
    if not user.is_active:
        raise AuthError("Account disabled", status_code=403)
    if not verify_password(password, user.password_hash):
        raise AuthError("Invalid credentials", status_code=401)

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    try:
        uid = uuid.UUID(user_id)
    except Exception:
        return None
    return db.query(User).filter(User.id == uid).first()


def create_token_for_user(user: User) -> str:
    return create_access_token(str(user.id), user.email or "", user.role.value if hasattr(user.role, "value") else str(user.role))


def find_or_create_oauth_user(
    db: Session, email: str, provider: AuthProvider, provider_user_id: str, name: Optional[str] = None
) -> tuple[User, bool]:
    """Find existing by provider_user_id or email, link if email exists, else create. Returns (user, created)."""
    email_n = _normalize_email(email)
    # 1. provider_user_id match
    existing = db.query(User).filter(User.provider == provider, User.provider_user_id == provider_user_id).first()
    if existing:
        if not existing.is_active:
            raise AuthError("Account disabled", status_code=403)
        existing.last_login_at = datetime.now(timezone.utc)
        db.commit()
        return existing, False

    # 2. email match → link
    existing_email = db.query(User).filter(User.email == email_n).first()
    if existing_email:
        if not existing_email.is_active:
            raise AuthError("Account disabled", status_code=403)
        # Link only if existing provider is email or same provider; otherwise safe link by email
        # Update provider_user_id if not set
        if not existing_email.provider_user_id:
            existing_email.provider_user_id = provider_user_id
            # Keep original provider? For linking we keep email provider but store provider_user_id
            # Alternatively update provider to new provider for future logins
            # We keep provider as email to preserve email login, but allow OAuth lookup via provider_user_id
        existing_email.last_login_at = datetime.now(timezone.utc)
        db.commit()
        return existing_email, False

    # 3. create new OAuth user (no password)
    user = User(
        email=email_n,
        display_name=name,
        password_hash=None,
        provider=provider,
        provider_user_id=provider_user_id,
        role=UserRole.USER,
        is_active=True,
        is_verified=True,  # OAuth emails are verified by provider
        last_login_at=datetime.now(timezone.utc),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Race: re-query
        existing_email = db.query(User).filter(User.email == email_n).first()
        if existing_email:
            return existing_email, False
        raise
    db.refresh(user)
    return user, True
