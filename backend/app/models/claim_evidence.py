"""FACTSETU — claim_evidence join (Claim ↔ EvidenceChunk provenance)."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ClaimEvidence(Base):
    __tablename__ = "claim_evidence"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("evidence_chunks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    support_type: Mapped[str | None] = mapped_column(String(20), nullable=True)  # supporting/contradicting/contextual
    retrieval_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    claim: Mapped["Claim"] = relationship("Claim", back_populates="chunk_links")
    chunk: Mapped["EvidenceChunk"] = relationship("EvidenceChunk", back_populates="claim_links")

    __table_args__ = (
        UniqueConstraint("claim_id", "chunk_id", name="uq_claim_chunk"),
        Index("ix_claim_evidence_claim", "claim_id"),
        Index("ix_claim_evidence_chunk", "chunk_id"),
    )

    def __repr__(self) -> str:
        return f"<ClaimEvidence claim={self.claim_id} chunk={self.chunk_id} score={self.relevance_score}>"
