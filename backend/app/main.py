from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth
from app.api.routes import tenants
from app.api.routes import admin
from app.api.routes import memory
from app.api.routes import growth
from app.api.routes import safety
from app.api.routes import billing

app = FastAPI(title="THE_ONE+ API")
@app.get("/")
def root():
    return {
        "ok": True,
        "health": "/health",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }
# CORS — allow frontend + Railway
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://192.0.0.4:5173",
        "https://theo-one-market-production.up.railway.app",
        "https://theo-one-market-production.up.railway.app/docs"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- HEALTH CHECK ----
@app.get("/health")
def health():
    return {"status": "ok"}
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
    "https://market-ready.vercel.app",
    "https://your-production-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---- ROUTERS ----
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tenants.router, prefix="/api/tenants", tags=["tenants"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
app.include_router(growth.router, prefix="/api/growth", tags=["growth"])
app.include_router(safety.router, prefix="/api/safety", tags=["safety"])
app.include_router(billing.router, prefix="/api/billing", tags=["billing"])
