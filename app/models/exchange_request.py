from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum as py_enum
from app.database import Base


class RequestStatus(str, py_enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class ExchangeRequest(Base):
    __tablename__ = "exchange_requests"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    offered_product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    message = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, accepted, rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # We use foreign_keys to distinguish the two relationships to the same Product table
    target_product = relationship("Product", foreign_keys=[product_id], backref="received_requests")
    offered_product = relationship("Product", foreign_keys=[offered_product_id])
    requester = relationship("User", backref="sent_requests")
