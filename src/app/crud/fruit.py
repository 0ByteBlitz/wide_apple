import random
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy import and_
from sqlalchemy.orm import Session

from src.app.models.fruit import Fruit, FruitPrice

def get_all_fruits(db: Session, rarity_level: Optional[int] = None, offset: int = 0, limit: int = 10) -> List[Fruit]:
    query = db.query(Fruit)
    if rarity_level is not None:
        query = query.filter(Fruit.rarity_level == rarity_level)
    return query.offset(offset).limit(limit).all()

def get_price_trend(db: Session, fruit_name: str):
    fruit = db.query(Fruit).filter_by(name=fruit_name).first()
    if not fruit:
        return None

    base = fruit.base_value
    today = datetime.today()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    prices = []
    for day in days:
        fluctuation = random.uniform(-0.2, 0.2)  # ±20%
        price = round(base + base * fluctuation, 2)
        prices.append({"date": day.strftime("%Y-%m-%d"), "price": price})

    return {"fruit": fruit_name, "base_value": base, "trend": prices}

def get_historical_prices(db: Session, fruit_id: Optional[int] = None, start_date: Optional[str] = None, end_date: Optional[str] = None, limit: Optional[int] = None):
    query = db.query(FruitPrice)
    if fruit_id is not None:
        query = query.filter(FruitPrice.fruit_id == fruit_id)
    if start_date is not None:
        query = query.filter(FruitPrice.date >= start_date)
    if end_date is not None:
        query = query.filter(FruitPrice.date <= end_date)
    query = query.order_by(FruitPrice.date.desc())
    if limit is not None:
        query = query.limit(limit)
    return query.all() 