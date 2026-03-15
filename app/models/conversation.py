from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # We use foreign_keys to distinguish the users
    user1 = relationship("User", foreign_keys=[user1_id], backref="conversations_started")
    user2 = relationship("User", foreign_keys=[user2_id], backref="conversations_received")
    
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
