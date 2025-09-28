@echo off
echo Starting Radio App Development Environment...

REM Start Redis (if using Docker)
echo Starting Redis...
docker start redis 2>nul || echo Redis not found or already running

REM Start Backend
echo Starting Backend Server...
cd backend
call venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause