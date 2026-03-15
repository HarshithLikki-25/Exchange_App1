from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
class ProductBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ProductCreate(ProductBase):
    image_url: Optional[str] = None


class ProductOut(ProductBase):
    id: int
    image_url: Optional[str] = None
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Paginated product listing response."""
    page: int
    limit: int
    total: int
    results: List[ProductOut]
