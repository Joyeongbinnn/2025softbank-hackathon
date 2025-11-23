import asyncio
from fastapi import APIRouter, HTTPException, status, Depends   
from sqlalchemy.orm import Session
from database.yoitang import get_db
from crud.service import create_service, get_service, get_services_by_user, get_services_count_by_user, get_success_services_count_by_user, get_today_user_services_count, get_user_service_success_rate
from crud.deploy import create_deploy, get_latest_deploy_by_service, update_deploy_status
from schemas.service import ServiceCreate, ServiceResponse, ServiceDeployInfo
from schemas.deploy import DeployCreate, DeployRequest
from core.git_util import get_latest_commit
from core.jenkins_trigger import trigger_jenkins_build

router = APIRouter()

# 서비스 생성
@router.post("/", response_model=ServiceResponse, summary="DB에 새 서비스 생성")
async def create_new_service(service_data: ServiceCreate, db: Session = Depends(get_db)):
    return create_service(db, service_data)

# 서비스 내용 조회
@router.get("/{service_id}", response_model=ServiceResponse, summary="단일 서비스 정보 조회")
async def get_service_by_id(service_id: int, db: Session = Depends(get_db)):
    service = get_service(db, service_id)

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 서비스가 존재하지 않습니다."
        )

    return service

# 특정 유저의 모든 서비스 조회
@router.get("/user/{user_id}", response_model=list[ServiceResponse], summary="특정 유저의 모든 서비스 조회")
async def get_services_by_user_id(user_id: int, db: Session = Depends(get_db)):
    services = get_services_by_user(db, user_id)
    return services

# 특정 유저의 서비스 개수 조회
@router.get("/user/{user_id}/count", response_model=int, summary="특정 유저의 서비스 개수 조회")
async def get_services_count_by_user_id(user_id: int, db: Session = Depends(get_db)):
    count = get_services_count_by_user(db, user_id)
    return count

# 특정 유저의 활성화 서비스 개수 조회
@router.get("/user/{user_id}/active_count", response_model=int, summary="특정 유저의 활성화 서비스 개수 조회")
async def get_success_services_count_by_user_id(user_id: int, db: Session = Depends(get_db)):
    count = get_success_services_count_by_user(db, user_id)
    return count

# 오늘 생성된 유저의 서비스 개수 조회
@router.get("/user/{user_id}/today_count", response_model=int, summary="오늘 생성된 유저의 서비스 개수 조회")
async def get_today_user_services_count_by_user_id(user_id: int, db: Session = Depends(get_db)):
    count = get_today_user_services_count(db, user_id)
    return count

# 특정 유저의 오늘 서비스 성공률 조회
@router.get("/user/{user_id}/success_rate", response_model=int, summary="특정 유저의 오늘 서비스 성공률 조회")
async def get_user_service_success_rate_by_user_id(user_id: int, db: Session = Depends(get_db)):
    success_rate = get_user_service_success_rate(db, user_id)
    return success_rate

# 새 서비스 자동 배포
@router.post("/auto_deploy", summary="새 서비스 자동 배포")
async def create_auto_deploy(auto_deploy_data: ServiceDeployInfo, db: Session = Depends(get_db)):
    service_create = ServiceCreate(
        user_id=auto_deploy_data.user_id,
        name=auto_deploy_data.name,
        domain=auto_deploy_data.domain,
        git_repo=auto_deploy_data.git_repo,
    )
    service = create_service(db, service_create)

    commit_id, commit_message = get_latest_commit(auto_deploy_data.git_repo, auto_deploy_data.git_branch)

    deploy_create = DeployCreate(
        service_id=service.service_id,
        git_branch=auto_deploy_data.git_branch,
        commit_id=commit_id,
        commit_message=commit_message,
    )
    deploy = create_deploy(db, deploy_create)

    deploy_req = DeployRequest(
        prefix=service.domain,
        git_repo=service.git_repo,
        branch=deploy.git_branch,
        use_repo_dockerfile=False,
        frontend_stack="react-vite",
        git_pat=auto_deploy_data.git_pat
    )
    asyncio.create_task(trigger_jenkins_build(deploy.deploy_id, deploy_req))

    return {
        "service": service,
        "deploy": deploy,
        "message": "Service and deploy created, Jenkins build triggered asynchronously."
    }

# 서비스 다시 배포
@router.post("/redeploy/{service_id}", summary="서비스 다시 배포")
async def redeploy_service(service_id: int, db: Session = Depends(get_db)):    
    deploy = get_latest_deploy_by_service(db, service_id)
    if not deploy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 서비스의 배포 이력이 존재하지 않습니다."
        )
    
    update_deploy_status(db, deploy.deploy_id, "ARCHIVED")
    
    service = get_service(db, service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="해당 서비스가 존재하지 않습니다."
        )

    commit_id, commit_message = get_latest_commit(service.git_repo, deploy.git_branch)

    deploy_create = DeployCreate(
        service_id=service.service_id,
        git_branch=deploy.git_branch,
        commit_id=commit_id,
        commit_message=commit_message,
    )
    new_deploy = create_deploy(db, deploy_create)

    deploy_req = DeployRequest(
        prefix=service.domain,
        git_repo=service.git_repo,
        branch=new_deploy.git_branch,
        use_repo_dockerfile=False,
        frontend_stack="react-vite",
    )
    asyncio.create_task(trigger_jenkins_build(new_deploy.deploy_id, deploy_req))

    return {
        "service": service,
        "deploy": new_deploy,
        "message": "Redeploy created, Jenkins build triggered asynchronously."
    }
