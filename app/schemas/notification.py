from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationBase(BaseModel):
    type: str
    message: str
    related_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationOut(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
