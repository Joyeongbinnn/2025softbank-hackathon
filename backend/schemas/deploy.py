from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum
import re

class DeployStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class DeployRequest(BaseModel):
    prefix: str
    git_repo: HttpUrl
    branch: str = "main"

    @field_validator("prefix")
    @classmethod
    def validate_prefix(cls, v: str) -> str:
        # k8s namespace + 도메인 prefix 제약: 소문자, 숫자, 하이픈
        if not re.fullmatch(r"[a-z0-9-]+", v):
            raise ValueError("prefix는 소문자/숫자/하이픈만 사용할 수 있습니다.")
        if len(v) > 30:
            raise ValueError("prefix는 30자 이하여야 합니다.")
        return v

class DeployResponse(BaseModel):
    deploy_id: int
    user_id: int
    service_name: str
    namespace: str
    domain: Optional[str]
    git_repo: str
    git_branch: str
    commit_id: str
    commit_message: str
    status: DeployStatus
    created_date: datetime
    updated_date: Optional[datetime]

    class Config:
        orm_mode = True
    