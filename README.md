# FACTSETU — Evidence-First Fact Verification Platform

> Turing Hacks PS06 — Bridge to Trustworthy Information

## Quick Start

```powershell
cd hacks/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Configure env (defaults to SQLite; set Gemini + OAuth as needed)
Copy-Item .env.example .env
# edit .env: GEMINI_API_KEY, GOOGLE_CLIENT_ID etc (see .env.example)

alembic upgrade head
python seed.py
uvicorn app.main:app --reload --port 8000
```

Open http://127.0.0.1:8000/docs — `GET /health`, `GET /api/auth/config`

## Database
- SQLite default `factsetu.db` (dev), Postgres via `DATABASE_URL=postgresql+psycopg2://...`
- Alembic migrations: `b963e710a051` → `1d8e57f7982e` (documents/chunks) → `147fba0a0232` (auth)
- 16 tables: users (auth), submissions, claims, documents, evidence_chunks, etc. See `docs/ARCHITECTURE.md` + `docs/AUTH_ARCHITECTURE.md`

## Authentication (this phase)
- Email signup/login via Argon2 + JWT (HttpOnly cookie + Bearer)
- OAuth placeholders: Continue with Google (`GET /api/auth/google`) and X (`GET /api/auth/x`) — 503 until `GOOGLE_*`/`X_*` configured
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Tests: `python -m pytest tests -v` (30 tests)

## Intelligence (separate phase, preserved)
Gemini (`gemini-2.5-flash` + `gemini-embedding-001`), document ingestion, chunking, hybrid retrieval, verification engine — see `docs/ARCHITECTURE_V2.md`. Auth does not depend on Gemini.

## PostgreSQL
```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/factsetu
alembic upgrade head
```

## Architecture Docs
- `docs/ARCHITECTURE.md` — V1 DB foundation
- `docs/ARCHITECTURE_V2.md` — intelligence layer
- `docs/AUTH_ARCHITECTURE.md` — authentication (this phase)
- `docs/specs/auth/*` — Spec Kit artifacts
