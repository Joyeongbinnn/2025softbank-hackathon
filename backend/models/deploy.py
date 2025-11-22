import enum
from sqlalchemy import Column, BigInteger, Text, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from database.yoitang import Base

class DeployStatus(enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    ARCHIVED = "ARCHIVED"

class Deploy(Base):
    __tablename__ = "deploys"

    deploy_id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    service_id = Column(BigInteger, ForeignKey("services.service_id"), nullable=False)
    git_branch = Column(String(100), default="main", nullable=False)
    commit_id = Column(String(50), nullable=False)
    commit_message = Column(Text, nullable=False)
    status = Column(Enum(DeployStatus), default=DeployStatus.IN_PROGRESS, nullable=False)
    created_date = Column(DateTime, server_default=func.now(), nullable=False)
    updated_date = Column(DateTime, onupdate=func.now(), nullable=True)