from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from database import Base, engine, get_db
from models import Customer, StatusEnum, User
from schemas import CustomerCreate, CustomerResponse, UserCreate, UserLogin, UserResponse
from crud import create_customer, update_status, get_customers_by_owner
from auth import get_current_user, create_access_token, verify_password, get_password_hash
from utils import generate_qr
import os
from dotenv import load_dotenv
# from email_utils import send_status_update_email # Ensure you have this file and function

# Load environment variables
load_dotenv()

os.makedirs("qr_codes", exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Laundry Manager")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/qr_codes", StaticFiles(directory="qr_codes"), name="qr_codes")

# --- Authentication Endpoints ---

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username, 
        email=user.email,
        password=hashed_password, 
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"username": db_user.username, "role": db_user.role, "email": db_user.email}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": db_user.username, "role": db_user.role, "id": db_user.id})
    return {"access_token": token, "role": db_user.role}

@app.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can list users")
    return db.query(User).all()

# --- Customer Endpoints ---

@app.post("/customers", response_model=CustomerResponse)
def add_customer(customer: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can add orders")
    owner = db.query(User).filter(User.username == customer.customer_username, User.role == "customer").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Customer user not found")
    existing_order = db.query(Customer).filter(Customer.owner_id == owner.id, Customer.status.in_(["pending", "started", "washed", "dried", "ready_for_pickup"])).first()
    if existing_order:
        raise HTTPException(status_code=400, detail=f"Customer {customer.customer_username} already has an active order.")
    db_customer = create_customer(db, customer, owner_id=owner.id)
    qr_path = generate_qr(db_customer.id)
    if qr_path:
        db_customer.qr_code_path = qr_path
        db.commit()
        db.refresh(db_customer)
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
        if not os.path.exists(f"qr_codes/{c.id}.png"):
            generate_qr(c.id)
    return customers

@app.get("/customers/me", response_model=list[CustomerResponse])
def my_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can view their orders")
    customers = get_customers_by_owner(db, owner_id=current_user.id)
    for c in customers:
        c.qr_code_url = f"/qr_codes/{c.id}.png"
        if not os.path.exists(f"qr_codes/{c.id}.png"):
            generate_qr(c.id)
    return customers

@app.put("/customers/{customer_id}/status", response_model=CustomerResponse)
def update_customer_status(customer_id: str, status: StatusEnum, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "serviceman":
        raise HTTPException(status_code=403, detail="Only servicemen can update status")
    customer = update_status(db, customer_id, status)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer.owner and customer.owner.email:
        print(f"Attempting to send email to {customer.owner.email} for order {customer.name}")
        # send_status_update_email(
        #     to_email=customer.owner.email, 
        #     order_name=customer.name, 
        #     new_status=customer.status
        # )
    
    customer.qr_code_url = f"/qr_codes/{customer.id}.png"
    return customer

@app.put("/change-password")
def change_password(password_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # ... (function content remains the same)
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Both current and new passwords are required")
    if not verify_password(current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    hashed_password = get_password_hash(new_password)
    current_user.password = hashed_password
    db.commit()
    return {"message": "Password changed successfully"}

@app.get("/customers/qr/{customer_id}", response_model=CustomerResponse)
def get_customer_by_qr(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # ... (function content remains the same)
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.qr_code_url = f"/qr_codes/{customer.id}.png"
    return customer