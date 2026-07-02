"""Project model."""
import uuid
import hashlib
from sqlalchemy import String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.mysql import CHAR, MEDIUMTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True, comment="Project name")
    title: Mapped[str | None] = mapped_column(String(255), nullable=True, comment="Optional title")
    language: Mapped[str] = mapped_column(String(20), nullable=False)
    source_code: Mapped[str] = mapped_column(MEDIUMTEXT, nullable=False)
    source_hash: Mapped[str] = mapped_column(String(64), nullable=False, comment="SHA-256 of source_code")
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=False), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(
        DateTime(timezone=False), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", backref="projects")

    @staticmethod
    def compute_hash(source_code: str) -> str:
        return hashlib.sha256(source_code.encode("utf-8")).hexdigest()
