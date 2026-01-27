from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api as api_router

app = FastAPI(title="THE_ONE+ API", version="0.1.0")

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://192.0.0.4:5173",
    "https://market-ready.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# include API
app.include_router(api_router)