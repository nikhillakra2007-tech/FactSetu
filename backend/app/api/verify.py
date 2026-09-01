"""FACTSETU — Verification APIs."""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.verify import VerifyRequest
from app.services.gemini_provider import GeminiProvider
from app.services.pipeline import VerificationPipeline
from app.models.verification_request import VerificationRequest
from app.models.claim import Claim
from app.models.verification import Verification
from app.models.claim_evidence import ClaimEvidence
from app.models.evidence_chunk import EvidenceChunk
from app.models.document import Document

router = APIRouter(prefix="/api", tags=["verification"])


def get_ai_provider():
    return GeminiProvider()


@router.post("/verify", response_model=dict)
def verify(req: VerifyRequest, db: Session = Depends(get_db), ai=Depends(get_ai_provider)):
    if len(req.text) > 10000:
        raise HTTPException(status_code=400, detail="Input too large (max 10000 chars)")
    pipeline = VerificationPipeline(ai_provider=ai)
    user_id = None
    if req.user_id:
        try:
            user_id = uuid.UUID(req.user_id)
        except Exception:
            user_id = None
    result = pipeline.run(
        original_input=req.text,
        input_type=req.input_type,
        language=req.language,
        user_id=user_id,
        db=db,
    )
    return result


@router.get("/verification/history/list")
def history(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    q = db.query(VerificationRequest).order_by(VerificationRequest.created_at.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": str(vr.id),
            "original_input": vr.original_input[:200],
            "status": vr.status.value if hasattr(vr.status, "value") else str(vr.status),
            "created_at": vr.created_at.isoformat() if vr.created_at else None,
        }
        for vr in q
    ]


@router.get("/verification/history")
def history_alias(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    return history(limit=limit, offset=offset, db=db)


@router.get("/verification/{request_id}")
def get_verification(request_id: str, db: Session = Depends(get_db)):
    try:
        rid = uuid.UUID(request_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    vr = db.query(VerificationRequest).filter(VerificationRequest.id == rid).first()
    if not vr:
        raise HTTPException(status_code=404, detail="Not found")
    claims = db.query(Claim).filter(Claim.verification_request_id == rid).all()
    out_claims = []
    for c in claims:
        ver = db.query(Verification).filter(Verification.claim_id == c.id).order_by(Verification.created_at.desc()).first()
        ces = db.query(ClaimEvidence).filter(ClaimEvidence.claim_id == c.id).order_by(ClaimEvidence.retrieval_rank).all()
        evidence = []
        for ce in ces:
            ch = db.query(EvidenceChunk).filter(EvidenceChunk.id == ce.chunk_id).first()
            doc = db.query(Document).filter(Document.id == ch.document_id).first() if ch else None
            evidence.append(
                {
                    "chunk_id": str(ce.chunk_id),
                    "chunk_text": ch.chunk_text[:500] if ch else "",
                    "url": doc.url if doc else "",
                    "relevance_score": ce.relevance_score,
                    "support_type": ce.support_type,
                }
            )
        out_claims.append(
            {
                "claim_id": str(c.id),
                "claim_text": c.claim_text,
                "normalized_claim": c.normalized_claim,
                "claim_type": c.claim_type.value if c.claim_type else None,
                "status": c.status.value if hasattr(c.status, "value") else str(c.status),
                "verification": {
                    "id": str(ver.id) if ver else None,
                    "verdict": ver.result.value if ver and hasattr(ver.result, "value") else str(ver.result) if ver else None,
                    "confidence": ver.confidence if ver else None,
                    "explanation": ver.reason if ver else None,
                },
                "evidence": evidence,
            }
        )
    return {
        "verification_request_id": str(vr.id),
        "status": vr.status.value if hasattr(vr.status, "value") else str(vr.status),
        "original_input": vr.original_input,
        "created_at": vr.created_at.isoformat() if vr.created_at else None,
        "claims": out_claims,
    }
