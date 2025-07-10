from sqlalchemy import Column, Integer, String
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, index=True)
    species = Column(String)
    home_dimension = Column(String) 