# app/api/users.py
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Order
from app.api.deps import get_current_user
from app.schemas import UserResponse, UserCreate, SubscriptionCreate, PasswordChange, OrderResponse
from app.services.user_service import user_service
from app.core.security import verify_password, get_password_hash
from app.api.orders import enrich_order_response # We will define this helper below

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(User).all()

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.delete("/{user_id}")
def remove_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Not authorized")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Simple delete logic (Service layer could handle cascade logic if complex)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Manual cascade for safety (though DB cascade usually handles this)
    db.query(Order).filter(Order.owner_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.get("/me/qrcodes", response_model=Dict[str, str])
def get_my_qr(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    filename = user_service.get_or_create_qr(db, current_user)
    return {"user_qr": f"/qr_codes/{filename}"}

# --- Subscriptions ---
@router.post("/{user_id}/subscribe", response_model=UserResponse)
def subscribe_user(
    user_id: str,
    sub_in: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user_service.handle_subscription(db, user, sub_in.plan)

@router.put("/me/subscribe", response_model=UserResponse)
def self_subscribe(
    sub_in: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return user_service.handle_subscription(db, current_user, sub_in.plan)

# --- Password Change ---
@router.put("/me/password")
def change_password(
    pwd_in: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.password or not verify_password(pwd_in.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.password = get_password_hash(pwd_in.new_password)
    db.commit()
    return {"message": "Password updated"}

@router.get("/{user_id}/active-orders", response_model=List[OrderResponse])
def get_user_active_orders(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Not authorized")

    orders = db.query(Order).filter(Order.owner_id == user_id).all()
    # Filter for active items logic
    active_orders = [o for o in orders if any(i.status != "picked_up" for i in o.items)]
    
    return [enrich_order_response(o) for o in active_orders]