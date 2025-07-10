from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from src.app.database import session_local
from src.app.schemas.user import UserCreate, UserOut
from src.app.schemas.auth import Token
from src.app.crud.user import get_user_by_username, create_user
from src.app.auth import verify_password, create_access_token, decode_token, create_refresh_token, decode_refresh_token
from src.app.models.vendor import Vendor

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

@router.post(
    "/auth/register",
    response_model=UserOut,
    summary="Register a new user",
    description="Register a new user and automatically create a vendor profile for them.",
    tags=["Auth"],
    responses={
        200: {"description": "User registered successfully."},
        400: {"description": "Username already exists."}
    },
    response_description="User registered successfully."
)
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

@router.post(
    "/auth/token",
    response_model=Token,
    summary="Login and get tokens",
    description="Authenticate a user and return access and refresh tokens.",
    tags=["Auth"],
    responses={
        200: {"description": "Tokens returned successfully."},
        401: {"description": "Invalid credentials."}
    },
    response_description="Tokens returned successfully."
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post(
    "/auth/refresh",
    response_model=Token,
    summary="Refresh access token",
    description="Get a new access token using a valid refresh token.",
    tags=["Auth"],
    responses={
        200: {"description": "Access token refreshed successfully."},
        401: {"description": "Invalid refresh token."}
    },
    response_description="Access token refreshed successfully."
)
def refresh_token_endpoint(refresh_token: str):
    token_data = decode_refresh_token(refresh_token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = create_access_token(data={"sub": token_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get(
    "/auth/me",
    response_model=UserOut,
    summary="Get current user profile",
    description="Get the profile of the currently authenticated user.",
    tags=["Auth"],
    responses={
        200: {"description": "Current user profile returned successfully."},
        401: {"description": "Invalid token."},
        404: {"description": "User not found."}
    },
    response_description="Current user profile returned successfully."
)
def read_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    token_data = decode_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user_by_username(db, token_data.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
