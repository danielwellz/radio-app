from fastapi import FastAPI, WebSocket, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import uuid
from Webpush import webpush, WebPushException
import json

from .database import get_db
from .models import Channel, Program, Track, UserInteraction, Advertisement, PushSubscription
from .schemas import (
    ChannelResponse, ProgramResponse, TrackResponse, 
    UserMessage, NowPlayingResponse, AffiliateLinkResponse,
    PushSubscriptionCreate, NotificationRequest
)

app = FastAPI(
    title="WaveRadio API",
    description="Modern web radio application with real-time features",
    version="2.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for real-time features
active_connections: Dict[str, List[WebSocket]] = {}
now_playing_data: Dict[str, Dict] = {}
user_sessions: Dict[str, Dict] = {}
push_subscriptions: List[Dict] = []

# Enhanced mock data
MOCK_CHANNELS = [
    {
        "id": "1",
        "name": "Chill Lo-Fi",
        "description": "Relaxing lo-fi beats to study and chill",
        "genre": "Lo-Fi",
        "image_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
        "color": "#B45309",
        "current_listeners": 1242,
        "is_live": True,
        "stream_url": "https://stream.example.com/lofi",
        "schedule": {
            "monday": ["06:00-10:00 Morning Chill", "14:00-18:00 Afternoon Vibes"],
            "friday": ["20:00-23:00 Weekend Warmup"]
        }
    },
    {
        "id": "2",
        "name": "Deep Focus",
        "description": "Minimal electronic for deep work",
        "genre": "Electronic",
        "image_url": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop",
        "color": "#0F766E",
        "current_listeners": 876,
        "is_live": True,
        "stream_url": "https://stream.example.com/focus",
        "schedule": {
            "tuesday": ["08:00-12:00 Work Flow", "15:00-19:00 Deep Sessions"]
        }
    }
]

MOCK_TRACKS = {
    "1": [
        {"id": "101", "title": "Sunset Dreams", "artist": "Lofi Producer", "album": "Chill Vibes", "duration": 183, "cover_art": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop"},
        {"id": "102", "title": "Rainy Window", "artist": "Ambient Soul", "album": "Urban Sounds", "duration": 215, "cover_art": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"}
    ],
    "2": [
        {"id": "201", "title": "Digital Ocean", "artist": "Deep Focus", "album": "Productive Hours", "duration": 324, "cover_art": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop"}
    ]
}

@app.get("/")
async def root():
    return {"message": "WaveRadio API", "status": "online", "version": "2.1.0"}

@app.get("/api/channels", response_model=List[ChannelResponse])
async def get_channels(genre: Optional[str] = None, featured: bool = False):
    channels = MOCK_CHANNELS.copy()
    
    if genre:
        channels = [c for c in channels if c["genre"].lower() == genre.lower()]
    
    for channel in channels:
        channel_id = channel["id"]
        channel["current_listeners"] = len(active_connections.get(channel_id, []))
    
    return channels

@app.get("/api/channels/{channel_id}", response_model=ChannelResponse)
async def get_channel(channel_id: str):
    channel = next((c for c in MOCK_CHANNELS if c["id"] == channel_id), None)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    channel["current_listeners"] = len(active_connections.get(channel_id, []))
    return channel

@app.get("/api/channels/{channel_id}/now-playing", response_model=NowPlayingResponse)
async def get_now_playing(channel_id: str):
    channel = next((c for c in MOCK_CHANNELS if c["id"] == channel_id), None)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    current_track = now_playing_data.get(channel_id, {}).get("track")
    if not current_track and channel_id in MOCK_TRACKS:
        current_track = MOCK_TRACKS[channel_id][0]
    
    return {
        "track": current_track,
        "channel": channel,
        "listeners": len(active_connections.get(channel_id, [])),
        "progress": now_playing_data.get(channel_id, {}).get("progress", 0),
        "duration": current_track.get("duration", 0) if current_track else 0,
        "is_ad": False
    }

@app.post("/api/push-subscribe")
async def subscribe_to_push(subscription: PushSubscriptionCreate):
    """Store push notification subscription"""
    push_subscriptions.append(subscription.dict())
    return {"status": "subscribed", "id": str(uuid.uuid4())}

@app.post("/api/send-notification")
async def send_notification(notification: NotificationRequest):
    """Send push notification to all subscribers"""
    for sub in push_subscriptions:
        try:
            # In production, you'd use webpush here
            print(f"Would send notification to: {sub['endpoint']}")
        except Exception as e:
            print(f"Error sending notification: {e}")
    
    return {"status": "sent", "recipients": len(push_subscriptions)}

@app.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str):
    await websocket.accept()
    
    if channel_id not in active_connections:
        active_connections[channel_id] = []
    active_connections[channel_id].append(websocket)
    
    await send_initial_data(websocket, channel_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_websocket_message(websocket, channel_id, message)
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if channel_id in active_connections and websocket in active_connections[channel_id]:
            active_connections[channel_id].remove(websocket)
        await broadcast_listener_count(channel_id)

async def send_initial_data(websocket: WebSocket, channel_id: str):
    await websocket.send_text(json.dumps({
        "type": "listener_count",
        "count": len(active_connections.get(channel_id, [])),
        "channel_id": channel_id
    }))
    
    current_track = now_playing_data.get(channel_id, {}).get("track")
    if current_track:
        await websocket.send_text(json.dumps({
            "type": "now_playing",
            "track": current_track,
            "channel_id": channel_id,
            "progress": now_playing_data[channel_id].get("progress", 0)
        }))

async def handle_websocket_message(websocket: WebSocket, channel_id: str, message: dict):
    message_type = message.get("type")
    
    if message_type == "user_message":
        await broadcast_message(channel_id, {
            "type": "user_message",
            "user_id": message.get("user_id", "anonymous"),
            "content": message.get("content"),
            "timestamp": datetime.now().isoformat()
        })
    
    elif message_type == "track_like":
        await broadcast_message(channel_id, {
            "type": "track_like",
            "track_id": message.get("track_id"),
            "user_id": message.get("user_id"),
            "timestamp": datetime.now().isoformat()
        })

async def broadcast_message(channel_id: str, message: dict):
    if channel_id in active_connections:
        disconnected = []
        for websocket in active_connections[channel_id]:
            try:
                await websocket.send_text(json.dumps(message))
            except:
                disconnected.append(websocket)
        
        for ws in disconnected:
            active_connections[channel_id].remove(ws)

async def broadcast_listener_count(channel_id: str):
    count = len(active_connections.get(channel_id, []))
    await broadcast_message(channel_id, {
        "type": "listener_count",
        "count": count,
        "channel_id": channel_id
    })

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_playback())

async def simulate_playback():
    while True:
        for channel_id, tracks in MOCK_TRACKS.items():
            if tracks:
                current_track = tracks[0]
                tracks.append(tracks.pop(0))
                
                now_playing_data[channel_id] = {
                    "track": current_track,
                    "started_at": datetime.now().isoformat(),
                    "progress": 0
                }
                
                await broadcast_message(channel_id, {
                    "type": "now_playing",
                    "track": current_track,
                    "channel_id": channel_id,
                    "progress": 0
                })
        
        await asyncio.sleep(30)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")