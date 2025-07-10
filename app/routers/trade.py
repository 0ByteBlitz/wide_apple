from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import session_local
from app.schemas.trade import TradeRequest
from app.crud import perform_trade

router = APIRouter()

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

@router.post("/trade")
def trade_route(request: TradeRequest, db: Session = Depends(get_db)):
    try:
        result = perform_trade(
            db,
            from_id=request.from_vendor_id,
            to_id=request.to_vendor_id,
            fruit_id=request.fruit_id,
            quantity=request.quantity
        )
        return {"status": "success", "trade": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
