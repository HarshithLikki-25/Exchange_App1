from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.favorite import FavoriteOut, FavoriteListResponse
from app.services.favorite_service import add_favorite, remove_favorite, get_user_favorites
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post("/{product_id}", response_model=FavoriteOut, status_code=201)
def add_to_favorites(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a product to your favorites/wishlist."""
    return add_favorite(db, current_user.id, product_id)


@router.delete("/{product_id}", status_code=200)
def remove_from_favorites(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a product from your favorites."""
    return remove_favorite(db, current_user.id, product_id)


@router.get("", response_model=FavoriteListResponse)
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all products in your favorites/wishlist."""
    return get_user_favorites(db, current_user.id)
