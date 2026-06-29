"""Execution trace model (1:1 with analyses)."""
import uuid
from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship
from app.models.base import Base


class ExecutionTrace(Base):
    __tablename__ = "execution_traces"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(CHAR(36), ForeignKey("analyses.id", ondelete="CASCADE"), unique=True, nullable=False)
    execution_mode = Column(String(20), nullable=True, comment="sandbox or ai_simulated")
    trace_data = Column(JSON, nullable=True)
    environment_info = Column(JSON, nullable=True)

    analysis = relationship("Analysis", back_populates="trace")
