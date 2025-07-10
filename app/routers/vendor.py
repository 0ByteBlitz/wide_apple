from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import session_local
from app.crud import get_all_vendors
from app.schemas.vendor import VendorSchema
from typing import List

router = APIRouter()

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

@router.get("/vendors", response_model=List[VendorSchema])
def read_vendors(db: Session = Depends(get_db)):
    return get_all_vendors(db)
