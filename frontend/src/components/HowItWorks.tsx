const STEPS = [
  {
    n: '01',
    title: 'Paste a GitHub URL',
    desc: 'Any public repository. No setup, no tokens, no configuration — sign-in optional.',
  },
  {
    n: '02',
    title: 'Seven-stage excavation',
    desc: 'Metadata, metrics, full clone, originality scan, AI reasoning and PDF generation run as one background job with live progress.',
  },
  {
    n: '03',
    title: 'Read the verdict',
    desc: 'A 0–100 health score, interactive charts and a downloadable report tell you if the project is alive, at risk, or already a ruin.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" aria-label="How it works" className="border-y border-edge bg-panel/40">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">How the dig works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="font-mono text-sm font-medium text-cta">{s.n}</span>
              <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
