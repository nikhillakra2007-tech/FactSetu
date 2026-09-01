"""FACTSETU — Fetcher (allowlist-only, safe limits)."""

import logging
from typing import Optional
from urllib.parse import urlparse

import httpx

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.source import Source

logger = logging.getLogger(__name__)


class FetchService:
    def __init__(self):
        self.settings = get_settings()

    def is_allowed(self, url: str, db=None) -> bool:
        """Only fetch if domain in trusted sources and is_active & is_trusted."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
            if not domain:
                return False
            # Check against DB or allow seeded list
            close = False
            if db is None:
                db = SessionLocal()
                close = True
            try:
                src = db.query(Source).filter(Source.domain == domain, Source.is_active == True).first()  # noqa
                if src and src.is_trusted:
                    return True
                # Also allow subdomains: e.g., pib.gov.in matches subdomain?
                # Check if url domain ends with allowed domain
                allowed = db.query(Source).filter(Source.is_active == True, Source.is_trusted == True).all()
                for s in allowed:
                    if domain == s.domain or domain.endswith("." + s.domain):
                        return True
                return False
            finally:
                if close:
                    db.close()
        except Exception:
            return False

    def fetch(self, url: str, db=None) -> dict:
        """Fetch URL. Returns {url, content, content_type, status_code, error}."""
        if not self.is_allowed(url, db):
            return {"url": url, "error": "domain not in allowlist", "content": None}
        # Validate URL scheme
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return {"url": url, "error": "invalid scheme", "content": None}
        try:
            # Use sync httpx for simplicity
            with httpx.Client(timeout=self.settings.fetch_timeout_seconds, follow_redirects=True, headers={"User-Agent": "FACTSETU/1.0"}) as client:
                resp = client.get(url)
                if resp.status_code != 200:
                    return {"url": url, "status_code": resp.status_code, "error": f"HTTP {resp.status_code}", "content": None}
                # size limit
                content_len = int(resp.headers.get("content-length", "0") or "0")
                if content_len and content_len > self.settings.max_fetch_bytes:
                    return {"url": url, "error": "content too large", "content": None}
                content = resp.content
                if len(content) > self.settings.max_fetch_bytes:
                    return {"url": url, "error": "content too large", "content": None}
                ct = resp.headers.get("content-type", "")
                # Decode
                try:
                    text = resp.text
                except Exception:
                    text = content.decode("utf-8", errors="ignore")
                return {"url": url, "status_code": 200, "content": text, "content_type": ct, "headers": dict(resp.headers)}
        except httpx.TimeoutException:
            return {"url": url, "error": "timeout", "content": None}
        except Exception as e:
            logger.warning("fetch %s failed: %s", url, e)
            return {"url": url, "error": str(e), "content": None}
