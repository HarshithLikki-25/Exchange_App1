from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from app.models.product import Product
from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteOut, FavoriteListResponse


def add_favorite(db: Session, user_id: int, product_id: int) -> FavoriteOut:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    favorite = Favorite(user_id=user_id, product_id=product_id)
    try:
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        return favorite
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is already in your favorites"
        )


def remove_favorite(db: Session, user_id: int, product_id: int) -> dict:
    favorite = db.query(Favorite).filter(
        Favorite.user_id == user_id,
        Favorite.product_id == product_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Favorite not found"
        )
        
    db.delete(favorite)
    db.commit()
    return {"message": "Product removed from favorites"}


def get_user_favorites(db: Session, user_id: int) -> FavoriteListResponse:
    # Query all products that the user has favorited
    products = (
        db.query(Product)
        .join(Favorite, Favorite.product_id == Product.id)
        .filter(Favorite.user_id == user_id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    
    return FavoriteListResponse(
        total=len(products),
        results=products
    )
