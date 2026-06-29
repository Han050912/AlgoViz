"""Analysis report model (1:1 with analyses)."""
import uuid
from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.mysql import CHAR, MEDIUMTEXT
from sqlalchemy.orm import relationship
from app.models.base import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(CHAR(36), ForeignKey("analyses.id", ondelete="CASCADE"), unique=True, nullable=False)
    algorithm_type = Column(String(100), nullable=True)
    time_complexity = Column(String(50), nullable=True)
    space_complexity = Column(String(50), nullable=True)
    markdown_content = Column(MEDIUMTEXT, nullable=True)
    metadata_json = Column(JSON, nullable=True)

    analysis = relationship("Analysis", back_populates="report")
