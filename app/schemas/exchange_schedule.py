from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class ExchangeScheduleBase(BaseModel):
    pickup_or_delivery: str
    location: str
    date: date
    time_slot: str


class ExchangeScheduleCreate(ExchangeScheduleBase):
    exchange_request_id: int


class ExchangeScheduleOut(ExchangeScheduleBase):
    id: int
    exchange_request_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
