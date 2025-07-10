from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.database import session_local
from app.schemas.user import UserCreate, UserOut
from app.schemas.auth import Token
from app.crud.user import get_user_by_username, create_user
from app.auth import verify_password, create_access_token, decode_token, create_refresh_token, decode_refresh_token
from app.models.vendor import Vendor

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

@router.post("/auth/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")

    # Create user
    db_user = create_user(db, user.username, user.password)

    # Auto-create vendor for the user
    new_vendor = Vendor(
        name=f"Vendor {user.username}",
        species="Human",
        home_dimension="Earth-1",
        user_id=db_user.id
    )
    db.add(new_vendor)
    db.commit()

    return db_user

@router.post("/auth/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/auth/refresh", response_model=Token)
def refresh_token_endpoint(refresh_token: str):
    token_data = decode_refresh_token(refresh_token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = create_access_token(data={"sub": token_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=UserOut)
def read_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user_by_username(db, token_data.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
