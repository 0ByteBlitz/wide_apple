import os
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from src.app.database import get_db
from src.app.crud.fruit import get_all_fruits, get_historical_prices, get_price_trend
from src.app.models.fruit import Fruit
from src.app.schemas.fruit import FruitPriceListSchema, FruitPriceSchema, FruitSchema

FRUITS_DIR = Path(__file__).resolve().parent.parent / "static" / "fruits"

router = APIRouter()

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

@router.post("/fruits")
async def create_fruit(
    name: str = Form(...),
    flavor_profile: str = Form(...),
    dimension_origin: str = Form(...),
    rarity_level: int = Form(...),
    base_value: float = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    photo_url = None
    if photo:
        ext = os.path.splitext(photo.filename)[1]
        filename = f"{uuid4().hex}{ext}"
        save_path = os.path.join("static/fruits", filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        with open(save_path, "wb") as f:
            f.write(await photo.read())
        photo_url = f"/static/fruits/{filename}"
    fruit = Fruit(
        name=name,
        flavor_profile=flavor_profile,
        dimension_origin=dimension_origin,
        rarity_level=rarity_level,
        base_value=base_value,
        photo_url=photo_url
    )
    db.add(fruit)
    db.commit()
    db.refresh(fruit)
    return {"id": fruit.id}

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