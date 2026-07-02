# GitDeep 🔍

**GitDeep** is an advanced **Software Archaeology & Repository Analysis Platform** that dives deep into public GitHub projects to determine their health, contributor risk, and development intent using AI.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20PostgreSQL%20%7C%20Redis%20%7C%20Docker-blue)

---

## Features ✨

- **Activity & Decay Tracking** — Calculates commit stagnation and developer drop-off over time
- **Bus Factor Analysis** — Detects over-reliance on a single contributor
- **Semantic Intent (NLP)** — Categorizes commits (features vs. technical debt) via keyword heuristics; Gemini powers the reasoning & originality reports
- **Plagiarism Detection** — Scans code patterns for duplicated or copied logic
- **PDF Report Generation** — Professional academic-style reports with embedded charts
- **Analysis History** — Logged-in users can view their past analyses
- **React SPA** — Dark-mode dashboard built with React 19, TypeScript and Recharts
- **Async Background Jobs** — Long-running analyses managed via Celery + Redis

## Security 🔒

- **XSS Prevention** — All DOM insertions use `textContent` / `createElement`, no `innerHTML` with user data
- **SQL Injection** — Fully protected via SQLAlchemy ORM (parametrized queries)
- **Rate Limiting** — `/login` (10/min) and `/register` (5/min) via `fastapi-limiter` + Redis
- **CAPTCHA** — Cloudflare Turnstile on all auth forms
- **Nginx Security Headers** — `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`
- **JWT Authentication** — Access + Refresh token flow with strong random secret keys
- **Trusted Host Middleware** — Rejects requests with invalid `Host` headers

## Tech Stack 🛠️

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, Celery |
| Database | PostgreSQL |
| Cache / Queue | Redis |
| AI | Google Gemini API |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Recharts |
| PDF | FPDF2 |
| Security | Cloudflare Turnstile, fastapi-limiter, bcrypt |
| Infrastructure | Docker, Docker Compose, Nginx |

---

## Getting Started 🚀

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- A [GitHub Personal Access Token](https://github.com/settings/tokens)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- A [Cloudflare Turnstile](https://dash.cloudflare.com) Site Key & Secret Key

### 1. Clone the Repository

```bash
git clone https://github.com/betaforevers/GitDeep.git
cd GitDeep
```

### 2. Configure Environment Variables

Create `backend/.env` (never commit this file):

```bash
# GitHub & Gemini
GITHUB_PAT=your_github_pat_here
GEMINI_API_KEY=your_gemini_api_key_here

# Production URLs
BASE_URL=https://gitdeep.yourdomain.com
ALLOWED_ORIGINS=https://gitdeep.yourdomain.com

# Cloudflare Turnstile
CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key_here
CLOUDFLARE_TURNSTILE_SECRET=your_secret_key_here

# JWT Secrets — generate with: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your_random_secret_here
REFRESH_SECRET_KEY=your_random_refresh_secret_here
```

### 3. Run with Docker Compose

```bash
docker compose up -d --build
```

All services will start automatically:
- **Frontend** → `http://localhost:8080`
- **Backend API** → `http://localhost:8000`
- **PostgreSQL** → port `5432`
- **Redis** → port `6379`

---

## Architecture 🏗️

```
User Browser
    │
    ▼
 Nginx (Frontend SPA + Reverse Proxy)
    │
    ├─► /api/*  →  FastAPI Backend
    │               │
    │               ├─► PostgreSQL (users, analysis history)
    │               ├─► Redis (rate limiting, Celery queue)
    │               └─► Celery Worker (long-running analysis tasks)
    │                       │
    │                       ├─► GitHub API (repo data)
    │                       └─► Google Gemini (NLP reasoning)
    │
    └─► /reports/* → PDF Download
```

**Analysis Flow:**
1. User submits a GitHub URL → FastAPI validates and queues the job via Celery
2. Celery worker fetches repo data (commits, contributors, issues) from GitHub API
3. `MetricsEngine` computes health scores (bus factor, stagnation, etc.)
4. `ReasoningEngine` uses Gemini to generate a narrative summary
5. `ReportGenerator` builds a PDF with embedded charts
6. Result is stored in PostgreSQL and returned to the frontend

---

## Deployment 🌍

For production deployment behind Cloudflare:

1. Point your subdomain DNS → your server IP (set to **Proxied / orange cloud** for DDoS protection)
2. Set Cloudflare SSL → **Full (Strict)**
3. Update `BASE_URL` and `ALLOWED_ORIGINS` in `.env` to your production domain
4. Replace Cloudflare Turnstile keys with your production keys
5. Run `docker compose up -d --build` on the server

---

## Contributors 👥

| | Name | GitHub |
|---|---|---|
| 👨‍💻 | Mehmet Kılıç | [@sirklc](https://github.com/sirklc) |
| 👩‍💻 | Tuba Çetin | [@cetintuba](https://github.com/cetintuba) |

*Built with ❤️ by [betaforevers](https://betaforevers.com)*

---

<details>
<summary>🇹🇷 Türkçe Dokümantasyon</summary>

# GitDeep 🔍

**GitDeep**, yapay zeka destekli gelişmiş bir **Yazılım Arkeolojisi & Depo Analiz Platformu**dur. Halka açık GitHub projelerini derinlemesine inceleyerek proje sağlığını, katkıcı riskini ve geliştirme niyetini analiz eder.

---

## Özellikler ✨

- **Aktivite & Çöküş Takibi** — Commit durağanlığını ve geliştirici düşüşünü matematiksel olarak hesaplar
- **Bus Factor Analizi** — Projenin tek bir katkıcıya aşırı bağımlılığını tespit eder
- **Semantik Niyet (NLP)** — Commit'leri anahtar kelime sezgileriyle kategorize eder (özellikler vs. teknik borç); Gemini ise muhakeme ve orijinallik raporlarını üretir
- **İntihal Tespiti** — Kopyalanmış veya fazla mükerrer kod kalıplarını tarar
- **PDF Rapor Üretimi** — Gömülü grafikler içeren profesyonel akademik raporlar
- **Analiz Geçmişi** — Giriş yapmış kullanıcılar geçmiş analizlerini görüntüleyebilir
- **React SPA** — React 19, TypeScript ve Recharts ile koyu temalı gösterge paneli
- **Asenkron Arka Plan İşleri** — Celery + Redis ile yönetilen uzun süreli analizler

## Güvenlik 🔒

- **XSS Koruması** — Tüm DOM işlemleri `textContent` / `createElement` ile yapılır
- **SQL Injection** — SQLAlchemy ORM sayesinde tam koruma
- **Rate Limiting** — `/login` (10/dk) ve `/register` (5/dk) sınırı
- **CAPTCHA** — Tüm kimlik doğrulama formlarında Cloudflare Turnstile
- **Nginx Güvenlik Başlıkları** — `X-Frame-Options`, `X-Content-Type-Options` vb.
- **JWT Kimlik Doğrulama** — Access + Refresh token akışı

## Kurulum 🚀

### Gereksinimler
- Docker & Docker Compose
- GitHub Personal Access Token
- Google Gemini API Anahtarı
- Cloudflare Turnstile Site Key & Secret Key

### 1. Depoyu Klonla

```bash
git clone https://github.com/betaforevers/GitDeep.git
cd GitDeep
```

### 2. `.env` Dosyasını Oluştur

`backend/.env` dosyası oluştur (bu dosyayı commit etme!):

```bash
GITHUB_PAT=github_tokenin
GEMINI_API_KEY=gemini_api_anhtarin

BASE_URL=https://gitdeep.sirklc.com
ALLOWED_ORIGINS=https://gitdeep.sirklc.com

CLOUDFLARE_TURNSTILE_SITE_KEY=site_keyin
CLOUDFLARE_TURNSTILE_SECRET=secret_keyin

# Güçlü rastgele değer oluştur: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=guclu_rastgele_deger
REFRESH_SECRET_KEY=baska_guclu_rastgele_deger
```

### 3. Docker ile Başlat

```bash
docker compose up -d --build
```

- **Frontend** → `http://localhost:8080`
- **Backend API** → `http://localhost:8000`

## Dağıtım 🌍

Cloudflare arkasında production dağıtımı için:

1. DNS kaydında subdomain → sunucu IP → **Proxied (turuncu bulut)** seç (DDoS koruması)
2. Cloudflare SSL → **Full (Strict)** seç
3. `.env` dosyasındaki `BASE_URL` ve `ALLOWED_ORIGINS` değerlerini production domain ile güncelle
4. Sunucuda `docker compose up -d --build` çalıştır

## Katkıda Bulunanlar 👥

| | İsim | GitHub |
|---|---|---|
| 👨‍💻 | Mehmet Kılıç | [@sirklc](https://github.com/sirklc) |
| 👩‍💻 | Tuba Çetin | [@cetintuba](https://github.com/cetintuba) |

</details>
