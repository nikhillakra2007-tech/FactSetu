"""FACTSETU — feedback table."""

import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import FeedbackType


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    verification_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("verifications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 1-5
    feedback_type: Mapped[FeedbackType | None] = mapped_column(
        Enum(FeedbackType, name="feedback_type_enum", native_enum=False, validate_strings=True), nullable=True
    )
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="feedback")
    verification: Mapped["Verification"] = relationship("Verification", back_populates="feedback")

    __table_args__ = (
        Index("ix_feedback_user", "user_id"),
        Index("ix_feedback_verification", "verification_id"),
    )

    def __repr__(self) -> str:
        return f"<Feedback {self.id} type={self.feedback_type} rating={self.rating}>"
