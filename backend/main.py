import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from api import main
from starlette.middleware.cors import CORSMiddleware
from core.ws_manager import manager # Import WebSocketManager instance

app = FastAPI(root_path="/api")

origins = ['*']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main.api_router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.websocket("/ws/deploy/{deploy_id}")
async def websocket_endpoint(websocket: WebSocket, deploy_id: int):
    await manager.connect(deploy_id, websocket)
    try:
        while True:
            # Keep the connection alive. Frontend might send ping messages.
            # Or simply wait for disconnect.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(deploy_id, websocket)
        print(f"WebSocket disconnected for deploy_id: {deploy_id}")
    except Exception as e:
        print(f"WebSocket error for deploy_id: {deploy_id}, error: {e}")
        manager.disconnect(deploy_id, websocket)
