"""FACTSETU — Authentication APIs (email + OAuth placeholders)."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.auth import SignupRequest, LoginRequest, UserOut, MeResponse, TokenResponse
from app.services.auth_service import signup as svc_signup, login as svc_login, create_token_for_user, AuthError
from app.services.auth_providers import GoogleProvider, XProvider
from app.api.deps import get_current_user, get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id),
        email=user.email,
        name=user.display_name,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        provider=user.provider.value if hasattr(user.provider, "value") else str(user.provider),
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login_at=user.last_login_at,
    )


def _set_auth_cookie(response: Response, token: str):
    settings = get_settings()
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        httponly=True,
        secure=settings.auth_cookie_secure,
        samesite="lax",
        max_age=settings.auth_jwt_expire_days * 24 * 3600,
        path="/",
    )


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(req: SignupRequest, response: Response, db: Session = Depends(get_db)):
    try:
        user = svc_signup(db, email=req.email, password=req.password, name=req.name)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    token = create_token_for_user(user)
    _set_auth_cookie(response, token)
    return TokenResponse(access_token=token, user=_user_out(user))


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        user = svc_login(db, email=req.email, password=req.password)
    except AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    token = create_token_for_user(user)
    _set_auth_cookie(response, token)
    return TokenResponse(access_token=token, user=_user_out(user))


@router.post("/logout")
def logout(response: Response, current_user: Optional[User] = Depends(get_current_user)):
    settings = get_settings()
    # Always clear cookie even if not authenticated (idempotent)
    response.delete_cookie(key=settings.auth_cookie_name, path="/")
    return {"status": "logged_out"}


@router.get("/me", response_model=MeResponse)
def me(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        return MeResponse(authenticated=False, user=None)
    return MeResponse(authenticated=True, user=_user_out(current_user))


@router.get("/config")
def auth_config():
    settings = get_settings()
    return {
        "email_enabled": True,
        "google_enabled": settings.google_configured,
        "google_configured": settings.google_configured,
        "x_enabled": settings.x_configured,
        "x_configured": settings.x_configured,
        "providers": ["email"] + (["google"] if settings.google_configured else []) + (["x"] if settings.x_configured else []),
    }


# --- Google OAuth ---
@router.get("/google")
def google_login():
    provider = GoogleProvider()
    if not provider.is_configured():
        raise HTTPException(
            status_code=503,
            detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env (see .env.example)",
        )
    url = provider.get_authorization_url(state="factsetu")
    return RedirectResponse(url=url)


@router.get("/google/callback")
def google_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    settings = get_settings()
    if error:
        raise HTTPException(status_code=400, detail=f"Google OAuth error: {error}")
    if not settings.google_configured:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code from Google callback")
    # Real implementation would exchange code for tokens via Google. For now return guidance.
    # To avoid fake, we do not create user without verifying code with Google.
    return {
        "status": "callback_received",
        "code": code[:10] + "..." if code else None,
        "message": "Google OAuth callback received. Exchange code with Google to create session (requires valid GOOGLE_CLIENT_ID/SECRET).",
    }


# --- X OAuth ---
@router.get("/x")
def x_login():
    provider = XProvider()
    if not provider.is_configured():
        raise HTTPException(
            status_code=503,
            detail="X OAuth not configured. Set X_CLIENT_ID, X_CLIENT_SECRET, X_REDIRECT_URI in .env (see .env.example)",
        )
    url = provider.get_authorization_url(state="factsetu")
    return RedirectResponse(url=url)


@router.get("/x/callback")
def x_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None, db: Session = Depends(get_db)):
    settings = get_settings()
    if error:
        raise HTTPException(status_code=400, detail=f"X OAuth error: {error}")
    if not settings.x_configured:
        raise HTTPException(status_code=503, detail="X OAuth not configured")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code from X callback")
    return {
        "status": "callback_received",
        "code": code[:10] + "..." if code else None,
        "message": "X OAuth callback received. Exchange code with X to create session (requires valid X_CLIENT_ID/SECRET).",
    }


# --- Example protected route for testing ---
@router.get("/protected")
def protected_example(current_user: User = Depends(get_current_active_user)):
    return {"message": f"Hello {current_user.email}", "role": current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)}
