from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from .base import Base, generate_uuid

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