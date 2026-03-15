from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.exchange_request import ExchangeRequestCreate, ExchangeRequestOut
from app.services.exchange_service import create_exchange_request, get_exchange_requests, update_exchange_status
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/exchange-requests", tags=["Exchange Requests"])


@router.post("", response_model=ExchangeRequestOut, status_code=201)
def send_exchange_request(
    request_data: ExchangeRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_exchange_request(db, request_data, current_user.id)


@router.get("", response_model=list[ExchangeRequestOut])
def list_exchange_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_exchange_requests(db, current_user.id)


@router.patch("/{request_id}", response_model=ExchangeRequestOut)
def change_exchange_status(
    request_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept or reject an exchange request (only owner)."""
    return update_exchange_status(db, request_id, current_user.id, status)
