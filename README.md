# GitDeep

GitDeep, herkese açık bir GitHub reposunun linkini alıp yapay zekâ (Claude) ile
**mimari kalite, güvenlik, topluluk sinyalleri ve dokümantasyon** eksenlerinde
0-100 arası puanlayan, sonucu PDF rapor olarak e-posta ile teslim eden bir SaaS'tır.

Kullanıcı kayıt olur, ücretsiz hoş geldin kredisi alır, repo linkini yapıştırır,
maliyeti görür, onaylar; analiz Celery kuyruğunda arka planda çalışır ve rapor
hazır olunca hem uygulama içinde hem e-postada kullanıcıyı bekler.

## Mimari özet

```
frontend/   Next.js 16 (App Router) + React 19 + next-intl (en/tr) + Tailwind 4
backend/    FastAPI + SQLAlchemy 2.0 + Alembic + Celery + Postgres + Redis
```

- **Backend**: JWT/cookie tabanlı kimlik doğrulama, append-only kredi ledger'ı,
  8 adımlı Celery analiz pipeline'ı, Anthropic Claude ile iki aşamalı LLM analizi,
  WeasyPrint ile PDF üretimi, SMTP ile e-posta teslimatı, Stripe + Cryptomus ile
  kredi satın alma.
- **Frontend**: Kayıt/giriş, kredi bakiyesi + satın alma, repo analiz akışı
  (teklif → onay → canlı ilerleme → rapor), analiz geçmişi.

Detaylı mimari, API referansı, kredi/ödeme akışı ve kurulum rehberi için
[`documents/`](documents/) klasörüne bakın:

- [Genel Bakış](documents/genel-bakis.md)
- [Teknoloji Yığını](documents/teknoloji-yigini.md)
- [Mimari](documents/mimari.md)
- [API Referansı](documents/api-referansi.md)
- [Kredi ve Ödeme Sistemi](documents/kredi-ve-odeme.md)
- [Kurulum ve Geliştirme](documents/kurulum-ve-gelistirme.md)
- [i18n (Çoklu Dil)](documents/i18n.md)

## Hızlı başlangıç

```bash
cp .env.example .env   # gerekli anahtarları doldurun (bkz. kurulum-ve-gelistirme.md)
docker compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (`/healthz` ile sağlık kontrolü)
- Mailpit (dev SMTP arayüzü): http://localhost:8025

Yerel geliştirme, testler ve ortam değişkenlerinin tam listesi için
[`documents/kurulum-ve-gelistirme.md`](documents/kurulum-ve-gelistirme.md).

## Lisans

MIT — bkz. [LICENSE](LICENSE).
