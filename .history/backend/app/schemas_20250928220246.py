from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ChannelBase(BaseModel):
    name: str
    description: Optional[str] = None
    genre: str

class ChannelCreate(ChannelBase):
    pass

class ChannelResponse(ChannelBase):
    id: str
    is_live: bool
    current_listeners: int
    stream_url: Optional[str] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class TrackBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    duration: int

class TrackResponse(TrackBase):
    id: str
    play_count: int
    affiliate_links: Optional[Dict[str, str]] = None
    cover_art: Optional[str] = None
    
    class Config:
        from_attributes = True

class NowPlayingResponse(BaseModel):
    track: Optional[Dict[str, Any]] = None
    channel: Dict[str, Any]
    listeners: int
    progress: int
    duration: int
    is_ad: bool

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: Dict[str, str]
    user_id: Optional[str] = None

class NotificationRequest(BaseModel):
    title: str
    body: str
    icon: Optional[str] = None
    data: Optional[Dict[str, Any]] = None