# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Customer, StatusEnum, User
from schemas import CustomerCreate, CustomerResponse, UserCreate, UserLogin
from crud import create_customer, update_status, get_customers_by_owner
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from utils import generate_qr
import os

# Create QR codes directory
os.makedirs("qr_codes", exist_ok=True)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Laundry Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/qr_codes", StaticFiles(directory="qr_codes"), name="qr_codes")

# ----------------------
# Authentication Endpoints
# ----------------------

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"username": db_user.username, "role": db_user.role}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": db_user.username, "role": db_user.role, "id": db_user.id})
    return {"access_token": token, "role": db_user.role}

@app.get("/users")
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can list users")
    return db.query(User).all()

# ----------------------
# Customer Endpoints
# ----------------------

@app.post("/customers", response_model=CustomerResponse)
def add_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only serviceman can add orders
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can add orders")

    # Fetch the customer user
    owner = db.query(User).filter(User.username == customer.customer_username, User.role == "customer").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Customer user not found")

    # Check if customer already has an active order
    existing_order = db.query(Customer).filter(
        Customer.owner_id == owner.id,
        Customer.status.in_(["pending", "started", "washed", "dried", "ready_for_pickup"])
    ).first()
    
    if existing_order:
        raise HTTPException(
            status_code=400, 
            detail=f"Customer {customer.customer_username} already has an active order (ID: {existing_order.id}). Complete current order first."
        )

    # Create the customer order
    print(f"Creating order for customer: {customer.customer_username}")  # Debug log
    db_customer = create_customer(db, customer, owner_id=owner.id)
    
    # ✅ FIXED: Generate QR code immediately after creating customer
    print(f"Generating QR code for order ID: {db_customer.id}")  # Debug log
    qr_path = generate_qr(db_customer.id)
    
    if qr_path:
        print(f"✅ QR code generated successfully: {qr_path}")
        # Update the qr_code_path in database
        db_customer.qr_code_path = qr_path
        db.commit()
        db.refresh(db_customer)
    else:
        print(f"❌ Failed to generate QR code for order: {db_customer.id}")
    
    # Set QR code URL for response
    db_customer.qr_code_url = f"/qr_codes/{db_customer.id}.png"
    
    return db_customer

@app.get("/customers", response_model=list[CustomerResponse])
def list_customers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "customer":
        customers = db.query(Customer).filter(Customer.owner_id == current_user.id).all()
    else:
        customers = db.query(Customer).all()
    
    for c in customers:
        c.qr_code_url = f"/qr_codes/{c.id}.png"
        # ✅ ADDED: Check if QR file actually exists
        qr_file_path = f"qr_codes/{c.id}.png"
        if not os.path.exists(qr_file_path):
            print(f"⚠️ QR file missing for order {c.id}, generating now...")
            generate_qr(c.id)
    
    return customers

@app.get("/customers/me", response_model=list[CustomerResponse])
def my_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can view their orders")
    
    customers = get_customers_by_owner(db, owner_id=current_user.id)
    
    for c in customers:
        c.qr_code_url = f"/qr_codes/{c.id}.png"
        # ✅ ADDED: Check if QR file actually exists and generate if missing
        qr_file_path = f"qr_codes/{c.id}.png"
        if not os.path.exists(qr_file_path):
            print(f"⚠️ QR file missing for order {c.id}, generating now...")
            generate_qr(c.id)
    
    return customers

@app.put("/customers/qr/{customer_id}/status", response_model=CustomerResponse)
def update_customer_status_by_qr(
    customer_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can update status")
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Auto-advance to next status
    status_order = ["pending", "started", "washed", "dried", "ready_for_pickup", "picked_up"]
    try:
        current_index = status_order.index(customer.status)
        if current_index < len(status_order) - 1:
            next_status = status_order[current_index + 1]
            customer.status = StatusEnum(next_status)
            db.commit()
            db.refresh(customer)
        else:
            raise HTTPException(status_code=400, detail="Order is already at final status")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid current status")
    
    customer.qr_code_url = f"/qr_codes/{customer.id}.png"
    return customer

@app.put("/customers/{customer_id}/status", response_model=CustomerResponse)
def update_customer_status(customer_id: str, status: StatusEnum, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Added current_user dependency for security
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can update status")
        
    customer = update_status(db, customer_id, status)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.qr_code_url = f"/qr_codes/{customer.id}.png"
    return customer

@app.put("/change-password")
def change_password(
    password_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Both current and new passwords are required")
    
    # Verify current password
    if not verify_password(current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    # Hash and update new password
    hashed_password = get_password_hash(new_password)
    current_user.password = hashed_password
    db.commit()
    
    return {"message": "Password changed successfully"}

# -----------------
# 🚨 THIS IS THE FIX 🚨
# -----------------
@app.get("/customers/qr/{customer_id}", response_model=CustomerResponse)
def get_customer_by_qr(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Added 'current_user' dependency to ensure this is a protected endpoint
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.qr_code_url = f"/qr_codes/{customer.id}.png"
    return customer

@app.post("/generate-missing-qr")
def generate_missing_qr_codes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can generate QR codes")
    
    customers = db.query(Customer).all()
    generated_count = 0
    
    for customer in customers:
        qr_file_path = f"qr_codes/{customer.id}.png"
        if not os.path.exists(qr_file_path):
            result = generate_qr(customer.id)
            if result:
                generated_count += 1
                print(f"Generated QR for order: {customer.id}")
    
    return {"message": f"Generated {generated_count} missing QR codes"}