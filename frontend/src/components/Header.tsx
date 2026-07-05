"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { api, type UserOut } from "@/lib/api";

export default function Header() {
  const t = useTranslations("nav");
  const commonT = useTranslations("common");
  const router = useRouter();
  const [user, setUser] = useState<UserOut | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api
      .get<UserOut>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  async function logout() {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-border-subtle">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold">
          GitDeep
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/billing" className="text-muted hover:text-foreground">
            {t("pricing")}
          </Link>
          {!checked ? null : user ? (
            <>
              <span className="font-mono text-accent">
                {user.credit_balance} {commonT("credits")}
              </span>
              <Link href="/dashboard" className="text-muted hover:text-foreground">
                {t("dashboard")}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-muted hover:text-foreground"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-foreground">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-strong"
              >
                {t("register")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
