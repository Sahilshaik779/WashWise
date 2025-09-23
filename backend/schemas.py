from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from models import StatusEnum

class CustomerCreate(BaseModel):
    customer_username: str
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
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr # Use EmailStr for automatic email validation
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    email: EmailStr

    class Config:
        from_attributes = True