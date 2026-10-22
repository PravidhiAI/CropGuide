@echo off
title TERRAFORM - Unified Full-Stack Launcher
cd /d "%~dp0"
echo ==========================================================
echo  TERRAFORM -- Launching Backend and Frontend Services
echo ==========================================================

start "TERRAFORM Backend" cmd /k "run_backend.bat"
start "TERRAFORM Frontend" cmd /k "run_frontend.bat"

timeout /t 3 >nul
start http://localhost:5173
