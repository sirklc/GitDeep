from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GitDeep Archaeology API"
    GITHUB_PAT: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # JWT - must be set in .env, never hardcoded in production
    SECRET_KEY: str = "change-me-in-production"
    REFRESH_SECRET_KEY: str = "change-me-refresh-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30          # 30 days

    # CORS - comma-separated list of allowed origins in .env
    ALLOWED_ORIGINS: str = "http://localhost:8080,http://localhost:3000"

    # Base URL used for building PDF download links
    BASE_URL: str = "http://localhost:8000"

    # Cloudflare Turnstile - set your real keys in .env for production
    # Test secret (always passes): 1x0000000000000000000000000000000AA
    # Test site key (always passes): 1x00000000000000000000AA
    CLOUDFLARE_TURNSTILE_SECRET: str = "1x0000000000000000000000000000000AA"
    CLOUDFLARE_TURNSTILE_SITE_KEY: str = "1x00000000000000000000AA"

    # Database
    DATABASE_URL: Optional[str] = None

    def get_allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
