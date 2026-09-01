"""FACTSETU — claims table (most important domain table)."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import ClaimStatus, ClaimType


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("submissions.id", ondelete="CASCADE"), nullable=True, index=True
    )
    verification_request_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=True, index=True
    )
    claim_text: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_claim: Mapped[str | None] = mapped_column(Text, nullable=True)
    claim_type: Mapped[ClaimType | None] = mapped_column(
        Enum(ClaimType, name="claim_type_enum", native_enum=False, validate_strings=True), nullable=True
    )
    language: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[ClaimStatus] = mapped_column(
        Enum(ClaimStatus, name="claim_status_enum", native_enum=False, validate_strings=True),
        nullable=False,
        default=ClaimStatus.pending,
        server_default=ClaimStatus.pending.value,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    submission: Mapped["Submission | None"] = relationship("Submission", back_populates="claims")
    verification_request: Mapped["VerificationRequest | None"] = relationship("VerificationRequest", back_populates="claims")
    chunk_links: Mapped[list["ClaimEvidence"]] = relationship(
        "ClaimEvidence", back_populates="claim", cascade="all, delete-orphan", lazy="selectin"
    )
    entities: Mapped[list["ClaimEntity"]] = relationship(
        "ClaimEntity", back_populates="claim", cascade="all, delete-orphan", lazy="selectin"
    )
    evidence: Mapped[list["Evidence"]] = relationship(
        "Evidence", back_populates="claim", cascade="all, delete-orphan", lazy="selectin"
    )
    verifications: Mapped[list["Verification"]] = relationship(
        "Verification", back_populates="claim", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_claims_submission", "submission_id"),
        Index("ix_claims_status", "status"),
        Index("ix_claims_submission_status", "submission_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Claim {self.id} status={self.status}>"
