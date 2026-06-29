"""Analysis model."""
import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base


class AnalysisStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(CHAR(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    api_config_id = Column(CHAR(36), ForeignKey("api_configs.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.pending, nullable=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=False), nullable=True)
    completed_at = Column(DateTime(timezone=False), nullable=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

    project = relationship("Project", backref="analyses")
    user = relationship("User", backref="analyses")
    api_config = relationship("ApiConfig", backref="analyses")
    report = relationship("AnalysisReport", back_populates="analysis", uselist=False)
    trace = relationship("ExecutionTrace", back_populates="analysis", uselist=False)
