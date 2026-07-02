import { useLocale } from '../i18n'

// SVG paths (24x24 stroke icons), order matches t.features.items
const ICONS = [
  'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  'M3 17l6-6 4 4 8-8M21 7v6h-6',
  'M8 9h8M8 13h5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'M9 12l2 2 4-4M12 3l7 4v5c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V7l7-4z',
  'M8 6l-6 6 6 6M16 6l6 6-6 6M13 4l-2 16',
  'M7 3h8l4 4v14H7V3zM15 3v4h4M10 13h5M10 17h5',
]

export default function FeatureGrid() {
  const { t } = useLocale()

  return (
    <section id="features" aria-label={t.nav.features} className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20">
      <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        {t.features.titleA}
        <span className="text-primary">{t.features.titleB}</span>
      </h2>
      <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">{t.features.sub}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.features.items.map((f, i) => (
          <div
            key={f.title}
            className="group rounded-xl border border-edge bg-panel p-6 transition-colors duration-200 hover:border-primary/60"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary transition-colors duration-200 group-hover:bg-primary/20">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={ICONS[i]} />
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
