from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Boolean
from sqlalchemy.sql import func
from .base import Base, generate_uuid

class Program(Base):
    __tablename__ = "programs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    host = Column(String(100))
    channel_id = Column(String, ForeignKey('channels.id'))
    schedule = Column(String(100))
    image_url = Column(String(500))
    next_airtime = Column(DateTime(timezone=True))

class Advertisement(Base):
    __tablename__ = "advertisements"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    image_url = Column(String(500))
    target_url = Column(String(500))
    duration = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())