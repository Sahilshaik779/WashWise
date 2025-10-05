# auth.py
import os
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from database import get_db
from models import User
from passlib.context import CryptContext
from dotenv import load_dotenv

# --- Configuration ---
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "a-very-insecure-default-key-for-testing-only") 
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Password Helpers ---
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# --- JWT Helpers ---
def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "role": role}
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Current User Dependency ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = verify_token(token)
        user = db.query(User).filter(User.username == payload["username"]).first()
        if not user:
            print(f"User not found for username: {payload.get('username')}")
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error in get_current_user: {type(e).__name__}: {e}")
        raise HTTPException(status_code=403, detail="Could not validate credentials")