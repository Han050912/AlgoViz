"""Analysis report model (1:1 with analyses)."""
import uuid
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.dialects.mysql import CHAR, MEDIUMTEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("analyses.id", ondelete="CASCADE"), unique=True, nullable=False)
    algorithm_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    time_complexity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    space_complexity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    markdown_content: Mapped[str | None] = mapped_column(MEDIUMTEXT, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    analysis = relationship("Analysis", back_populates="report")