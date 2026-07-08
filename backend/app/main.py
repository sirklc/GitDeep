from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, newsletter
from app.core.config import settings

app = FastAPI(title="GitDeep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(newsletter.router)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}
