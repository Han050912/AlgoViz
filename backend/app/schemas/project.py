"""Pydantic schemas for project management."""
from __future__ import annotations
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

SUPPORTED_LANGUAGES = {"python", "javascript", "java", "c", "cpp", "go", "rust"}


class ProjectCreate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    language: str = Field(..., min_length=1, max_length=20)
    source_code: str = Field(..., min_length=1)

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        if v.lower() not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language: {v}. Supported: {', '.join(sorted(SUPPORTED_LANGUAGES))}")
        return v.lower()


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    source_code: Optional[str] = None
    language: Optional[str] = None


class ProjectOut(BaseModel):
    id: str
    name: Optional[str] = None
    language: str
    source_code: str
    source_hash: str
    is_favorite: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
