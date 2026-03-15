from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
from app.services.user_service import register_user, login_user
from app.services.forgot_password_service import handle_forgot_password, verify_otp, reset_password
from app.utils.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user_data)


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, user_data.email, user_data.password)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/forgot-password")
def forgot_password_endpoint(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return handle_forgot_password(db, data.email)


@router.post("/verify-otp")
def verify_otp_endpoint(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    return verify_otp(db, data.email, data.otp)


@router.post("/reset-password")
def reset_password_endpoint(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    return reset_password(db, data.email, data.otp, data.new_password)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
