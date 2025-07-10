import os

from datetime import datetime, timedelta, UTC
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.schemas.auth import TokenData
from dotenv import load_dotenv
from typing import Optional
import re

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if SECRET_KEY is None:
    raise ValueError("SECRET_KEY environment variable is not set.")
ALGORITHM = os.getenv("ALGORITHM") or "HS256"
if ALGORITHM is None:
    raise ValueError("ALGORITHM environment variable is not set.")
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
except ValueError:
    ACCESS_TOKEN_EXPIRE_MINUTES = 30.0

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password Hashing
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Password Validation
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]).{8,}$"
)

def validate_password(password: str) -> None:
    if not PASSWORD_REGEX.match(password):
        raise ValueError(
            "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
        )

# JWT Token Generation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Token Decoding and Validation
def decode_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not isinstance(username, str):
            return None
        return TokenData(username=username)
    except JWTError:
        return None

# Refresh Token Support
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", SECRET_KEY)
REFRESH_TOKEN_EXPIRE_MINUTES = float(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "43200"))  # 30 days default

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_refresh_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not isinstance(username, str):
            return None
        return TokenData(username=username)
    except JWTError:
        return None