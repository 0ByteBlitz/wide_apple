from pydantic import BaseModel
from typing import List, Optional

class FruitSchema(BaseModel):
    id: int
    name: str
    flavor_profile: str
    dimension_origin: str
    rarity_level: int
    base_value: float
    photo_url: Optional[str] = None

    class Config:
        from_attributes = True

class VendorInventorySchema(BaseModel):
    fruit_id: int
    quantity: int
    fruit: FruitSchema

    class Config:
        from_attributes = True 

class FruitPriceSchema(BaseModel):
    id: int
    fruit_id: int
    date: str  # ISO date string (YYYY-MM-DD)
    price: float

    class Config:
        from_attributes = True

class FruitPriceListSchema(BaseModel):
    prices: List[FruitPriceSchema] 