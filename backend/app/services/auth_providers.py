"""FACTSETU — AuthProvider abstraction (Email/Google/X)."""

from abc import ABC, abstractmethod
from typing import Optional
from urllib.parse import urlencode

from app.core.config import get_settings


class AuthProviderBase(ABC):
    @abstractmethod
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        pass


class EmailProvider(AuthProviderBase):
    def get_authorization_url(self, state=None) -> str:
        raise NotImplementedError("Email provider does not use OAuth")

    def is_configured(self) -> bool:
        return True


class GoogleProvider(AuthProviderBase):
    def is_configured(self) -> bool:
        return get_settings().google_configured

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        s = get_settings()
        if not self.is_configured():
            raise RuntimeError("Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI in .env")
        params = {
            "client_id": s.google_client_id,
            "redirect_uri": s.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        if state:
            params["state"] = state
        return "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)


class XProvider(AuthProviderBase):
    def is_configured(self) -> bool:
        return get_settings().x_configured

    def get_authorization_url(self, state: Optional[str] = None) -> str:
        s = get_settings()
        if not self.is_configured():
            raise RuntimeError("X OAuth not configured. Set X_CLIENT_ID, X_CLIENT_SECRET, X_REDIRECT_URI in .env")
        # X (Twitter) OAuth 2.0
        params = {
            "response_type": "code",
            "client_id": s.x_client_id,
            "redirect_uri": s.x_redirect_uri,
            "scope": "users.read tweet.read",
            "state": state or "factsetu",
            "code_challenge": "challenge",  # PKCE simplified; real flow would generate properly
            "code_challenge_method": "plain",
        }
        return "https://twitter.com/i/oauth2/authorize?" + urlencode(params)


def get_provider(name: str) -> AuthProviderBase:
    name = name.lower()
    if name == "google":
        return GoogleProvider()
    if name == "x":
        return XProvider()
    if name == "email":
        return EmailProvider()
    raise ValueError(f"Unknown provider {name}")
