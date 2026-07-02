const LINES: { text: string; tone?: 'muted' | 'good' | 'accent' }[] = [
  { text: '$ gitdeep analyze facebook/react', tone: 'accent' },
  { text: '[14%] Fetching repository metadata…', tone: 'muted' },
  { text: '[28%] Calculating bus factor & activity decay…', tone: 'muted' },
  { text: '[42%] Cloning repo, extracting file history…', tone: 'muted' },
  { text: '[57%] Running originality & plagiarism checks…', tone: 'muted' },
  { text: '[71%] Synthesizing AI reasoning…', tone: 'muted' },
  { text: '[85%] Generating PDF report…', tone: 'muted' },
  { text: '✓ Health score 87/100 — HEALTHY', tone: 'good' },
]

/** Static terminal window showing what an analysis session looks like. */
export default function TerminalMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-2xl shadow-primary/10" aria-hidden="true">
      <div className="flex items-center gap-1.5 border-b border-edge bg-panel-2 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-bad/60" />
        <span className="h-3 w-3 rounded-full bg-warn/60" />
        <span className="h-3 w-3 rounded-full bg-good/60" />
        <span className="ml-3 font-mono text-xs text-ink-muted">gitdeep — excavation</span>
      </div>
      <div className="space-y-2 p-5 font-mono text-[13px] leading-relaxed">
        {LINES.map((line, i) => (
          <p
            key={i}
            className={
              line.tone === 'good'
                ? 'font-medium text-good'
                : line.tone === 'accent'
                  ? 'text-cta'
                  : 'text-ink-muted'
            }
          >
            {line.text}
          </p>
        ))}
        <p className="text-ink">
          <span className="text-cta">$</span> <span className="animate-pulse">▌</span>
        </p>
      </div>
    </div>
  )
}
