import type { Contributor } from '../types'

/** Top contributors with ownership bars — table-like, accessible alternative to a pie chart. */
export default function ContributorList({ contributors }: { contributors: Contributor[] }) {
  if (!contributors?.length) return null

  return (
    <div className="rounded-xl border border-edge bg-panel p-4">
      <h3 className="mb-3 text-sm font-medium text-ink">Top contributors by commit ownership</h3>
      <ul className="space-y-2">
        {contributors.slice(0, 5).map((c) => (
          <li key={c.author} className="flex items-center gap-3">
            <span className="w-32 truncate font-mono text-xs text-ink" title={c.author}>
              {c.author}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel-2">
              <div className="h-full rounded-full bg-chart-1" style={{ width: `${Math.min(c.ownership_pct, 100)}%` }} />
            </div>
            <span className="w-12 text-right font-mono text-xs text-ink-muted">{c.ownership_pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
