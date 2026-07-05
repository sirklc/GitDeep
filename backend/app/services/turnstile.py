import httpx
import structlog

from app.core.config import settings

log = structlog.get_logger()

VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

# Cloudflare'in "her zaman geçer" test secret'ı — dev/test ortamı işareti.
ALWAYS_PASS_TEST_SECRET = "1x0000000000000000000000000000000AA"


async def verify_turnstile(token: str, remote_ip: str | None = None) -> bool:
    if settings.turnstile_secret == ALWAYS_PASS_TEST_SECRET:
        return True
    data: dict = {"secret": settings.turnstile_secret, "response": token}
    if remote_ip:
        data["remoteip"] = remote_ip
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(VERIFY_URL, data=data)
            return bool(resp.json().get("success"))
    except Exception as exc:
        # Cloudflare'a ulaşılamazsa kullanıcıyı bloklamak yerine logla ve geçir;
        # asıl koruma katmanları rate limit + email doğrulamadır.
        log.warning("turnstile_unreachable", error=str(exc))
        return True
