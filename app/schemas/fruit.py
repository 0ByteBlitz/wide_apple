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
        from_attributes = True

class VendorInventorySchema(BaseModel):
    fruit_id: int
    quantity: int
    fruit: FruitSchema

    class Config:
        from_attributes = True 