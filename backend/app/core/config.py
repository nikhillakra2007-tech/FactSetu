"""FACTSETU — Application configuration."""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "FACTSETU"
    app_env: str = "development"
    secret_key: str = "dev-secret-key-change-in-production"

    # Database — defaults to SQLite for hackathon local dev without Postgres.
    database_url: str = "sqlite:///./factsetu.db"

    cors_origins: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:8765"

    # Gemini
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.5-flash-lite"
    gemini_embedding_model: str = "gemini-embedding-001"

    # Auth
    auth_jwt_secret: str | None = None
    auth_jwt_expire_days: int = 7
    auth_cookie_name: str = "factsetu_token"
    auth_cookie_secure: bool = False
    frontend_url: str = "http://localhost:3000"

    # OAuth — Google
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str | None = None

    # OAuth — X (Twitter)
    x_client_id: str | None = None
    x_client_secret: str | None = None
    x_redirect_uri: str | None = None

    # Data ingestion
    max_fetch_bytes: int = 5 * 1024 * 1024  # 5MB
    fetch_timeout_seconds: int = 12
    chunk_size_chars: int = 600
    chunk_overlap_chars: int = 100

    # Retrieval
    retrieval_top_k: int = 5

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_postgres(self) -> bool:
        return self.database_url.startswith("postgresql")

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key and len(self.gemini_api_key.strip()) > 5)

    @property
    def jwt_secret(self) -> str:
        return self.auth_jwt_secret or self.secret_key

    @property
    def google_configured(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret and self.google_redirect_uri)

    @property
    def x_configured(self) -> bool:
        return bool(self.x_client_id and self.x_client_secret and self.x_redirect_uri)

    def model_post_init(self, _context) -> None:
        # Normalize empty string to None
        if self.gemini_api_key == "":
            self.gemini_api_key = None
        if self.auth_jwt_secret == "":
            self.auth_jwt_secret = None
        if self.google_client_id == "":
            self.google_client_id = None
        if self.google_client_secret == "":
            self.google_client_secret = None
        if self.google_redirect_uri == "":
            self.google_redirect_uri = None
        if self.x_client_id == "":
            self.x_client_id = None
        if self.x_client_secret == "":
            self.x_client_secret = None
        if self.x_redirect_uri == "":
            self.x_redirect_uri = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
