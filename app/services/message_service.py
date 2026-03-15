from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate, MessageOut, ConversationOut
from app.services.notification_service import create_notification


def get_conversations(db: Session, user_id: int):
    # Fetch all conversations where user is a participant
    convos = db.query(Conversation).filter(
        or_(Conversation.user1_id == user_id, Conversation.user2_id == user_id)
    ).order_by(Conversation.created_at.desc()).all()
    
    # We want to attach the last message to the Pydantic schema easily
    results = []
    for c in convos:
        last_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.desc()).first()
        c.last_message = last_msg
        results.append(c)
        
    return results


def get_messages(db: Session, user_id: int, conversation_id: int):
    # Validate user is in convo
    convo = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not convo or (convo.user1_id != user_id and convo.user2_id != user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or unauthorized")
        
    return db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()


def send_message(db: Session, sender_id: int, msg_in: MessageCreate):
    if msg_in.conversation_id:
        convo = db.query(Conversation).filter(Conversation.id == msg_in.conversation_id).first()
        if not convo or (convo.user1_id != sender_id and convo.user2_id != sender_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        
        recipient_id = convo.user2_id if convo.user1_id == sender_id else convo.user1_id
    elif msg_in.recipient_id:
        # Check if conversation already exists between these two users
        convo = db.query(Conversation).filter(
            or_(
                (Conversation.user1_id == sender_id) & (Conversation.user2_id == msg_in.recipient_id),
                (Conversation.user1_id == msg_in.recipient_id) & (Conversation.user2_id == sender_id)
            )
        ).first()
        
        if not convo:
            # Create a new conversation
            convo = Conversation(user1_id=sender_id, user2_id=msg_in.recipient_id)
            db.add(convo)
            db.commit()
            db.refresh(convo)
            
        recipient_id = msg_in.recipient_id
    else:
        raise HTTPException(status_code=400, detail="Must provide conversation_id or recipient_id")
        
    new_message = Message(
        conversation_id=convo.id,
        sender_id=sender_id,
        message_text=msg_in.message_text
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # Trigger notification to recipient
    sender_name = db.query(User).filter(User.id == sender_id).first().name
    create_notification(db, recipient_id, 'message', f"New message from {sender_name}", new_message.conversation_id)
    
    return new_message
