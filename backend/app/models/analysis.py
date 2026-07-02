"""Analysis model."""
import uuid
import enum
from sqlalchemy import DateTime, ForeignKey, Text, Enum
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class AnalysisStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    api_config_id: Mapped[str | None] = mapped_column(CHAR(36), ForeignKey("api_configs.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[AnalysisStatus] = mapped_column(Enum(AnalysisStatus), default=AnalysisStatus.pending, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[str | None] = mapped_column(DateTime(timezone=False), nullable=True)
    completed_at: Mapped[str | None] = mapped_column(DateTime(timezone=False), nullable=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=False), server_default=func.now())

    project = relationship("Project", backref="analyses")
    user = relationship("User", backref="analyses")
    api_config = relationship("ApiConfig", backref="analyses")

    report = relationship("AnalysisReport", back_populates="analysis", uselist=False)
    trace = relationship("ExecutionTrace", back_populates="analysis", uselist=False)
