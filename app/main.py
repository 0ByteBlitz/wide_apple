import sys
import unittest
from fastapi import FastAPI
from app.database import Base, engine
from app.routers import fruit, vendor, trade, auth

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(fruit.router)
app.include_router(vendor.router)
app.include_router(trade.router)
app.include_router(auth.router)

@app.get("/")
def read_root():
    return{"message": "Welcome to WideApple Interdimensional API"}

if __name__ == "__main__":
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
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)