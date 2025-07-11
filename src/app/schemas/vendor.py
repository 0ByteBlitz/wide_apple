from typing import List

from pydantic import BaseModel

from .fruit import VendorInventorySchema

class VendorSchema(BaseModel):
    id: int
    name: str
    species: str
    home_dimension: str
    inventory_items: List[VendorInventorySchema]

    class Config:
        from_attributes = True