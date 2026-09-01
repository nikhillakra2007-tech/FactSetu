"""FACTSETU — Sources API."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.source import Source

router = APIRouter(prefix="/api", tags=["sources"])


@router.get("/sources")
def list_sources(db: Session = Depends(get_db)):
    sources = db.query(Source).order_by(Source.authority_level.desc(), Source.name).all()
    return [
        {
            "id": str(s.id),
            "name": s.name,
            "domain": s.domain,
            "base_url": s.base_url,
            "source_type": s.source_type.value if hasattr(s.source_type, "value") else str(s.source_type),
            "trust_level": s.trust_level,
            "authority_level": s.authority_level,
            "country": s.country,
            "language": s.language,
            "is_trusted": s.is_trusted,
            "is_active": s.is_active,
        }
        for s in sources
    ]


@router.get("/sources/trusted")
def trusted_sources(db: Session = Depends(get_db)):
    sources = db.query(Source).filter(Source.is_trusted == True, Source.is_active == True).order_by(Source.authority_level.desc()).all()
    return [{"id": str(s.id), "name": s.name, "domain": s.domain, "authority_level": s.authority_level} for s in sources]
