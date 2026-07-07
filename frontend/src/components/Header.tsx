"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { api, type UserOut } from "@/lib/api";
import {
  ChevronDownIcon,
  CloseIcon,
  CoinIcon,
  GitHubIcon,
  LogoMark,
  MenuIcon,
  UserIcon,
} from "@/components/icons";

const REPO_URL = "https://github.com/betaforevers/GitDeep";
const LOCALES: Locale[] = ["tr", "en"];

export default function Header() {
  const t = useTranslations("nav");
  const commonT = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<UserOut | null>(null);
  const [checked, setChecked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<UserOut>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    function onClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [accountOpen]);

  async function logout() {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
    setAccountOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/#sample-report", label: t("sampleReport") },
    { href: "/#tech-stack", label: t("techStack") },
    { href: "/billing", label: t("pricing") },
  ];

  function isActive(href: string) {
    return href === "/billing" && pathname === "/billing";
  }

  return (
    <div
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "px-4 pt-4 sm:px-6" : "px-0 pt-0"
      }`}
    >
      <header
        className={`mx-auto flex w-full max-w-6xl items-center justify-between transition-all duration-300 ${
          scrolled
            ? "glass-card max-w-5xl rounded-2xl px-5 py-3 shadow-xl shadow-black/30"
            : "max-w-none rounded-none border-b border-white/5 bg-background/60 px-6 py-4 backdrop-blur-md"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <LogoMark className="h-8 w-8 transition-transform group-hover:scale-105" />
          <span className="font-display text-lg font-bold">
            Git<span className="text-gradient">Deep</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                isActive(link.href)
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t("github")}
            className="hidden rounded-lg p-2 text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            <GitHubIcon className="h-[18px] w-[18px]" />
          </a>

          <div
            className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-medium sm:flex"
            role="group"
            aria-label={t("switchLanguage")}
          >
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={pathname}
                locale={l}
                className={`rounded-full px-2.5 py-1 uppercase transition-colors ${
                  locale === l
                    ? "bg-primary-strong text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {l}
              </Link>
            ))}
          </div>

          <div className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true" />

          {!checked ? null : user ? (
            <div ref={accountRef} className="relative hidden items-center gap-2 md:flex">
              <span className="glass-card inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-accent">
                <CoinIcon className="h-3.5 w-3.5" />
                {user.credit_balance} {commonT("credits")}
              </span>

              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="glass-card flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-2.5 text-sm text-foreground transition hover:border-white/20"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                  {user.email.slice(0, 1).toUpperCase()}
                </span>
                <ChevronDownIcon
                  className={`h-3.5 w-3.5 text-muted transition-transform ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="glass-card absolute right-0 top-[calc(100%+0.5rem)] w-48 overflow-hidden rounded-xl py-1.5 shadow-xl shadow-black/40"
                >
                  <p className="truncate border-b border-white/5 px-3.5 pb-2 pt-1 text-xs text-muted">
                    {user.email}
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={() => setAccountOpen(false)}
                    className="block px-3.5 py-2 text-sm text-foreground transition-colors hover:bg-white/5"
                  >
                    {t("dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full px-3.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-white/5"
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/login" className="text-sm text-muted transition-colors hover:text-foreground">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="glow-primary rounded-lg bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary"
              >
                {t("register")}
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-foreground md:hidden"
          >
            {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="glass-card mx-auto mt-2 max-w-5xl rounded-2xl p-4 shadow-xl shadow-black/30 md:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-white/5"
            >
              <GitHubIcon className="h-4 w-4" />
              {t("github")}
            </a>
          </nav>

          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <div
              className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-medium"
              role="group"
              aria-label={t("switchLanguage")}
            >
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  className={`rounded-full px-3 py-1 uppercase transition-colors ${
                    locale === l
                      ? "bg-primary-strong text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {l}
                </Link>
              ))}
            </div>

            {checked && user ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                <CoinIcon className="h-3.5 w-3.5" />
                {user.credit_balance} {commonT("credits")}
              </span>
            ) : null}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
            {!checked ? null : user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-white/5"
                >
                  <UserIcon className="h-4 w-4" />
                  {t("dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-white/5"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="glow-primary rounded-lg bg-primary-strong px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary"
                >
                  {t("register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
