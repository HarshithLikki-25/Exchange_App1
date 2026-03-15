from sqlalchemy.orm import Session
from app.models.user import User
from app.models.product import Product
from app.models.exchange_request import ExchangeRequest
from app.models.favorite import Favorite
from app.schemas.product import ProductListResponse
from app.schemas.favorite import FavoriteListResponse
from app.schemas.exchange_request import ExchangeRequestOut
from app.utils.cloudinary_upload import upload_image
from fastapi import UploadFile, HTTPException, status


def get_user_profile(user: User) -> User:
    """Return the authenticated user's profile information."""
    return user


def get_public_profile(db: Session, user_id: int) -> User:
    """Return a public profile for any user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def upload_profile_image(db: Session, user: User, file: UploadFile) -> User:
    """Upload profile image to Cloudinary and update user."""
    url = upload_image(file)
    user.profile_image_url = url
    db.commit()
    db.refresh(user)
    return user


def get_user_products(db: Session, user_id: int, page: int = 1, limit: int = 10) -> ProductListResponse:
    """Return products owned by the authenticated user with pagination."""
    query = db.query(Product).filter(Product.owner_id == user_id).order_by(Product.created_at.desc())
    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    return ProductListResponse(
        page=page,
        limit=limit,
        total=total,
        results=products
    )


def get_user_favorites(db: Session, user_id: int, page: int = 1, limit: int = 10) -> FavoriteListResponse:
    """Return products favorited by the authenticated user with pagination."""
    # Note: FavoriteListResponse currently only takes total and results, 
    # but we can add pagination manually or just stick to the schema.
    # The schema for FavoriteListResponse currently lacks page/limit, but we can return total/results.
    query = (
        db.query(Product)
        .join(Favorite, Favorite.product_id == Product.id)
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
    )
    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    return FavoriteListResponse(
        total=total,
        results=products
    )


def get_user_exchange_requests(db: Session, user_id: int) -> list[ExchangeRequest]:
    """
    Return all exchange requests related to the user:
    - Requests they sent
    - Requests received for their products
    """
    return (
        db.query(ExchangeRequest)
        .join(Product, ExchangeRequest.product_id == Product.id)
        .filter(
            (ExchangeRequest.requested_by == user_id) |
            (Product.owner_id == user_id)
        )
        .order_by(ExchangeRequest.created_at.desc())
        .all()
    )
