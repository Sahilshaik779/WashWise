# app/services/user_service.py
from sqlalchemy.orm import Session, attributes
from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
import secrets

from app.db.models import User, MembershipPlanEnum
from app.schemas import UserCreate, SubscriptionCreate
from app.core.security import get_password_hash
from app.schemas.utils import generate_qr  # Keep your existing utils.py
from app.services.notification_service import notification_service

class UserService:
    def create_user(self, db: Session, user_in: UserCreate) -> User:
        if db.query(User).filter(User.username == user_in.username).first():
            raise HTTPException(400, "Username taken")
        if db.query(User).filter(User.email == user_in.email).first():
            raise HTTPException(400, "Email already exists")

        db_user = User(
            username=user_in.username,
            email=user_in.email,
            password=get_password_hash(user_in.password),
            role=user_in.role,
            monthly_services_used={}
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def handle_subscription(self, db: Session, user: User, plan: MembershipPlanEnum) -> User:
        user.membership_plan = plan
        if plan != MembershipPlanEnum.none:
            user.membership_expiry_date = datetime.now(timezone.utc) + timedelta(days=365)
            # Reset usage when upgrading/renewing
            user.monthly_services_used = {}
        else:
            user.membership_expiry_date = None
        
        # Ensure changes to JSON field are tracked
        attributes.flag_modified(user, "monthly_services_used")
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def get_or_create_qr(self, db: Session, user: User) -> str:
        """Returns the filename of the user's static QR code."""
        if user.static_qr_codes and "user_qr_filename" in user.static_qr_codes:
            return user.static_qr_codes["user_qr_filename"]

        filename = f"user_{user.id}.png"
        qr_path = generate_qr(data={"user_id": user.id}, filename=filename)
        
        if qr_path:
            user.static_qr_codes = {"user_qr_filename": filename}
            attributes.flag_modified(user, "static_qr_codes")
            db.add(user)
            db.commit()
            return filename
        return None

    def request_password_reset(self, db: Session, email: str, frontend_url: str):
        user = db.query(User).filter(User.email == email).first()
        if user:
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
            db.commit()
            
            reset_link = f"{frontend_url}/reset-password?token={token}"
            subject = "WashWise Password Reset"
            html = f"<a href='{reset_link}'>Click here to reset your password</a>"
            notification_service.send_email(user.email, subject, html)

user_service = UserService()