from sqlalchemy.orm import Session
from src.app.models.fruit import VendorInventory, Fruit

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
    if fruit is None:
        raise ValueError("Fruit not found")
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