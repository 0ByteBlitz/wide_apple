from sqlalchemy.orm import Session
from src.app.models.vendor import Vendor
from typing import Optional, List

def get_all_vendors(db: Session, species: Optional[str] = None, offset: int = 0, limit: int = 10) -> List[Vendor]:
    query = db.query(Vendor)
    if species is not None:
        query = query.filter(Vendor.species == species)
    return query.offset(offset).limit(limit).all() 