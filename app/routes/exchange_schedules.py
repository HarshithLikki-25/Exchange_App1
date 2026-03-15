from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.exchange_schedule import ExchangeScheduleCreate, ExchangeScheduleOut
from app.services.exchange_schedule_service import create_exchange_schedule
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/exchange-schedule", tags=["Exchange Schedule"])


@router.post("", response_model=ExchangeScheduleOut, status_code=201)
def schedule_exchange(
    schedule_data: ExchangeScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a schedule/pickup for an accepted exchange."""
    return create_exchange_schedule(db, schedule_data, current_user.id)

@router.get("", response_model=list[ExchangeScheduleOut])
def get_user_schedules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all scheduled exchanges for the current user."""
    from app.services.exchange_schedule_service import get_schedules_for_user
    return get_schedules_for_user(db, current_user.id)

@router.patch("/{schedule_id}/status", response_model=ExchangeScheduleOut)
def update_status(
    schedule_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept or reject a proposed schedule."""
    from app.services.exchange_schedule_service import update_schedule_status
    return update_schedule_status(db, schedule_id, current_user.id, status)
