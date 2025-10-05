from sqlalchemy import Column, String, Integer, Enum as SAEnum, DateTime, ForeignKey, Float, Boolean
from sqlalchemy import JSON
from sqlalchemy.orm import relationship
from database import Base
import enum
import uuid
from datetime import datetime
from datetime import datetime, timezone

class MembershipPlanEnum(str, enum.Enum):
    none = "none"
    standard = "standard"
    premium = "premium"

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    
    orders = relationship("Order", back_populates="owner")

    # --- Subscription Fields ---
    membership_plan = Column(SAEnum(MembershipPlanEnum), default=MembershipPlanEnum.none)
    membership_expiry_date = Column(DateTime(timezone=True), nullable=True)
    services_used_this_month = Column(Integer, default=0)
    static_qr_codes = Column(JSON, nullable=True)

# New Order table to handle the overall order
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

# OrderItem now stores status as a simple string, validated by business logic.
class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id"))
    service_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    cost = Column(Float, default=0.0)
    status = Column(String(50), nullable=False, default="pending")

    order = relationship("Order", back_populates="items") 
