from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.app.auth import decode_token
from src.app.crud.trade import perform_trade
from src.app.database import get_db
from src.app.models.user import User
from src.app.models.vendor import Vendor
from src.app.schemas.trade import TradeRequest, TradeResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter_by(username=token_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post(
    "/trade",
    summary="Initiate a trade (send, request, buy, sell)",
    description="Initiate a trade between vendors. Supports send, request, buy, and sell with alien currency.",
    tags=["Trade"],
    response_model=TradeResponse,
    responses={
        200: {"description": "Trade completed successfully."},
        400: {"description": "Invalid trade request."},
        403: {"description": "Forbidden: You can only trade from your own vendor."}
    },
    response_description="Trade completed successfully."
)
def trade_route(request: TradeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get the vendor for the current user
    vendor = db.query(Vendor).filter_by(user_id=current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=403, detail="User does not have a vendor profile")
    if request.from_vendor_id != vendor.id:
        raise HTTPException(status_code=403, detail="You can only initiate trades from your own vendor")
    try:
        result = perform_trade(
            db,
            from_id=request.from_vendor_id,
            to_id=request.to_vendor_id,
            fruit_id=request.fruit_id,
            quantity=request.quantity,
            trade_type=request.trade_type,
            currency_amount=request.currency_amount,
            alien_currency=request.alien_currency
        )
        return TradeResponse(
            status="success",
            trade_type=request.trade_type,
            from_vendor_id=request.from_vendor_id,
            to_vendor_id=request.to_vendor_id,
            fruit_id=request.fruit_id,
            quantity=request.quantity,
            currency_amount=result.get("currency_amount"),
            alien_currency=request.alien_currency,
            details=result
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
