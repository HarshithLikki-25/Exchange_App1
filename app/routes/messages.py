from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.message import MessageCreate, MessageOut, ConversationOut
from app.services.message_service import get_conversations, get_messages, send_message
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/conversations", response_model=list[ConversationOut])
def read_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for the authenticated user."""
    return get_conversations(db, current_user.id)


@router.get("/{conversation_id}", response_model=list[MessageOut])
def read_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all messages in a specific conversation."""
    return get_messages(db, current_user.id, conversation_id)


@router.post("", response_model=MessageOut)
def create_message(
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a new message to an existing conversation or start a new thread."""
    return send_message(db, current_user.id, msg_in)
