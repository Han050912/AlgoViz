"""Execution trace model (1:1 with analyses)."""
import uuid
from sqlalchemy import String, ForeignKey, JSON
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class ExecutionTrace(Base):
    __tablename__ = "execution_traces"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("analyses.id", ondelete="CASCADE"), unique=True, nullable=False)
    execution_mode: Mapped[str | None] = mapped_column(String(20), nullable=True, comment="sandbox or ai_simulated")
    trace_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    environment_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    analysis = relationship("Analysis", back_populates="trace")
