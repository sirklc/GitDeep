import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { analyzeRepository, getHistory, getPublicConfig } from './api/client'
import { useAuth } from './context/AuthContext'
import type { AnalysisResult, HistoryItem } from './types'
import Navbar from './components/Navbar'
import AnalyzeForm from './components/AnalyzeForm'
import ProgressLog, { type LogEntry } from './components/ProgressLog'
import ScoreCard from './components/ScoreCard'
import MetricCards from './components/MetricCards'
const ActivityChart = lazy(() => import('./components/charts/ActivityChart'))
const IntentChart = lazy(() => import('./components/charts/IntentChart'))
import ContributorList from './components/ContributorList'
import HistoryGrid from './components/HistoryGrid'
import AuthModal, { type AuthMode } from './components/AuthModal'

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
      window.scrollTo({ top: 0 })
    },
    [busy, handleAnalyze],
  )

  return (
    <div className="min-h-screen bg-dig-grid">
      <Navbar onOpenAuth={setAuthMode} />

      <main className="mx-auto max-w-6xl px-4 pt-32 pb-16">
        {/* Hero */}
        <section className="mb-10 text-center">
          <p className="mb-3 font-mono text-sm tracking-widest text-primary">SOFTWARE ARCHAEOLOGY</p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Dig into any GitHub repository's <span className="text-primary">true health</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-muted">
            Bus factor, activity decay, commit intent, originality and code quality — synthesized into one
            AI-reasoned report with a downloadable PDF.
          </p>
        </section>

        <AnalyzeForm busy={busy} onSubmit={handleAnalyze} />
        <ProgressLog entries={log} error={error} />

        {result && (
          <div className="mt-10 space-y-4">
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

      <HistoryGrid items={history} personal={!!user} onSelect={handleHistorySelect} />

      <footer className="border-t border-edge py-6 text-center text-xs text-ink-muted">
        GitDeep — built by{' '}
        <a href="https://github.com/sirklc" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          @sirklc
        </a>{' '}
        &{' '}
        <a href="https://github.com/cetintuba" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          @cetintuba
        </a>
      </footer>

      {authMode && siteKey !== undefined && (
        <AuthModal mode={authMode} siteKey={siteKey} onClose={() => setAuthMode(null)} />
      )}
    </div>
  )
}
