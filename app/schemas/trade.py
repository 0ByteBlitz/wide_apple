from pydantic import BaseModel

class TradeRequest(BaseModel):
    from_vendor_id: int
    to_vendor_id: int
    fruit_id: int
    quantity: int 