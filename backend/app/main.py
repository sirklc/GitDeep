import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import analysis, auth, newsletter
from app.core.config import settings

log = structlog.get_logger()

app = FastAPI(title="GitDeep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Starlette's default 500 handler runs outside CORSMiddleware, so the
    # browser sees a CORS-blocked "Failed to fetch" instead of the real
    # error. Handling it here keeps the response inside CORSMiddleware.
    log.exception("unhandled_exception", path=request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


app.include_router(auth.router)
app.include_router(newsletter.router)
app.include_router(analysis.router)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}
