# backend/app/api/channels.py
from fastapi import APIRouter, HTTPException, Depends, WebSocket, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import json

from ..database import get_db
from .. import models, schemas, crud
from ..services import audio_service, websocket_manager

router = APIRouter()

@router.get("/channels", response_model=List[schemas.ChannelResponse])
async def get_channels(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    channels = db.query(models.Channel).offset(skip).limit(limit).all()
    return channels

@router.get("/channels/{channel_id}", response_model=schemas.ChannelResponse)
async def get_channel(channel_id: str, db: Session = Depends(get_db)):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

@router.get("/channels/{channel_id}/now-playing", response_model=schemas.NowPlayingResponse)
async def get_now_playing(channel_id: str, db: Session = Depends(get_db)):
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Get current track from audio service
    current_track = audio_service.current_tracks.get(channel_id, {})
    
    return {
        "channel": channel,
        "track": current_track,
        "listeners": websocket_manager.listener_counts.get(channel_id, 0),
        "progress": current_track.get('progress', 0)
    }

@router.get("/channels/{channel_id}/tracks", response_model=List[schemas.TrackResponse])
async def get_channel_tracks(channel_id: str, db: Session = Depends(get_db)):
    tracks = db.query(models.Track).filter(models.Track.channel_id == channel_id).all()
    return tracks

@router.websocket("/ws/channels/{channel_id}")
async def websocket_channel(websocket: WebSocket, channel_id: str):
    await websocket_manager.connect(websocket, channel_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages from clients
            message_data = json.loads(data)
            await handle_websocket_message(channel_id, message_data)
    except:
        await websocket_manager.disconnect(websocket, channel_id)

async def handle_websocket_message(channel_id: str, message_data: dict):
    message_type = message_data.get('type')
    
    if message_type == 'user_message':
        # Handle user messages/dedications
        await websocket_manager.send_user_message(channel_id, message_data)
    
    elif message_type == 'track_like':
        # Handle track likes
        pass

# backend/app/api/interactions.py
router = APIRouter()

@router.post("/messages")
async def send_message(message: schemas.UserMessage, db: Session = Depends(get_db)):
    """Send user message/dedication"""
    # Save message to database
    db_message = models.UserInteraction(
        user_id=message.user_id,
        channel_id=message.channel_id,
        interaction_type=message.type,
        content=message.message
    )
    db.add(db_message)
    db.commit()
    
    # Broadcast to channel via WebSocket
    await websocket_manager.send_user_message(message.channel_id, {
        'user_id': message.user_id,
        'message': message.message,
        'type': message.type
    })
    
    return {"status": "message_sent"}

@router.post("/channels/{channel_id}/share")
async def share_channel(channel_id: str, platform: str, db: Session = Depends(get_db)):
    """Share channel on social media"""
    channel = db.query(models.Channel).filter(models.Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Log share interaction
    share_interaction = models.UserInteraction(
        channel_id=channel_id,
        interaction_type="share",
        metadata={"platform": platform}
    )
    db.add(share_interaction)
    db.commit()
    
    return {"status": "shared", "platform": platform}

# backend/app/api/affiliate.py
router = APIRouter()

@router.get("/tracks/{track_id}/affiliate-links", response_model=schemas.AffiliateLinkResponse)
async def get_affiliate_links(track_id: str, db: Session = Depends(get_db)):
    """Get affiliate links for a track"""
    track = db.query(models.Track).filter(models.Track.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    # Generate affiliate links (mock implementation)
    affiliate_links = {
        "itunes": f"https://itunes.apple.com/link?track={track_id}",
        "spotify": f"https://open.spotify.com/track/sample",
        "amazon": f"https://amazon.com/music/track/{track_id}"
    }
    
    return {"track_id": track_id, "links": affiliate_links}

# Include all routers in main.py
app.include_router(router, prefix="/api/v1")