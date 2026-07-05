from contextlib import asynccontextmanager

import sentry_sdk
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.ratelimit import close_redis, init_redis

log = structlog.get_logger()

if settings.sentry_dsn:
    sentry_sdk.init(dsn=settings.sentry_dsn, traces_sample_rate=0.1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    yield
    await close_redis()


from app.api import analyze, auth, credits, payments, reports  # noqa: E402

app = FastAPI(title="GitDeep API", lifespan=lifespan)

app.include_router(auth.router)
app.include_router(credits.router)
app.include_router(analyze.router)
app.include_router(reports.router)
app.include_router(payments.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz() -> dict:
    return {"status": "ok"}
