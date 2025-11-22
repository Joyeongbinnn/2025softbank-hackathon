from typing import Dict, List
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, deploy_id: int, websocket: WebSocket):
        await websocket.accept()
        if deploy_id not in self.active_connections:
            self.active_connections[deploy_id] = []
        self.active_connections[deploy_id].append(websocket)

    def disconnect(self, deploy_id: int, websocket: WebSocket):
        if deploy_id in self.active_connections:
            self.active_connections[deploy_id].remove(websocket)
            if not self.active_connections[deploy_id]:
                del self.active_connections[deploy_id]

    async def broadcast(self, deploy_id: int, message: str):
        if deploy_id in self.active_connections:
            for connection in self.active_connections[deploy_id]:
                await connection.send_text(message)

manager = WebSocketManager()
