"""FACTSETU — claim_entities table."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ClaimEntity(Base):
    __tablename__ = "claim_entities"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True
    )
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # ORGANIZATION | PERSON | LOCATION …
    entity_text: Mapped[str] = mapped_column(String(500), nullable=False)
    normalized_value: Mapped[str | None] = mapped_column(String(500), nullable=True)
    meta: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    claim: Mapped["Claim"] = relationship("Claim", back_populates="entities")

    __table_args__ = (
        Index("ix_claim_entities_claim", "claim_id"),
        Index("ix_claim_entities_type", "entity_type"),
    )

    def __repr__(self) -> str:
        return f"<ClaimEntity {self.entity_type}:{self.entity_text}>"
