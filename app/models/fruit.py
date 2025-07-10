from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship, backref
from app.database import Base

class VendorInventory(Base):
    __tablename__ = "vendor_inventory"

    id = Column(Integer, primary_key=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    fruit_id = Column(Integer, ForeignKey("fruits.id"))
    quantity = Column(Integer)

    fruit = relationship("Fruit", backref="inventory_items")
    vendor = relationship("Vendor", backref="inventory_items")

class Fruit(Base):
    __tablename__ = "fruits"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    flavor_profile = Column(String)
    dimension_origin = Column(String)
    rarity_level = Column(Integer)
    base_value = Column(Float) 