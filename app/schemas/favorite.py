from pydantic import BaseModel
from datetime import datetime
from typing import List
from app.schemas.product import ProductOut


class FavoriteOut(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class FavoriteListResponse(BaseModel):
    total: int
    results: List[ProductOut]
