"""FACTSETU — submissions table."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import InputType, SubmissionStatus


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    input_type: Mapped[InputType] = mapped_column(
        Enum(InputType, name="input_type_enum", native_enum=False, validate_strings=True),
        nullable=False,
    )
    original_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    original_language: Mapped[str | None] = mapped_column(String(10), nullable=True)
    status: Mapped[SubmissionStatus] = mapped_column(
        Enum(SubmissionStatus, name="submission_status_enum", native_enum=False, validate_strings=True),
        nullable=False,
        default=SubmissionStatus.pending,
        server_default=SubmissionStatus.pending.value,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="submissions")
    input_files: Mapped[list["InputFile"]] = relationship(
        "InputFile", back_populates="submission", cascade="all, delete-orphan", lazy="selectin"
    )
    extracted_contents: Mapped[list["ExtractedContent"]] = relationship(
        "ExtractedContent", back_populates="submission", cascade="all, delete-orphan", lazy="selectin"
    )
    claims: Mapped[list["Claim"]] = relationship(
        "Claim", back_populates="submission", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_submissions_user_created", "user_id", "created_at"),
        Index("ix_submissions_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Submission {self.id} status={self.status}>"
