"""
App configuration via pydantic-settings.
Reads from .env file and environment variables.
"""
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, model_validator


_env_path = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(default="")

    # JWT
    SECRET_KEY: str = Field(default="")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AES Encryption (base64-encoded 32-byte key)
    ENCRYPTION_KEY: str = Field(default="")

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Sandbox
    SANDBOX_TIMEOUT: int = 10

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v

    LOG_LEVEL: str = "INFO"

    model_config = {
        "env_file": str(_env_path),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }

    @model_validator(mode="after")
    def check_required(self):
        missing = []
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")
        if not self.SECRET_KEY:
            missing.append("SECRET_KEY")
        if not self.ENCRYPTION_KEY:
            missing.append("ENCRYPTION_KEY")
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}. "
                f"Please check backend/.env."
            )
        return self


settings = Settings()