"""Common response schemas."""
from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")


# Define a unified API response format
class APIResponse(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None
