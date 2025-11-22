from sqlalchemy import Column, BigInteger, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.yoitang import Base

class Log(Base):
    __tablename__ = "logs"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    deploy_id = Column(BigInteger, ForeignKey("deploys.deploy_id"), nullable=False)
    build_log = Column(Text, nullable=True)
    deploy_log = Column(Text, nullable=True)
    application_log = Column(Text, nullable=True)
    created_date = Column(DateTime, server_default=func.now(), nullable=False)
    updated_date = Column(DateTime, onupdate=func.now(), nullable=True)