import asyncio
from sqlalchemy.orm import Session
from core.jenkins_client import JenkinsClient
from crud.deploy import update_deploy_status
from database.yoitang import SessionLocal
from schemas.deploy import DeployRequest

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
            git_pat=req.git_pat,
        )
        update_deploy_status(db, deploy_id, "SUCCESS")
    except Exception as e:
        update_deploy_status(db, deploy_id, "FAILED")
    finally:
        db.close()