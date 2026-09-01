"""FACTSETU — verification_runs table (pipeline execution attempts)."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Index, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import VerificationRunStatus


class VerificationRun(Base):
    __tablename__ = "verification_runs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    verification_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("verifications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[VerificationRunStatus] = mapped_column(
        Enum(VerificationRunStatus, name="verification_run_status_enum", native_enum=False, validate_strings=True),
        nullable=False,
        default=VerificationRunStatus.pending,
        server_default=VerificationRunStatus.pending.value,
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    pipeline_metadata: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    verification: Mapped["Verification"] = relationship("Verification", back_populates="runs")

    __table_args__ = (
        Index("ix_verification_runs_verification", "verification_id"),
        Index("ix_verification_runs_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<VerificationRun {self.id} status={self.status}>"
