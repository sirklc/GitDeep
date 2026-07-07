"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/api";

interface PackageOut {
  code: string;
  name: string;
  credits: number;
  amount_usd: number;
}

interface CheckoutOut {
  payment_id: string;
  checkout_url: string;
}

// GitDeep'in en ucuz analiz tarifesiyle eşleşir (bkz. backend CREDIT_TIERS) —
// kartta gösterilen "≈ N analiz" tahmini için kullanılır.
const SMALL_REPO_ANALYSIS_COST = 50;

const TIER_STYLE: Record<
  string,
  {
    ribbon: "popular" | "bestValue" | null;
    card: string;
    button: string;
    badge: string;
  }
> = {
  starter: {
    ribbon: null,
    card: "border-border-subtle",
    button: "bg-surface-raised text-foreground hover:bg-white/10",
    badge: "",
  },
  pro: {
    ribbon: "popular",
    card: "border-primary/40 sm:-translate-y-2 sm:shadow-2xl sm:shadow-primary/10",
    button: "glow-primary bg-primary-strong text-white hover:bg-primary",
    badge: "bg-primary/20 text-primary",
  },
  bulk: {
    ribbon: "bestValue",
    card: "border-accent/40",
    button: "bg-accent text-background hover:opacity-90",
    badge: "bg-accent/20 text-accent",
  },
};

const DEFAULT_TIER_STYLE = TIER_STYLE.starter;

function CheckIcon({ className = "h-4 w-4" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
    </svg>
  );
}

function BoltIcon({ className = "h-5 w-5" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </svg>
  );
}

function BillingContent() {
  const t = useTranslations("billing");
  const dashboardT = useTranslations("dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const [packages, setPackages] = useState<PackageOut[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api
      .get<PackageOut[]>("/payments/packages")
      .then(setPackages)
      .catch((err) => setError(err instanceof ApiError ? err.detail : String(err)));
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    let elapsed = 0;
    async function poll() {
      try {
        const { credit_balance } = await api.get<{ credit_balance: number }>("/credits/balance");
        setBalance(credit_balance);
      } catch {
        // sessizce yeniden dene
      }
      elapsed += 2000;
      if (elapsed >= 15000 && pollTimer.current) {
        clearInterval(pollTimer.current);
      }
    }
    poll();
    pollTimer.current = setInterval(poll, 2000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [status]);

  async function buy(code: string, provider: "stripe" | "cryptomus") {
    setError(null);
    setNeedsVerification(false);
    setBusyCode(code);
    try {
      const { checkout_url } = await api.post<CheckoutOut>(`/payments/checkout/${provider}`, {
        package_code: code,
      });
      window.location.assign(checkout_url);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.push("/login");
      else if (err instanceof ApiError && err.status === 403) setNeedsVerification(true);
      else setError(err instanceof ApiError ? err.detail : String(err));
      setBusyCode(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-16 pb-24">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      {status === "success" && (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
          <p className="font-semibold text-accent">{t("successTitle")}</p>
          <p className="mt-1 text-muted">
            {balance !== null
              ? t("successBody", { balance })
              : t("successPending")}
          </p>
        </div>
      )}
      {status === "cancelled" && (
        <div className="mt-6 rounded-xl border border-border-subtle bg-surface p-4 text-sm text-muted">
          {t("cancelledBody")}
        </div>
      )}

      {needsVerification && (
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm">
          {dashboardT("verifyBanner")}{" "}
          <button
            type="button"
            disabled={resent}
            onClick={() => api.post("/auth/resend-verification").then(() => setResent(true))}
            className="cursor-pointer font-semibold text-accent underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resent ? dashboardT("verifySent") : dashboardT("resend")}
          </button>
        </div>
      )}

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {(() => {
          // Kıyas noktası: giriş seviyesi (en az kredili) paket — "cheaper"
          // rozeti diğer paketlerin ona göre ne kadar tasarruf sağladığını gösterir.
          const entryTier = packages.reduce<PackageOut | null>(
            (min, p) => (!min || p.credits < min.credits ? p : min),
            null,
          );
          const entryPerCredit = entryTier ? entryTier.amount_usd / entryTier.credits : 0;

          return packages.map((pkg) => {
            const style = TIER_STYLE[pkg.code] ?? DEFAULT_TIER_STYLE;
            const perCredit = pkg.amount_usd / pkg.credits;
            const cheaperPct =
              entryPerCredit > 0 && perCredit < entryPerCredit
                ? Math.round((1 - perCredit / entryPerCredit) * 100)
                : 0;
            const approxAnalyses = Math.floor(pkg.credits / SMALL_REPO_ANALYSIS_COST);
            const hasDesc = t.has(`tierDesc.${pkg.code}`);

            return (
              <div
                key={pkg.code}
                className={`glass-card relative flex flex-col rounded-2xl border p-6 transition-transform ${style.card}`}
              >
                {style.ribbon && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
                  >
                    {style.ribbon === "popular" ? t("mostPopular") : t("bestValue")}
                  </span>
                )}

                <p className="font-display text-lg font-bold uppercase tracking-wide">{pkg.name}</p>
                {hasDesc && (
                  <p className="mt-1 text-sm text-muted">{t(`tierDesc.${pkg.code}`)}</p>
                )}

                <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="flex items-center gap-2 font-mono text-2xl font-bold">
                    <BoltIcon className="h-5 w-5 text-accent" />
                    {pkg.credits.toLocaleString()}
                    <span className="font-sans text-sm font-normal text-muted">
                      {t("creditsLabel")}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {t("approxAnalyses", { count: approxAnalyses })}
                  </p>
                </div>

                <div className="mt-5">
                  {cheaperPct > 0 && (
                    <span className="inline-block rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-accent">
                      {t("cheaperBadge", { pct: cheaperPct })}
                    </span>
                  )}
                  <p className="mt-2 font-mono text-3xl font-bold">${pkg.amount_usd.toFixed(2)}</p>
                  <p className="text-xs text-muted">
                    {t("oneTime")} · ${perCredit.toFixed(3)} {t("perCredit")}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busyCode !== null}
                  onClick={() => buy(pkg.code, "stripe")}
                  className={`mt-6 w-full cursor-pointer rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${style.button}`}
                >
                  {t("payCard")}
                </button>
                <button
                  type="button"
                  disabled={busyCode !== null}
                  onClick={() => buy(pkg.code, "cryptomus")}
                  className="mt-2 w-full cursor-pointer rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("payCrypto")}
                </button>

                <ul className="mt-6 space-y-2 border-t border-white/5 pt-5 text-sm text-muted">
                  {t.raw("features").map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          });
        })()}
      </div>
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
