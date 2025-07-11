from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from src.app.models.fruit import VendorInventory, Fruit
from src.app.models.vendor import Vendor

def get_all_vendors(db: Session, species: Optional[str] = None, offset: int = 0, limit: int = 10) -> List[Vendor]:
    query = db.query(Vendor)
    if species is not None:
        query = query.filter(Vendor.species == species)
    return query.offset(offset).limit(limit).all()

def get_popular_vendors(db: Session, limit: int = 5):
    # Join Vendor, VendorInventory, and Fruit to calculate popularity
    subq = (
        db.query(
            Vendor.id.label('vendor_id'),
            func.sum(VendorInventory.quantity * Fruit.rarity_level).label('popularity_score')
        )
        .join(VendorInventory, Vendor.id == VendorInventory.vendor_id)
        .join(Fruit, VendorInventory.fruit_id == Fruit.id)
        .group_by(Vendor.id)
        .order_by(func.sum(VendorInventory.quantity * Fruit.rarity_level).desc())
        .limit(limit)
        .subquery()
    )
    # Get the actual Vendor objects, ordered by popularity
    vendors = (
        db.query(Vendor)
        .join(subq, Vendor.id == subq.c.vendor_id)
        .order_by(subq.c.popularity_score.desc())
        .all()
    )
    return vendors 