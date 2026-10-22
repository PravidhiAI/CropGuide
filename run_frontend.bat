@echo off
title TERRAFORM - Vite Frontend Server
cd /d "%~dp0\frontend"
echo ==========================================================
echo  TERRAFORM -- Starting Vite React Frontend Server
echo ==========================================================

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js/npm is not installed or not in PATH.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Starting Vite server on http://localhost:5173 ...
call npm run dev -- --host 127.0.0.1 --port 5173
pause
