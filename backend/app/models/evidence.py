"""FACTSETU — evidence table (retrieved snippet per claim per source)."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import EvidenceType


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sources.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    snippet: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    retrieved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    evidence_type: Mapped[EvidenceType | None] = mapped_column(
        Enum(EvidenceType, name="evidence_type_enum", native_enum=False, validate_strings=True), nullable=True
    )
    meta: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)

    # Relationships
    claim: Mapped["Claim"] = relationship("Claim", back_populates="evidence")
    source: Mapped["Source"] = relationship("Source", back_populates="evidence")

    __table_args__ = (
        Index("ix_evidence_claim", "claim_id"),
        Index("ix_evidence_source", "source_id"),
        Index("ix_evidence_claim_source", "claim_id", "source_id"),
    )

    def __repr__(self) -> str:
        return f"<Evidence {self.id} claim={self.claim_id} source={self.source_id}>"
