"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/api";

interface QuoteOut {
  repo: string;
  size_mb: number;
  credits: number;
  balance: number;
  balance_after: number;
}

export default function AnalyzePage() {
  const t = useTranslations("analyze");
  const dashboardT = useTranslations("dashboard");
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [quote, setQuote] = useState<QuoteOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);

  function handleError(err: unknown) {
    setNeedsVerification(false);
    if (err instanceof ApiError && err.status === 401) router.push("/login");
    else if (err instanceof ApiError && err.status === 403) setNeedsVerification(true);
    else setError(err instanceof ApiError ? err.detail : String(err));
  }

  async function getQuote(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setBusy(true);
    try {
      setQuote(await api.post<QuoteOut>("/analyze/quote", { repo_url: url }));
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setError(null);
    setNeedsVerification(false);
    setBusy(true);
    try {
      const { job_id } = await api.post<{ job_id: string }>("/analyze", {
        repo_url: url,
      });
      router.push(`/analyze/${job_id}`);
    } catch (err) {
      handleError(err);
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 pt-16">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("subtitle")}</p>

      <form onSubmit={getQuote} className="mt-8 flex gap-3">
        <input
          type="url"
          required
          placeholder="https://github.com/owner/repo"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setQuote(null);
          }}
          className="flex-1 rounded-lg border border-border-subtle bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-strong disabled:opacity-50"
        >
          {t("getQuote")}
        </button>
      </form>

      {needsVerification && (
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm">
          {t("verifyRequired")}{" "}
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

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {quote && (
        <div className="mt-8 rounded-xl border border-border-subtle bg-surface p-6">
          <p className="font-mono text-lg font-semibold">{quote.repo}</p>
          <p className="text-sm text-muted">~{quote.size_mb} MB</p>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              {t("cost")}:{" "}
              <span className="font-mono font-bold text-accent">{quote.credits}</span>
            </p>
            <p className="text-muted">
              {t("balanceChange", {
                before: quote.balance,
                after: quote.balance_after,
              })}
            </p>
          </div>
          {quote.balance_after < 0 ? (
            <p className="mt-4 text-sm text-red-400">{t("insufficient")}</p>
          ) : (
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="mt-4 rounded-lg bg-accent px-6 py-2.5 font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {t("confirm", { credits: quote.credits })}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
