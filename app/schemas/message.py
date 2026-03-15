from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class MessageBase(BaseModel):
    message_text: str = Field(..., min_length=1)


class MessageCreate(MessageBase):
    conversation_id: Optional[int] = None
    recipient_id: Optional[int] = None  # Used to start a new thread if conversation_id is blank


class MessageOut(MessageBase):
    id: int
    conversation_id: int
    sender_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    created_at: datetime
    # We could embed the last message or user info here if needed
    last_message: Optional[MessageOut] = None

    model_config = {"from_attributes": True}
