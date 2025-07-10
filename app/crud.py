import random

from sqlalchemy.orm import Session
from app.models import Fruit, Vendor, VendorInventory
from datetime import datetime, timedelta

def get_all_fruits(db: Session):
    return db.query(Fruit).all()

def get_all_vendors(db: Session):
    return db.query(Vendor).all()

def perform_trade(db: Session, from_id: int, to_id: int, fruit_id: int, quantity: int):
    from_inv = db.query(VendorInventory).filter_by(vendor_id=from_id, fruit_id=fruit_id).first()
    if from_inv is None or from_inv.quantity < quantity:
        raise ValueError("Insufficient stock")

    to_inv = db.query(VendorInventory).filter_by(vendor_id=to_id, fruit_id=fruit_id).first()

    # transfer stock
    from_inv.quantity -= quantity
    if to_inv:
        to_inv.quantity += quantity
    else:
        to_inv = VendorInventory(vendor_id=to_id, fruit_id=fruit_id, quantity=quantity)
        db.add(to_inv)

    # calculate tax based on rarity level
    fruit = db.query(Fruit).filter_by(id=fruit_id).first()
    tax = (fruit.base_value * quantity) * (fruit.rarity_level / 10.0)
    total_cost = (fruit.base_value * quantity) + tax

    db.commit()
    return {
        "fruit": fruit.name,
        "quantity": quantity,
        "base_value": fruit.base_value,
        "tax": tax,
        "total_cost": total_cost
    }

def get_price_trend(db: Session, fruit_name: str):
    fruit = db.query(Fruit).filter_by(name=fruit_name).first()
    if not fruit:
        return None

    base = fruit.base_value
    today = datetime.today()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    prices = []
    for day in days:
        fluctuation = random.uniform(-0.2, 0.2)  # ±20%
        price = round(base + base * fluctuation, 2)
        prices.append({"date": day.strftime("%Y-%m-%d"), "price": price})

    return {"fruit": fruit_name, "base_value": base, "trend": prices}