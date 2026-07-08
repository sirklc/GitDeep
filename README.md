# GitDeep

GitDeep is a SaaS that takes the link to any public GitHub repository and
scores it with AI (Claude) across **architecture quality, security, community
signals, and documentation** on a 0-100 scale, delivering the result as a PDF
report via email.

> **Status:** The backend is being actively rewritten. Right now only
> authentication (signup/login/password reset) and newsletter subscription
> work; the repo analysis pipeline (Celery, Claude integration, credit
> system, Stripe/Cryptomus) hasn't been migrated to this new backend yet.
> The frontend dashboard is currently a UI preview running entirely on mock
> data — it isn't wired up to the real API yet.

## Architecture overview

```
frontend/   Next.js 16 (App Router) + React 19 + next-intl (en/tr) + Tailwind 4
backend/    FastAPI + SQLAlchemy 2.0 + Alembic + Postgres (external server)
```

- **Backend (at this stage):** JWT/cookie-based authentication (signup,
  login, logout, `/me`, refresh), outgoing email from a purpose-specific
  sender address (password reset from `support@`, newsletter confirmation
  from `newsletter@`), and newsletter subscription. The database runs on a
  **separate server** — docker-compose does not host Postgres, it only
  connects to it via `DATABASE_URL`.
- **Frontend:** Open-source project landing page; signup/login/forgot-password
  flows are wired to the real backend; the dashboard (credits, analysis
  history, billing, notifications, etc.) is UI-only for now and uses mock
  data.

The analysis pipeline, credit ledger, and payment integrations (Celery,
Anthropic Claude, Stripe, Cryptomus) that existed in the previous version
have deliberately not been migrated to this backend yet; they'll be added
back in separate steps.

## Environment variables (.env)

```bash
cp .env.example .env
```

The most critical fields to fill in:

- `DATABASE_URL` — connection string for your own (external) Postgres server.
- `SECRET_KEY`, `REFRESH_SECRET_KEY`, `EMAIL_LINK_SECRET` — replace with long,
  random values in production.
- `SMTP_*` — Mailpit is used in dev (see below); use a real SMTP provider
  (SES, Postmark, Resend, etc.) in production.
- `EMAIL_FROM_SUPPORT` / `EMAIL_FROM_NEWSLETTER` / `EMAIL_FROM_DEFAULT` —
  different sender address per email type. When adding a new email type,
  just add a new `EMAIL_FROM_*` variable here.

## Quick start (Docker)

```bash
cp .env.example .env   # fill in the fields above
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (`/healthz` for health check, `/docs` for Swagger UI)
- Mailpit (dev SMTP interface — view every email sent here): http://localhost:8025

`docker-compose.yml` intentionally does **not** include a database service —
since Postgres is hosted on your own server, the backend container just
connects to it over the network via the `DATABASE_URL` in `.env`. On first
boot, the backend container runs `alembic upgrade head` and sets up the
tables automatically.

## Local development (without Docker)

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

## License

MIT — see [LICENSE](LICENSE).
