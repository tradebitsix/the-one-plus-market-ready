from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api as api_router

app = FastAPI(title="THE_ONE+ API", version="0.1.0")

# allow exact origins from env + allow Vercel preview regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list(),  # exact matches
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",  # previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(api_router)