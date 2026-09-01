"""FACTSETU — verification_requests table."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import InputType, VerificationRequestStatus


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    input_type: Mapped[InputType] = mapped_column(
        Enum(InputType, name="vr_input_type_enum", native_enum=False, validate_strings=True), nullable=False
    )
    original_input: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[VerificationRequestStatus] = mapped_column(
        Enum(VerificationRequestStatus, name="vr_status_enum", native_enum=False, validate_strings=True),
        nullable=False,
        default=VerificationRequestStatus.pending,
        server_default=VerificationRequestStatus.pending.value,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User | None"] = relationship("User")
    claims: Mapped[list["Claim"]] = relationship("Claim", back_populates="verification_request", lazy="selectin")

    __table_args__ = (
        Index("ix_vr_user", "user_id"),
        Index("ix_vr_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<VerificationRequest {self.id} status={self.status}>"
