# Kredi ve Ödeme Sistemi

## Kredi paketleri

`backend/app/core/config.py::CREDIT_PACKAGES` (MVP'de sabit, canlıda DB'ye taşınabilir):

| Kod | Kredi | Fiyat (USD) |
|---|---|---|
| `starter` | 100 | $5.00 |
| `pro` | 300 | $12.00 |
| `bulk` | 1000 | $35.00 |

Kayıt olan her kullanıcı `SIGNUP_BONUS_CREDITS` (varsayılan 100) kredi ile başlar.

## Analiz tarifesi (repo boyutuna göre kademeli)

`credits_for_repo_size()` — `CREDIT_TIERS`:

| Repo boyutu | Kredi |
|---|---|
| ≤ 50 MB | 50 |
| ≤ 200 MB | 75 |
| ≤ 500 MB | 100 |
| > 500 MB | 150 |

Bu, sabit "1 analiz = 50 kredi" değil, repo boyutuna göre ölçeklenen bir tarifedir.

## Satın alma akışı

1. Kullanıcı `/billing` sayfasında bir paket seçer, "Kartla öde" (Stripe) veya
   "Kripto ile öde" (Cryptomus) tıklar.
2. Frontend `POST /api/payments/checkout/{stripe|cryptomus}` çağırır
   (`get_verified_user` + CSRF gerekir — kredi satın almak da e-posta
   doğrulaması ister, analizle aynı kural).
3. Backend **önce** `status=pending` bir `Payment` satırı ekler (`provider_ref`
   henüz `None`), sonra sağlayıcının API'sini çağırır:
   - **Stripe**: `stripe.checkout.Session.create(...)` — `client_reference_id=payment.id`
     ve `metadata={"payment_id": ...}` ile gönderilir (webhook eşleştirmesi için).
   - **Cryptomus**: `POST https://api.cryptomus.com/v2/payment` — `order_id=payment.id`
     ile gönderilir (Cryptomus bunu webhook payload'unda aynen geri döner).
4. Dönen `checkout_url`'e `payment.provider_ref` yazılır, kullanıcı bu URL'e
   yönlendirilir (tarayıcı sağlayıcının barındırdığı ödeme sayfasına gider).
5. Ödeme tamamlanınca sağlayıcı **webhook** gönderir:
   - `POST /api/payments/webhooks/stripe` — imza `stripe.Webhook.construct_event()`
     ile doğrulanır (`STRIPE_WEBHOOK_SECRET`).
   - `POST /api/payments/webhooks/cryptomus` — imza `md5(base64(json)+api_key)`
     HMAC karşılaştırmasıyla doğrulanır (`CRYPTOMUS_API_KEY`).
6. Webhook, `payment.id` (client_reference_id/metadata/order_id üzerinden) veya
   `provider_ref` ile ilgili `Payment` satırını bulur; zaten `paid` ise hiçbir
   şey yapmadan `200` döner (idempotent no-op — replay güvenli).
7. Aksi halde `status=paid`, `paid_at`, `raw_payload` (denetim için tüm ham
   payload) yazılır ve `credit_service.grant_for_payment()` çağrılır — bu da
   `idempotency_key=f"{provider}:{provider_ref}"` ile korunan aynı ledger
   fonksiyonudur (bkz. [mimari.md](mimari.md#kredi-ledger-tasarımı)).
8. Kullanıcı `?status=success` ile `/billing`'e geri döner; frontend kısa bir
   süre (≈15sn, 2sn aralıklarla) `GET /api/credits/balance`'ı yoklayıp yeni
   bakiyeyi gösterir (webhook, tarayıcı yönlendirmesinden birkaç saniye geç
   kalabilir).

## Neden bu kadar sıkı idempotency?

Ödeme webhook'ları **replay edilebilir** (sağlayıcı 2xx almazsa tekrar dener,
bazen ağ katmanında da çiftlenebilir). Çift kredi verilmesi doğrudan parasal
kayıptır. Bu yüzden üç bağımsız savunma katmanı var:
1. Webhook handler'da `payment.status == paid` kontrolü (en dış, en ucuz kontrol).
2. `credit_transactions.idempotency_key` unique constraint (veritabanı seviyesinde kesin).
3. `_apply()`'ın atomik `UPDATE ... RETURNING` deseni (aynı anda gelen iki isteğin birbirini ezmesini önler).

## Bilinen sınırlamalar / açık notlar

- **Gerçek API anahtarı yok**: kod yapısal olarak tamdır ama gerçek Stripe
  test anahtarları / Cryptomus sandbox hesabı olmadan uçtan uca denenemez.
- **Cryptomus imza serileştirmesi**: `_sign()`'daki `json.dumps` key sırasının
  Cryptomus'un PHP tarafındaki serileştirmeyle birebir eşleştiği varsayımı,
  gerçek bir sandbox hesabı olmadan doğrulanamadı — kod kendi içinde tutarlı
  (sign→verify round-trip test'i geçiyor) ama gerçek sunucuyla henüz test edilmedi.
- **Yerel geliştirmede webhook**: Stripe/Cryptomus `localhost:8000`'e
  ulaşamaz — Stripe için `stripe listen --forward-to localhost:8000/api/payments/webhooks/stripe`
  CLI tüneli gerekir.
