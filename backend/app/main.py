from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api

app = FastAPI(title="THE_ONE+ API", version="1.0.0")
from app.db.session import engine
from app.db.base import Base

@app.on_event("startup")
def init_db():
    Base.metadata.create_all(bind=engine)
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root (fixes your 404 on base domain)
@app.get("/")
def root():
    return {"status": "ok", "service": "theo-one-market", "docs": "/docs", "api": "/api"}

# Existing routes
@app.get("/health")
def health():
    return {"ok": True, "env": settings.APP_ENV}

# API routes
app.include_router(api, prefix="/api")
