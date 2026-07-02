import { useEffect, useRef } from 'react'

export interface LogEntry {
  text: string
  progress: number | null
}

interface Props {
  entries: LogEntry[]
  error?: string | null
}

export default function ProgressLog({ entries, error }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const progress = entries.length ? entries[entries.length - 1].progress : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [entries.length, error])

  if (!entries.length && !error) return null

  return (
    <section aria-label="Analysis progress" className="mx-auto mt-6 w-full max-w-2xl">
      {progress !== null && !error && (
        <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-panel-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-edge bg-panel p-4 font-mono text-xs leading-relaxed">
        {entries.map((entry, i) => (
          <p key={i} className={i === entries.length - 1 && !error ? 'text-ink' : 'text-ink-muted'}>
            <span className="select-none text-primary">▸ </span>
            {entry.progress !== null && <span className="text-cta">[{entry.progress}%] </span>}
            {entry.text}
          </p>
        ))}
        {error && (
          <p role="alert" className="mt-1 text-bad">
            <span className="select-none">✕ </span>
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  )
}
