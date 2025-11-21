from fastapi import APIRouter
from api.routes import deploy, log

api_router = APIRouter()

api_router.include_router(deploy.router, prefix="/deploy", tags=["deploy"])
api_router.include_router(log.router, prefix="/log", tags=["log"])