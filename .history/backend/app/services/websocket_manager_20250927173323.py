# backend/app/services/websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.listener_counts: Dict[str, int] = {}

    async def connect(self, websocket: WebSocket, channel_id: str):
        await websocket.accept()
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = []
        self.active_connections[channel_id].append(websocket)
        
        # Update listener count
        self.listener_counts[channel_id] = len(self.active_connections[channel_id])
        await self.broadcast_listener_count(channel_id)

    async def disconnect(self, websocket: WebSocket, channel_id: str):
        if channel_id in self.active_connections:
            self.active_connections[channel_id].remove(websocket)
            self.listener_counts[channel_id] = len(self.active_connections[channel_id])
            await self.broadcast_listener_count(channel_id)

    async def broadcast_to_channel(self, channel_id: str, message: dict):
        if channel_id in self.active_connections:
            disconnected = []
            for websocket in self.active_connections[channel_id]:
                try:
                    await websocket.send_json(message)
                except:
                    disconnected.append(websocket)
            
            # Clean up disconnected clients
            for ws in disconnected:
                self.active_connections[channel_id].remove(ws)

    async def broadcast_listener_count(self, channel_id: str):
        count = self.listener_counts.get(channel_id, 0)
        message = {
            'type': 'listener_count',
            'channel_id': channel_id,
            'count': count,
            'timestamp': datetime.now().isoformat()
        }
        await self.broadcast_to_channel(channel_id, message)

    async def send_user_message(self, channel_id: str, message_data: dict):
        """Send user message/dedication to channel"""
        message = {
            'type': 'user_message',
            'data': message_data,
            'timestamp': datetime.now().isoformat()
        }
        await self.broadcast_to_channel(channel_id, message)

# Global instance
websocket_manager = WebSocketManager()