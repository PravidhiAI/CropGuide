import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.db import init_db
# New:
# from app.database.db import init_db
from backend.app.api.endpoints import router as api_router
# from app.api.endpoints import router as api_router
from backend.app.knowledge_base.loader import kb

# Immediate database initialization
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    kb.load_all()
    yield

app = FastAPI(
    title="TERRAFORM — AI Agricultural Intelligence System",
    description="Deterministic Decision-Support Engine for High-Altitude Cold Terrace Agriculture",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration for local Vite and production frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "system": "TERRAFORM Agricultural Intelligence Platform",
        "scenario": "High-Altitude Cold Terrace",
        "status": "online",
        "api_docs": "/docs",
        "api_v1": "/api/v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
