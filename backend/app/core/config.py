from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class CreditPackage:
    def __init__(self, code: str, credits: int, amount_usd: float, name: str):
        self.code = code
        self.credits = credits
        self.amount_usd = amount_usd
        self.name = name


# Kredi paketleri — canlıda değişecekse DB'ye taşınır, MVP'de sabit.
CREDIT_PACKAGES: dict[str, CreditPackage] = {
    "starter": CreditPackage("starter", 100, 5.00, "Starter"),
    "pro": CreditPackage("pro", 300, 12.00, "Pro"),
    "bulk": CreditPackage("bulk", 1000, 35.00, "Bulk"),
}

# Repo boyutuna göre kademeli analiz tarifesi (MB üst sınırı -> kredi).
# None üst sınırı = sınırsız dilim.
CREDIT_TIERS: list[tuple[int | None, int]] = [
    (50, 50),
    (200, 75),
    (500, 100),
    (None, 150),
]


def credits_for_repo_size(size_mb: float) -> int:
    for upper_mb, credits in CREDIT_TIERS:
        if upper_mb is None or size_mb <= upper_mb:
            return credits
    return CREDIT_TIERS[-1][1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Core
    database_url: str = "postgresql+psycopg://gitdeep:gitdeep_password@db:5432/gitdeep"
    redis_url: str = "redis://redis:6379/0"
    secret_key: str = "change-me"
    refresh_secret_key: str = "change-me-too"
    email_link_secret: str = "change-me-hmac"
    backend_base_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    allowed_origins: str = "http://localhost:3000"
    cookie_secure: bool = False

    # JWT
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24
    refresh_token_minutes: int = 60 * 24 * 30
    email_link_hours: int = 24

    # LLM
    anthropic_api_key: str = ""
    claude_model_select: str = "claude-haiku-4-5"
    claude_model_review: str = "claude-sonnet-5"

    # GitHub
    github_pat: str = ""

    # Credits
    signup_bonus_credits: int = 100

    # Analiz kuralları
    clone_timeout_seconds: int = 60
    analysis_cache_hours: int = 6
    max_file_read_kb: int = 100
    max_selected_file_kb: int = 50
    max_selected_total_kb: int = 150

    # Stripe
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""

    # Cryptomus
    cryptomus_merchant_id: str = ""
    cryptomus_api_key: str = ""
    cryptomus_test_mode: bool = True

    # SMTP
    smtp_host: str = "mailpit"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "reports@gitdeep.dev"
    smtp_tls: str = "none"  # none | starttls | ssl

    # Turnstile
    turnstile_secret: str = "1x0000000000000000000000000000000AA"

    # Sentry
    sentry_dsn: str = ""

    # Paths
    reports_dir: str = "/app/reports"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
