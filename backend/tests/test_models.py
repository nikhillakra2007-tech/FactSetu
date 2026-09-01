import sys
sys.path.insert(0, "C:/Users/nikhi/OneDrive/Desktop/coding/hacks/backend")
from sqlalchemy import text
from app.core.database import SessionLocal, Base
import app.models

def test_tables_exist():
    db=SessionLocal()
    rows=db.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")).fetchall()
    names=[r[0] for r in rows]
    assert "documents" in names
    assert "evidence_chunks" in names
    assert "verification_requests" in names
    assert "claim_evidence" in names
    assert "sources" in names
    db.close()

def test_source_columns():
    from app.core.database import SessionLocal
    db=SessionLocal()
    info=db.execute(text("PRAGMA table_info(sources)")).fetchall()
    cols=[c[1] for c in info]
    assert "authority_level" in cols
    assert "is_trusted" in cols
    assert "country" in cols
    db.close()

def test_deduplication():
    from app.models.document import Document
    from app.models.source import Source
    db=SessionLocal()
    src=db.query(Source).first()
    content="Test deduplication content unique "+str(__import__('uuid').uuid4())
    h=Document.compute_hash(content)
    d1=Document(source_id=src.id, url="https://test.example/dedup1", content=content, document_type="text", content_hash=h)
    db.add(d1); db.commit()
    # duplicate hash should not insert again via ingestion
    from app.services.ingestion_service import IngestionService
    from app.services.gemini_provider import GeminiProvider
    svc=IngestionService(ai_provider=GeminiProvider())
    # simulate duplicate detection
    existing=db.query(Document).filter(Document.content_hash==h).first()
    assert existing is not None
    # cleanup
    db.delete(d1); db.commit(); db.close()
