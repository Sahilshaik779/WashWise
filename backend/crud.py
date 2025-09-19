# crud.py
from sqlalchemy.orm import Session
from models import Customer, StatusEnum
from schemas import CustomerCreate

def create_customer(db: Session, customer: CustomerCreate, owner_id: str):
    db_customer = Customer(
        name=f"Order for {customer.customer_username}",  # ✅ FIXED: Better naming
        clothes_count=customer.clothes_count,
        owner_id=owner_id
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customers_by_owner(db: Session, owner_id: str):
    return db.query(Customer).filter(Customer.owner_id == owner_id).all()

def update_status(db: Session, customer_id: str, status: StatusEnum):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return None
    customer.status = status
    db.commit()
    db.refresh(customer)
    return customer

# ✅ ADDED: Get all customers (for serviceman)
def get_all_customers(db: Session):
    return db.query(Customer).all()

# ✅ ADDED: Get customer by ID
def get_customer_by_id(db: Session, customer_id: str):
    return db.query(Customer).filter(Customer.id == customer_id).first()