
# 1. ALL IMPORTS 

import os
import json
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from database import Base, engine, get_db
from models import User, MembershipPlanEnum, Order, OrderItem
from schemas import (
    OrderCreate, OrderResponse, UserCreate, UserLogin, UserResponse,
    SubscriptionCreate, SERVICE_PRICES, OrderItemResponse, StatusUpdate,
    SERVICE_WORKFLOWS, PasswordChange, QrOrderCreate, ServiceOrderItemCreate
)
import crud
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from utils import generate_qr


# 2. LOADING .ENV AND DEFINE CONFIGURATIONS
load_dotenv()
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")


# 3. INITIALIZE THE APP (ONLY ONCE)
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Laundry Manager V3")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/qr_codes", StaticFiles(directory="qr_codes"), name="qrcodes")


# 4. DEFINE ALL HELPER FUNCTIONS
def send_status_update_email(email_to: str, username: str, subject: str, body: str):
    api_url = f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages"
    auth = ("api", MAILGUN_API_KEY)
    data = {"from": f"WashWise Notifier <mailgun@{MAILGUN_DOMAIN}>", "to": email_to, "subject": subject, "html": body}
    try:
        response = requests.post(api_url, auth=auth, data=data)
        response.raise_for_status()
        print(f"Email sent successfully to {email_to}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send email: {e}")

def enrich_order_response(order: Order) -> Order:
    if order.qr_code_path:
        order.qr_code_url = f"/{order.qr_code_path}"
        
    for item in order.items:
        workflow = SERVICE_WORKFLOWS.get(item.service_name, [])
        try:
            current_index = workflow.index(item.status)
            if current_index + 1 < len(workflow):
                item.possible_next_statuses = [workflow[current_index + 1]]
            else:
                item.possible_next_statuses = []
        except ValueError:
            item.possible_next_statuses = []
    return order


# 5. DEFINING ALL YOUR API ENDPOINTS / ROUTES
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user_by_username = db.query(User).filter(User.username == user.username).first()
    if existing_user_by_username:
        raise HTTPException(status_code=400, detail="Username is already taken.")

    existing_user_by_email = db.query(User).filter(User.email == user.email).first()
    if existing_user_by_email:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": db_user.username, "role": db_user.role, "id": db_user.id})
    return {"access_token": token, "role": db_user.role, "user_id": db_user.id}

@app.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can list users")
    return db.query(User).all()

@app.get("/users/me/qrcodes", response_model=dict)
def get_or_create_static_qrcodes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.static_qr_codes and "user_qr" in current_user.static_qr_codes:
        return current_user.static_qr_codes
    
    qr_data = {"user_id": current_user.id}
    filename = f"user_{current_user.id}.png"
    qr_path = generate_qr(data=qr_data, filename=filename)
    
    user_qr_codes = {}
    if qr_path:
        user_qr_codes["user_qr"] = f"/{qr_path}"
        current_user.static_qr_codes = user_qr_codes
        flag_modified(current_user, "static_qr_codes")
        db.add(current_user)
        db.commit()
        
    return user_qr_codes


@app.post("/users/{user_id}/subscribe", response_model=UserResponse)
def subscribe_user(user_id: str, subscription: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can manage subscriptions")
    user_to_subscribe = db.query(User).filter(User.id == user_id).first()
    if not user_to_subscribe:
        raise HTTPException(status_code=404, detail="User not found")
    user_to_subscribe.membership_plan = subscription.plan
    if subscription.plan != MembershipPlanEnum.none:
        user_to_subscribe.membership_expiry_date = datetime.utcnow() + timedelta(days=365)
        user_to_subscribe.services_used_this_month = 0
    else:
        user_to_subscribe.membership_expiry_date = None
    db.commit()
    db.refresh(user_to_subscribe)
    return user_to_subscribe

def _generate_and_save_order_qr(order: Order, db: Session):
    qr_data = {"order_id": order.id}
    filename = f"order_{order.id}.png"
    qr_path = generate_qr(data=qr_data, filename=filename)
    if qr_path:
        order.qr_code_path = qr_path
        db.add(order)
        db.commit()
        db.refresh(order)

@app.post("/orders", response_model=OrderResponse)
def add_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can add orders")
    owner = db.query(User).filter(User.username == order_data.customer_username).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Customer user not found")
    for item_data in order_data.services:
        if item_data.service_name not in SERVICE_PRICES:
            raise HTTPException(status_code=400, detail=f"Invalid service name: {item_data.service_name}")
    
    db_order = crud.create_order(db=db, order_data=order_data, owner=owner)
    db.commit()
    db.refresh(db_order)

    _generate_and_save_order_qr(db_order, db)

    return enrich_order_response(db_order)

@app.put("/orders/items/{item_id}/status", response_model=OrderItemResponse)
def update_service_status(item_id: str, status_update: StatusUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can update status")

    item_to_update = crud.get_order_item_by_id(db, item_id)
    if not item_to_update:
        raise HTTPException(status_code=404, detail="Order item not found")
        
    workflow = SERVICE_WORKFLOWS.get(item_to_update.service_name)
    if not workflow:
        raise HTTPException(status_code=400, detail="No workflow defined for this service.")
        
    new_status = status_update.status
    if new_status not in workflow:
        raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}' for this service.")
    
    try:
        current_index = workflow.index(item_to_update.status)
        new_index = workflow.index(new_status)
        if new_index < current_index:
            raise HTTPException(status_code=400, detail="Cannot revert to a previous status.")
    except ValueError:
        raise HTTPException(status_code=400, detail="Status consistency error.")

    updated_item = crud.update_order_item_status(db, item_id, new_status)

    if updated_item:
        order_owner = updated_item.order.owner
        new_status_formatted = updated_item.status.replace('_', ' ').upper()
        service_name_formatted = updated_item.service_name.replace('_', ' ').title()
        subject = f"Your WashWise Order #{updated_item.order.id[:8]} Has Been Updated!"
        html_content = f"""
        <html><body>
            <p>Hi {order_owner.username},</p>
            <p>The status of your <strong>{service_name_formatted}</strong> service is now: <strong>{new_status_formatted}</strong>.</p>
        </body></html>
        """
        background_tasks.add_task(send_status_update_email, order_owner.email, order_owner.username, subject, html_content)

    parent_order = crud.get_order_by_id(db, updated_item.order_id)
    enriched_order = enrich_order_response(parent_order)
    for item in enriched_order.items:
        if item.id == updated_item.id:
            return item
    raise HTTPException(status_code=500, detail="Could not retrieve updated item details.")

@app.get("/orders", response_model=list[OrderResponse])
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        orders = crud.get_orders_by_owner(db, owner_id=current_user.id)
    else:
        orders = crud.get_all_orders(db)
    return [enrich_order_response(order) for order in orders]

@app.get("/orders/qr/{order_id}", response_model=OrderResponse)
def get_order_by_qr(order_id: str, db: Session = Depends(get_db)):
    order = crud.get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return enrich_order_response(order)

@app.get("/users/{user_id}/active-orders", response_model=list[OrderResponse])
def get_user_active_orders(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="You do not have permission to access this resource.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    all_orders = db.query(Order).filter(Order.owner_id == user_id).all()
    active_orders = [order for order in all_orders if any(item.status != "picked_up" for item in order.items)]

    if not active_orders:
        return []

    return [enrich_order_response(order) for order in active_orders]


@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/me/subscribe", response_model=UserResponse)
def purchase_subscription(subscription: SubscriptionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.membership_plan = subscription.plan
    if subscription.plan != MembershipPlanEnum.none:
        current_user.membership_expiry_date = datetime.utcnow() + timedelta(days=365)
        current_user.services_used_this_month = 0
    else:
        current_user.membership_expiry_date = None
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.put("/users/me/password")
def change_user_password(password_data: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(password_data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    new_hashed_password = get_password_hash(password_data.new_password)
    current_user.password = new_hashed_password
    db.add(current_user)
    db.commit()
    return {"message": "Password updated successfully"}