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
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 pt-16">
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
            className="font-semibold text-accent underline disabled:opacity-50"
          >
            {resent ? dashboardT("verifySent") : dashboardT("resend")}
          </button>
        </div>
      )}

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.code} className="rounded-xl border border-border-subtle bg-surface p-6">
            <p className="font-display text-lg font-semibold">{pkg.name}</p>
            <p className="mt-2 font-mono text-3xl font-bold text-accent">{pkg.credits}</p>
            <p className="text-sm text-muted">{t("creditsLabel")}</p>
            <p className="mt-4 font-mono text-xl">${pkg.amount_usd.toFixed(2)}</p>
            <button
              type="button"
              disabled={busyCode !== null}
              onClick={() => buy(pkg.code, "stripe")}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
            >
              {t("payCard")}
            </button>
            <button
              type="button"
              disabled={busyCode !== null}
              onClick={() => buy(pkg.code, "cryptomus")}
              className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {t("payCrypto")}
            </button>
          </div>
        ))}
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
