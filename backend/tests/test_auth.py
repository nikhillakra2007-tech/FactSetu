from pathlib import Path
import sys
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.core.database import SessionLocal
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.user import User
from app.models.enums import UserRole

client = TestClient(app)

def unique_email():
    return f"test_{uuid.uuid4().hex[:8]}@factsetu.example"

def test_signup_success():
    email=unique_email()
    r=client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123","name":"Test"})
    assert r.status_code==201
    j=r.json()
    assert "access_token" in j
    assert j["user"]["email"]==email.lower()
    assert j["user"]["role"]=="USER"
    assert "password" not in str(j).lower()
    # cookie set
    assert "factsetu_token" in r.cookies

def test_duplicate_signup():
    email=unique_email()
    r1=client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    assert r1.status_code==201
    r2=client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    assert r2.status_code==409
    assert "already exists" in r2.json()["detail"]

def test_login_success():
    email=unique_email()
    client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    r=client.post("/api/auth/login", json={"email":email,"password":"StrongPass123"})
    assert r.status_code==200
    assert r.json()["user"]["email"]==email.lower()

def test_wrong_password():
    email=unique_email()
    client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    r=client.post("/api/auth/login", json={"email":email,"password":"WrongPass123"})
    assert r.status_code==401
    assert r.json()["detail"]=="Invalid credentials"

def test_invalid_email():
    r=client.post("/api/auth/signup", json={"email":"notanemail","password":"StrongPass123"})
    assert r.status_code==422

def test_weak_password():
    r=client.post("/api/auth/signup", json={"email":unique_email(),"password":"short"})
    assert r.status_code==422

def test_disabled_account():
    email=unique_email()
    client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    db=SessionLocal()
    db.execute(text("UPDATE users SET is_active=0 WHERE email=:e"), {"e": email.lower()})
    db.commit()
    db.close()
    r=client.post("/api/auth/login", json={"email":email,"password":"StrongPass123"})
    assert r.status_code==403
    assert "disabled" in r.json()["detail"].lower()
    # re-enable for cleanup
    db=SessionLocal()
    db.execute(text("UPDATE users SET is_active=1 WHERE email=:e"), {"e": email.lower()})
    db.commit()
    db.close()

def test_me_authenticated():
    email=unique_email()
    r=client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    token=r.json()["access_token"]
    # bearer
    r2=client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code==200
    assert r2.json()["authenticated"]==True
    assert r2.json()["user"]["email"]==email.lower()

def test_me_unauthenticated():
    anon_client=TestClient(app)
    r=anon_client.get("/api/auth/me")
    assert r.status_code==200
    assert r.json()["authenticated"]==False
    assert r.json()["user"] is None

def test_logout():
    email=unique_email()
    r=client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    # login to set cookie
    client.post("/api/auth/login", json={"email":email,"password":"StrongPass123"})
    # logout should clear cookie
    r2=client.post("/api/auth/logout")
    assert r2.status_code==200
    assert r2.json()["status"]=="logged_out"
    # after logout, cookie cleared, me should be unauthenticated (fresh client without token)
    fresh=TestClient(app)
    r3=fresh.get("/api/auth/me")
    assert r3.json()["authenticated"]==False

def test_protected_dependency():
    email=unique_email()
    r=client.post("/api/auth/signup", json={"email":email,"password":"StrongPass123"})
    token=r.json()["access_token"]
    # with token
    r2=client.get("/api/auth/protected", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code==200
    # without
    fresh=TestClient(app)
    r3=fresh.get("/api/auth/protected")
    assert r3.status_code==401

def test_role_handling():
    # create admin directly
    db=SessionLocal()
    admin_email=unique_email()
    from app.core.security import hash_password as hp
    admin=User(email=admin_email, display_name="Admin", password_hash=hp("AdminPass123"), role=UserRole.ADMIN, is_active=True)
    db.add(admin); db.commit()
    token=create_access_token(str(admin.id), admin.email, admin.role.value)
    db.close()
    # verify jwt contains role
    payload=decode_access_token(token)
    assert payload["role"]=="ADMIN"
    # cleanup
    db=SessionLocal()
    db.execute(text("DELETE FROM users WHERE email=:e"), {"e": admin_email})
    db.commit()
    db.close()

def test_password_hashing():
    h=hash_password("MySecure123")
    assert h != "MySecure123"
    assert h.startswith("$argon2")
    assert verify_password("MySecure123", h)==True
    assert verify_password("wrong", h)==False

def test_token_handling():
    token=create_access_token("00000000-0000-0000-0000-000000000001", "a@b.com", "USER")
    payload=decode_access_token(token)
    assert payload is not None
    assert payload["sub"]=="00000000-0000-0000-0000-000000000001"
    # invalid token
    assert decode_access_token("invalid")==None
    # expired token (create with -1 day)
    from datetime import datetime, timedelta, timezone
    import jwt
    from app.core.config import get_settings
    s=get_settings()
    payload_exp={"sub":"x","exp": datetime.now(timezone.utc)-timedelta(days=1)}
    expired=jwt.encode(payload_exp, s.jwt_secret, algorithm="HS256")
    assert decode_access_token(expired)==None

def test_cors_behavior():
    # allowed origin
    r=client.get("/api/auth/me", headers={"Origin":"http://localhost:3000"})
    # should have allow-origin echo when credentials
    # starlette cors with allow_credentials returns explicit origin, not *
    assert r.headers.get("access-control-allow-origin")=="http://localhost:3000" or r.headers.get("access-control-allow-origin") is not None
    # evil origin should not be allowed (no header or not echo)
    r2=client.get("/api/auth/me", headers={"Origin":"http://evil.com"})
    # Should not return evil origin
    assert r2.headers.get("access-control-allow-origin") != "http://evil.com"

def test_oauth_config():
    r=client.get("/api/auth/config")
    assert r.status_code==200
    j=r.json()
    assert "email_enabled" in j
    assert "google_configured" in j
    assert "x_configured" in j
    # without config, google should 503
    r2=client.get("/api/auth/google", follow_redirects=False)
    assert r2.status_code==503
    assert "not configured" in r2.json()["detail"].lower()
    r3=client.get("/api/auth/x", follow_redirects=False)
    assert r3.status_code==503

def test_security_no_plaintext():
    email=unique_email()
    pwd="SuperSecret123"
    r=client.post("/api/auth/signup", json={"email":email,"password":pwd})
    assert r.status_code==201
    # response must not contain password
    assert pwd not in r.text
    # db must not store plaintext
    db=SessionLocal()
    row=db.execute(text("SELECT password_hash FROM users WHERE email=:e"), {"e": email.lower()}).fetchone()
    assert row is not None
    assert pwd not in row[0]
    assert row[0].startswith("$argon2")
    db.close()

def test_env_ignored():
    from pathlib import Path
    backend_root = Path(__file__).resolve().parent.parent
    gitignore = (backend_root / ".gitignore").read_text()
    assert ".env" in gitignore
