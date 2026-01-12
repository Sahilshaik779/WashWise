from sqlalchemy import Column, String, Integer, Enum as SAEnum, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
import enum
import uuid
from datetime import datetime, timezone

# --- CHANGED: Import Base from the new dedicated file ---
# Old: from database import Base
from app.db.base import Base 

class MembershipPlanEnum(str, enum.Enum):
    none = "none"
    standard = "standard"
    premium = "premium"

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=True) 
    role = Column(String(20), nullable=False)
    
    google_id = Column(String(255), nullable=True, unique=True, index=True)
    
    orders = relationship("Order", back_populates="owner")

    # --- Subscription Fields ---
    membership_plan = Column(SAEnum(MembershipPlanEnum), default=MembershipPlanEnum.none)
    membership_expiry_date = Column(DateTime(timezone=True), nullable=True)
    monthly_services_used = Column(JSON, nullable=True)
    
    static_qr_codes = Column(JSON, nullable=True)

    # --- Password Reset ---
    reset_token = Column(String(255), nullable=True, unique=True, index=True)
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)


class Order(Base):
    __tablename__ = "orders"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    total_cost = Column(Float, default=0.0)
    payment_status = Column(String(20), default="unpaid")
    is_covered_by_plan = Column(Boolean, default=False)
    qr_code_path = Column(String(255), nullable=True)
    
    owner = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"))
    service_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    cost = Column(Float, default=0.0)
    status = Column(String(50), nullable=False, default="pending")

    order = relationship("Order", back_populates="items")