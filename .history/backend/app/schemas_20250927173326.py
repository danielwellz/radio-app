# backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class TrackBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    duration: int
    bitrate: int = 128

class TrackCreate(TrackBase):
    channel_id: str

class TrackResponse(TrackBase):
    id: str
    play_count: int
    affiliate_links: Optional[Dict[str, str]] = None
    last_played: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ChannelBase(BaseModel):
    name: str
    description: Optional[str] = None
    genre: str
    image_url: Optional[str] = None

class ChannelCreate(ChannelBase):
    pass

class ChannelResponse(ChannelBase):
    id: str
    is_live: bool
    current_listeners: int
    stream_url: Optional[str] = None
    schedule: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProgramBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str

class ProgramResponse(ProgramBase):
    id: str
    is_live: bool
    schedule: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class NowPlayingResponse(BaseModel):
    track: TrackResponse
    channel: ChannelResponse
    listeners: int
    progress: int  # seconds
    is_ad: bool = False

class UserMessage(BaseModel):
    user_id: str
    channel_id: str
    message: str
    type: str = "dedication"  # dedication, shoutout, general

class AffiliateLinkResponse(BaseModel):
    track_id: str
    links: Dict[str, str]  # platform -> url