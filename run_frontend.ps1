Write-Host "==========================================================" -ForegroundColor Green
Write-Host " TERRAFORM — Starting Vite React Frontend Dev Server" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

# Ensure working directory is frontend
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir/frontend"

# Check Node installation
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm is not found in PATH. Please install Node.js 18+." -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nStarting Vite server on http://localhost:5173 ..." -ForegroundColor Green
npm run dev -- --host 127.0.0.1 --port 5173
