from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from src.app.auth import decode_token
from src.app.crud.vendor import get_all_vendors, get_popular_vendors
from src.app.database import get_db
from src.app.models.fruit import VendorInventory
from src.app.models.user import User
from src.app.models.vendor import Vendor
from src.app.schemas.vendor import VendorSchema

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter_by(username=token_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get(
    "/vendors",
    response_model=List[VendorSchema],
    summary="List Vendors",
    description="Get a paginated list of vendors. Supports filtering by species.",
    tags=["Vendor"],
    responses={
        200: {"description": "A list of vendors."}
    },
    response_description="A list of vendors."
)
def read_vendors(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number", example=1),
    limit: int = Query(10, ge=1, le=100, description="Items per page", example=10),
    species: Optional[str] = Query(None, description="Filter by species", example="Human")
):
    offset = (page - 1) * limit
    return get_all_vendors(db, species=species, offset=offset, limit=limit)

@router.get(
    "/vendors/me",
    response_model=VendorSchema,
    summary="Get My Vendor Profile",
    description="Get the vendor profile associated with the current authenticated user.",
    tags=["Vendor"],
    responses={
        200: {"description": "The current user's vendor profile."},
        404: {"description": "Vendor profile not found."}
    },
    response_description="The current user's vendor profile."
)
def read_my_vendor(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vendor = db.query(Vendor).filter_by(user_id=current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return vendor

@router.get(
    "/vendors/popular",
    response_model=List[VendorSchema],
    summary="List Popular Vendors",
    description="Get a list of the most popular vendors, ranked by the sum of (quantity * rarity_level) of all their fruits.",
    tags=["Vendor"],
    responses={
        200: {"description": "A list of popular vendors."}
    },
    response_description="A list of popular vendors."
)
def read_popular_vendors(
    db: Session = Depends(get_db),
    limit: int = Query(5, ge=1, le=20, description="Number of popular vendors to return", example=5)
):
    return get_popular_vendors(db, limit=limit)

@router.post("/vendors/me/add-fruit")
def add_fruit_to_inventory(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fruit_id = data["fruit_id"]
    quantity = data["quantity"]
    vendor = db.query(Vendor).filter_by(user_id=current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    inv = db.query(VendorInventory).filter_by(vendor_id=vendor.id, fruit_id=fruit_id).first()
    if inv:
        inv.quantity += int(quantity)
    else:
        inv = VendorInventory(vendor_id=vendor.id, fruit_id=fruit_id, quantity=quantity)
        db.add(inv)
    db.commit()
    return {"success": True}
