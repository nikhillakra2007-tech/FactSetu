"""FACTSETU — Auth dependencies."""

from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# Optional bearer: don't auto-error
bearer_scheme = HTTPBearer(auto_error=False)


def _token_from_request(request: Request, credentials: Optional[HTTPAuthorizationCredentials]) -> Optional[str]:
    # 1. Authorization header
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials
    # 2. Cookie
    settings = get_settings()
    cookie = request.cookies.get(settings.auth_cookie_name)
    if cookie:
        return cookie
    return None


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Optional[User]:
    token = _token_from_request(request, credentials)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    try:
        uid = __import__("uuid").UUID(user_id)
    except Exception:
        return None
    user = db.query(User).filter(User.id == uid).first()
    if not user or not user.is_active:
        return None
    return user


def get_current_active_user(
    current_user: Optional[User] = Depends(get_current_user),
) -> User:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return current_user


def require_role(required_role: str):
    def _checker(current_user: User = Depends(get_current_active_user)):
        # Role hierarchy: ADMIN > MODERATOR > USER
        hierarchy = {"USER": 1, "MODERATOR": 2, "ADMIN": 3}
        user_level = hierarchy.get(current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role), 0)
        need_level = hierarchy.get(required_role, 99)
        if user_level < need_level:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return _checker
