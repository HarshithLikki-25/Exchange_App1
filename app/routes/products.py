from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Literal
from app.database import get_db
from app.schemas.product import ProductCreate, ProductOut, ProductListResponse
from app.services.product_service import (
    create_product,
    get_all_products,
    get_product_by_id,
    delete_product
)
from app.utils.auth import get_current_user
from app.utils.cloudinary_upload import upload_image
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductOut, status_code=201)
async def add_product(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    condition: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new product listing. Optionally upload an image to Cloudinary."""
    image_url = None
    if image and image.filename:
        image_url = await upload_image(image)

    product_data = ProductCreate(
        title=title,
        description=description,
        category=category,
        condition=condition,
        image_url=image_url
    )
    return create_product(db, product_data, current_user.id)


@router.get("", response_model=ProductListResponse)
def list_products(
    search: Optional[str] = Query(None, description="Search by title or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    condition: Optional[str] = Query(None, description="Filter by condition (e.g. Good, Used)"),
    latitude: Optional[float] = Query(None, description="User's latitude for distance filtering"),
    longitude: Optional[float] = Query(None, description="User's longitude for distance filtering"),
    radius: Optional[float] = Query(None, description="Search radius in kilometers"),
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(10, ge=1, le=50, description="Results per page (max 50)"),
    sort: Literal["newest", "oldest"] = Query("newest", description="Sort by creation time"),
    db: Session = Depends(get_db)
):
    """
    Browse all product listings.
    Supports search, category/condition filtering, pagination, and sorting.
    """
    return get_all_products(db, search=search, category=category, condition=condition,
                            page=page, limit=limit, sort=sort)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID."""
    return get_product_by_id(db, product_id)


@router.delete("/{product_id}")
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete your own product listing."""
    return delete_product(db, product_id, current_user.id)
