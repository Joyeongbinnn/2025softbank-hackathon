from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ServiceCreate(BaseModel):
    user_id: int
    name: str
    domain: str
    git_repo: str
    
class ServiceResponse(BaseModel):
    service_id: int
    user_id: int
    name: str
    domain: str
    git_repo: str
    created_date: datetime
    updated_date: Optional[datetime]

    class Config:
        orm_mode = True

class ServiceDeployInfo(BaseModel):
    user_id: int
    name: str
    domain: str
    git_repo: str
    git_branch: str
    git_pat: str
