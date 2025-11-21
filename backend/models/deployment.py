import enum
from sqlalchemy import Column, BigInteger, Text, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from database.yoitang import Base

class DeploymentStatus(enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class Deployment(Base):
    __tablename__ = "deployments"

    deployment_id = Column(BigInteger, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.user_id"), nullable=False)
    service_name = Column(String(100), nullable=False)
    namespace = Column(String(50), nullable=False)
    domain = Column(String(200), nullable=True)
    git_repo = Column(Text, nullable=False)
    git_branch = Column(String(100), default="main", nullable=False)
    commit_id = Column(String(50), nullable=False)
    commit_message = Column(Text, nullable=False)
    status = Column(Enum(DeploymentStatus), default=DeploymentStatus.IN_PROGRESS, nullable=False)
    created_date = Column(DateTime, server_default=func.now(), nullable=False)
    updated_date = Column(DateTime, onupdate=func.now(), nullable=True)