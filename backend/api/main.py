from fastapi import APIRouter
from api.routes import deploy, metrics, log, service

api_router = APIRouter()

api_router.include_router(deploy.router, prefix="/deploy", tags=["deploy"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(log.router, prefix="/log", tags=["log"])
api_router.include_router(service.router, prefix="/service", tags=["service"])

