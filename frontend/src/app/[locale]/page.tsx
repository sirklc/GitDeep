import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { Link } from "@/i18n/navigation";

export default function LandingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("landing");

  const features = ["architecture", "security", "engagement", "documentation"] as const;

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
        <span className="inline-block rounded-full border border-border-subtle bg-surface px-4 py-1 text-sm text-accent">
          {t("badge")}
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{t("subtitle")}</p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-strong"
          >
            {t("cta")}
          </Link>
          <Link
            href="/#how-it-works"
            className="rounded-lg border border-border-subtle px-6 py-3 font-semibold text-muted transition hover:text-foreground"
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2">
        {features.map((key) => (
          <div
            key={key}
            className="rounded-xl border border-border-subtle bg-surface p-6 text-left"
          >
            <h3 className="font-display text-xl font-semibold text-accent">
              {t(`features.${key}.title`)}
            </h3>
            <p className="mt-2 text-muted">{t(`features.${key}.desc`)}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
