from pydantic import BaseModel
from typing import List

class FruitSchema(BaseModel):
    id: int
    name: str
    flavor_profile: str
    dimension_origin: str
    rarity_level: int
    base_value: float

    class Config:
        orm_mode = True

class VendorInventorySchema(BaseModel):
    fruit_id: int
    quantity: int
    fruit: FruitSchema

    class Config:
        orm_mode = True

class VendorSchema(BaseModel):
    id: int
    name: str
    species: str
    home_dimension: str
    inventory_items: List[VendorInventorySchema]

    class Config:
        orm_mode = True

class TradeRequest(BaseModel):
    from_vendor_id: int
    to_vendor_id: int
    fruit_id: int
    quantity: int