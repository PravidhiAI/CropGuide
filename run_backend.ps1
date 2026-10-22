Write-Host "==========================================================" -ForegroundColor Green
Write-Host " TERRAFORM -- Starting FastAPI Agricultural Backend Server" -ForegroundColor Cyan
Write-Host " Scenario: High-Altitude Cold Terrace Decision Support" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# Ensure working directory is the repository root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check Python installation
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not found in PATH. Please install Python 3.10+." -ForegroundColor Red
    exit 1
}

$VenvPython = Join-Path $ScriptDir ".venv\Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    Write-Host "Creating the backend virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Could not create the backend virtual environment." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

# Install requirements only when the project environment is missing them.
& $VenvPython -m pip show fastapi uvicorn pydantic sqlalchemy httpx *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    & $VenvPython -m pip install -r backend/requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Backend dependency installation failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

# Launch Uvicorn
Write-Host "`nStarting Uvicorn server on http://127.0.0.1:8000 ..." -ForegroundColor Green
Write-Host "API Documentation available at: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
& $VenvPython -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: The backend stopped unexpectedly." -ForegroundColor Red
    exit $LASTEXITCODE
}
