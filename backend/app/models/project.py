"""Project model."""
import uuid
import hashlib
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import CHAR, MEDIUMTEXT
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=True, comment="Project name")
    title = Column(String(255), nullable=True, comment="Optional title")
    language = Column(String(20), nullable=False)
    source_code = Column(MEDIUMTEXT, nullable=False)
    source_hash = Column(String(64), nullable=False, comment="SHA-256 of source_code")
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=False), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", backref="projects")

    @staticmethod
    def compute_hash(source_code: str) -> str:
        return hashlib.sha256(source_code.encode("utf-8")).hexdigest()
