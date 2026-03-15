from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    college = Column(String, nullable=True)
    location = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reset_otp = Column(String, nullable=True)
    reset_otp_expires = Column(DateTime, nullable=True)

    products = relationship("Product", back_populates="owner", cascade="all, delete-orphan")
    exchange_requests = relationship("ExchangeRequest", back_populates="requester", cascade="all, delete-orphan")
