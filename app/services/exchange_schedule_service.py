from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.exchange_schedule import ExchangeSchedule
from app.models.exchange_request import ExchangeRequest
from app.models.product import Product
from app.models.user import User
from app.schemas.exchange_schedule import ExchangeScheduleCreate
from app.services.notification_service import create_notification


def create_exchange_schedule(db: Session, schedule_in: ExchangeScheduleCreate, user_id: int) -> ExchangeSchedule:
    # Verify the exchange request exists and is accepted
    req = db.query(ExchangeRequest).filter(ExchangeRequest.id == schedule_in.exchange_request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Exchange request not found")
        
    if req.status != "accepted":
        raise HTTPException(status_code=400, detail="Cannot schedule an exchange that has not been accepted")
        
    # Verify the user is either the requester or the original owner
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if user_id != req.requested_by and user_id != product.owner_id:
        raise HTTPException(status_code=403, detail="You are not authorized to schedule this exchange")
        
    # Check if a schedule already exists
    existing = db.query(ExchangeSchedule).filter(ExchangeSchedule.exchange_request_id == req.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Schedule already exists for this exchange")
        
    schedule = ExchangeSchedule(
        exchange_request_id=req.id,
        pickup_or_delivery=schedule_in.pickup_or_delivery,
        location=schedule_in.location,
        date=schedule_in.date,
        time_slot=schedule_in.time_slot,
        description=schedule_in.description,
        status="pending"
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    
    # Notify the other party
    other_party = req.requested_by if user_id == product.owner_id else product.owner_id
    create_notification(
        db=db,
        user_id=other_party,
        type="exchange_scheduled",
        message=f"Pickup scheduled for '{product.title}' at {schedule.location} on {schedule.date} ({schedule.time_slot}). Waiting for your approval.",
        related_id=schedule.id
    )
    
    return schedule

def get_schedules_for_user(db: Session, user_id: int):
    # Fetch all schedules where the user is either the requester or the product owner
    return db.query(ExchangeSchedule).join(
        ExchangeRequest, ExchangeSchedule.exchange_request_id == ExchangeRequest.id
    ).join(
        Product, ExchangeRequest.product_id == Product.id
    ).filter(
        (ExchangeRequest.requested_by == user_id) | (Product.owner_id == user_id)
    ).all()

def update_schedule_status(db: Session, schedule_id: int, user_id: int, status: str):
    schedule = db.query(ExchangeSchedule).filter(ExchangeSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    req = db.query(ExchangeRequest).filter(ExchangeRequest.id == schedule.exchange_request_id).first()
    product = db.query(Product).filter(Product.id == req.product_id).first()
    
    # Only allow the other party to modify it? Well, anyone involved can accept/reject, but usually it's the receiver.
    if user_id != req.requested_by and user_id != product.owner_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    schedule.status = status
    db.commit()
    db.refresh(schedule)
    
    # Notify the other party
    other_party = req.requested_by if user_id == product.owner_id else product.owner_id
    create_notification(
        db=db,
        user_id=other_party,
        type="exchange_scheduled",
        message=f"Schedule for '{product.title}' has been {status}!",
        related_id=schedule.id
    )
    
    return schedule
