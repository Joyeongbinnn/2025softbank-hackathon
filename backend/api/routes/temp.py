from fastapi import APIRouter

router = APIRouter()

@router.get("/test", response_model=str)
async def test():
    return 'test'