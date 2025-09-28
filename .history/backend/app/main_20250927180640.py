# backend/app/main.py
from fastapi import FastAPI, WebSocket, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import json
from datetime import datetime
from typing import List, Optional

from .database import get_db, Base, engine
from . import models

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Radio API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage for demo
channels_data = [
    {
        "id": "1",
        "name": "Chill Lo-Fi",
        "description": "Relaxing lo-fi beats to study/chill to",
        "genre": "Lo-Fi",
        "stream_url": "https://stream-url-1.com",
        "is_live": True,
        "current_listeners": 150,
        "image_url": "https://via.placeholder.com/300x300/4A5568/FFFFFF?text=Lo-Fi"
    },
    {
        "id": "2", 
        "name": "Electronic Dance",
        "description": "The best EDM and electronic music",
        "genre": "Electronic",
        "stream_url": "https://stream-url-2.com",
        "is_live": True,
        "current_listeners": 89,
        "image_url": "https://via.placeholder.com/300x300/805AD5/FFFFFF?text=EDM"
    },
    {
        "id": "3",
        "name": "Jazz Classics",
        "description": "Timeless jazz classics from the greats",
        "genre": "Jazz", 
        "stream_url": "https://stream-url-3.com",
        "is_live": False,
        "current_listeners": 42,
        "image_url": "https://via.placeholder.com/300x300/38A169/FFFFFF?text=Jazz"
    }
]

# WebSocket connections
active_connections = {}

@app.get("/")
async def root():
    return {"message": "Radio API is running!", "status": "ok"}

@app.get("/api/channels")
async def get_channels():
    return channels_data

@app.get("/api/channels/{channel_id}")
async def get_channel(channel_id: str):
    channel = next((c for c in channels_data if c["id"] == channel_id), None)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@app.get("/api/channels/{channel_id}/tracks")
async def get_channel_tracks(channel_id: str):
    # Mock tracks data
    tracks = [
        {
            "id": "1",
            "title": "Sunset Dreams",
            "artist": "Lofi Producer",
            "album": "Chill Vibes",
            "duration": 180,
            "affiliate_links": {
                "itunes": "https://itunes.apple.com/track/1",
                "spotify": "https://open.spotify.com/track/1"
            }
        },
        {
            "id": "2",
            "title": "Night Drive",
            "artist": "Synthwave Artist", 
            "album": "Retro Waves",
            "duration": 240,
            "affiliate_links": {
                "itunes": "https://itunes.apple.com/track/2",
                "spotify": "https://open.spotify.com/track/2"
            }
        }
    ]
    return tracks

@app.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str):
    await websocket.accept()
    
    if channel_id not in active_connections:
        active_connections[channel_id] = []
    active_connections[channel_id].append(websocket)
    
    try:
        while True:
            # Keep connection alive and handle messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "get_listeners":
                listener_count = len(active_connections.get(channel_id, []))
                await websocket.send_text(json.dumps({
                    "type": "listener_count",
                    "count": listener_count
                }))
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if channel_id in active_connections:
            active_connections[channel_id].remove(websocket)

@app.post("/api/messages")
async def send_message(message: dict):
    # Handle user messages/dedications
    return {"status": "message_received", "message": message}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)