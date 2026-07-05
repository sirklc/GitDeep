# Genel Bakış

## GitDeep nedir?

GitDeep, herkese açık bir GitHub reposunun linkini alıp yapay zekâ (Anthropic
Claude) ile dört eksende analiz eden ve sonucu hem uygulama içinde hem PDF
rapor olarak e-postayla teslim eden bir SaaS ürünüdür:

1. **Mimari Kalite (0-30 puan)** — separation of concerns, clean code, ölçeklenebilirlik.
2. **Güvenlik (0-30 puan)** — hardcoded secret taraması, bağımlılık riski.
3. **Engagement/Community (0-20 puan)** — GitHub istatistikleri, README kalitesi.
4. **Dokümantasyon (0-20 puan)** — commit mesajı kalitesi, README profesyonelliği.

Toplam puan 0-100 arasıdır ve dört alt puanın toplamıdır.

## Hangi sorunu çözer?

Bir geliştirici/işveren, bir GitHub reposunun (kendi projesi, bir adayın
portfolyosu, bir bağımlılık adayı) gerçekte ne durumda olduğunu manuel olarak
değerlendirmek yerine, birkaç dakika içinde yapılandırılmış, kanıta dayalı
bir "code review" raporu alır. Rapor hem teknik (mimari/güvenlik) hem de
profesyonel sunum (dokümantasyon/topluluk) açısından değerlendirme yapar.

## Uçtan uca kullanıcı akışı

1. **Kayıt** — kullanıcı e-posta + parola ile kayıt olur (`POST /api/auth/register`).
   Kayıt anında `SIGNUP_BONUS_CREDITS` (varsayılan 100) kredi hesabına tanımlanır
   ve bir doğrulama e-postası gönderilir.
2. **E-posta doğrulama** — analiz başlatmak ve kredi satın almak için e-posta
   doğrulanmış olmalıdır (`get_verified_user` kuralı). Doğrulanmamış kullanıcı
   403 alır ve arayüzde "doğrulama e-postasını tekrar gönder" seçeneği çıkar.
3. **Repo linki + teklif** — kullanıcı `/analyze` sayfasında bir GitHub linki
   girer, `POST /api/analyze/quote` ile maliyeti (repo boyutuna göre kademeli
   kredi tarifesi) ve satın alma sonrası bakiyesini görür.
4. **Onay** — `POST /api/analyze` ile analiz kuyruğa alınır: kredi hemen
   düşülür (aynı transaction'da job kaydı + ledger satırı), Celery görevi
   `analyze_repo_task.apply_async` ile tetiklenir.
5. **Canlı ilerleme** — `/analyze/{jobId}` sayfası `GET /api/analyze/{job_id}`
   uç noktasını 2 saniyede bir yoklar (polling), 8 adımlık ilerleme çubuğunu
   gösterir.
6. **Analiz pipeline'ı (arka planda, Celery worker)** — bkz. [mimari.md](mimari.md#analiz-pipeline).
   Repo klonlanır (asla çalıştırılmaz), statik güvenlik taraması yapılır, Claude
   iki aşamada çağrılır (önce kritik dosya seçimi, sonra derin inceleme), PDF
   rapor üretilir.
7. **Sonuç** — analiz tamamlanınca kullanıcı otomatik olarak `/reports/{jobId}`
   sayfasına yönlendirilir; ayrıca raporun PDF'i eklenmiş bir e-posta alır.
   Hata durumunda kredi otomatik iade edilir (`status=refunded`).
8. **Geçmiş** — `/history` sayfasında geçmiş tüm analizler (durum, puan, tarih)
   listelenir.
9. **Kredi tükenince** — `/billing` sayfasından Stripe (kart) veya Cryptomus
   (kripto) ile yeni kredi paketi satın alınır; ödeme onaylanınca webhook
   krediyi otomatik hesaba işler. Bkz. [kredi-ve-odeme.md](kredi-ve-odeme.md).

## Neden "üyelik zorunlu"?

Analiz işlemi hesaplama açısından pahalıdır (GitHub API çağrıları + repo klonu
+ iki LLM çağrısı + PDF üretimi). Bu yüzden GitDeep bilinçli olarak "önce kayıt
ol, sonra analiz et" modelini seçmiştir — anonim/misafir analiz akışı yoktur.
Bu, kredi sisteminin ve kötüye kullanım önleminin (rate limit + Cloudflare
Turnstile + e-posta doğrulama) temelini oluşturur.
