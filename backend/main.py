import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import router

app = FastAPI()

origins = os.getenv("CORS_ORIGINS", "")
origins_list = [o.strip() for o in origins.split(",") if o.strip()]

# If Railway forgot the env var, do not block traffic
if not origins_list:
    origins_list = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")