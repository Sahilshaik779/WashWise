from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models import StatusEnum

class CustomerCreate(BaseModel):
    customer_username: str  # link to an existing customer user
    clothes_count: int

class CustomerResponse(BaseModel):
    id: str
    status: StatusEnum
    name: str
    clothes_count: int
    created_at: datetime
    qr_code_url: Optional[str] = None
    monthly_usage: int
    owner_id: Optional[str] = None
    
    class Config:
        from_attributes = True  # ✅ FIXED: Added this for SQLAlchemy compatibility

class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):  # ✅ ADDED: Response model for user data
    id: str
    username: str
    role: str
    
    class Config:
        from_attributes = True