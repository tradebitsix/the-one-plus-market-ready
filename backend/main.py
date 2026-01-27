import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import router

app = FastAPI()

# Comma-separated list, e.g.
# CORS_ORIGINS="https://the-one-plus-market-ready.vercel.app,http://localhost:5173"
origins = os.getenv("CORS_ORIGINS", "")
origins_list = [o.strip() for o in origins.split(",") if o.strip()]

# CORS rule:
# - If origins are explicit, we can allow credentials (cookies/auth headers).
# - If origins fall back to "*", credentials MUST be disabled (browser blocks wildcard+credentials).
allow_credentials = True
if not origins_list:
    origins_list = ["*"]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"ok": True, "docs": "/docs", "api_base": "/api"}

@app.get("/api/health")
def health():
    return {"ok": True}
```0