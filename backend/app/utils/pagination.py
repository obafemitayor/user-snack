from pydantic import BaseModel
from typing import List, TypeVar, Generic
from fastapi import Query

T = TypeVar('T')

class PaginationParams:
    """Pagination parameters for endpoints."""
    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number (starts from 1)"),
        limit: int = Query(10, ge=1, le=100, description="Number of items per page (max 100)")
    ):
        self.page = page
        self.limit = limit
        self.skip = (page - 1) * limit

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
    has_next: bool
    has_prev: bool

    @classmethod
    def create(cls, items: List[T], total: int, page: int, limit: int):
        """Create a paginated response."""
        pages = (total + limit - 1) // limit  # Ceiling division
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1
        )
