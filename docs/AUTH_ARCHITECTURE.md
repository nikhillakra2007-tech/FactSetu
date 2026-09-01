# FACTSETU — Authentication Architecture (Auth-Only Phase)

## Overview
Auth is isolated from AI/evidence/intelligence. It identifies **who** requested verification, not truth.

```
LOGIN UI (dark premium, "Bridge to Trustworthy Information", Welcome back)
    ↓ email/password or Continue with Google / X
    → POST /api/auth/signup | POST /api/auth/login | GET /api/auth/google | GET /api/auth/x
    → AuthService (signup/login, hash, link)
    → User (DB)
    → JWT (HS256) + HttpOnly cookie `factsetu_token`
    → GET /api/auth/me (frontend auth state)
```

## User Model
`users` (UUID PK):
- `email` VARCHAR(255) unique, nullable
- `display_name` nullable
- `password_hash` nullable (OAuth users null)
- `provider` Enum(email, google, x) default email
- `provider_user_id` nullable, indexed
- `role` Enum(USER, MODERATOR, ADMIN) default USER
- `is_active` bool default true, `is_verified` bool default false
- `last_login_at` nullable, `preferred_language`, `created_at`, `updated_at`

Migration: `147fba0a0232_auth_extend_users_with_password_hash_provider_role.py`

## Password Hashing
`app/core/security.py`: `passlib[argon2]` with `argon2-cffi` (fallback pbkdf2). `hash_password()` → `$argon2id$...`, `verify_password()`. Policy: min 8, max 128, reject `password`, `12345678`, `factsetu` etc. Never logs passwords, never returns hash.

## JWT / Session
`create_access_token(sub, email, role)` → HS256 via `SECRET_KEY` (fallback `auth_jwt_secret`), exp `7 days`. `decode_access_token` validates. Cookie: `factsetu_token`, `HttpOnly=True`, `SameSite=Lax`, `Secure=False` in dev (`auth_cookie_secure`), `max_age=7d`, `path=/`. Supports both `Authorization: Bearer <token>` and cookie; `get_current_user` checks both.

## AuthService
`app/services/auth_service.py`: `signup()`, `login()`, `get_user_by_id()`, `create_token_for_user()`, `find_or_create_oauth_user()` (deterministic linking: provider_user_id match → email match → create). Validates via `email-validator`, checks duplicate 409, generic "Invalid credentials" 401, disabled 403.

## Provider Abstraction
`app/services/auth_providers.py`: `AuthProvider ABC` → `EmailProvider`, `GoogleProvider`, `XProvider`. `get_authorization_url()` builds OAuth URL with `client_id`, `redirect_uri`, `state`. `is_configured()` checks env vars. If not configured, routes return 503 with setup guidance (not faked).

## OAuth Flows
Email: `Login UI → POST /api/auth/login → User lookup → verify hash → JWT+cookie → FactSetu`
Google: `Login UI → GET /api/auth/google → redirect accounts.google.com → GET /google/callback?code → (exchange code, not faked) → find/create user → JWT`
X: analogous to `twitter.com/i/oauth2/authorize`. Callback currently returns `callback_received` with code snippet; real token exchange to be added when `X_CLIENT_*` configured.

## APIs
- `POST /api/auth/signup {email,password,name}` → 201 + `access_token` + `user`, sets cookie
- `POST /api/auth/login {email,password}` → 200 + token
- `POST /api/auth/logout` → clears cookie (idempotent)
- `GET /api/auth/me` → `{authenticated:bool, user:UserOut|null}` (optional auth)
- `GET /api/auth/config` → `{email_enabled, google_configured, x_configured, providers}`
- `GET /api/auth/google` → 302 redirect or 503
- `GET /api/auth/google/callback?code` → 200 guidance or 503
- `GET /api/auth/x` / `GET /api/auth/x/callback` analogous
- `GET /api/auth/protected` example of `require_authenticated_user`

All use `app/schemas/auth.py` (EmailStr via `email-validator`, length checks).

## Dependencies
`app/api/deps.py`: `get_current_user()` (optional), `get_current_active_user()` (401 if missing, 403 if disabled), `require_role(role)` hierarchy USER<MODERATOR<ADMIN.

## Authorization
Default role `USER`. Protected routes can `Depends(require_role("ADMIN"))`. `is_active` checked on every auth; disabled cannot login nor use token.

## CORS
Preserved `CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:8765` via `Settings.cors_origins_list`, `allow_credentials=True`, `allow_methods=["*"]`, never `*` with credentials. Verified: `http://localhost:3000` echoed, `http://evil.com` not.

## Security
- `backend/.env` gitignored (`.gitignore:1` `.env`), secrets never in responses/logs
- JWT secret defaults to `SECRET_KEY` but `AUTH_JWT_SECRET` can be separate
- Cookie `HttpOnly`, `SameSite=Lax`, `Secure` in prod
- Input validation via Pydantic + `email-validator`, oversized 255/128 limits, injection safe via schemas
- No plaintext storage, Argon2, token expiry, disabled accounts blocked

## Environment
```env
SECRET_KEY=change-me-in-production
AUTH_JWT_SECRET=optional-override
AUTH_JWT_EXPIRE_DAYS=7
AUTH_COOKIE_SECURE=false
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
X_CLIENT_ID=
X_CLIENT_SECRET=
X_REDIRECT_URI=http://localhost:8000/api/auth/x/callback
```
See `.env.example`.

## Tests
18 auth tests: signup, duplicate 409, login, wrong password 401, invalid email 422, weak password 422, disabled 403, me bearer/cookie/anon, logout, protected 401/200, role/hierarchy, hashing argon2, token encode/decode/expired, CORS, OAuth config 503, plaintext not stored, env ignored. All 30 tests (auth+intelligence) pass.

## Future Frontend Contract
Email arrow → `POST /api/auth/login` or `/signup`; Continue with Google → `GET /api/auth/google`; Continue with X → `GET /api/auth/x`; Welcome back → `GET /api/auth/me`; Sign up link → `/signup`; token stored in HttpOnly cookie automatically, or `access_token` for Authorization header; dark/light compatible via API only.

## AI Separation
`AuthService` never imports `AIProvider`; intelligence services remain in `app/services/*` (gemini, retrieval, verification) untouched.

