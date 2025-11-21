from sqlalchemy.orm import Session
from models.log import Log
from schemas.log import LogCreate

# 로그 생성
def create_log(db: Session, log_data: LogCreate) -> Log:
    new_log = Log(**log_data.model_dump())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

# 로그 정보 조회
def get_log(db: Session, deploy_id: int) -> Log:
    return db.query(Log).filter(Log.deploy_id == deploy_id).first()