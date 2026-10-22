@echo off
title TERRAFORM - FastAPI Backend Server
cd /d "%~dp0"
echo ==========================================================
echo  TERRAFORM -- Starting FastAPI Backend Server
echo  Scenario: High-Altitude Cold Terrace Decision Support
echo ==========================================================

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
    echo Creating the backend virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo Error: Could not create the backend virtual environment.
        exit /b 1
    )
)

".venv\Scripts\python.exe" -m pip show fastapi uvicorn pydantic sqlalchemy httpx >nul 2>&1
if errorlevel 1 (
    echo Installing backend dependencies...
    ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo Error: Backend dependency installation failed.
        exit /b 1
    )
)

echo Starting Uvicorn server on http://127.0.0.1:8000 ...
echo API Docs: http://127.0.0.1:8000/docs
".venv\Scripts\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
if errorlevel 1 (
    echo Error: Backend failed to start. Check the error message above.
    exit /b 1
)
pause
