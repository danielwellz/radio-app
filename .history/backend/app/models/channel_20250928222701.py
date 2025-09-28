from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from .base import Base, generate_uuid

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