from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class ExchangeSchedule(Base):
    __tablename__ = "exchange_schedules"

    id = Column(Integer, primary_key=True, index=True)
    exchange_request_id = Column(Integer, ForeignKey("exchange_requests.id"), nullable=False, unique=True)
    proposed_by_id = Column(Integer, ForeignKey("users.id"), nullable=False, default=1)
    pickup_or_delivery = Column(String, nullable=False)
    location = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    time_slot = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    exchange_request = relationship("ExchangeRequest", backref="schedule")
