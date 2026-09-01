# PLAN — Auth Implementation

## 1. DB Changes (Alembic migration 1d8e... → new)
- `users` columns: `password_hash VARCHAR(255) nullable`, `provider VARCHAR(20) default email`, `provider_user_id VARCHAR(255) nullable`, `role VARCHAR(20) default USER`, `is_active BOOLEAN default 1`, `is_verified BOOLEAN default 0`, `last_login_at DATETIME nullable`
- Indexes: `ix_users_email` already exists, add `ix_users_provider_user_id` unique composite where provider_user_id not null, `ix_users_role`
- Enums stored as string (native_enum=False) for SQLite: UserRole (USER, MODERATOR, ADMIN), AuthProvider (email, google, x)

## 2. Core
- `app/core/config.py`: add `auth_jwt_secret`, `auth_jwt_expire_days`, `auth_cookie_name`, `google_client_id/secret/redirect_uri`, `x_client_id/secret/redirect_uri`, `frontend_url`
- `app/core/security.py`: `hash_password`, `verify_password` (argon2), `create_access_token`, `decode_access_token`
- `app/services/auth_service.py`: `signup(email,password,name)`, `login`, `logout`, `get_user_by_id`, `update_last_login`
- `app/services/auth_providers.py`: `AuthProvider ABC`, `EmailProvider`, `GoogleProvider`, `XProvider` (OAuth URL generation, callback handling via httpx)

## 3. Schemas
- `app/schemas/auth.py`: `SignupRequest`, `LoginRequest`, `UserOut`, `MeResponse`, `TokenResponse`

## 4. Dependencies
- `app/api/deps.py`: `get_db`, `get_current_user`, `get_current_active_user`, `require_role`

## 5. APIs
- `app/api/auth.py` router prefix `/api/auth`: `POST /signup`, `POST /login`, `POST /logout`, `GET /me`, `GET /google`, `GET /google/callback`, `GET /x`, `GET /x/callback`, `GET /config`
- Register in `app/main.py`, keep health/verify/etc

## 6. Tests
- `tests/test_auth.py`: signup, duplicate, login, wrong password, invalid email, disabled account, me, logout, dependency, role, hashing, token, CORS, OAuth config

## 7. Docs
- Update `docs/ARCHITECTURE.md` + `.env.example`, ensure `.gitignore` keeps `.env`
