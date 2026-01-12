# app/repositories/order_repo.py
from sqlalchemy.orm import Session
from app.db.models import Order, OrderItem
from app.schemas import OrderCreate

class OrderRepository:
    def create(self, db: Session, order: Order) -> Order:
        db.add(order)
        db.commit()
        db.refresh(order)
        return order

    def add_items(self, db: Session, items: list[OrderItem]):
        db.add_all(items)
        db.commit()

    def get_by_owner(self, db: Session, owner_id: str):
        return db.query(Order).filter(Order.owner_id == owner_id).order_by(Order.created_at.desc()).all()

    def get_by_id(self, db: Session, order_id: str):
        return db.query(Order).filter(Order.id == order_id).first()
    def get_item_by_id(self, db: Session, item_id: str):
        return db.query(OrderItem).filter(OrderItem.id == item_id).first()

order_repo = OrderRepository()