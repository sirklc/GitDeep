import type { HistoryItem } from '../types'

interface Props {
  items: HistoryItem[]
  personal: boolean
  onSelect: (repoName: string) => void
}

function statusColor(status: string) {
  if (status === 'HEALTHY') return 'var(--color-good)'
  if (status === 'AT RISK') return 'var(--color-warn)'
  return 'var(--color-bad)'
}

export default function HistoryGrid({ items, personal, onSelect }: Props) {
  if (!items.length) return null

  return (
    <section aria-label="Analysis history" className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="mb-4 text-lg font-semibold">
        {personal ? 'Your recent analyses' : 'Recently analyzed repositories'}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.repo_name)}
            className="cursor-pointer rounded-xl border border-edge bg-panel p-4 text-left transition-colors duration-200 hover:border-primary focus:outline-2 focus:outline-primary"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-mono text-sm text-ink" title={item.repo_name}>
                {item.repo_name}
              </span>
              <span className="shrink-0 font-mono text-sm font-semibold" style={{ color: statusColor(item.status) }}>
                {item.score}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">{item.summary}</p>
            <p className="mt-2 text-[11px] text-ink-muted/70">
              {new Date(item.analyzed_at).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
