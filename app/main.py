from fastapi import FastAPI
from app.database import Base, engine
from app.routers import fruit, vendor, trade

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(fruit.router)
app.include_router(vendor.router)
app.include_router(trade.router)

@app.get("/")
def read_root():
    return{"message": "Welcome to WideApple Interdimensional API"}