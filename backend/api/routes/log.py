from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.yoitang import get_db
from crud.log import get_log
from schemas.log import LogResponse

router = APIRouter()

#  로그 내용 조회
@router.get("/{deployment_id}", response_model=LogResponse)
async def get_log_by_deployment(deployment_id: int, db: Session = Depends(get_db)):
    log = get_log(db, deployment_id)

    if not log:
        raise HTTPException(status_code=404, detail="해당 배포가 존재하지 않습니다.")

    return log