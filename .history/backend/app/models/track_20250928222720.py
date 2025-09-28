from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from .base import Base, generate_uuid

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