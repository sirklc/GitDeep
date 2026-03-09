from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.api.auth import router as auth_router
from app.db.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialise Redis-backed rate limiter on startup."""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    try:
        import redis.asyncio as aioredis
        from fastapi_limiter import FastAPILimiter
        redis_conn = await aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(redis_conn)
        print("✅ FastAPILimiter initialised with Redis.")
    except Exception as e:
        print(f"⚠️  FastAPILimiter could not connect to Redis ({e}). Rate limiting disabled.")

    yield  # application runs here

    # Teardown (optional cleanup)

from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "*"] # Use specific domains in production
)

os.makedirs("reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "GitDeep Archaeology API is running"}
