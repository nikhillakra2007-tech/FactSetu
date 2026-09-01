# SPECIFY — FactSetu Authentication Foundation (Auth-Only Phase)

## Goal
Implement secure, production-ready authentication foundation that the future dark-premium FactSetu frontend ("Bridge to Trustworthy Information", Welcome back, Continue with Google/X, email arrow flow) can consume without auth architecture changes. This phase is **AUTH ONLY** — no AI/evidence/ingestion/Gemini.

## Existing Architecture
- FastAPI 0.115 + SQLAlchemy 2.0.36 + Alembic (1d8e57f7982e head) + Pydantic + SQLite (factsetu.db) / Postgres fallback
- User model: id (UUID), email (unique nullable), display_name, preferred_language, created_at/updated_at only; 0 users; no password_hash/provider/role
- No auth code, no JWT, no hashing, no OAuth, CORS origins http://localhost:3000,5173,127.0.0.1:8765 via Settings
- Intelligence layer exists (documents, chunks, verification_requests) but must not be touched
- .env contains SECRET_KEY, DATABASE_URL, GEMINI_API_KEY; .env.example missing auth vars

## Functional Requirements
- User model extended: password_hash (nullable for OAuth), name/display_name, provider, provider_user_id, role (USER default, MODERATOR, ADMIN), is_active, is_verified, last_login_at, timestamps
- Email auth: signup (email+password+name → validate → hash Argon2 → create) and login (verify hash → update last_login → token) with never storing plaintext
- Password policy: min 8 chars, not trivially weak
- OAuth: Google + X — architecture + placeholders + provider abstraction; real flow when credentials configured, safe errors otherwise; account linking deterministic (email exists → link provider)
- Token/session: JWT HS256 via SECRET_KEY, HttpOnly cookie + Bearer, expiry 7d, secure/SameSite handling, logout invalidates cookie
- APIs: POST /api/auth/signup, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me, GET /api/auth/google, /google/callback, GET /api/auth/x, /x/callback (reuse project conventions, no duplicates)
- Dependencies: get_current_user(), require_authenticated_user(), require_role() for future protected routes
- Frontend contract: email field → login/signup, Continue with Google → /auth/google, Continue with X → /auth/x, arrow submit, Sign up link, Welcome back state via /me

## Non-Functional
- Argon2 hashing (argon2-cffi), JWT (python-jose), email-validator
- No plaintext logs, secrets never in responses, .env stays gitignored
- Rate limiting light (in-memory) for login/signup if practical
- Tests for auth flows, security, DB constraints

## Out of Scope
AI/Gemini, claim extraction, retrieval, ingestion, embeddings, verification — explicitly separate.
