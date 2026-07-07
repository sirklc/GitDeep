import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { Link } from "@/i18n/navigation";
import HeroBackground from "@/components/HeroBackground";
import Reveal from "@/components/Reveal";
import ScrollProgress from "@/components/ScrollProgress";
import TechStack from "@/components/TechStack";
import {
  ArchitectureIcon,
  ChevronDownIcon,
  CommunityIcon,
  DocumentationIcon,
  SecurityIcon,
} from "@/components/icons";

const FEATURE_ICONS = {
  architecture: ArchitectureIcon,
  security: SecurityIcon,
  engagement: CommunityIcon,
  documentation: DocumentationIcon,
} as const;

const SAMPLE_SCORES = {
  architecture: { score: 24, max: 30 },
  security: { score: 26, max: 30 },
  engagement: { score: 16, max: 20 },
  documentation: { score: 14, max: 20 },
} as const;

const FEATURE_MAX = {
  architecture: 30,
  security: 30,
  engagement: 20,
  documentation: 20,
} as const;

const SAMPLE_OVERALL = 80;

export default function LandingPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("landing");
  const reportT = useTranslations("report");

  const features = ["architecture", "security", "engagement", "documentation"] as const;

  return (
    <main className="flex-1">
      <ScrollProgress />

      {/* Hero — full-viewport karşılama ekranı */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <HeroBackground videoSrc="/hero-bg.mp4" />
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <Reveal>
            <span className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {t("badge")}
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-gradient mt-8 font-display text-5xl font-bold tracking-tight sm:text-7xl">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{t("subtitle")}</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="glow-primary rounded-lg bg-primary-strong px-6 py-3 font-semibold text-white transition hover:bg-primary"
              >
                {t("cta")}
              </Link>
              <Link
                href="/#how-it-works"
                className="glass-card rounded-lg px-6 py-3 font-semibold text-foreground transition hover:border-white/20"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-3">
              {(["dimensions", "scale", "delivery", "engine"] as const).map((key) => (
                <span
                  key={key}
                  className="glass-card rounded-full px-4 py-1.5 text-xs text-muted sm:text-sm"
                >
                  {t(`heroStats.${key}`)}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Link
          href="/#how-it-works"
          aria-label={t("ctaSecondary")}
          className="motion-safe:animate-bounce absolute bottom-8 left-1/2 -translate-x-1/2 text-muted transition-colors hover:text-foreground"
        >
          <ChevronDownIcon className="h-7 w-7" />
        </Link>
      </section>

      {/* Tech stack — what GitDeep is built on */}
      <TechStack />

      {/* Features — stacked cards that page-flip open on top of each other while scrolling */}
      <section className="bg-dot-grid relative border-t border-white/5">
        <div className="mx-auto max-w-2xl px-6 py-24 sm:py-32">
          <div className="[perspective:1400px]">
            {features.map((key, i) => {
              const Icon = FEATURE_ICONS[key];
              const isLast = i === features.length - 1;
              return (
                <div
                  key={key}
                  className={isLast ? "" : "h-[65vh] sm:h-[60vh]"}
                >
                  <Reveal
                    direction="flip"
                    delay={i * 60}
                    className="sticky"
                    style={{ top: `${5 + i * 1.1}rem`, zIndex: i + 1 }}
                  >
                    <div className="glass-card glow-primary rounded-3xl p-8 sm:p-10">
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <span className="font-mono text-sm text-muted">
                            {String(i + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
                          </span>
                          <div className="mt-4 inline-flex rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-3">
                            <Icon className="h-7 w-7 text-accent" />
                          </div>
                          <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
                            {t(`features.${key}.title`)}
                          </h3>
                          <p className="mt-3 max-w-sm text-muted">{t(`features.${key}.desc`)}</p>
                        </div>
                        <div className="shrink-0 text-center">
                          <p className="text-gradient font-display text-5xl font-bold sm:text-6xl">
                            {FEATURE_MAX[key]}
                          </p>
                          <p className="mt-1 text-xs text-muted">{t("features.pointsLabel")}</p>
                        </div>
                      </div>
                      <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${FEATURE_MAX[key]}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        {t("features.shareLabel", { pct: FEATURE_MAX[key] })}
                      </p>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
              {t("howItWorks.title")}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted">
              {t("howItWorks.subtitle")}
            </p>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {([0, 1, 2] as const).map((i) => (
              <Reveal key={i} delay={i * 120} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <div className="glass-card h-full rounded-2xl p-7 text-left transition-colors hover:border-accent/30">
                  <span className="text-gradient font-display text-4xl font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    {t(`howItWorks.steps.${i}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{t(`howItWorks.steps.${i}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report — proof by demonstration, not fabricated testimonials */}
      <section id="sample-report" className="border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <Reveal>
            <span className="glass-card mx-auto block w-fit rounded-full px-4 py-1.5 text-center text-sm text-accent">
              {t("sample.badge")}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 text-center font-display text-3xl font-bold sm:text-4xl">
              {t("sample.title")}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted">{t("sample.subtitle")}</p>
          </Reveal>

          <Reveal delay={200}>
            <div className="glass-card mx-auto mt-12 max-w-2xl rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div
                  className="glow-primary relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#8b5cf6 ${SAMPLE_OVERALL * 3.6}deg, #27272f 0deg)`,
                  }}
                >
                  <div
                    className="grid place-items-center rounded-full bg-surface"
                    style={{ width: "5.5rem", height: "5.5rem" }}
                  >
                    <span className="font-display text-2xl font-bold text-accent">
                      {SAMPLE_OVERALL}
                    </span>
                  </div>
                </div>
                <div className="w-full flex-1 space-y-3">
                  {features.map((key) => {
                    const { score, max } = SAMPLE_SCORES[key];
                    const pct = (score / max) * 100;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted">{reportT(`sections.${key}`)}</span>
                          <span className="font-mono font-semibold">
                            {score}
                            <span className="text-muted">/{max}</span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-6 text-sm italic text-muted">{t("sample.verdict")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <Reveal>
            <div className="glass-card glow-primary relative overflow-hidden rounded-3xl px-6 py-16 sm:px-16">
              <div
                className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl"
                aria-hidden="true"
              />
              <h2 className="text-gradient relative font-display text-4xl font-bold sm:text-5xl">
                {t("finalCta.title")}
              </h2>
              <p className="relative mt-4 text-lg text-muted">{t("finalCta.subtitle")}</p>
              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="glow-primary rounded-lg bg-primary-strong px-8 py-3.5 font-semibold text-white transition hover:bg-primary"
                >
                  {t("finalCta.cta")}
                </Link>
                <Link
                  href="/#sample-report"
                  className="rounded-lg px-8 py-3.5 font-semibold text-foreground underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
                >
                  {t("finalCta.secondaryCta")}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
