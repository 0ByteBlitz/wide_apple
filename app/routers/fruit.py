from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import session_local
from app.crud import get_all_fruits, get_price_trend
from app.schemas import FruitSchema
from typing import List

router = APIRouter()

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()


@router.get("/fruits", response_model=List[FruitSchema])
def read_fruits(db: Session = Depends(get_db)):
    return get_all_fruits(db)

@router.get("/prices")
def get_prices(fruit: str = Query(...), db: Session = Depends(get_db)):
    trend = get_price_trend(db, fruit)
    if not trend:
        return JSONResponse(status_code=404, content={"error": "Fruit not found"})
    return trend