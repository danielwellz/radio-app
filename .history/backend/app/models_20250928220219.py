from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Channel(Base):
    __tablename__ = "channels"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    stream_url = Column(String(500))
    is_live = Column(Boolean, default=False)
    current_listeners = Column(Integer, default=0)
    genre = Column(String(50))
    image_url = Column(String(500))
    color = Column(String(7))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    artist = Column(String(100), nullable=False)
    album = Column(String(100))
    duration = Column(Integer)
    file_path = Column(String(500))
    channel_id = Column(String, ForeignKey('channels.id'))
    play_count = Column(Integer, default=0)
    affiliate_links = Column(JSON)
    cover_art = Column(String(500))

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    endpoint = Column(Text, nullable=False)
    keys = Column(JSON, nullable=False)
    user_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String)
    channel_id = Column(String, ForeignKey('channels.id'))
    interaction_type = Column(String(50))  # like, share, dedication
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())