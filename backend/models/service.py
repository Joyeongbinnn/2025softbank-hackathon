from sqlalchemy import Column, BigInteger, Text, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.yoitang import Base

class Service(Base):
    __tablename__ = "services"

    service_id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    name = Column(String(100), nullable=False)
    domain = Column(String(200), nullable=False)
    git_repo = Column(Text, nullable=False)
    created_date = Column(DateTime, server_default=func.now(), nullable=False)
    updated_date = Column(DateTime, onupdate=func.now(), nullable=True)
