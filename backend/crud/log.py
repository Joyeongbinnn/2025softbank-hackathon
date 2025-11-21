from sqlalchemy.orm import Session
from models.log import Log

# 로그 정보 조회
def get_log(db: Session, deployment_id: int) -> Log:
    return db.query(Log).filter(Log.deployment_id == deployment_id).first()