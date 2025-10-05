from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from models import MembershipPlanEnum

# --- NEW: Service-specific workflows ---
SERVICE_WORKFLOWS = {
    "wash_and_fold": ["pending", "started", "washing", "folding", "ready_for_pickup", "picked_up"],
    "wash_and_iron": ["pending", "started", "washing", "ironing", "ready_for_pickup", "picked_up"],
    "premium_wash": ["pending", "started", "inspection", "pre_treatment", "washing", "drying", "quality_check", "ready_for_pickup", "picked_up"],
    "dry_cleaning": ["pending", "started", "tagging", "pre_treatment", "dry_cleaning", "pressing", "finishing", "ready_for_pickup", "picked_up"],
    "steam_iron": ["pending", "started", "steaming", "pressing", "finishing", "ready_for_pickup", "picked_up"]
}

# --- Service Pricing with Per-Unit Costs (keys must match workflows) ---
SERVICE_PRICES = {
    "wash_and_fold": {"name": "Wash and Fold", "price": 10},
    "wash_and_iron": {"name": "Wash and Iron", "price": 25},
    "dry_cleaning": {"name": "Dry Cleaning", "price": 50},
    "premium_wash": {"name": "Premium Wash", "price": 40},
    "steam_iron": {"name": "Steam Iron", "price": 15},
}

# --- Schema for updating a status ---
class StatusUpdate(BaseModel):
    status: str

# --- Schemas for Creating an Order ---
class ServiceOrderItemCreate(BaseModel):
    service_name: str
    quantity: int = Field(..., gt=0, le=20)

class OrderCreate(BaseModel):
    customer_username: str
    services: List[ServiceOrderItemCreate]

# --- NEW: Schema for creating an order from a QR scan ---
class QrOrderCreate(BaseModel):
    qr_data: str
    quantity: int = Field(..., gt=0, le=20)

# --- Schemas for API Responses ---
class OrderItemResponse(BaseModel):
    id: str
    service_name: str
    quantity: int
    cost: float
    status: str
    possible_next_statuses: List[str] = []

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    owner_id: str
    created_at: datetime
    total_cost: float
    payment_status: str
    is_covered_by_plan: bool
    qr_code_url: Optional[str] = None
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

# --- User and Subscription Schemas ---
class SubscriptionCreate(BaseModel):
    plan: MembershipPlanEnum

class UserCreate(BaseModel):
    username: str
    email: EmailStr
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
    membership_plan: MembershipPlanEnum
    membership_expiry_date: Optional[datetime] = None
    services_used_this_month: int

    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str