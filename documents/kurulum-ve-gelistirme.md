# Kurulum ve Geliştirme

## Docker Compose ile (önerilen)

```bash
cp .env.example .env
# .env içindeki anahtarları doldurun (bkz. aşağıdaki tablo)
docker compose up -d
```

Servisler: `redis`, `db` (Postgres 16), `backend` (FastAPI, migration'ları
otomatik uygular: `alembic upgrade head && uvicorn ...`), `celery_worker`,
`frontend` (Next.js), `mailpit` (dev SMTP yakalayıcı).

- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (`/healthz`)
- Mailpit arayüzü: http://localhost:8025 (SMTP: 1025)

Docker Desktop kapalıysa: `systemctl --user start docker-desktop`.

## Ortam değişkenleri (`.env`)

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg://gitdeep:gitdeep_password@db:5432/gitdeep` | Postgres bağlantısı. |
| `REDIS_URL` | `redis://redis:6379/0` | Celery broker/backend + rate limiter. |
| `SECRET_KEY` / `REFRESH_SECRET_KEY` | — | JWT imzalama anahtarları — **üretimde mutlaka değiştirin**. |
| `EMAIL_LINK_SECRET` | — | E-posta doğrulama linklerinin HMAC imza anahtarı. |
| `BACKEND_BASE_URL` | `http://localhost:8000` | Webhook URL'lerinin oluşturulmasında kullanılır (`url_callback` vb.). |
| `FRONTEND_URL` | `http://localhost:3000` | E-posta linkleri ve ödeme sonrası redirect URL'leri için. |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS izinli origin listesi (virgülle ayrık). |
| `COOKIE_SECURE` | `false` | Üretimde `true` olmalı (HTTPS zorunlu). |
| `ANTHROPIC_API_KEY` | boş | Boşsa Claude çağrıları deterministik stub döner (dev/test). |
| `CLAUDE_MODEL_SELECT` | `claude-haiku-4-5` | Aşama 1 (dosya seçimi) modeli. |
| `CLAUDE_MODEL_REVIEW` | `claude-sonnet-5` | Aşama 2 (derin inceleme) modeli. |
| `GITHUB_PAT` | boş | GitHub API rate limit'ini yükseltmek için opsiyonel personal access token. |
| `SIGNUP_BONUS_CREDITS` | `100` | Kayıtta verilen ücretsiz kredi. |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | boş | Stripe Checkout + webhook doğrulama için. |
| `CRYPTOMUS_MERCHANT_ID` / `CRYPTOMUS_API_KEY` / `CRYPTOMUS_TEST_MODE` | boş / boş / `true` | Cryptomus invoice + webhook imzası için. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` / `SMTP_TLS` | `mailpit` / `1025` / boş / boş / `reports@gitdeep.dev` / `none` | Dev ortamında Mailpit'e gönderir; üretimde gerçek SMTP sağlayıcısı. |
| `TURNSTILE_SECRET` | Cloudflare'in "her zaman geçer" test secret'ı | Üretimde gerçek Cloudflare Turnstile secret'ı ile değiştirilmeli. |
| `SENTRY_DSN` | boş | Boşsa Sentry devre dışı. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Frontend'in backend'e istek atacağı temel URL. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare test site key | Frontend Turnstile widget'ı için (henüz UI'da render edilmiyor). |

## Docker olmadan yerel geliştirme

### Backend

```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt -r requirements-dev.txt
# Postgres ve Redis'in yerel/erişilebilir olduğundan emin olun, sonra:
DATABASE_URL=postgresql+psycopg://gitdeep:gitdeep_password@localhost:5432/gitdeep \
  ./venv/bin/alembic upgrade head
DATABASE_URL=postgresql+psycopg://gitdeep:gitdeep_password@localhost:5432/gitdeep \
  ./venv/bin/uvicorn app.main:app --reload
```

Celery worker'ı ayrıca çalıştırmak için:
```bash
./venv/bin/celery -A app.worker.celery_app worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # localhost:3000, proxy backend'e :8000 üzerinden gider
```

## Testler

Backend testleri **gerçek Postgres** üzerinde çalışır (SQLite değil — ledger'ın
`RETURNING` deseni ve `Enum`/`JSON`/`Numeric` tipleri Postgres'e özgüdür):

```bash
# Bir kerelik test veritabanı (Docker ile hızlı yol):
docker run -d --name gitdeep_test_pg -p 5432:5432 \
  -e POSTGRES_USER=gitdeep -e POSTGRES_PASSWORD=gitdeep_password -e POSTGRES_DB=gitdeep_test \
  postgres:16-alpine

cd backend
./venv/bin/pip install -r requirements.txt -r requirements-dev.txt
TEST_DATABASE_URL=postgresql+psycopg://gitdeep:gitdeep_password@localhost:5432/gitdeep_test \
  ./venv/bin/pytest -q
```

Test fixture'ları (`tests/conftest.py`) her testi kendi SAVEPOINT'inde
çalıştırır — uygulama kodunun `commit()`/`rollback()` çağırması dış test
transaction'ını etkilemez, test bitince her şey geri alınır. E-posta gönderimi
(`send_verification_email`) otomatik olarak no-op'a çevrilir (gerçek SMTP'ye
gitmez).

Frontend için:
```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

CI'da (`.github/workflows/ci.yml`) aynı adımlar Postgres+Redis service
container'larıyla otomatik çalışır.
