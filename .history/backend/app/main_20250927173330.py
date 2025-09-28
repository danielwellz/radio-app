# backend/app/main.py
from fastapi import FastAPI, WebSocket, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import asyncio
import json
from datetime import datetime, timedelta

from .database import SessionLocal, engine, Base
from . import models, schemas, crud, services

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Web Radio API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# WebSocket connections
active_connections = {}
listener_counts = {}

@app.on_event("startup")
async def startup_event():
    # Initialize background tasks
    asyncio.create_task(services.audio_monitoring_service())
    asyncio.create_task(services.notification_service())

@app.get("/")
async def root():
    return {"message": "Web Radio API", "status": "running"}

# Mount static files for audio streams
app.mount("/streams", StaticFiles(directory="streams"), name="streams")