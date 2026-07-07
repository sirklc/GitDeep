import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { GitHubIcon } from "@/components/icons";

const REPO_URL = "https://github.com/betaforevers/GitDeep";
const DOCS_URL = "";

export default function Footer() {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="font-display text-lg font-bold">
              Git<span className="text-gradient">Deep</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted">{t("tagline")}</p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="glass-card mt-5 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition hover:border-white/20"
            >
              <GitHubIcon className="h-4 w-4" />
              {t("sourceCode")}
            </a>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">{t("product")}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <Link href="/#how-it-works" className="transition-colors hover:text-foreground">
                  {t("howItWorks")}
                </Link>
              </li>
              <li>
                <Link href="/#sample-report" className="transition-colors hover:text-foreground">
                  {t("sampleReport")}
                </Link>
              </li>
              <li>
                <Link href="/billing" className="transition-colors hover:text-foreground">
                  {navT("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">{t("account")}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  {navT("register")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  {navT("login")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  {navT("dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">{t("resources")}</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                {DOCS_URL ? (
                  <a
                    href={DOCS_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-foreground"
                  >
                    {t("docs")}
                  </a>
                ) : (
                  <span className="cursor-not-allowed opacity-50" title={t("docsComingSoon")}>
                    {t("docs")}
                  </span>
                )}
              </li>
              <li>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-8 text-xs text-muted sm:flex-row">
          <p>
            © {year} GitDeep. {t("rights")}
          </p>
          <p className="text-accent">{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
