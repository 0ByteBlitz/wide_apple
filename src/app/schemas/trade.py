from typing import Optional

from pydantic import BaseModel

class TradeRequest(BaseModel):
    from_vendor_id: int
    to_vendor_id: int
    fruit_id: int
    quantity: int
    trade_type: str  # 'send', 'request', 'buy', 'sell'
    currency_amount: Optional[float] = None  # For buy/sell
    alien_currency: bool = True

class TradeResponse(BaseModel):
    status: str
    trade_type: str
    from_vendor_id: int
    to_vendor_id: int
    fruit_id: int
    quantity: int
    currency_amount: Optional[float] = None
    alien_currency: bool
    details: dict 