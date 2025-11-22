from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas.deploy import DeployRequest, DeployResponse
from schemas.log import LogUpdate # Import LogUpdate
from core.jenkins_client import JenkinsClient
from crud.deploy import get_deploy, get_deploys_by_user_id
from database.yoitang import get_db
from core.ws_manager import manager # Import WebSocketManager instance

router = APIRouter()

@router.post("/", summary="새 배포 요청")
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

# 유저의 최근 4번의 배포 이력 조회
@router.get("/user/{user_id}", response_model=List[DeployResponse], summary="유저의 최근 4번의 배포 이력 조회")
async def get_user_deploys(user_id: int, db: Session = Depends(get_db)):
    deploys = get_deploys_by_user_id(db, user_id)
    return deploys

@router.post("/log/{deploy_id}", summary="Jenkins 로그 수신 및 브로드캐스트")
async def receive_jenkins_log(
    deploy_id: int,
    log_update: LogUpdate,
    db: Session = Depends(get_db)
):
    # Broadcast log to WebSocket clients
    await manager.broadcast(deploy_id, f"[{log_update.stage}] {log_update.log}")

    # For now, we are not saving to the database as per user's request.
    # If saving to DB is needed later, uncomment and implement append_deploy_log
    # append_deploy_log(db, deploy_id, log_update.log)

    return {"message": "Log received and broadcasted"}