import type { AnalysisDetails } from '../types'

interface Metric {
  label: string
  value: string
  hint: string
  tone?: 'good' | 'warn' | 'bad'
}

const toneColor = { good: 'var(--color-good)', warn: 'var(--color-warn)', bad: 'var(--color-bad)' }

function buildMetrics(d: AnalysisDetails): Metric[] {
  const originality = d.plagiarism?.originality
  const duplication = d.plagiarism?.internal_duplication_pct

  return [
    {
      label: 'Bus factor',
      value: String(d.bus_factor),
      hint: `${d.bus_factor_data?.total_contributors ?? '?'} contributors total`,
      tone: d.bus_factor <= 1 ? 'bad' : d.bus_factor <= 2 ? 'warn' : 'good',
    },
    {
      label: 'Activity',
      value: d.is_stagnant ? 'Stagnant' : 'Active',
      hint: `${d.commits_analyzed} commits analyzed`,
      tone: d.is_stagnant ? 'bad' : 'good',
    },
    {
      label: 'Tech debt ratio',
      value: d.tech_debt_ratio.toFixed(2),
      hint: 'maintenance vs. feature work',
      tone: d.tech_debt_ratio > 2 ? 'warn' : 'good',
    },
    {
      label: 'Code quality',
      value: String(d.code_quality?.sqale_rating ?? '—'),
      hint: `${d.code_quality?.bugs ?? 0} estimated bugs`,
      tone: ['A', 'B'].includes(String(d.code_quality?.sqale_rating)) ? 'good' : 'warn',
    },
    {
      label: 'Originality',
      value: originality ? `${originality.score}/100` : '—',
      hint: originality?.assessment ?? 'not assessed',
      tone: originality ? (originality.score >= 60 ? 'good' : originality.score >= 30 ? 'warn' : 'bad') : undefined,
    },
    {
      label: 'Duplication',
      value: duplication !== undefined ? `${duplication}%` : '—',
      hint: 'internal copy-paste level',
      tone: duplication !== undefined ? (duplication < 10 ? 'good' : duplication < 25 ? 'warn' : 'bad') : undefined,
    },
    { label: 'Stars', value: d.stars.toLocaleString(), hint: 'GitHub stargazers' },
    { label: 'Open issues', value: d.open_issues.toLocaleString(), hint: 'unresolved on GitHub' },
  ]
}

export default function MetricCards({ details }: { details: AnalysisDetails }) {
  return (
    <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {buildMetrics(details).map((m) => (
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
