# backend/app/main.py - COMPLETELY UPDATED WITH ALL FEATURES
from fastapi import FastAPI, WebSocket, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import uuid

from .database import get_db
from .models import Channel, Program, Track, UserInteraction, Advertisement
from .schemas import (
    ChannelResponse, ProgramResponse, TrackResponse, 
    UserMessage, NowPlayingResponse, AffiliateLinkResponse
)

app = FastAPI(
    title="Modern Radio API",
    description="A modern web radio application with real-time features",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for real-time features
active_connections: Dict[str, List[WebSocket]] = {}
now_playing_data: Dict[str, Dict] = {}
user_sessions: Dict[str, Dict] = {}

# Mock data for demonstration
MOCK_CHANNELS = [
    {
        "id": "1",
        "name": "Chill Lo-Fi",
        "description": "Relaxing lo-fi beats to study and chill",
        "genre": "Lo-Fi",
        "image_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop",
        "color": "#4F46E5",
        "current_listeners": 1242,
        "is_live": True,
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
        "color": "#06B6D4",
        "current_listeners": 876,
        "is_live": True,
        "schedule": {
            "tuesday": ["08:00-12:00 Work Flow", "15:00-19:00 Deep Sessions"]
        }
    },
    {
        "id": "3",
        "name": "Jazz Lounge",
        "description": "Smooth jazz and classic standards",
        "genre": "Jazz",
        "image_url": "https://images.unsplash.com/photo-1511192336575-5a79af67b7f6?w=400&h=400&fit=crop",
        "color": "#10B981",
        "current_listeners": 543,
        "is_live": False,
        "schedule": {
            "wednesday": ["19:00-22:00 Evening Jazz"],
            "sunday": ["12:00-16:00 Sunday Relaxation"]
        }
    },
    {
        "id": "4",
        "name": "Synthwave",
        "description": "Retro synth and 80s vibes",
        "genre": "Electronic",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        "color": "#8B5CF6",
        "current_listeners": 321,
        "is_live": True
    },
    {
        "id": "5",
        "name": "Acoustic Mornings",
        "description": "Gentle acoustic starts to your day",
        "genre": "Acoustic",
        "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
        "color": "#F59E0B",
        "current_listeners": 198,
        "is_live": False
    },
    {
        "id": "6",
        "name": "Urban Beats",
        "description": "Latest hip-hop and urban sounds",
        "genre": "Hip-Hop",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        "color": "#EC4899",
        "current_listeners": 765,
        "is_live": True
    }
]

MOCK_TRACKS = {
    "1": [
        {"id": "101", "title": "Sunset Dreams", "artist": "Lofi Producer", "album": "Chill Vibes", "duration": 183, "cover_art": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop"},
        {"id": "102", "title": "Rainy Window", "artist": "Ambient Soul", "album": "Urban Sounds", "duration": 215, "cover_art": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop"},
        {"id": "103", "title": "Coffee Shop", "artist": "Study Beats", "album": "Focus Time", "duration": 197, "cover_art": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop"}
    ],
    "2": [
        {"id": "201", "title": "Digital Ocean", "artist": "Deep Focus", "album": "Productive Hours", "duration": 324, "cover_art": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop"},
        {"id": "202", "title": "Code Flow", "artist": "Tech Beats", "album": "Programming Sessions", "duration": 278, "cover_art": "https://images.unsplash.com/photo-1511192336575-5a79af67b7f6?w=300&h=300&fit=crop"}
    ]
}

@app.get("/")
async def root():
    return {"message": "Modern Radio API", "status": "online", "version": "2.0.0"}

@app.get("/api/channels", response_model=List[ChannelResponse])
async def get_channels(genre: Optional[str] = None, featured: bool = False):
    channels = MOCK_CHANNELS.copy()
    
    # Filter by genre if provided
    if genre:
        channels = [c for c in channels if c["genre"].lower() == genre.lower()]
    
    # Update listener counts from active connections
    for channel in channels:
        channel_id = channel["id"]
        channel["current_listeners"] = len(active_connections.get(channel_id, []))
    
    return channels

@app.get("/api/channels/{channel_id}", response_model=ChannelResponse)
async def get_channel(channel_id: str):
    channel = next((c for c in MOCK_CHANNELS if c["id"] == channel_id), None)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Update listener count
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

@app.get("/api/channels/{channel_id}/tracks", response_model=List[TrackResponse])
async def get_channel_tracks(channel_id: str):
    if channel_id not in MOCK_TRACKS:
        return []
    
    tracks = MOCK_TRACKS[channel_id]
    # Add affiliate links to each track
    for track in tracks:
        track["affiliate_links"] = {
            "spotify": f"https://open.spotify.com/track/{track['id']}",
            "apple_music": f"https://music.apple.com/track/{track['id']}",
            "amazon": f"https://amazon.com/music/track/{track['id']}"
        }
    
    return tracks

@app.get("/api/programs", response_model=List[ProgramResponse])
async def get_programs(channel_id: Optional[str] = None, upcoming: bool = True):
    # Mock program data
    programs = [
        {
            "id": "p1",
            "title": "Morning Chill",
            "description": "Start your day with relaxing lo-fi beats",
            "host": "DJ Chill",
            "channel_id": "1",
            "schedule": "Mon-Fri 06:00-10:00",
            "image_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=200&fit=crop",
            "next_airtime": datetime.now().replace(hour=6, minute=0, second=0) + timedelta(days=1)
        },
        {
            "id": "p2", 
            "title": "Deep Work Sessions",
            "description": "Focus-enhancing electronic music",
            "host": "Focus Master",
            "channel_id": "2",
            "schedule": "Tue-Thu 08:00-12:00",
            "image_url": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=200&fit=crop",
            "next_airtime": datetime.now().replace(hour=8, minute=0, second=0) + timedelta(days=1)
        }
    ]
    
    if channel_id:
        programs = [p for p in programs if p["channel_id"] == channel_id]
    
    if upcoming:
        programs = [p for p in programs if p["next_airtime"] > datetime.now()]
        programs.sort(key=lambda x: x["next_airtime"])
    
    return programs

@app.post("/api/messages")
async def send_message(message: UserMessage, background_tasks: BackgroundTasks):
    """Send user message/dedication"""
    message_id = str(uuid.uuid4())
    
    # Store message
    message_data = {
        "id": message_id,
        "user_id": message.user_id,
        "channel_id": message.channel_id,
        "type": message.type,
        "content": message.content,
        "timestamp": datetime.now().isoformat(),
        "status": "sent"
    }
    
    # Broadcast to channel via WebSocket
    background_tasks.add_task(broadcast_message, message.channel_id, message_data)
    
    return {"status": "sent", "message_id": message_id, "timestamp": message_data["timestamp"]}

@app.post("/api/notifications/subscribe")
async def subscribe_notifications(user_id: str, channel_id: str, program_id: Optional[str] = None):
    """Subscribe to notifications for a channel or program"""
    return {
        "status": "subscribed",
        "user_id": user_id,
        "channel_id": channel_id,
        "program_id": program_id,
        "message": "You'll receive notifications 15 minutes before shows"
    }

@app.get("/api/tracks/{track_id}/affiliate-links", response_model=AffiliateLinkResponse)
async def get_affiliate_links(track_id: str):
    """Get affiliate links for a track"""
    return {
        "track_id": track_id,
        "links": {
            "itunes": f"https://itunes.apple.com/track/{track_id}",
            "spotify": f"https://open.spotify.com/track/{track_id}",
            "amazon": f"https://amazon.com/music/track/{track_id}",
            "youtube": f"https://youtube.com/watch?v={track_id}"
        },
        "commission_rate": "5%"
    }

@app.websocket("/ws/{channel_id}")
async def websocket_endpoint(websocket: WebSocket, channel_id: str):
    await websocket.accept()
    
    # Add to active connections
    if channel_id not in active_connections:
        active_connections[channel_id] = []
    active_connections[channel_id].append(websocket)
    
    # Send initial data
    await send_initial_data(websocket, channel_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_websocket_message(websocket, channel_id, message)
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Clean up on disconnect
        if channel_id in active_connections and websocket in active_connections[channel_id]:
            active_connections[channel_id].remove(websocket)
        await broadcast_listener_count(channel_id)

async def send_initial_data(websocket: WebSocket, channel_id: str):
    """Send initial data when client connects"""
    # Send listener count
    await websocket.send_text(json.dumps({
        "type": "listener_count",
        "count": len(active_connections.get(channel_id, [])),
        "channel_id": channel_id
    }))
    
    # Send now playing info
    current_track = now_playing_data.get(channel_id, {}).get("track")
    if current_track:
        await websocket.send_text(json.dumps({
            "type": "now_playing",
            "track": current_track,
            "channel_id": channel_id,
            "progress": now_playing_data[channel_id].get("progress", 0)
        }))

async def handle_websocket_message(websocket: WebSocket, channel_id: str, message: dict):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    if message_type == "user_message":
        # Handle user messages/dedications
        await broadcast_message(channel_id, {
            "type": "user_message",
            "user_id": message.get("user_id", "anonymous"),
            "content": message.get("content"),
            "timestamp": datetime.now().isoformat()
        })
    
    elif message_type == "track_like":
        # Handle track likes
        await broadcast_message(channel_id, {
            "type": "track_like",
            "track_id": message.get("track_id"),
            "user_id": message.get("user_id"),
            "timestamp": datetime.now().isoformat()
        })
    
    elif message_type == "ping":
        await websocket.send_text(json.dumps({"type": "pong"}))

async def broadcast_message(channel_id: str, message: dict):
    """Broadcast message to all connected clients in a channel"""
    if channel_id in active_connections:
        disconnected = []
        for websocket in active_connections[channel_id]:
            try:
                await websocket.send_text(json.dumps(message))
            except:
                disconnected.append(websocket)
        
        # Clean up disconnected clients
        for ws in disconnected:
            active_connections[channel_id].remove(ws)

async def broadcast_listener_count(channel_id: str):
    """Broadcast updated listener count"""
    count = len(active_connections.get(channel_id, []))
    await broadcast_message(channel_id, {
        "type": "listener_count",
        "count": count,
        "channel_id": channel_id
    })

# Background task to simulate track changes
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_playback())

async def simulate_playback():
    """Simulate track playback and changes"""
    while True:
        for channel_id, tracks in MOCK_TRACKS.items():
            if tracks:
                current_track = tracks[0]  # Rotate tracks
                tracks.append(tracks.pop(0))
                
                now_playing_data[channel_id] = {
                    "track": current_track,
                    "started_at": datetime.now().isoformat(),
                    "progress": 0
                }
                
                # Broadcast now playing update
                await broadcast_message(channel_id, {
                    "type": "now_playing",
                    "track": current_track,
                    "channel_id": channel_id,
                    "progress": 0
                })
        
        await asyncio.sleep(30)  # Change track every 30 seconds

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")