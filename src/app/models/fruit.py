from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship, backref
from src.app.database import Base

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

class FruitPrice(Base):
    __tablename__ = "fruit_prices"
    id = Column(Integer, primary_key=True)
    fruit_id = Column(Integer, ForeignKey("fruits.id"), nullable=False)
    date = Column(String, nullable=False)  # ISO date string (YYYY-MM-DD)
    price = Column(Float, nullable=False)

    fruit = relationship("Fruit", backref=backref("historical_prices", cascade="all, delete-orphan")) 