from fastapi import APIRouter
from api.routes import temp

api_router = APIRouter()

api_router.include_router(temp.router, prefix="/temp", tags=["temp"])