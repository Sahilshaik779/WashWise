# app/api/auth.py
from datetime import timedelta, datetime, timezone
from typing import Any
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth

from app.db.session import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.api import deps
# CHANGED: Added UserCreate, UserResponse to imports
from app.schemas import UserLogin, Token, PasswordResetRequest, PasswordReset, UserCreate, UserResponse
from app.db.models import User
from app.services.notification_service import notification_service
# CHANGED: Added this import which was missing causing the 500 error
from app.services.user_service import user_service

router = APIRouter()

# --- Google OAuth Setup ---
oauth = OAuth()
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'},
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET
)

# --- NEW: Registration Endpoint ---
@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, user_in)

@router.post("/login", response_model=dict)
def login(user_in: UserLogin, db: Session = Depends(get_db)) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.username == user_in.username).first()
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    return {
        "access_token": create_access_token(user.username, user.role, user.id),
        "role": user.role,
        "user_id": user.id,
        "token_type": "bearer"
    }

@router.get("/login/google")
async def login_google(request: Request):
    """
    Redirects user to Google Login page.
    """
    redirect_uri = request.url_for('auth_google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback", name="auth_google_callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Callback from Google. Creates/Links user and logs them in.
    """
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        # Redirect to frontend with error
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/?error=oauth_failed")

    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="No user info from Google")

    google_id = user_info['sub']
    email = user_info['email']

    # 1. Check if user exists by Google ID
    user = db.query(User).filter(User.google_id == google_id).first()
    
    # 2. If not, check by email (and link accounts)
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            db.commit()
    
    # 3. If still no user, create a new one
    if not user:
        base_username = email.split('@')[0].replace('.', '_')
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{counter}"
            counter += 1
            
        user = User(
            username=username,
            email=email,
            google_id=google_id,
            role="customer", # Default role for Google Sign-in
            monthly_services_used={}
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. Generate Token
    access_token = create_access_token(user.username, user.role, user.id)

    # 5. Redirect to Frontend with Cookies
    response = RedirectResponse(url=f"{settings.FRONTEND_URL}/google-callback")
    response.set_cookie(
        key="auth_token", 
        value=access_token, 
        httponly=False, # Must be False so frontend JS can read it
        max_age=30,     # Short life, just for transfer
        samesite="lax"
    )
    response.set_cookie(
        key="user_role", 
        value=user.role, 
        httponly=False,
        max_age=30,
        samesite="lax"
    )
    return response

@router.post("/forgot-password")
def forgot_password(
    request: PasswordResetRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """
    Triggers a password reset email if the user exists.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
        db.commit()
        
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        subject = "Your WashWise Password Reset Request"
        html_content = (
            f"<p>Hi {user.username},</p>"
            f"<p>Click <a href='{reset_link}'>here</a> to reset your password.</p>"
            f"<p>Link expires in 15 minutes.</p>"
        )
        # Use the notification service we created
        background_tasks.add_task(
            notification_service.send_email, 
            user.email, 
            subject, 
            html_content
        )
        
    # Always return success to prevent email enumeration attacks
    return {"message": "If an account with that email exists, a password reset link has been sent."}

@router.post("/reset-password")
def reset_password(request: PasswordReset, db: Session = Depends(get_db)):
    """
    Completes the password reset process.
    """
    user = db.query(User).filter(User.reset_token == request.token).first()
    if not user or not user.reset_token_expiry:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    if user.reset_token_expiry.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expired")

    user.password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    
    return {"message": "Password has been reset successfully."}