from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.ideas import router as ideas_router


app = FastAPI(
    title="FOUNDry API",
    description="AI-powered multi-agent startup operating system",
    version="0.1.0",
)


# Allow the React development frontend to communicate with FastAPI.
# Hackathon configuration only.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://foundry-topaz.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(ideas_router)


@app.get("/")
def root():
    return {
        "name": "FOUNDry",
        "status": "running",
        "message": "FOUNDry multi-agent backend is online.",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }
