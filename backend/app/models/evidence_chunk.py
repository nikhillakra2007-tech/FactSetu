"""FACTSETU — evidence_chunks table (chunked document + embedding)."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class EvidenceChunk(Base):
    __tablename__ = "evidence_chunks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    section: Mapped[str | None] = mapped_column(String(255), nullable=True)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    embedding: Mapped[list | None] = mapped_column(JSON, nullable=True)  # list[float] for SQLite; pgvector later
    embedding_model: Mapped[str | None] = mapped_column(String(50), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    document: Mapped["Document"] = relationship("Document", back_populates="chunks")
    claim_links: Mapped[list["ClaimEvidence"]] = relationship(
        "ClaimEvidence", back_populates="chunk", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_evidence_chunks_document", "document_id"),
        Index("ix_evidence_chunks_document_index", "document_id", "chunk_index"),
    )

    def __repr__(self) -> str:
        return f"<EvidenceChunk {self.id} doc={self.document_id} idx={self.chunk_index}>"
