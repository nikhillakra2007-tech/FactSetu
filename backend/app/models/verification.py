"""FACTSETU — verifications table (outcome per claim)."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import VerificationResult


class Verification(Base):
    __tablename__ = "verifications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True
    )
    result: Mapped[VerificationResult] = mapped_column(
        Enum(VerificationResult, name="verification_result_enum", native_enum=False, validate_strings=True),
        nullable=False,
    )
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    claim: Mapped["Claim"] = relationship("Claim", back_populates="verifications")
    runs: Mapped[list["VerificationRun"]] = relationship(
        "VerificationRun", back_populates="verification", cascade="all, delete-orphan", lazy="selectin"
    )
    feedback: Mapped[list["Feedback"]] = relationship(
        "Feedback", back_populates="verification", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_verifications_claim", "claim_id"),
        Index("ix_verifications_result", "result"),
    )

    def __repr__(self) -> str:
        return f"<Verification {self.id} result={self.result} conf={self.confidence}>"
