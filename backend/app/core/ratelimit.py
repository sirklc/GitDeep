"""Redis INCR+EXPIRE tabanlı hafif rate limiter.

fastapi-limiter güncel FastAPI sürümleriyle uyumsuz olduğu için kendi
bağımsız implementasyonumuz. Redis erişilemezse sessizce no-op olur —
asıl koruma katmanları Turnstile + email doğrulamadır.
"""

import redis.asyncio as aioredis
import structlog
from fastapi import Depends, HTTPException, Request

from app.core.config import settings

log = structlog.get_logger()

_redis: aioredis.Redis | None = None


async def init_redis() -> None:
    global _redis
    try:
        _redis = aioredis.from_url(settings.redis_url, decode_responses=True)
        await _redis.ping()
        log.info("rate_limiter_initialized")
    except Exception as exc:
        _redis = None
        log.warning("rate_limiter_disabled", error=str(exc))


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


def rate_limit(times: int, seconds: int):
    """Endpoint başına IP bazlı limit: `seconds` penceresinde en fazla `times` istek."""

    async def dependency(request: Request) -> None:
        if _redis is None:
            return
        ip = request.client.host if request.client else "unknown"
        key = f"rl:{request.scope['path']}:{ip}"
        try:
            count = await _redis.incr(key)
            if count == 1:
                await _redis.expire(key, seconds)
            if count > times:
                raise HTTPException(status_code=429, detail="Too many requests")
        except HTTPException:
            raise
        except Exception as exc:
            log.warning("rate_limit_check_failed", error=str(exc))

    return Depends(dependency)
