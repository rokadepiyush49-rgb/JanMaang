"""Cursor pagination, used by every list endpoint.

Cursor rather than offset because the ranked feeds reorder constantly; offset
paging would show a citizen the same problem twice as ranks shift under them.
"""

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PageParams(BaseModel):
    cursor: str | None = None
    limit: int = Field(default=20, ge=1, le=100)


class Page(BaseModel, Generic[T]):
    items: list[T]
    next_cursor: str | None = None
    has_more: bool = False
