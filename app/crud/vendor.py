from sqlalchemy.orm import Session
from app.models.vendor import Vendor

def get_all_vendors(db: Session):
    return db.query(Vendor).all() 