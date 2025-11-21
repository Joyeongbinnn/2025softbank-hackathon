from fastapi import APIRouter, HTTPException, status

from schemas.deploy import DeployRequest
from core.jenkins_client import JenkinsClient

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
