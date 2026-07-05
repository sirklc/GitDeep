# Teknoloji Yığını

## Backend (`backend/`)

| Teknoloji | Neden seçildi |
|---|---|
| **FastAPI** (`>=0.115`) | Pydantic ile tip güvenli istek/yanıt şemaları, otomatik OpenAPI, async/sync route'ları birlikte destekler (webhook'lar `async def`, çoğu route `def`). |
| **SQLAlchemy 2.0** (`Mapped`/`mapped_column` stili) | Modern, tip destekli ORM; `Enum`, `JSON`, `Numeric` gibi Postgres'e özgü tipleri doğrudan destekler. |
| **Alembic** | Şema migrasyonları — proje şu an tek migration'da (`0001_initial.py`) tüm şemayı taşıyor. |
| **PostgreSQL 16** | Kredi ledger'ının atomik `UPDATE ... RETURNING` deseni ve `Enum`/`JSON`/`Numeric` tipleri Postgres'e özgü davranışa dayanıyor — bu yüzden testler de SQLite değil gerçek Postgres üzerinde çalışır. |
| **Celery + Redis** | Analiz işlemi hiçbir zaman HTTP isteği içinde yapılmaz; kuyruğa alınır. Redis hem broker hem result backend hem de rate-limiter deposu olarak kullanılır. |
| **Argon2 (argon2-cffi)** | Parola hashleme — OWASP'ın güncel önerisi (bcrypt yerine). |
| **PyJWT** | Access/refresh token imzalama (HS256). |
| **Anthropic Python SDK** (`>=0.45`) | Claude API çağrıları — iki aşamalı analiz (ucuz model seçim, güçlü model inceleme). |
| **PyGithub** | GitHub REST API'sinden repo metadata (yıldız, boyut, commit mesajları vb.). |
| **WeasyPrint** | HTML/CSS'ten PDF üretimi — rapor şablonu `templates/report.html`. |
| **Jinja2** | PDF ve e-posta şablonları için templating. |
| **stripe (Python SDK, `>=11`)** | Stripe Checkout Session oluşturma ve webhook imza doğrulama. |
| **httpx** | Cryptomus'un resmi Python SDK'sı olmadığı için ham REST çağrıları; ayrıca Turnstile doğrulaması ve test ortamında `TestClient` için. |
| **structlog** | Yapılandırılmış (JSON) loglama. |
| **Sentry SDK** | Hata izleme (opsiyonel, `SENTRY_DSN` boşsa devre dışı). |
| **pytest + pytest-cov** | Test çatısı — `backend/requirements-dev.txt`. |

## Frontend (`frontend/`)

| Teknoloji | Neden seçildi |
|---|---|
| **Next.js 16** (App Router, Turbopack) | Sunucu bileşenleri + `[locale]` segment tabanlı i18n routing. **Önemli**: bu sürüm önceki Next.js sürümlerine göre kırıcı değişiklikler içerir (`frontend/AGENTS.md`), yeni kod yazmadan önce `node_modules/next/dist/docs/` kontrol edilmeli. |
| **React 19** | `use()` hook'u ile async route param'larının (`params: Promise<...>`) unwrap edilmesi; tüm client bileşenlerde bu desen kullanılıyor. |
| **next-intl** | `en`/`tr` çoklu dil desteği — `messages/en.json` ve `messages/tr.json` her zaman birlikte güncellenir. |
| **Tailwind CSS v4** (`@theme inline`) | Tasarım token'ları CSS değişkenleri olarak tanımlanıp Tailwind sınıflarına eşleniyor (`bg-primary`, `text-accent` vb.). |
| **TypeScript** | Tüm frontend kodu tipli; backend Pydantic şemalarının TS karşılıkları elle senkron tutuluyor (`frontend/src/lib/api.ts` ve sayfa içi local interface'ler). |
| **ESLint** (`eslint-plugin-react-hooks` dahil) | `react-hooks/set-state-in-effect` ve `react-hooks/immutability` gibi React Compiler'a hazırlık kurallarını da kapsıyor — bu kurallar `window.location.href = ...` gibi doğrudan mutasyonları ve effect içinde senkron `setState` çağrısını reddeder. |

## Altyapı

- **Docker Compose** (`docker-compose.yml`) — `redis`, `db` (Postgres), `backend`, `celery_worker`, `frontend`, `mailpit` (dev SMTP) servislerini tek komutla ayağa kaldırır.
- **GitHub Actions** (`.github/workflows/ci.yml`) — backend testleri (Postgres + Redis service container) ve frontend lint/typecheck/build.
