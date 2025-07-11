from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from src.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    vendor = relationship("Vendor", back_populates="user", uselist=False)
