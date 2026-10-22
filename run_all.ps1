Write-Host "==========================================================" -ForegroundColor Green
Write-Host " TERRAFORM — Launching Full-Stack Agricultural System" -ForegroundColor Cyan
Write-Host " Starting Backend (Port 8000) and Frontend (Port 5173)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start backend in a separate window
Start-Process powershell -ArgumentList "-NoExit", "-File", "$ScriptDir/run_backend.ps1"

# Start frontend in a separate window
Start-Process powershell -ArgumentList "-NoExit", "-File", "$ScriptDir/run_frontend.ps1"

Start-Sleep -Seconds 3
Write-Host "`nOpening browser at http://localhost:5173 ..." -ForegroundColor Green
Start-Process "http://localhost:5173"
