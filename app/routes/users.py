from fastapi import APIRouter, Depends, Query, File, UploadFile
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserOut
from app.schemas.product import ProductListResponse
from app.schemas.favorite import FavoriteListResponse
from app.schemas.exchange_request import ExchangeRequestOut
from app.services.user_dashboard_service import (
    get_user_profile,
    get_user_products,
    get_user_favorites,
    get_user_exchange_requests,
    upload_profile_image,
    get_public_profile
)
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users & Dashboard"])


@router.get("/me", response_model=UserOut)
def read_user_profile(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return get_user_profile(current_user)


from app.utils.cloudinary_upload import upload_image

@router.post("/profile-image", response_model=UserOut)
async def update_profile_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a new profile picture."""
    url = await upload_image(file)
    return upload_profile_image(db, current_user, url)


@router.get("/me/products", response_model=ProductListResponse)
def read_user_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all products posted by the current user."""
    return get_user_products(db, current_user.id, page, limit)


@router.get("/me/favorites", response_model=FavoriteListResponse)
def read_user_favorites(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all products favorited by the current user."""
    return get_user_favorites(db, current_user.id, page, limit)


@router.get("/me/exchange-requests", response_model=list[ExchangeRequestOut])
def read_user_exchange_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get exchange requests sent by the user AND received for their products."""
    return get_user_exchange_requests(db, current_user.id)


@router.get("/{user_id}", response_model=UserOut)
def read_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get a public user profile."""
    return get_public_profile(db, user_id)
