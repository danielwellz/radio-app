# backend/app/main.py - Updated for SQLite
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from datetime import datetime

app = FastAPI(title="Radio API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage (replaces Redis)
active_connections = {}
listener_counts = {}

# Mock data
channels_data = [
    {
        "id": "1",
        "name": "Chill Lo-Fi",
        "description": "Relaxing lo-fi beats to study/chill to",
        "genre": "Lo-Fi",
        "stream_url": "/api/stream/1",
        "is_live": True,
        "current_listeners": 150,
        "image_url": "https://via.placeholder.com/300x300/4A5568/FFFFFF?text=Lo-Fi"
    },
    {
        "id": "2", 
        "name": "Electronic Dance",
        "description": "The best EDM and electronic music",
        "genre": "Electronic",
        "stream_url": "/api/stream/2", 
        "is_live": True,
        "current_listeners": 89,
        "image_url": "https://via.placeholder.com/300x300/805AD5/FFFFFF?text=EDM"
    }
]

@app.get("/")
async def root():
    return {"message": "Radio API is running!", "status": "ok"}

@app.get("/api/channels")
async def get_channels():
    # Update listener counts from active connections
    for channel in channels_data:
        channel_id = channel["id"]
        channel["current_listeners"] = len(active_connections.get(channel_id, []))
    return channels_data

@app.get("/api/stream/{channel_id}")
async def get_stream_url(channel_id: str):
    # Mock stream URL - in real app, this would point to actual audio
    return {"url": f"/api/audio/{channel_id}", "format": "mp3"}

@app.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str):
    await websocket.accept()
    
    if channel_id not in active_connections:
        active_connections[channel_id] = []
    active_connections[channel_id].append(websocket)
    
    # Update listener count
    listener_count = len(active_connections[channel_id])
    
    try:
        # Send initial listener count
        await websocket.send_text(json.dumps({
            "type": "listener_count",
            "count": listener_count
        }))
        
        # Send now playing info
        await websocket.send_text(json.dumps({
            "type": "now_playing",
            "track": {
                "title": "Sample Track",
                "artist": "Sample Artist",
                "duration": 180
            }
        }))
        
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Clean up on disconnect
        if channel_id in active_connections:
            active_connections[channel_id].remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)