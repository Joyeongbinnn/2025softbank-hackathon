from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from schemas.deploy import DeployRequest, DeployCreate, DeployResponse
from core.jenkins_client import JenkinsClient
from crud.deploy import create_deploy, get_deploy, get_deploys_by_service, get_latest_deploy_by_service
from database.yoitang import get_db

router = APIRouter()

#@router.post("/", summary="새 배포 요청")
#@router.post("", summary="새 배포 요청")
async def deploy(req: DeployRequest):
    """
    유저 입력:
      - prefix            : team1
      - git_repo          : https://github.com/...
      - branch            : main
      - use_repo_dockerfile: bool (optional, default=false)
      - frontend_stack    : react-vite (optional)
    """
    try:
        jenkins = JenkinsClient()
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

    try:
        queue_id = jenkins.trigger_build(
            prefix=req.prefix,
            git_repo=str(req.git_repo),
            branch=req.branch,
            use_repo_dockerfile=req.use_repo_dockerfile,
            frontend_stack=req.frontend_stack,
            git_pat=req.git_pat,   # 👈 추가

        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Jenkins 트리거 실패: {e}",
        )

    return {
        "message": "Deploy pipeline triggered",
        "prefix": req.prefix,
        "queue_id": queue_id,
    }

# 배포 생성
@router.post("/", response_model=DeployResponse, summary="새 배포 생성")
async def create_new_deploy(deploy_data: DeployCreate, db: Session = Depends(get_db)):
    return create_deploy(db, deploy_data)

# 배포 내용 조회
@router.get("/{deploy_id}", response_model=DeployResponse, summary="단일 배포 정보 조회")
async def get_single_deploy(deploy_id: int, db: Session = Depends(get_db)):
    deploy = get_deploy(db, deploy_id)

    if not deploy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 배포가 존재하지 않습니다."
        )
    return deploy

# 서비스의 가장 최근 배포 조회
@router.get("/service/latest/{service_id}", response_model=DeployResponse, summary="서비스의 가장 최근 배포 조회")
async def get_service_latest_deploy(service_id: int, db: Session = Depends(get_db)):
    deploy = get_latest_deploy_by_service(db, service_id)

    if not deploy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 서비스의 배포 이력이 존재하지 않습니다."
        )
    return deploy

# 서비스의 최근 4번의 배포 이력 조회
@router.get("/service/{service_id}", response_model=List[DeployResponse], summary="서비스의 최근 4번의 배포 이력 조회")
async def get_service_deploys(service_id: int, db: Session = Depends(get_db)):
    deploys = get_deploys_by_service(db, service_id)

    if not deploys:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 서비스의 배포 이력이 존재하지 않습니다."
        )
    return deploys    

class DeployLog(BaseModel):
    stage: str
    message: str
    prefix: str
    build_number: int
    deploy_id: Optional[str] = None  # 선택적으로 사용 가능

@router.post("/log/receive", summary="Jenkins로부터 배포 로그 수신(미완)")
async def receive_deploy_log(log: DeployLog):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    deploy_id = log.deploy_id if log.deploy_id else "None"
    print(f"[{timestamp}] 📦 Deploy {deploy_id} | Stage: {log.stage} | {log.message}")
    return {"ok": True}