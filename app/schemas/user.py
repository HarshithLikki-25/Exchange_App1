from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    college: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None


class UserOut(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
