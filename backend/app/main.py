from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api as api_router  # app/api/router.py

app = FastAPI(title="THE_ONE+ API", version="0.1.0")

# ---- CORS (SINGLE SOURCE OF TRUTH) ----
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://192.0.0.4:5173",
    "https://market-ready.vercel.app",
    # add your real custom domain here when you have it:
    # "https://theone.yourdomain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- HEALTH CHECK ----
@app.get("/health")
def health():
    return {"status": "ok"}

# ---- ROUTERS ----
app.include_router(api_router)
```0