"""FACTSETU — sources registry (trusted source catalog)."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import SourceType


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    domain: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    base_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    source_type: Mapped[SourceType] = mapped_column(
        Enum(SourceType, name="source_type_enum", native_enum=False, validate_strings=True),
        nullable=False,
        default=SourceType.other,
        server_default=SourceType.other.value,
    )
    trust_level: Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")
    # Extended authority fields
    authority_level: Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")
    country: Mapped[str] = mapped_column(String(10), nullable=False, default="IN", server_default="IN")
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="en", server_default="en")
    is_trusted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="1")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="1")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # One source can provide many evidence snippets + documents
    evidence: Mapped[list["Evidence"]] = relationship("Evidence", back_populates="source", lazy="selectin")
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="source", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Source {self.name} ({self.domain}) trust={self.trust_level}>"
