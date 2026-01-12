# app/services/order_service.py
from sqlalchemy.orm import Session, attributes
from fastapi import HTTPException 
from app.repositories.order_repo import order_repo
from app.db.models import User, Order, OrderItem, MembershipPlanEnum
from app.schemas import OrderCreate, SERVICE_PRICES, SERVICE_WORKFLOWS
from datetime import datetime, timezone

# --- CHANGED: Added missing import ---
from app.services.notification_service import notification_service

class OrderService:
    def create_order(self, db: Session, order_data: OrderCreate, owner: User) -> Order:
        """
        Handles the business logic of creating an order:
        1. Checks subscription validity.
        2. Calculates costs (applying discounts).
        3. Updates usage counters.
        4. Saves to DB via Repository.
        """
        total_cost = 0.0
        is_fully_covered = True
        
        is_active_subscription = (
            owner.membership_plan != MembershipPlanEnum.none and 
            owner.membership_expiry_date and 
            owner.membership_expiry_date.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc)
        )

        if owner.monthly_services_used is None:
            owner.monthly_services_used = {}

        # Prepare Order Object (but don't save yet)
        db_order = Order(owner_id=owner.id, payment_status="unpaid")
        
        # Save order first to generate ID
        db_order = order_repo.create(db, db_order)
        
        order_items = []

        for item_data in order_data.services:
            service_info = SERVICE_PRICES.get(item_data.service_name)
            if not service_info:
                raise ValueError(f"Invalid service: {item_data.service_name}")
                
            item_cost = service_info["price"] * item_data.quantity
            item_is_covered = False

            # --- Business Rule: Subscription Logic ---
            if is_active_subscription:
                current_usage = owner.monthly_services_used.get(item_data.service_name, 0)
                if current_usage < 4:
                    is_eligible = False
                    if owner.membership_plan == MembershipPlanEnum.premium:
                        is_eligible = True
                    elif owner.membership_plan == MembershipPlanEnum.standard and item_data.service_name in ["wash_and_fold", "wash_and_iron"]:
                        is_eligible = True
                    
                    if is_eligible:
                        item_cost = 0.0
                        item_is_covered = True
                        owner.monthly_services_used[item_data.service_name] = current_usage + 1
            
            if not item_is_covered:
                is_fully_covered = False

            total_cost += item_cost
            initial_status = SERVICE_WORKFLOWS.get(item_data.service_name, ["pending"])[0]
            
            new_item = OrderItem(
                order_id=db_order.id,
                service_name=item_data.service_name,
                quantity=item_data.quantity,
                cost=item_cost,
                status=initial_status
            )
            order_items.append(new_item)

        # Update Order Totals
        db_order.total_cost = total_cost
        db_order.is_covered_by_plan = is_fully_covered
        if total_cost == 0.0:
            db_order.payment_status = "paid"

        # Persist everything
        order_repo.add_items(db, order_items)
        
        # Flag user as modified to save JSON updates
        if is_active_subscription:
            attributes.flag_modified(owner, "monthly_services_used")
            db.add(owner)
            db.commit()
            
        db.commit()
        db.refresh(db_order)
        return db_order

    def process_payment(self, db: Session, order_id: str, user_id: str):
        order = order_repo.get_by_id(db, order_id)
        if not order:
            raise HTTPException(404, "Order not found")
        if order.owner_id != user_id:
            raise HTTPException(403, "Not your order")
        
        order.payment_status = "paid"
        db.commit()
        db.refresh(order)
        return order

    def update_item_status(self, db: Session, item_id: str, new_status: str):
        # 1. Get Item
        item = order_repo.get_item_by_id(db, item_id)
        if not item: 
            raise HTTPException(404, "Item not found")

        # 2. Validate Workflow
        workflow = SERVICE_WORKFLOWS.get(item.service_name)
        if new_status not in workflow:
            raise HTTPException(400, f"Invalid status {new_status}")
            
        # 3. Update DB
        item.status = new_status
        db.commit()
        
        # 4. Send Email Notification
        # (This line was failing before because of missing import)
        owner = item.order.owner
        subject = f"Order Update: {item.service_name}"
        body = f"Your service status is now: <b>{new_status}</b>"
        notification_service.send_email(owner.email, subject, body)
        
        return item

order_service = OrderService()