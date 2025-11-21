from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogResponse(BaseModel):
    log_id: int
    deployment_id: int
    build_log: Optional[str]
    deploy_log: Optional[str]
    application_log: Optional[str]
    created_date: datetime
    updated_date: Optional[datetime]

    class Config:
        orm_mode = True
