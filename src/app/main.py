import sys
import unittest
import os
from fastapi import FastAPI
from src.app.database import Base, engine
from src.app.routers import fruit, vendor, trade, auth
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime
from src.app.models.fruit import Fruit, FruitPrice
from src.app.database import session_local
import random

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(fruit.router)
app.include_router(vendor.router)
app.include_router(trade.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return{"message": "Welcome to WideApple Interdimensional API"}

def simulate_and_store_daily_prices():
    db: Session = session_local()
    today = datetime.today().strftime("%Y-%m-%d")
    fruits = db.query(Fruit).all()
    for fruit in fruits:
        base = fruit.base_value
        fluctuation = random.uniform(-0.2, 0.2)  # ±20%
        price = round(base + base * fluctuation, 2)
        fruit_price = FruitPrice(fruit_id=fruit.id, date=today, price=price)
        db.add(fruit_price)
    db.commit()
    db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(simulate_and_store_daily_prices, 'interval', days=1)
scheduler.start()

if __name__ == "__main__":
    # Run Alembic migrations
    os.system("uv run alembic upgrade head")
    # Optionally seed the database
    # os.system("uv run python src/app/utils/seed.py")
    # Run unittests before starting the server
    print("Running Tests!")
    test_loader = unittest.TestLoader()
    test_suite = test_loader.discover("tests")
    test_runner = unittest.TextTestRunner()
    result = test_runner.run(test_suite)
    if not result.wasSuccessful():
        print("Tests failed. Server will not start.")
        sys.exit(1)
    import uvicorn
    uvicorn.run("src.app.main:app", host="127.0.0.1", port=8000, reload=True)