"""API config model."""
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import CHAR, VARBINARY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base


class ApiConfig(Base):
    __tablename__ = "api_configs"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(CHAR(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(100), nullable=False)
    base_url = Column(String(512), nullable=False)
    encrypted_api_key = Column(VARBINARY(512), nullable=False)
    encryption_iv = Column(VARBINARY(32), nullable=False)
    model_name = Column(String(100), nullable=False)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=False), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", backref="api_configs")
