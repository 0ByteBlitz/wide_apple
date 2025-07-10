from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from src.app.database import session_local
from src.app.crud.fruit import get_all_fruits, get_price_trend, get_historical_prices
from src.app.schemas.fruit import FruitSchema, FruitPriceSchema, FruitPriceListSchema
from typing import List, Optional

router = APIRouter()

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/fruits",
    response_model=List[FruitSchema],
    summary="List Fruits",
    description="Get a paginated list of fruits. Supports filtering by rarity level.",
    tags=["Fruit"],
    responses={
        200: {"description": "A list of fruits."}
    },
    response_description="A list of fruits."
)
def read_fruits(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number", example=1),
    limit: int = Query(10, ge=1, le=100, description="Items per page", example=10),
    rarity: Optional[int] = Query(None, description="Filter by rarity level", example=3)
):
    offset = (page - 1) * limit
    return get_all_fruits(db, rarity_level=rarity, offset=offset, limit=limit)

@router.get(
    "/prices",
    summary="Get Historical Fruit Prices",
    description="Get historical prices for fruits, with optional filtering by fruit_id, date range, and limit.",
    tags=["Fruit"],
    response_model=FruitPriceListSchema,
    responses={
        200: {"description": "Historical prices for fruits."},
        404: {"description": "No prices found."}
    },
    response_description="Historical prices for fruits."
)
def get_prices(
    fruit_id: int = Query(None, description="ID of the fruit", example=1),
    start_date: str = Query(None, description="Start date (YYYY-MM-DD)", example="2025-07-01"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD)", example="2025-07-10"),
    limit: int = Query(None, description="Limit number of results", example=30),
    db: Session = Depends(get_db)
):
    prices = get_historical_prices(db, fruit_id=fruit_id, start_date=start_date, end_date=end_date, limit=limit)
    if not prices:
        return JSONResponse(status_code=404, content={"error": "No prices found"})
    return {"prices": prices}