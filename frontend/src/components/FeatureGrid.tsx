interface Feature {
  title: string
  desc: string
  icon: string // SVG path (24x24, stroke)
}

const FEATURES: Feature[] = [
  {
    title: 'Bus factor',
    desc: 'How many developers can leave before the project collapses? Ownership concentration, quantified.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    title: 'Activity decay',
    desc: 'Month-by-month commit archaeology that separates living projects from abandoned ruins.',
    icon: 'M3 17l6-6 4 4 8-8M21 7v6h-6',
  },
  {
    title: 'Commit intent',
    desc: 'Features, fixes, chores or docs — NLP classification reveals where the effort really goes.',
    icon: 'M8 9h8M8 13h5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Originality check',
    desc: 'Gemini-powered assessment: genuine engineering, boilerplate, or a tutorial clone?',
    icon: 'M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V7l7-4z',
  },
  {
    title: 'Code quality',
    desc: 'Hotspot analysis over the full file history estimates bugs, smells and a SQALE grade.',
    icon: 'M8 6l-6 6 6 6M16 6l6 6-6 6M13 4l-2 16',
  },
  {
    title: 'PDF verdict',
    desc: 'Every excavation ends with an academic-style PDF report — charts, reasoning and score included.',
    icon: 'M7 3h8l4 4v14H7V3zM15 3v4h4M10 13h5M10 17h5',
  },
]

export default function FeatureGrid() {
  return (
    <section id="features" aria-label="Features" className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        Every layer of the codebase, <span className="text-primary">excavated</span>
      </h2>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
        Seven analysis stages dig through commits, contributors and code patterns to produce one verdict.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border border-edge bg-panel p-6 transition-colors duration-200 hover:border-primary/60"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={f.icon} />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
