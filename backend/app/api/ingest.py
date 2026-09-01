"""FACTSETU — Ingestion & Multimodal OCR APIs."""

import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.verify import IngestRequest
from app.services.gemini_provider import GeminiProvider
from app.services.ingestion_service import IngestionService
from app.models.document import Document
from app.models.evidence_chunk import EvidenceChunk

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["ingestion"])


def get_ai():
    return GeminiProvider()


@router.post("/ocr")
async def ocr_extract(file: UploadFile = File(...), ai=Depends(get_ai)):
    """Extract all text, messages, and claims from an uploaded screenshot or image."""
    try:
        contents = await file.read()
        mime_type = file.content_type or "image/jpeg"

        if ai and ai.is_available():
            extracted = ai.extract_text_from_image_bytes(contents, mime_type=mime_type)
            if extracted:
                return {
                    "text": extracted,
                    "confidence": 0.98,
                    "filename": file.filename,
                }
    except Exception as e:
        logger.warning("OCR processing error: %s", e)

    raise HTTPException(status_code=422, detail="Could not extract text from this image. Please try a clearer screenshot.")


@router.post("/ingest")
def ingest(req: IngestRequest, db: Session = Depends(get_db), ai=Depends(get_ai)):
    svc = IngestionService(ai_provider=ai)
    import uuid

    source_id = None
    if req.source_id:
        try:
            source_id = uuid.UUID(req.source_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid source_id")
    result = svc.ingest_url(req.url, source_id=source_id, db=db)
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result.get("error", "ingestion failed"))
    return result


@router.get("/documents")
def list_documents(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    docs = db.query(Document).order_by(Document.created_at.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": str(d.id),
            "title": d.title,
            "url": d.url,
            "content_hash": d.content_hash[:12],
            "document_type": d.document_type.value if hasattr(d.document_type, "value") else str(d.document_type),
            "source_id": str(d.source_id),
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "chunks": db.query(EvidenceChunk).filter(EvidenceChunk.document_id == d.id).count(),
        }
        for d in docs
    ]


@router.get("/chunks")
def list_chunks(document_id: str | None = None, limit: int = 20, db: Session = Depends(get_db)):
    q = db.query(EvidenceChunk)
    if document_id:
        import uuid

        try:
            did = uuid.UUID(document_id)
            q = q.filter(EvidenceChunk.document_id == did)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid document_id")
    chunks = q.order_by(EvidenceChunk.created_at.desc()).limit(limit).all()
    return [
        {
            "id": str(c.id),
            "document_id": str(c.document_id),
            "chunk_index": c.chunk_index,
            "chunk_text": c.chunk_text[:500],
            "has_embedding": c.embedding is not None,
            "embedding_model": c.embedding_model,
        }
        for c in chunks
    ]
