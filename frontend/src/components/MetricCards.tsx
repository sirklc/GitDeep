import { useLocale } from '../i18n'
import type { Dict } from '../i18n/en'
import type { AnalysisDetails } from '../types'

interface Metric {
  label: string
  value: string
  hint: string
  tone?: 'good' | 'warn' | 'bad'
}

const toneColor = { good: 'var(--color-good)', warn: 'var(--color-warn)', bad: 'var(--color-bad)' }

function buildMetrics(d: AnalysisDetails, m: Dict['result']['metrics']): Metric[] {
  const originality = d.plagiarism?.originality
  const duplication = d.plagiarism?.internal_duplication_pct

  return [
    {
      label: m.busFactor,
      value: String(d.bus_factor),
      hint: `${d.bus_factor_data?.total_contributors ?? '?'} ${m.busFactorHint}`,
      tone: d.bus_factor <= 1 ? 'bad' : d.bus_factor <= 2 ? 'warn' : 'good',
    },
    {
      label: m.activity,
      value: d.is_stagnant ? m.stagnant : m.active,
      hint: `${d.commits_analyzed} ${m.activityHint}`,
      tone: d.is_stagnant ? 'bad' : 'good',
    },
    {
      label: m.techDebt,
      value: d.tech_debt_ratio.toFixed(2),
      hint: m.techDebtHint,
      tone: d.tech_debt_ratio > 2 ? 'warn' : 'good',
    },
    {
      label: m.quality,
      value: String(d.code_quality?.sqale_rating ?? '—'),
      hint: `${d.code_quality?.bugs ?? 0} ${m.qualityHint}`,
      tone: ['A', 'B'].includes(String(d.code_quality?.sqale_rating)) ? 'good' : 'warn',
    },
    {
      label: m.originality,
      value: originality ? `${originality.score}/100` : '—',
      hint: originality?.assessment ?? m.originalityHint,
      tone: originality ? (originality.score >= 60 ? 'good' : originality.score >= 30 ? 'warn' : 'bad') : undefined,
    },
    {
      label: m.duplication,
      value: duplication !== undefined ? `${duplication}%` : '—',
      hint: m.duplicationHint,
      tone: duplication !== undefined ? (duplication < 10 ? 'good' : duplication < 25 ? 'warn' : 'bad') : undefined,
    },
    { label: m.stars, value: d.stars.toLocaleString(), hint: m.starsHint },
    { label: m.issues, value: d.open_issues.toLocaleString(), hint: m.issuesHint },
  ]
}

export default function MetricCards({ details }: { details: AnalysisDetails }) {
  const { t } = useLocale()

  return (
    <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {buildMetrics(details, t.result.metrics).map((m) => (
        <div key={m.label} className="rounded-xl border border-edge bg-panel p-4">
          <p className="text-xs text-ink-muted">{m.label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold" style={m.tone ? { color: toneColor[m.tone] } : undefined}>
            {m.value}
          </p>
          <p className="mt-1 text-xs text-ink-muted">{m.hint}</p>
        </div>
      ))}
    </section>
  )
}
