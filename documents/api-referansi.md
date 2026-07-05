# API Referansı

Tüm uçlar `/api` altında toplanır. Kimlik doğrulama httpOnly cookie'lerle
yapılır (`gd_access`, `gd_refresh`); state değiştiren isteklerde double-submit
CSRF deseni kullanılır (`gd_csrf` cookie'si `X-CSRF-Token` header'ında
tekrarlanır). Frontend'in `lib/api.ts` fonksiyonu bunu otomatik yapar.

**Auth seviyeleri:**
- **Yok** — herkese açık.
- `get_current_user` — geçerli `gd_access` cookie'si yeterli.
- `get_verified_user` — yukarıdakine ek olarak `email_verified_at` dolu olmalı (403 döner, aksi halde).

## Auth — `/api/auth`

| Method & Path | Auth | Rate limit | Açıklama |
|---|---|---|---|
| `POST /register` | Yok | 5/60sn | Turnstile doğrulama + kayıt + signup bonus kredi + doğrulama e-postası + cookie set. |
| `POST /login` | Yok | 10/60sn | Turnstile doğrulama + parola kontrolü + cookie set. |
| `POST /refresh` | Refresh cookie | — | Yeni access+refresh+csrf cookie seti döner. |
| `POST /logout` | Yok | — | Cookie'leri temizler. |
| `GET /me` | `get_current_user` | — | `UserOut` döner. |
| `GET /verify-email?token=` | Yok | — | HMAC imzalı token'ı doğrular, `email_verified_at` set eder. |
| `POST /resend-verification` | `get_current_user` | 3/300sn | Doğrulama e-postasını tekrar gönderir. |

`UserOut`: `{id, email, locale, email_verified, credit_balance, created_at}`

## Kredi — `/api/credits`

| Method & Path | Auth | Açıklama |
|---|---|---|
| `GET /balance` | `get_current_user` | `{credit_balance}` |
| `GET /history?limit=50` | `get_current_user` | Ledger satırları (en yeni önce, üst sınır 200). |

`TransactionOut`: `{id, delta, balance_after, reason, job_id, created_at}` —
`reason` ∈ `signup_bonus | analysis_charge | analysis_refund | purchase`.

## Analiz — `/api/analyze`

| Method & Path | Auth | Rate limit | Açıklama |
|---|---|---|---|
| `POST /quote` | `get_verified_user` | 20/60sn | Repo boyutuna göre maliyeti hesaplar, bakiye/bakiye-sonrası döner. Kredi düşmez. |
| `POST /` | `get_verified_user` + CSRF | 10/3600sn | Kredi düşer + `AnalysisJob` oluşturur + Celery'e enqueue eder. Aynı anda sadece 1 aktif iş olabilir (409). Yetersiz kredide 402. |
| `GET /history?limit=20` | `get_verified_user` | — | Geçmiş işler (üst sınır 100). |
| `GET /{job_id}` | `get_verified_user` | — | Tek işin durumu (polling için). |

`QuoteOut`: `{repo, size_mb, credits, balance, balance_after}`
`JobStatusOut`: `{job_id, repo, status, progress_step, progress_total, progress_message, overall_score, error_message, credits_charged, created_at}`
`status` ∈ `queued | processing | completed | failed | refunded`

## Rapor — `/api/reports`

| Method & Path | Auth | Açıklama |
|---|---|---|
| `GET /{job_id}` | `get_verified_user` | Tamamlanmış işin JSON raporu (409 eğer henüz hazır değilse). |
| `GET /{job_id}/pdf` | `get_verified_user` | PDF dosya indirme. |

## Ödeme — `/api/payments`

| Method & Path | Auth | Açıklama |
|---|---|---|
| `GET /packages` | Yok | Kredi paketlerini listeler (public fiyatlandırma). |
| `POST /checkout/stripe` | `get_verified_user` + CSRF | Stripe Checkout Session oluşturur, `{payment_id, checkout_url}` döner. |
| `POST /checkout/cryptomus` | `get_verified_user` + CSRF | Cryptomus invoice oluşturur, `{payment_id, checkout_url}` döner. |
| `POST /webhooks/stripe` | **Yok** (imza doğrulama) | `checkout.session.completed` event'inde krediyi işler. |
| `POST /webhooks/cryptomus` | **Yok** (imza doğrulama) | `status=paid` payload'unda krediyi işler. |

`PackageOut`: `{code, name, credits, amount_usd}` — bkz. [kredi-ve-odeme.md](kredi-ve-odeme.md).

## Rate limiting davranışı

`app/core/ratelimit.py`, Redis `INCR`+`EXPIRE` ile IP bazlı sabit pencere
limiti uygular. **Redis'e erişilemezse limitleyici sessizce no-op olur**
("fail open") — asıl koruma katmanları Cloudflare Turnstile ve e-posta
doğrulamasıdır, rate limit ek bir katmandır.

## Hata formatı

Tüm hatalar FastAPI'nin standart `{"detail": "..."}` gövdesiyle döner. Sık
kod: `400` geçersiz girdi, `401` kimlik doğrulama yok/geçersiz, `402` yetersiz
kredi, `403` e-posta doğrulanmamış / CSRF hatası, `404` bulunamadı, `409`
çakışan durum (aktif iş var / rapor henüz hazır değil), `429` rate limit.
