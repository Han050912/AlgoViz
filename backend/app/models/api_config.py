"""API config model."""
import uuid
from sqlalchemy import String, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.mysql import CHAR, VARBINARY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class ApiConfig(Base):
    __tablename__ = "api_configs"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    base_url: Mapped[str] = mapped_column(String(512), nullable=False)
    encrypted_api_key: Mapped[bytes] = mapped_column(VARBINARY(512), nullable=False)
    encryption_iv: Mapped[bytes] = mapped_column(VARBINARY(32), nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=False), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(
        DateTime(timezone=False), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", backref="api_configs")
