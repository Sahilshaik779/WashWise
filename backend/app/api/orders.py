# app/api/orders.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Order, OrderItem
from app.api.deps import get_current_user
from app.schemas import OrderResponse, OrderCreate, OrderItemResponse, StatusUpdate, SERVICE_WORKFLOWS
from app.services.order_service import order_service
from app.repositories.order_repo import order_repo

router = APIRouter()

# --- Helper Function (Copied logic from your main.py) ---
def enrich_order_response(order: Order) -> Order:
    """Adds frontend-specific fields like qr_code_url and possible statuses."""
    if order.qr_code_path:
        order.qr_code_url = f"/qr_codes/{order.qr_code_path}"
        
    for item in order.items:
        workflow = SERVICE_WORKFLOWS.get(item.service_name, [])
        try:
            current_index = workflow.index(item.status)
            item.possible_next_statuses = workflow[current_index + 1:]
        except (ValueError, IndexError):
            item.possible_next_statuses = []
    return order

@router.post("/", response_model=OrderResponse)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    owner = db.query(User).filter(User.username == order_in.customer_username).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Customer not found")

    new_order = order_service.create_order(db, order_in, owner)
    
    # Generate QR (Service layer handles this internally or we call util here)
    # Assuming service.create_order handles it, otherwise call your util here
    
    return enrich_order_response(new_order)

@router.get("/", response_model=List[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "customer":
        orders = order_repo.get_by_owner(db, current_user.id)
    else:
        # Admin sees all
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        
    return [enrich_order_response(o) for o in orders]

@router.get("/qr/{order_id}", response_model=OrderResponse)
def get_order_by_qr(
    order_id: str,
    db: Session = Depends(get_db)
):
    order = order_repo.get_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return enrich_order_response(order)

@router.put("/{order_id}/pay", response_model=OrderResponse)
def pay_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Logic moved to service, passing IDs for validation
    order = order_service.process_payment(db, order_id, current_user.id)
    return enrich_order_response(order)

@router.put("/items/{item_id}/status", response_model=OrderItemResponse)
def update_status(
    item_id: str,
    status_update: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    updated_item = order_service.update_item_status(db, item_id, status_update.status)
    
    # We need to re-enrich the item (specifically for possible_next_statuses)
    # A quick way is to fetch the parent order and find the item
    return enrich_order_response(updated_item.order).items[0] # Simplified logic