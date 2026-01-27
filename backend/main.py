import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# If your repo is /app/app/main.py, this import is usually:
# from app.api.router import router
# Keep whichever path matches your repo structure.
from api.router import router

# Force docs endpoints to exist (so /docs is never “Not Found” unless you explicitly disable it)
app = FastAPI(
    title=os.getenv("APP_TITLE", "THE_ONE+ API"),
    version=os.getenv("APP_VERSION", "0.1.0"),
    docs_url="/docs",
    openapi_url="/openapi.json",
    redoc_url=None,
)

# CORS_ORIGINS="https://your-frontend.vercel.app,http://localhost:5173"
origins = (os.getenv("CORS_ORIGINS") or "").strip()
origins_list = [o.strip() for o in origins.split(",") if o.strip()]

# If no explicit origins, allow all BUT without credentials (required by browsers)
allow_credentials = bool(origins_list)
if not origins_list:
    origins_list = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=[
        "*",
        "Authorization",
        "Content-Type",
        "X-Tenant-Id",
        "X-Requested-With",
    ],
)

# Your API is mounted under /api
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {
        "ok": True,
        "docs": "/docs",
        "openapi": "/openapi.json",
        "api_base": "/api",
        "health": "/api/health",
    }

@app.get("/api/health")
def health():
    return {"ok": True}