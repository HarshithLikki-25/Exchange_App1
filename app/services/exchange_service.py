from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.exchange_request import ExchangeRequest
from app.models.product import Product
from app.models.user import User
from app.schemas.exchange_request import ExchangeRequestCreate
from app.services.notification_service import create_notification


def create_exchange_request(db: Session, request_data: ExchangeRequestCreate, user_id: int) -> ExchangeRequest:
    product = db.query(Product).filter(Product.id == request_data.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if product.owner_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot request an exchange on your own product"
        )
        
    if request_data.offered_product_id:
        offered = db.query(Product).filter(Product.id == request_data.offered_product_id).first()
        if not offered or offered.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Offered product must belong to you"
            )

    # Prevent duplicate pending requests
    existing = db.query(ExchangeRequest).filter(
        ExchangeRequest.product_id == request_data.product_id,
        ExchangeRequest.requested_by == user_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already sent an exchange request for this product"
        )

    exchange_req = ExchangeRequest(
        product_id=request_data.product_id,
        requested_by=user_id,
        offered_product_id=request_data.offered_product_id,
        message=request_data.message,
        status="pending"
    )
    db.add(exchange_req)
    db.commit()
    db.refresh(exchange_req)
    
    # Notify product owner
    requester_name = db.query(User).filter(User.id == user_id).first().name
    request_type = "exchange" if request_data.offered_product_id else "direct purchase"
    create_notification(
        db=db,
        user_id=product.owner_id,
        type="exchange_request",
        message=f"{requester_name} has sent a {request_type} request for your item '{product.title}'.",
        related_id=exchange_req.id
    )
    
    return exchange_req


def get_exchange_requests(db: Session, user_id: int) -> list[ExchangeRequest]:
    """Return all exchange requests related to the current user (as sender or product owner)."""
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


def update_exchange_status(db: Session, request_id: int, user_id: int, next_status: str) -> ExchangeRequest:
    """Accept or reject an exchange request. Only the product owner can do this."""
    req = db.query(ExchangeRequest).filter(ExchangeRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if product.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Only the product owner can change the status")
        
    if next_status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    req.status = next_status
    db.commit()
    db.refresh(req)
    
    # Notify requester
    create_notification(
        db=db,
        user_id=req.requested_by,
        type="exchange_accepted" if next_status == "accepted" else "exchange_rejected",
        message=f"Your exchange request for '{product.title}' was {next_status}.",
        related_id=req.id
    )
    
    return req
