import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { analyzeRepository, getHistory, getPublicConfig } from './api/client'
import { useAuth } from './context/AuthContext'
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
import Footer from './components/Footer'

const ActivityChart = lazy(() => import('./components/charts/ActivityChart'))
const IntentChart = lazy(() => import('./components/charts/IntentChart'))

const STATS = [
  { value: '7', label: 'analysis stages' },
  { value: '200+', label: 'commits scanned per dig' },
  { value: '0–100', label: 'health score verdict' },
  { value: 'PDF', label: 'report on every run' },
]

export default function App() {
  const { user } = useAuth()
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

  const refreshHistory = useCallback(() => {
    getHistory().then(setHistory).catch(() => setHistory([]))
  }, [])

  useEffect(refreshHistory, [refreshHistory, user])

  const handleAnalyze = useCallback(async (url: string) => {
    setBusy(true)
    setError(null)
    setResult(null)
    setLog([{ text: `Initiating analysis for ${url}`, progress: null }])

    try {
      const data = await analyzeRepository(url, (message, progress) => {
        setLog((prev) =>
          prev.length && prev[prev.length - 1].text === message ? prev : [...prev, { text: message, progress }],
        )
      })
      setLog((prev) => [...prev, { text: 'Analysis complete.', progress: 100 }])
      setResult(data)
      refreshHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
    } finally {
      setBusy(false)
    }
  }, [refreshHistory])

  const handleHistorySelect = useCallback(
    (repoName: string) => {
      if (!busy) handleAnalyze(`https://github.com/${repoName}`)
      document.getElementById('analyze')?.scrollIntoView()
    },
    [busy, handleAnalyze],
  )

  return (
    <div className="min-h-screen">
      <Navbar onOpenAuth={setAuthMode} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="analyze" className="hero-glow scroll-mt-16 border-b border-edge">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-32 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              Software archaeology platform
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              Dig up the truth buried in any repo.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-muted">
              GitDeep excavates public GitHub repositories — bus factor, activity decay, commit intent and
              originality — and delivers one AI-reasoned health verdict.
            </p>

            <div className="mt-8">
              <AnalyzeForm busy={busy} onSubmit={handleAnalyze} />
              <p className="mt-3 text-sm text-ink-muted">
                Free · no sign-up required · results in ~1 minute
              </p>
            </div>
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
      </main>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section aria-label="Platform stats" className="mx-auto max-w-6xl px-4 pt-16">
        <div className="grid grid-cols-2 gap-6 rounded-xl border border-edge bg-panel px-6 py-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-cta">{s.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <FeatureGrid />
      <HowItWorks />

      <div id="history" className="scroll-mt-16">
        <HistoryGrid items={history} personal={!!user} onSelect={handleHistorySelect} />
      </div>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section aria-label="Get started" className="border-t border-edge bg-panel/40">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Ready to start the excavation?
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-muted">
            Paste a repository URL and get the verdict — health, risk and intent in one report.
          </p>
          <a
            href="#analyze"
            className="mt-8 inline-block cursor-pointer rounded-lg bg-cta px-8 py-3 font-semibold text-slate-950 transition-colors duration-200 hover:bg-teal-300 focus:outline-2 focus:outline-offset-2 focus:outline-cta"
          >
            Start digging
          </a>
        </div>
      </section>

      <Footer />

      {authMode && <AuthModal mode={authMode} siteKey={siteKey} onClose={() => setAuthMode(null)} />}
    </div>
  )
}
