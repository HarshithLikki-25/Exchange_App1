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
