from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from app.database import session_local
from app.crud.vendor import get_all_vendors
from app.schemas.vendor import VendorSchema
from app.models.user import User
from app.models.vendor import Vendor
from app.auth import decode_token
from typing import List

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter_by(username=token_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/vendors", response_model=List[VendorSchema])
def read_vendors(db: Session = Depends(get_db)):
    return get_all_vendors(db)

@router.get("/vendors/me", response_model=VendorSchema)
def read_my_vendor(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vendor = db.query(Vendor).filter_by(user_id=current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor
