"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useRouter } from "@/i18n/navigation";
import { api, ApiError, type UserOut } from "@/lib/api";

export default function AuthForm({ mode }: Readonly<{ mode: "login" | "register" }>) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // Turnstile widget'ı Faz 5'te eklenecek; dev ortamında backend test
      // secret ile doğrulamayı atlıyor.
      await api.post<UserOut>(`/auth/${mode}`, {
        email,
        password,
        ...(mode === "register" ? { locale } : {}),
        turnstile_token: "",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-16 w-full max-w-md rounded-xl border border-border-subtle bg-surface p-8"
    >
      <h1 className="font-display text-2xl font-bold">
        {mode === "login" ? t("loginTitle") : t("registerTitle")}
      </h1>
      <label className="mt-6 block text-sm text-muted" htmlFor="email">
        {t("email")}
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border-subtle bg-background px-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
      />
      <label className="mt-4 block text-sm text-muted" htmlFor="password">
        {t("password")}
      </label>
      <input
        id="password"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border-subtle bg-background px-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
      />
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full cursor-pointer rounded-lg bg-primary-strong py-2.5 font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "..." : mode === "login" ? t("loginCta") : t("registerCta")}
      </button>
    </form>
  );
}
