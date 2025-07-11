from sqlalchemy.orm import Session

from src.app.models.fruit import VendorInventory, Fruit

def perform_trade(db: Session, *, from_id: int, to_id: int, fruit_id: int, quantity: int, trade_type: str, currency_amount: float = None, alien_currency: bool = True):
    fruit = db.query(Fruit).filter_by(id=fruit_id).first()
    if fruit is None:
        raise ValueError("Fruit not found")
    # Calculate base value in alien currency if needed
    base_value = fruit.base_value
    if alien_currency:
        ALIEN_EXCHANGE_RATE = 3.14
        base_value = base_value * ALIEN_EXCHANGE_RATE
    tax = (base_value * quantity) * (fruit.rarity_level / 10.0)
    total_cost = (base_value * quantity) + tax
    details = {
        "fruit": fruit.name,
        "quantity": quantity,
        "base_value": base_value,
        "tax": tax,
        "total_cost": total_cost,
        "alien_currency": alien_currency
    }
    if trade_type == "send":
        from_inv = db.query(VendorInventory).filter_by(vendor_id=from_id, fruit_id=fruit_id).first()
        if from_inv is None or from_inv.quantity < quantity:
            raise ValueError("Insufficient stock to send")
        to_inv = db.query(VendorInventory).filter_by(vendor_id=to_id, fruit_id=fruit_id).first()
        from_inv.quantity -= quantity
        if to_inv:
            to_inv.quantity += quantity
        else:
            to_inv = VendorInventory(vendor_id=to_id, fruit_id=fruit_id, quantity=quantity)
            db.add(to_inv)
        db.commit()
        return {**details, "trade_type": "send"}
    elif trade_type == "request":
        # B sends fruit to A (A requests, B must have stock)
        from_inv = db.query(VendorInventory).filter_by(vendor_id=to_id, fruit_id=fruit_id).first()
        if from_inv is None or from_inv.quantity < quantity:
            raise ValueError("Requested vendor has insufficient stock")
        to_inv = db.query(VendorInventory).filter_by(vendor_id=from_id, fruit_id=fruit_id).first()
        from_inv.quantity -= quantity
        if to_inv:
            to_inv.quantity += quantity
        else:
            to_inv = VendorInventory(vendor_id=from_id, fruit_id=fruit_id, quantity=quantity)
            db.add(to_inv)
        db.commit()
        return {**details, "trade_type": "request"}
    elif trade_type == "buy":
        # A buys fruit from B for currency
        from_inv = db.query(VendorInventory).filter_by(vendor_id=to_id, fruit_id=fruit_id).first()
        if from_inv is None or from_inv.quantity < quantity:
            raise ValueError("Seller has insufficient stock")
        to_inv = db.query(VendorInventory).filter_by(vendor_id=from_id, fruit_id=fruit_id).first()
        from_inv.quantity -= quantity
        if to_inv:
            to_inv.quantity += quantity
        else:
            to_inv = VendorInventory(vendor_id=from_id, fruit_id=fruit_id, quantity=quantity)
            db.add(to_inv)
        # Currency transfer would be handled here (not modeled)
        db.commit()
        return {**details, "trade_type": "buy", "currency_amount": total_cost}
    elif trade_type == "sell":
        # A sells fruit to B for currency
        from_inv = db.query(VendorInventory).filter_by(vendor_id=from_id, fruit_id=fruit_id).first()
        if from_inv is None or from_inv.quantity < quantity:
            raise ValueError("Seller has insufficient stock")
        to_inv = db.query(VendorInventory).filter_by(vendor_id=to_id, fruit_id=fruit_id).first()
        from_inv.quantity -= quantity
        if to_inv:
            to_inv.quantity += quantity
        else:
            to_inv = VendorInventory(vendor_id=to_id, fruit_id=fruit_id, quantity=quantity)
            db.add(to_inv)
        # Currency transfer would be handled here (not modeled)
        db.commit()
        return {**details, "trade_type": "sell", "currency_amount": total_cost}
    else:
        raise ValueError("Invalid trade_type") 