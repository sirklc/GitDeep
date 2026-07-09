from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Core — DATABASE_URL harici bir sunucudaki Postgres'i işaret eder,
    # docker-compose bu servisi kendi başına barındırmaz.
    database_url: str = "postgresql+psycopg://gitdeep:gitdeep@localhost:5432/gitdeep"
    secret_key: str = "change-me"
    refresh_secret_key: str = "change-me-too"
    email_link_secret: str = "change-me-hmac"
    frontend_url: str = "http://localhost:3000"
    allowed_origins: str = "http://localhost:3000"
    cookie_secure: bool = False

    # JWT / token ömürleri
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24
    refresh_token_minutes: int = 60 * 24 * 30
    password_reset_minutes: int = 60

    # SMTP bağlantısı — üretimde gerçek sağlayıcı (SES/Postmark/Resend vb.),
    # dev'de Mailpit.
    smtp_host: str = "mailpit"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_tls: str = "none"  # none | starttls | ssl

    # Amaca göre farklı gönderici adresleri — her e-posta türü kendi
    # kutusundan gider (support/newsletter/no-reply karışmasın).
    email_from_support: str = "support@gitdeep.dev"
    email_from_newsletter: str = "newsletter@gitdeep.dev"
    email_from_default: str = "no-reply@gitdeep.dev"

    # Repo analiz pipeline'ı (Faz 3) — mimari eksenini skorlayan Claude çağrısı.
    anthropic_api_key: str = ""

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
