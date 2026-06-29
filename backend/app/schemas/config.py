"""Pydantic schemas for API config management."""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ConfigCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=100)
    base_url: str = Field(..., min_length=1, max_length=512)
    api_key: str = Field(..., min_length=1)
    model_name: str = Field(..., min_length=1, max_length=100)


class ConfigUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=100)
    base_url: Optional[str] = Field(None, min_length=1, max_length=512)
    api_key: Optional[str] = Field(None, min_length=1)
    model_name: Optional[str] = Field(None, min_length=1, max_length=100)


class ConfigOut(BaseModel):
    id: str
    label: str
    base_url: str
    model_name: str
    is_default: bool
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ConfigTestResult(BaseModel):
    ok: bool
    message: str
