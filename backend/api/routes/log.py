from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database.yoitang import get_db
from crud.log import create_log, get_log
from schemas.log import LogResponse, LogCreate

router = APIRouter()

# 로그 생성
@router.post("/", response_model=LogResponse, summary="DB에 새 로그 생성")
async def create_new_log(log_data: LogCreate, db: Session = Depends(get_db)):
    return create_log(db, log_data)

# 로그 내용 조회
@router.get("/{deploy_id}", response_model=LogResponse, summary="단일 로그 정보 조회")
async def get_log_by_deploy(deploy_id: int, db: Session = Depends(get_db)):
    log = get_log(db, deploy_id)

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 배포가 존재하지 않습니다."
        )

    return log