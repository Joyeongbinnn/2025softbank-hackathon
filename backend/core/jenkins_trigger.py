import asyncio
from sqlalchemy.orm import Session
from core.jenkins_client import JenkinsClient
from crud.deploy import update_deploy_status
from database.yoitang import SessionLocal
from schemas.deploy import DeployRequest
from models.deploy import DeployStatus

def map_jenkins_result_to_status(result: str | None) -> DeployStatus:
    if result is None:
        return DeployStatus.IN_PROGRESS
    r = result.upper()
    if r == "SUCCESS":
        return DeployStatus.SUCCESS 
    # FAILURE / ABORTED / NOT_BUILT / UNSTABLE → 실패로 처리
    return DeployStatus.FAILED

async def trigger_jenkins_build(deploy_id: int, req: DeployRequest):
    db = SessionLocal()
    try:
        jenkins = JenkinsClient()
        queue_id = jenkins.trigger_build(
            prefix=req.prefix,
            git_repo=str(req.git_repo),
            branch=req.branch,
            use_repo_dockerfile=req.use_repo_dockerfile,
            frontend_stack=req.frontend_stack,
            git_pat=req.git_pat if req.git_pat else None,
        )
        
        # queue_id → build_number 조회 (blocking → thread 로)
        build_number = await asyncio.to_thread(
            jenkins.get_build_number_from_queue,
            queue_id
        )

        # 빌드 완료될 때까지 결과 polling (blocking → thread 로)
        result = await asyncio.to_thread(
            jenkins.get_build_result,
            build_number
        )

        deploy_status = map_jenkins_result_to_status(result)
        update_deploy_status(db, deploy_id, deploy_status.value)
    except Exception as e:
        update_deploy_status(db, deploy_id, DeployStatus.FAILED.value)
    finally:
        db.close()