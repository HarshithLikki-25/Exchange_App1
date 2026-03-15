from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.exchange_request import RequestStatus


class ExchangeRequestBase(BaseModel):
    message: str = Field(..., min_length=10, max_length=500)


class ExchangeRequestCreate(ExchangeRequestBase):
    product_id: int
    offered_product_id: Optional[int] = None


class ExchangeRequestOut(ExchangeRequestBase):
    id: int
    product_id: int
    requested_by: int
    offered_product_id: Optional[int] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
