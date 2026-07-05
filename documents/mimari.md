# Mimari

## Klasör yapısı

### Backend (`backend/app/`)

```
app/
  main.py                    FastAPI uygulaması, CORS, Sentry init, lifespan (Redis init/close), router mount
  core/
    config.py                pydantic-settings Settings sınıfı, CREDIT_PACKAGES, CREDIT_TIERS, credits_for_repo_size()
    security.py               Argon2 parola hash, JWT access/refresh token, HMAC e-posta doğrulama token'ı, sha256_file()
    ratelimit.py               Redis INCR+EXPIRE tabanlı rate limiter (Redis erişilemezse "fail open" — no-op)
  api/
    auth.py                    /api/auth: register, login, refresh, logout, me, verify-email, resend-verification
    credits.py                  /api/credits: balance, history
    analyze.py                   /api/analyze: quote, create, history, job status
    payments.py                   /api/payments: packages, checkout/{stripe,cryptomus}, webhooks/{stripe,cryptomus}
    reports.py                     /api/reports/{job_id} (JSON) ve /{job_id}/pdf (dosya indirme)
    deps.py                        get_current_user, get_verified_user, csrf_protect, cookie yardımcıları
  db/
    database.py                     SQLAlchemy engine/session (Base, SessionLocal, get_db)
    models.py                        User, CreditTransaction, AnalysisJob, Payment (+ enum'lar)
  schemas/
    auth.py                          RegisterRequest, LoginRequest, UserOut, MessageOut
  services/
    claude_client.py                  İki aşamalı Claude entegrasyonu (bkz. aşağı)
    github_service.py                  GitHub API metadata (PyGithub)
    repo_fetcher.py                     Bare/shallow git clone + güvenli blob okuma
    static_scan.py                       Secret regex tarayıcı + dependency manifest parser
    credits.py                           Ledger tabanlı kredi motoru (charge/refund/purchase/signup bonus)
    stripe_gateway.py                     Stripe Checkout Session oluşturma + webhook imza doğrulama
    cryptomus_gateway.py                   Cryptomus invoice oluşturma + webhook imza doğrulama (HMAC/MD5)
    mailer.py                               SMTP gönderim (doğrulama e-postası, rapor e-postası + PDF eki)
    report_pdf.py                            WeasyPrint HTML→PDF render
    turnstile.py                             Cloudflare Turnstile doğrulama
  worker/
    celery_app.py                           Celery app yapılandırması (Redis broker+backend)
    tasks.py                                 analyze_repo_task — 8 adımlı analiz pipeline'ı
  templates/
    report.html                              PDF rapor şablonu (Jinja2, mor/turkuaz marka)
    email_en.html / email_tr.html             Rapor-hazır e-posta şablonları
  tests/
    conftest.py                               Postgres tabanlı, SAVEPOINT izole test fixture'ları
    test_credits.py, test_auth.py, test_analyze.py, test_payments.py
```

### Frontend (`frontend/src/`)

```
src/
  app/[locale]/
    layout.tsx              Kök layout — font'lar, NextIntlClientProvider, global <Header/>
    page.tsx                  Landing sayfası (pazarlama, açık kaynak)
    login/, register/           AuthForm bileşenini kullanan sayfalar
    verify-email/                 E-posta doğrulama sonuç sayfası
    dashboard/                     Kredi bakiyesi, "Kredi al" ve "Analiz başlat" CTA'ları, kredi geçmişi tablosu
    analyze/                        Repo linki gir → teklif gör → onayla
    analyze/[jobId]/                  Canlı ilerleme (2sn polling)
    reports/[jobId]/                    Puanlı rapor görünümü + PDF indirme
    history/                             Geçmiş analizler tablosu
    billing/                              Kredi paketleri + Stripe/Cryptomus satın alma
  components/
    AuthForm.tsx               Login/register ortak form bileşeni
    Header.tsx                   Global nav — giriş durumu + kredi bakiyesi (client-side ada bileşen)
  lib/
    api.ts                        Genel fetch sarmalayıcı: CSRF header enjeksiyonu, 401'de tek seferlik refresh retry
  i18n/
    routing.ts, navigation.ts, request.ts    next-intl yapılandırması
```

## Analiz Pipeline'ı {#analiz-pipeline}

`app/worker/tasks.py::analyze_repo_task`, `bind=True` bir Celery görevi
(`name="analyze_repo"`), her adımda hem veritabanına hem Celery state'ine
yazan, restart-safe (yeniden başlatılabilir) 8 adımlı bir işlemdir:

1. **GitHub metadata** — `github_service.get_repo_overview()` + `get_commit_messages()`.
2. **Klon** — `repo_fetcher.clone_bare()`: `git clone --bare --depth=1`, `GIT_TERMINAL_PROMPT=0`, `clone_timeout_seconds` (varsayılan 60sn) ile sınırlı.
3. **Ağaç + README + manifest** — `git ls-tree -r -l HEAD`; README ve bağımlılık manifestleri (derinlik ≤1, <200KB) okunur.
4. **Statik tarama** — secret regex kuralları + manifest parse (`static_scan.py`), en fazla 2000 dosya taranır.
5. **Claude çağrı 1 (ucuz model)** — `select_critical_files()`: ağaç + README + manifest gönderilir, 3-5 kritik dosya + tespit edilen dil + proje tipi istenir.
6. **Claude çağrı 2 (güçlü model)** — `review_repo()`: GitHub istatistikleri, commit mesajları, statik bulgular, bağımlılıklar, README ve SADECE seçilen dosyaların içeriği (üst sınır `max_selected_file_kb`/`max_selected_total_kb`, toplam 150KB) gönderilir → yapılandırılmış `RepoReview`.
7. **Sonuç + PDF** — `report_pdf.generate_pdf()` ile rapor render edilir, SHA-256 bütünlük hash'i hesaplanır.
8. **E-posta + tamamlama** — `_finalize_and_email()`: job tamamlanmış işaretlenir, rapor e-postası gönderilir (e-posta gönderim hatası pipeline'ı BAŞARISIZ YAPMAZ).

Ayrıca **6 saatlik sonuç önbelleği** vardır: aynı owner/repo son
`analysis_cache_hours` saatte tamamlandıysa, pipeline doğrudan 7. adıma atlar
ve önbellekteki sonucu/PDF'i kopyalar.

Herhangi bir istisna durumunda: rollback → job `failed` → kredi idempotent
olarak iade edilir (`credit_service.refund_for_analysis`) → job `refunded`.
`finally` bloğu her koşulda `repo_fetcher.cleanup()` çağırarak klon dizinini
siler.

### Neden sandbox yerine "hiç çalıştırma" stratejisi?

Klonlanan kod için ayrı bir konteyner/process sandbox (gVisor, Docker-in-Docker,
seccomp) **kullanılmıyor**. Bunun yerine mitigasyon stratejisi "klonlanan kodu
asla execute etme"dir:

- Klon `--bare` yapılır — working tree/checkout yoktur.
- Tüm okumalar sadece `git cat-file blob` / `git ls-tree` alt-process
  çağrılarıyla yapılır (asla `npm install`, `pip install`, script çalıştırma yok).
- `GIT_TERMINAL_PROMPT=0` / `GIT_ASKPASS=echo` interaktif prompt'ları engeller.
- Sabit klon timeout'u vardır.

Bu, kötü niyetli bir reponun keyfi kod çalıştırmasına karşı etkilidir (zaten
hiç kod çalıştırılmıyor), ancak bir "git bomb" / aşırı büyük blob'un paylaşılan
worker host'unda disk tüketmesine karşı **disk kotası veya bellek limiti
yoktur** — bu bilinen, kabul edilmiş bir sınırlamadır.

## Kredi Ledger Tasarımı

`app/services/credits.py`, tüm kredi hareketlerinin **tek geçidi** olan
`_apply()` fonksiyonu etrafında kurulmuştur:

- `credit_transactions` tablosu **append-only**'dir (satırlar asla güncellenmez/silinmez).
- Gerçek bakiye kaynağı ledger'dır; `users.credit_balance` denormalize bir
  önbellektir ve HER değişim ledger insert'iyle **aynı veritabanı transaction'ında**
  atomik olarak güncellenir:
  ```sql
  UPDATE users SET credit_balance = credit_balance + :delta
  WHERE id = :user_id AND credit_balance + :delta >= 0
  RETURNING credit_balance
  ```
  Bu `WHERE` koşulu, negatif bakiyeyi veritabanı seviyesinde imkansız kılar
  (race condition'da bile).
- `idempotency_key` unique constraint'i ikinci savunma hattıdır — webhook
  replay'i veya Celery task retry'ı aynı krediyi iki kez vermez/almaz. Anahtar
  desenleri: `signup:{user_id}`, `charge:{job_id}`, `refund:{job_id}`,
  `{provider}:{provider_ref}` (satın alma).

Bu tasarım sayesinde `grant_for_payment()` (ödeme webhook'unda çağrılır) ile
`charge_for_analysis()`/`refund_for_analysis()` (analiz pipeline'ında çağrılır)
aynı güvenli ilkeyi paylaşır — kredi mantığı ödeme sistemi eklenirken hiç
değiştirilmedi, sadece yeniden kullanıldı.

## Ödeme Akışı (Stripe + Cryptomus)

Detaylar için [kredi-ve-odeme.md](kredi-ve-odeme.md) dosyasına bakın. Özet:
satın alma isteği önce `status=pending` bir `Payment` satırı oluşturur, ardından
sağlayıcıya (Stripe/Cryptomus) yönlendirme URL'i alınır. Webhook geldiğinde
imza doğrulanır, ilgili `Payment` bulunur (id/metadata/provider_ref sırasıyla),
zaten `paid` değilse `grant_for_payment()` çağrılır. Webhook route'ları
`csrf_protect`/cookie-auth KULLANMAZ — tek kimlik doğrulama imza kontrolüdür.
