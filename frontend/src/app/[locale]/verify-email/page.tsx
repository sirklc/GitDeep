"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/api";

function VerifyEmailInner() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"pending" | "ok" | "error">(token ? "pending" : "error");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setState("ok"))
      .catch((err) => {
        setDetail(err instanceof ApiError ? err.detail : String(err));
        setState("error");
      });
  }, [token]);

  return (
    <main className="flex-1 px-6">
      <div className="mx-auto mt-24 max-w-md rounded-xl border border-border-subtle bg-surface p-8 text-center">
        {state === "pending" && <p className="text-muted">{t("verifying")}</p>}
        {state === "ok" && (
          <>
            <p className="font-display text-xl font-semibold text-accent">
              {t("verified")}
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-strong"
            >
              {t("goDashboard")}
            </Link>
          </>
        )}
        {state === "error" && (
          <p className="text-red-400">
            {t("verifyFailed")}
            {detail && <span className="mt-2 block text-sm text-muted">{detail}</span>}
          </p>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
