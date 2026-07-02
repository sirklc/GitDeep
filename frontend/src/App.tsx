import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { analyzeRepository, getHistory, getPublicConfig } from './api/client'
import { useAuth } from './context/AuthContext'
import { useLocale } from './i18n'
import type { AnalysisResult, HistoryItem } from './types'
import Navbar from './components/Navbar'
import AnalyzeForm from './components/AnalyzeForm'
import ProgressLog, { type LogEntry } from './components/ProgressLog'
import ScoreCard from './components/ScoreCard'
import MetricCards from './components/MetricCards'
import ContributorList from './components/ContributorList'
import HistoryGrid from './components/HistoryGrid'
import AuthModal, { type AuthMode } from './components/AuthModal'
import TerminalMock from './components/TerminalMock'
import FeatureGrid from './components/FeatureGrid'
import HowItWorks from './components/HowItWorks'
import OpenSource from './components/OpenSource'
import Footer from './components/Footer'

const ActivityChart = lazy(() => import('./components/charts/ActivityChart'))
const IntentChart = lazy(() => import('./components/charts/IntentChart'))

const GITHUB_URL = 'https://github.com/betaforevers/GitDeep'

export default function App() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [siteKey, setSiteKey] = useState('')

  useEffect(() => {
    getPublicConfig().then((c) => setSiteKey(c.turnstile_site_key ?? ''))
  }, [])

  // The app is members-only: history exists only for signed-in users
  useEffect(() => {
    if (user) getHistory().then(setHistory).catch(() => setHistory([]))
    else {
      setHistory([])
      setResult(null)
      setLog([])
      setError(null)
    }
  }, [user])

  const handleAnalyze = useCallback(async (url: string) => {
    setBusy(true)
    setError(null)
    setResult(null)
    setLog([{ text: `${t.analyze.initiating} ${url}`, progress: null }])

    try {
      const data = await analyzeRepository(url, (message, progress) => {
        setLog((prev) =>
          prev.length && prev[prev.length - 1].text === message ? prev : [...prev, { text: message, progress }],
        )
      })
      setLog((prev) => [...prev, { text: t.analyze.complete, progress: 100 }])
      setResult(data)
      getHistory().then(setHistory).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setBusy(false)
    }
  }, [t])

  const handleHistorySelect = useCallback(
    (repoName: string) => {
      if (!busy) handleAnalyze(`https://github.com/${repoName}`)
      document.getElementById('analyze')?.scrollIntoView()
    },
    [busy, handleAnalyze],
  )

  const openRegister = useCallback(() => setAuthMode('register'), [])

  return (
    <div className="min-h-screen">
      <Navbar onOpenAuth={setAuthMode} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="analyze" className="hero-glow scroll-mt-16 border-b border-edge">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-32 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              {t.hero.badge}
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-muted">{t.hero.sub}</p>

            {user ? (
              <div className="mt-8">
                <AnalyzeForm busy={busy} onSubmit={handleAnalyze} />
                <p className="mt-3 text-sm text-ink-muted">{t.hero.formNote}</p>
              </div>
            ) : (
              <div className="mt-8">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={openRegister}
                    className="min-h-12 cursor-pointer rounded-xl bg-cta px-6 font-semibold text-slate-950 transition-colors duration-200 hover:bg-teal-300 focus:outline-2 focus:outline-offset-2 focus:outline-cta"
                  >
                    {t.hero.ctaPrimary}
                  </button>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-edge px-6 font-semibold transition-colors duration-200 hover:border-primary hover:text-primary focus:outline-2 focus:outline-primary"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.8.55A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
                    </svg>
                    {t.hero.ctaSecondary}
                  </a>
                </div>
                <p className="mt-3 text-sm text-ink-muted">{t.hero.note}</p>
              </div>
            )}
          </div>

          <TerminalMock />
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4">
        <ProgressLog entries={log} error={error} />

        {result && (
          <div className="mt-10 scroll-mt-24 space-y-4" id="result">
            <ScoreCard score={result.health_score} summary={result.message} pdfUrl={result.pdf_url} />
            <MetricCards details={result.details} />
            <Suspense fallback={<div className="h-56 animate-pulse rounded-xl border border-edge bg-panel" aria-hidden="true" />}>
              <div className="grid gap-4 lg:grid-cols-2">
                <ActivityChart trend={result.chart_data.activity_trend} />
                <IntentChart breakdown={result.chart_data.intent_breakdown} />
              </div>
            </Suspense>
            {result.details.bus_factor_data?.top_contributors && (
              <ContributorList contributors={result.details.bus_factor_data.top_contributors} />
            )}
          </div>
        )}

        {user && <HistoryGrid items={history} onSelect={handleHistorySelect} />}
      </main>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section aria-label="Platform stats" className="mx-auto max-w-6xl px-4 pt-16">
        <div className="grid grid-cols-2 gap-6 rounded-xl border border-edge bg-panel px-6 py-8 md:grid-cols-4">
          {t.stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-cta">{s.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <FeatureGrid />
      <HowItWorks />
      <OpenSource onGetStarted={openRegister} />

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      {!user && (
        <section aria-label="Get started" className="border-t border-edge bg-panel/40">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t.ctaBand.title}</h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-muted">{t.ctaBand.sub}</p>
            <button
              onClick={openRegister}
              className="mt-8 inline-block cursor-pointer rounded-lg bg-cta px-8 py-3 font-semibold text-slate-950 transition-colors duration-200 hover:bg-teal-300 focus:outline-2 focus:outline-offset-2 focus:outline-cta"
            >
              {t.ctaBand.button}
            </button>
          </div>
        </section>
      )}

      <Footer />

      {authMode && <AuthModal mode={authMode} siteKey={siteKey} onClose={() => setAuthMode(null)} />}
    </div>
  )
}
