export type JobStatus = "queued" | "processing" | "completed" | "failed" | "refunded";

export type ScoreAxis = {
    score: number;
    maxScore: number;
    summary: string;
};

export type AnalysisAxes = {
    architecture: ScoreAxis;
    security: ScoreAxis;
    engagement: ScoreAxis;
    documentation: ScoreAxis;
};

export type AnalysisJob = {
    id: string;
    repo: string;
    repoUrl: string;
    status: JobStatus;
    overallScore: number | null;
    creditsCharged: number;
    createdAt: string;
    axes: AnalysisAxes | null;
    recommendations: string[];
    verdict: string | null;
    secretFindings: string[];
};

export const mockAnalyses: AnalysisJob[] = [
    {
        id: "8f2a1c4e",
        repo: "sirklc/gitdeep",
        repoUrl: "https://github.com/sirklc/gitdeep",
        status: "completed",
        overallScore: 84,
        creditsCharged: 60,
        createdAt: "2026-07-07T09:12:00Z",
        axes: {
            architecture: { score: 26, maxScore: 30, summary: "Katmanlar net ayrılmış, servis sınırları tutarlı." },
            security: { score: 24, maxScore: 30, summary: "Sabit kodlanmış gizli anahtar bulunamadı; birkaç eski bağımlılık var." },
            engagement: { score: 16, maxScore: 20, summary: "README güçlü, katkı rehberi eksik." },
            documentation: { score: 18, maxScore: 20, summary: "Commit mesajları açıklayıcı ve tutarlı." },
        },
        recommendations: [
            "CONTRIBUTING.md ekleyerek katkı sürecini netleştirin.",
            "Bağımlılıklardaki 2 eski paketi güncelleyin.",
            "Kritik servisler için entegrasyon testleri ekleyin.",
        ],
        verdict: "Sağlam bir mimari üzerine kurulu, üretime yakın bir proje.",
        secretFindings: [],
    },
    {
        id: "3b7d9f01",
        repo: "vercel/next.js",
        repoUrl: "https://github.com/vercel/next.js",
        status: "completed",
        overallScore: 92,
        creditsCharged: 90,
        createdAt: "2026-07-05T14:40:00Z",
        axes: {
            architecture: { score: 29, maxScore: 30, summary: "Monorepo yapısı ve modülerlik örnek düzeyde." },
            security: { score: 27, maxScore: 30, summary: "Düzenli güvenlik denetimi ve responsible disclosure süreci var." },
            engagement: { score: 20, maxScore: 20, summary: "Çok aktif topluluk, yüksek star/fork oranı." },
            documentation: { score: 16, maxScore: 20, summary: "Dokümantasyon geniş ama bazı API'ler güncel değil." },
        },
        recommendations: [
            "Deneysel API dokümantasyonunu stabil sürümle senkronize edin.",
            "Daha küçük katkılar için 'good first issue' etiketlemesini artırın.",
            "Migration rehberlerine sürüm bazlı changelog ekleyin.",
        ],
        verdict: "Endüstri standardı seviyesinde, referans alınabilecek bir kod tabanı.",
        secretFindings: [],
    },
    {
        id: "c19e5a2d",
        repo: "acme/legacy-api",
        repoUrl: "https://github.com/acme/legacy-api",
        status: "completed",
        overallScore: 47,
        creditsCharged: 60,
        createdAt: "2026-07-02T08:05:00Z",
        axes: {
            architecture: { score: 12, maxScore: 30, summary: "Katmanlar iç içe geçmiş, tek bir dosyada iş mantığı birikmiş." },
            security: { score: 9, maxScore: 30, summary: "Kaynak kodunda düz metin API anahtarı tespit edildi." },
            engagement: { score: 10, maxScore: 20, summary: "README yetersiz, son commit 8 ay önce." },
            documentation: { score: 16, maxScore: 20, summary: "Kurulum adımları açık ama mimari anlatılmamış." },
        },
        recommendations: [
            "Tespit edilen API anahtarını derhal iptal edip .env'e taşıyın.",
            "İş mantığını servis katmanına ayırın.",
            "README'ye mimari diyagramı ve kurulum bağımlılıklarını ekleyin.",
        ],
        verdict: "Üretime alınmadan önce güvenlik ve mimari borcu kapatılmalı.",
        secretFindings: [
            "config/settings.py:41 — hardcoded AWS_SECRET_ACCESS_KEY",
            "scripts/deploy.sh:12 — hardcoded database password",
        ],
    },
    {
        id: "e04f6b88",
        repo: "sirklc/gitdeep-worker",
        repoUrl: "https://github.com/sirklc/gitdeep-worker",
        status: "processing",
        overallScore: null,
        creditsCharged: 60,
        createdAt: "2026-07-08T11:30:00Z",
        axes: null,
        recommendations: [],
        verdict: null,
        secretFindings: [],
    },
    {
        id: "a5d82c17",
        repo: "octocat/hello-world",
        repoUrl: "https://github.com/octocat/hello-world",
        status: "refunded",
        overallScore: null,
        creditsCharged: 60,
        createdAt: "2026-06-29T19:22:00Z",
        axes: null,
        recommendations: [],
        verdict: null,
        secretFindings: [],
    },
    {
        id: "b6a2e910",
        repo: "acme/private-tools",
        repoUrl: "https://github.com/acme/private-tools",
        status: "failed",
        overallScore: null,
        creditsCharged: 0,
        createdAt: "2026-06-18T13:45:00Z",
        axes: null,
        recommendations: [],
        verdict: null,
        secretFindings: [],
    },
    {
        id: "9c41f3aa",
        repo: "openai/whisper",
        repoUrl: "https://github.com/openai/whisper",
        status: "completed",
        overallScore: 88,
        creditsCharged: 90,
        createdAt: "2026-06-24T16:00:00Z",
        axes: {
            architecture: { score: 27, maxScore: 30, summary: "Model/veri/eğitim ayrımı net, tekrar kullanılabilir modüller." },
            security: { score: 25, maxScore: 30, summary: "Bağımlılık zinciri temiz, gizli anahtar bulunmadı." },
            engagement: { score: 19, maxScore: 20, summary: "Çok yüksek topluluk ilgisi ve düzenli katkı akışı." },
            documentation: { score: 17, maxScore: 20, summary: "README kapsamlı, ileri seviye kullanım örnekleri sınırlı." },
        },
        recommendations: [
            "İleri seviye kullanım senaryoları için ek örnekler paylaşın.",
            "Model kartlarını (model card) her sürüm için güncel tutun.",
            "Katkıda bulunanlar için test yazma rehberi ekleyin.",
        ],
        verdict: "Araştırma kalitesinde, iyi belgelenmiş, canlı bir açık kaynak proje.",
        secretFindings: [],
    },
];

export function getAnalysisById(id: string): AnalysisJob | undefined {
    return mockAnalyses.find((job) => job.id === id);
}

export type CreditReason = "signup_bonus" | "analysis_charge" | "analysis_refund" | "purchase";

export type Transaction = {
    id: number;
    reason: CreditReason;
    delta: number;
    balanceAfter: number;
    createdAt: string;
};

// Newest first — running balance reconciles back to currentUser.creditBalance.
export const mockTransactions: Transaction[] = [
    { id: 1009, reason: "analysis_charge", delta: -60, balanceAfter: 340, createdAt: "2026-07-08T11:30:00Z" },
    { id: 1008, reason: "analysis_charge", delta: -60, balanceAfter: 400, createdAt: "2026-07-07T09:12:00Z" },
    { id: 1007, reason: "purchase", delta: 100, balanceAfter: 460, createdAt: "2026-07-06T10:00:00Z" },
    { id: 1006, reason: "analysis_charge", delta: -90, balanceAfter: 360, createdAt: "2026-07-05T14:40:00Z" },
    { id: 1005, reason: "analysis_charge", delta: -60, balanceAfter: 450, createdAt: "2026-07-02T08:05:00Z" },
    { id: 1004, reason: "analysis_refund", delta: 60, balanceAfter: 510, createdAt: "2026-06-29T19:23:00Z" },
    { id: 1003, reason: "analysis_charge", delta: -60, balanceAfter: 450, createdAt: "2026-06-29T19:22:00Z" },
    { id: 1002, reason: "analysis_charge", delta: -90, balanceAfter: 510, createdAt: "2026-06-24T16:00:00Z" },
    { id: 1001, reason: "purchase", delta: 500, balanceAfter: 600, createdAt: "2026-06-22T11:00:00Z" },
    { id: 1000, reason: "signup_bonus", delta: 100, balanceAfter: 100, createdAt: "2026-06-20T09:00:00Z" },
];

export type PaymentProvider = "stripe" | "cryptomus";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type Payment = {
    id: string;
    provider: PaymentProvider;
    packageName: string;
    credits: number;
    amount: number;
    currency: string;
    status: PaymentStatus;
    createdAt: string;
};

export const mockPayments: Payment[] = [
    { id: "pay_1c2d", provider: "cryptomus", packageName: "Starter", credits: 100, amount: 9, currency: "USD", status: "paid", createdAt: "2026-07-06T09:58:00Z" },
    { id: "pay_3f8a", provider: "stripe", packageName: "Pro", credits: 500, amount: 39, currency: "USD", status: "paid", createdAt: "2026-06-22T10:59:00Z" },
    { id: "pay_9e7b", provider: "stripe", packageName: "Scale", credits: 1500, amount: 99, currency: "USD", status: "failed", createdAt: "2026-06-15T12:10:00Z" },
];

export type CreditPackage = {
    code: string;
    name: string;
    credits: number;
    price: number;
    popular: boolean;
};

export const creditPackages: CreditPackage[] = [
    { code: "starter", name: "Starter", credits: 100, price: 9, popular: false },
    { code: "pro", name: "Pro", credits: 500, price: 39, popular: true },
    { code: "scale", name: "Scale", credits: 1500, price: 99, popular: false },
];

export type NotificationType = "analysis_completed" | "low_credit" | "payment_success" | "payment_failed";

export type NotificationItem = {
    id: string;
    type: NotificationType;
    repo?: string;
    read: boolean;
    createdAt: string;
};

export const mockNotifications: NotificationItem[] = [
    { id: "n1", type: "analysis_completed", repo: "sirklc/gitdeep", read: false, createdAt: "2026-07-07T09:13:00Z" },
    { id: "n2", type: "payment_success", read: false, createdAt: "2026-07-06T10:01:00Z" },
    { id: "n3", type: "low_credit", read: true, createdAt: "2026-07-05T15:00:00Z" },
    { id: "n4", type: "analysis_completed", repo: "acme/legacy-api", read: true, createdAt: "2026-07-02T08:06:00Z" },
    { id: "n5", type: "payment_failed", read: true, createdAt: "2026-06-15T12:11:00Z" },
];

export const currentUser = {
    name: "Mehmet Kılıç",
    email: "mehmet@example.com",
    creditBalance: 340,
    emailVerified: false,
};
