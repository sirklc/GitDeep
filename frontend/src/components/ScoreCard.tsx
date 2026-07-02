import { useLocale } from '../i18n'

interface Props {
  score: number
  summary: string
  pdfUrl?: string
}

/** Hero number: overall repository health score with an SVG ring gauge. */
export default function ScoreCard({ score, summary, pdfUrl }: Props) {
  const { t } = useLocale()
  const { color, label } =
    score >= 70
      ? { color: 'var(--color-good)', label: t.result.healthy }
      : score >= 40
        ? { color: 'var(--color-warn)', label: t.result.atRisk }
        : { color: 'var(--color-bad)', label: t.result.critical }
  const r = 52
  const c = 2 * Math.PI * r
  const filled = (score / 100) * c

  return (
    <section aria-label="Health score" className="flex flex-col items-center gap-6 rounded-2xl border border-edge bg-panel p-8 md:flex-row md:items-start">
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Health score ${score} out of 100 — ${label}`}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-panel-2)" strokeWidth="10" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${c - filled}`}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-semibold">{score}</span>
          <span className="text-xs text-ink-muted">/ 100</span>
        </div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <p className="mb-1 font-mono text-sm tracking-widest" style={{ color }}>
          {label}
        </p>
        <p className="leading-relaxed text-ink">{summary}</p>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-teal-300 focus:outline-2 focus:outline-offset-2 focus:outline-cta"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.result.downloadPdf}
          </a>
        )}
      </div>
    </section>
  )
}
