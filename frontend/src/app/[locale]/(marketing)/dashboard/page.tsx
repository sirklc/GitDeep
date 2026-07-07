"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { api, ApiError, type TransactionOut, type UserOut } from "@/lib/api";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [user, setUser] = useState<UserOut | null>(null);
  const [history, setHistory] = useState<TransactionOut[]>([]);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<UserOut>("/auth/me"),
      api.get<TransactionOut[]>("/credits/history"),
    ])
      .then(([u, h]) => {
        setUser(u);
        setHistory(h);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
        }
      });
  }, [router]);

  if (!user) {
    return (
      <main className="flex-1 px-6 pt-24 text-center text-muted">...</main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 pt-12">
      <h1 className="font-display text-3xl font-bold">{t("title")}</h1>

      {!user.email_verified && (
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-4 text-sm">
          {t("verifyBanner")}{" "}
          <button
            type="button"
            disabled={resent}
            onClick={() =>
              api.post("/auth/resend-verification").then(() => setResent(true))
            }
            className="cursor-pointer font-semibold text-accent underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resent ? t("verifySent") : t("resend")}
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <p className="text-sm text-muted">{t("balance")}</p>
          <p className="mt-2 font-display text-4xl font-bold text-accent">
            {user.credit_balance}
          </p>
          <Link
            href="/billing"
            className="mt-4 inline-block rounded-lg bg-primary-strong px-4 py-2 text-sm font-semibold text-white hover:bg-primary"
          >
            {t("buyCredits")}
          </Link>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <p className="text-sm text-muted">{t("newAnalysis")}</p>
          <p className="mt-2 text-sm text-muted">{t("newAnalysisDesc")}</p>
          <Link
            href="/analyze"
            className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            {t("startAnalysis")}
          </Link>
        </div>
      </div>

      <h2 className="mt-12 flex items-center justify-between font-display text-xl font-semibold">
        {t("ledger")}
        <Link href="/history" className="text-sm font-normal text-accent hover:underline">
          {t("viewHistory")}
        </Link>
      </h2>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="px-4 py-3">{t("colReason")}</th>
              <th className="px-4 py-3">{t("colDelta")}</th>
              <th className="px-4 py-3">{t("colBalance")}</th>
              <th className="px-4 py-3">{t("colDate")}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx) => (
              <tr key={tx.id} className="border-t border-border-subtle">
                <td className="px-4 py-3">{t(`reasons.${tx.reason}`)}</td>
                <td
                  className={`px-4 py-3 font-mono ${tx.delta > 0 ? "text-accent" : "text-red-400"}`}
                >
                  {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                </td>
                <td className="px-4 py-3 font-mono">{tx.balance_after}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(tx.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
