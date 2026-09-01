"""FACTSETU — Health check endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:  # pragma: no cover
        db_status = f"error: {exc}"

    return {"status": "ok", "database": db_status, "app": "FACTSETU"}


@router.get("/health/db")
def db_tables(db: Session = Depends(get_db)):
    """List tables — useful for hackathon demo verification."""
    try:
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
        tables = [r[0] for r in result.fetchall()]
        # Try postgres variant if sqlite returned nothing
        if not tables:
            try:
                result = db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"))
                tables = [r[0] for r in result.fetchall()]
            except Exception:
                pass
        return {"tables": tables, "count": len(tables)}
    except Exception as exc:
        return {"error": str(exc), "tables": []}
