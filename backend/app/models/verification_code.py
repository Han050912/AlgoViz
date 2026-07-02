"""Password reset verification code model."""
import uuid
from datetime import timedelta
from sqlalchemy import String, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.models.base import Base


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id: Mapped[str] = mapped_column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[str] = mapped_column(
        DateTime(timezone=False),
        server_default=func.now(),
        nullable=False,
    )
    created_at: Mapped[str] = mapped_column(DateTime(timezone=False), server_default=func.now())

    def is_expired(self) -> bool:
        import datetime as _dt
        return _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None) >= self.expires_at

    def is_valid(self) -> bool:
        return not self.used and not self.is_expired()
