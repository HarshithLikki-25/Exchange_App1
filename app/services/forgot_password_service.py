import random
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.models.user import User

def generate_otp() -> str:
    """Generate a 4-digit numeric OTP."""
    return f"{random.randint(1000, 9999)}"

def send_otp_email(email: str, otp: str):
    """
    Simulate sending an email.
    In a real app, integrate with SendGrid, Mailgun, or FastAPI-Mail.
    """
    print("\n" + "="*50)
    print(f"EMAIL SENT TO: {email}")
    print(f"SUBJECT: Your CampusXchange Password Reset OTP")
    print(f"MESSAGE: Your 4-digit code is: {otp}")
    print(f"This code will expire in 10 minutes.")
    print("="*50 + "\n")

def handle_forgot_password(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # For security, we might not want to disclose if an email exists
        # But for an MVP, this is fine
        raise HTTPException(status_code=404, detail="User not found")
    
    otp = generate_otp()
    user.reset_otp = otp
    user.reset_otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    db.commit()
    send_otp_email(email, otp)
    return {"message": "OTP sent to your email"}

def verify_otp(db: Session, email: str, otp: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or user.reset_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if user.reset_otp_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    
    return {"message": "OTP verified successfully"}

def reset_password(db: Session, email: str, otp: str, new_password: str):
    from app.utils.auth import hash_password
    
    user = db.query(User).filter(User.email == email).first()
    if not user or user.reset_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if user.reset_otp_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired")
    
    user.password = hash_password(new_password)
    user.reset_otp = None
    user.reset_otp_expires = None
    
    db.commit()
    return {"message": "Password reset successful"}
