from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationOut


def get_user_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()


def unread_count(db: Session, user_id: int) -> int:
    return db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).count()


def create_notification(db: Session, user_id: int, type: str, message: str, related_id: int = None):
    notif = Notification(user_id=user_id, type=type, message=message, related_id=related_id)
    db.add(notif)
    db.commit()


def mark_as_read(db: Session, notification_id: int, user_id: int) -> NotificationOut:
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif
