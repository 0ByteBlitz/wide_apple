import json
from sqlalchemy.orm import Session
from src.app.models import Fruit, Vendor, VendorInventory
from src.app.database import session_local, engine, Base

# Ensure all tables exist
Base.metadata.create_all(bind=engine)

def seed_fruits(db: Session):
    with open("data/fruits.json", "r") as f:
        fruits = json.load(f)
        for fruit in fruits:
            f_obj = Fruit(
                name=fruit["name"],
                flavor_profile=",".join(fruit["flavor_profile"]),
                dimension_origin=fruit["dimension_origin"],
                rarity_level=fruit["rarity_level"],
                base_value=fruit["base_value"]
            )
            db.add(f_obj)
    db.commit()

def seed_vendors(db: Session):
    with open("data/vendors.json", "r") as f:
        vendors = json.load(f)
        for vendor in vendors:
            v_obj = Vendor(
                name=vendor["name"],
                species=vendor["species"],
                home_dimension=vendor["home_dimension"]
            )
            db.add(v_obj)
            db.flush()  # Needed to get v_obj.id before inserting inventory

            for item in vendor["inventory"]:
                fruit = db.query(Fruit).filter_by(name=item["fruit"]).first()
                if fruit:
                    inventory = VendorInventory(
                        vendor_id=v_obj.id,
                        fruit_id=fruit.id,
                        quantity=item["quantity"]
                    )
                    db.add(inventory)
    db.commit()

def run_seed():
    db = session_local()
    seed_fruits(db)
    seed_vendors(db)
    db.close()

if __name__ == "__main__":
    run_seed()
