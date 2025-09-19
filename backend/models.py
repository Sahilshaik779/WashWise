from sqlalchemy import Column, String, Integer, Enum, DateTime, ForeignKey
import enum
import uuid
from database import Base
from datetime import datetime

class StatusEnum(str, enum.Enum):
    pending = "pending"
    started = "started"
    washed = "washed"
    dried = "dried"
    ready_for_pickup = "ready_for_pickup"
    picked_up = "picked_up"


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    qr_code_path = Column(String(255))
    clothes_count = Column(Integer, default=1)
    monthly_usage = Column(Integer, default=0)
    owner_id = Column(String(36), ForeignKey("users.id"))  # link to User table
