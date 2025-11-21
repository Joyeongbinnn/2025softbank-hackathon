from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogCreate(BaseModel):
    deploy_id: int
    build_log: Optional[str] = None
    deploy_log: Optional[str] = None
    application_log: Optional[str] = None

class LogResponse(BaseModel):
    log_id: int
    deploy_id: int
    build_log: Optional[str]
    deploy_log: Optional[str]
    application_log: Optional[str]
    created_date: datetime
    updated_date: Optional[datetime]

    class Config:
        orm_mode = True
