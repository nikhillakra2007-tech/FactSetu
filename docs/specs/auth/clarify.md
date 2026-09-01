# CLARIFY — Auth Decisions

1. **DB not replaced:** Preserve factsetu.db (sources, documents). Additive migration only, `ALTER TABLE users`.
2. **User model reuse:** Extend existing `users` table, not duplicate. Keep `email` unique nullable but enforce not null for email provider via app logic; OAuth users have email + provider.
3. **Hash algorithm:** Argon2 via `argon2-cffi` + `passlib[argon2]` (preferred over bcrypt per spec). Fallback to pbkdf2 only if argon2 missing — but we install argon2.
4. **Token architecture:** JWT bearer + HttpOnly cookie `factsetu_token` (chosen over server session for stateless + frontend flexibility). Same token used for Authorization header or cookie. Config: `AUTH_JWT_SECRET` defaults to `SECRET_KEY`, `AUTH_JWT_EXPIRE_DAYS=7`, `AUTH_COOKIE_SECURE` false in dev, true prod, `SameSite=Lax`, `HttpOnly=True`. No refresh token for local dev; logout clears cookie.
5. **OAuth placeholders:** `GoogleProvider`/`XProvider` implement AuthProvider ABC with `get_authorization_url()` and `handle_callback()`. If `GOOGLE_CLIENT_ID` etc not set, routes return 503 with setup instructions — not faked.
6. **Account linking:** If signup email exists as email provider → 409; if Google login finds existing email user with different provider → link `provider_user_id` and return same user (deterministic, no auto-merge of two distinct accounts without email match).
7. **Password policy:** min_length 8, not in common weak list (password, 12345678, factsetu), email regex via `email-validator`, duplicate check 409.
8. **Errors:** Safe messages: "Invalid credentials" (not "user not found"), 409 for duplicate, 401/403 for auth/role.
9. **CORS:** Keep `CORS_ORIGINS` list, `allow_credentials=True` only for explicit origins (never `*`). Dependencies read cookies + Authorization.
10. **AI separation:** AuthService never imports Gemini; intelligence pipeline unchanged.
