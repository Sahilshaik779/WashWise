from sqlalchemy.orm import Session
from models import User, Order, OrderItem, MembershipPlanEnum
from schemas import OrderCreate, ServiceOrderItemCreate, SERVICE_PRICES, SERVICE_WORKFLOWS

from datetime import datetime, timezone
def create_order(db: Session, order_data: OrderCreate, owner: User):
    """
    Creates a new order, calculates costs based on the owner's subscription plan,
    and creates the associated service items.
    """
    total_cost = 0.0
    is_fully_covered = True
    services_to_cover = 0
    
    if owner.membership_plan != MembershipPlanEnum.none and owner.membership_expiry_date and owner.membership_expiry_date.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
        services_left_on_plan = 4 - owner.services_used_this_month
        if services_left_on_plan > 0:
            services_to_cover = services_left_on_plan

    db_order = Order(owner_id=owner.id, payment_status="unpaid")
    db.add(db_order)
    db.flush()

    services_used_in_this_order = 0
    for item_data in order_data.services:
        service_info = SERVICE_PRICES[item_data.service_name]
        item_cost = service_info["price"] * item_data.quantity
        item_is_covered = False

        if services_to_cover > 0:
            is_eligible = False
            if owner.membership_plan == MembershipPlanEnum.premium:
                is_eligible = True
            elif owner.membership_plan == MembershipPlanEnum.standard and item_data.service_name in ["wash_and_fold", "wash_and_iron"]:
                is_eligible = True
            
            if is_eligible:
                item_cost = 0.0
                item_is_covered = True
                services_to_cover -= 1
                services_used_in_this_order += 1
        
        if not item_is_covered:
            is_fully_covered = False

        total_cost += item_cost
        initial_status = SERVICE_WORKFLOWS.get(item_data.service_name, ["pending"])[0]
        
        db_item = OrderItem(
            order_id=db_order.id,
            service_name=item_data.service_name,
            quantity=item_data.quantity,
            cost=item_cost,
            status=initial_status
        )
        db.add(db_item)

    db_order.total_cost = total_cost
    db_order.is_covered_by_plan = is_fully_covered
    
    if total_cost == 0.0:
        db_order.payment_status = "paid"
    
    if services_used_in_this_order > 0:
        owner.services_used_this_month += services_used_in_this_order
    
    return db_order

def get_orders_by_owner(db: Session, owner_id: str):
    return db.query(Order).filter(Order.owner_id == owner_id).all()

def get_order_by_id(db: Session, order_id: str):
    return db.query(Order).filter(Order.id == order_id).first()
    
def get_order_item_by_id(db: Session, item_id: str):
    return db.query(OrderItem).filter(OrderItem.id == item_id).first()

def get_all_orders(db: Session):
    return db.query(Order).all()

def update_order_item_status(db: Session, item_id: str, status: str):
    order_item = db.query(OrderItem).filter(OrderItem.id == item_id).first()
    if not order_item:
        return None
    order_item.status = status
    db.commit()
    db.refresh(order_item)
    return order_item