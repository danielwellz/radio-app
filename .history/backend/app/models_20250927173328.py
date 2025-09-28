# backend/app/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_subscribed = Column(Boolean, default=False)
    subscription_type = Column(String, default="free")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Channel(Base):
    __tablename__ = "channels"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    stream_url = Column(String(500))
    hls_url = Column(String(500))
    is_live = Column(Boolean, default=False)
    current_listeners = Column(Integer, default=0)
    max_listeners = Column(Integer, default=1000)
    genre = Column(String(50))
    image_url = Column(String(500))
    schedule = Column(JSON)  # {day: {start: "09:00", end: "17:00", program: "Morning Show"}}
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, ForeignKey('users.id'))
    
    # Relationships
    tracks = relationship("Track", back_populates="channel")
    programs = relationship("Program", back_populates="channel")

class Track(Base):
    __tablename__ = "tracks"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    artist = Column(String(100), nullable=False)
    album = Column(String(100))
    duration = Column(Integer)  # in seconds
    file_path = Column(String(500))
    file_size = Column(Integer)
    audio_format = Column(String(10))
    bitrate = Column(Integer, default=128)
    channel_id = Column(String, ForeignKey('channels.id'))
    play_count = Column(Integer, default=0)
    last_played = Column(DateTime(timezone=True))
    affiliate_links = Column(JSON)  # {itunes: "url", spotify: "url", amazon: "url"}
    
    channel = relationship("Channel", back_populates="tracks")

class Program(Base):
    __tablename__ = "programs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    type = Column(String(50))  # podcast, live_show, scheduled
    schedule = Column(JSON)  # {days: ["mon", "wed", "fri"], time: "14:00", duration: 3600}
    is_live = Column(Boolean, default=False)
    host_id = Column(String, ForeignKey('users.id'))
    channel_id = Column(String, ForeignKey('channels.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    channel = relationship("Channel", back_populates="programs")
    episodes = relationship("ProgramEpisode", back_populates="program")

class ProgramEpisode(Base):
    __tablename__ = "program_episodes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    audio_url = Column(String(500))
    duration = Column(Integer)
    publish_date = Column(DateTime(timezone=True))
    program_id = Column(String, ForeignKey('programs.id'))
    listen_count = Column(Integer, default=0)
    
    program = relationship("Program", back_populates="episodes")

class Advertisement(Base):
    __tablename__ = "advertisements"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200))
    audio_url = Column(String(500))
    duration = Column(Integer)
    target_channels = Column(JSON)  # List of channel IDs
    target_genres = Column(JSON)   # List of genres
    max_plays = Column(Integer, default=1000)
    current_plays = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))

class UserInteraction(Base):
    __tablename__ = "user_interactions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey('users.id'))
    channel_id = Column(String, ForeignKey('channels.id'))
    interaction_type = Column(String(50))  # like, share, dedication, message
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    metadata = Column(JSON)