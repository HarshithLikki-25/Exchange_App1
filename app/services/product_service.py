from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from fastapi import HTTPException, status
from typing import Optional, Literal
from sqlalchemy import or_, and_, desc, asc
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductListResponse
import math


def create_product(db: Session, product_data: ProductCreate, owner_id: int) -> Product:
    product = Product(
        title=product_data.title,
        description=product_data.description,
        category=product_data.category,
        condition=product_data.condition,
        image_url=product_data.image_url,
        latitude=product_data.latitude,
        longitude=product_data.longitude,
        owner_id=owner_id
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


from app.models.user import User

def get_all_products(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    condition: Optional[str] = None,
    location: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    latitude: float = None,
    longitude: float = None,
    radius: float = None,
    sort: str = "newest"
) -> ProductListResponse:
    """
    Retrieve products with optional search, category/condition filters,
    pagination, and sort order.
    """
    query = db.query(Product)

    # --- Search: case-insensitive match on title or description ---
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Product.title).like(search_term),
                func.lower(Product.description).like(search_term)
            )
        )

    # --- Category filter ---
    if category:
        query = query.filter(func.lower(Product.category) == category.lower())

    # --- Condition filter ---
    if condition:
        query = query.filter(Product.condition.ilike(f"%{condition}%"))
        
    # --- Location Text filter ---
    if location:
        query = query.join(User).filter(User.location.ilike(f"%{location}%"))
        
    # Bounding Box Location Filtering
    if latitude is not None and longitude is not None and radius:
        # 1 degree of latitude is ~111km
        lat_delta = radius / 111.0
        # 1 degree of longitude is ~111km * cos(latitude)
        lng_delta = radius / (111.0 * math.cos(math.radians(latitude)))
        
        query = query.filter(
            and_(
                Product.latitude >= (latitude - lat_delta),
                Product.latitude <= (latitude + lat_delta),
                Product.longitude >= (longitude - lng_delta),
                Product.longitude <= (longitude + lng_delta)
            )
        )
        
    # Python-side highly accurate filtering is skipped for DB simplicity,
    # the bounding box is good enough for a college marketplace.

    # --- Total count (before pagination) ---
    total = query.count()

    # --- Sorting ---
    if sort == "oldest":
        query = query.order_by(Product.created_at.asc())
    else:  # default: newest
        query = query.order_by(Product.created_at.desc())

    # --- Pagination ---
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    return ProductListResponse(
        page=page,
        limit=limit,
        total=total,
        results=products
    )


def get_product_by_id(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


def delete_product(db: Session, product_id: int, current_user_id: int) -> dict:
    product = get_product_by_id(db, product_id)
    if product.owner_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this product"
        )
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
