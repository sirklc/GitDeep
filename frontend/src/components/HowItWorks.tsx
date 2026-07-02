import { useLocale } from '../i18n'

export default function HowItWorks() {
  const { t } = useLocale()

  return (
    <section id="how-it-works" aria-label={t.how.title} className="scroll-mt-16 border-y border-edge bg-panel/40">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t.how.title}</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {t.how.steps.map((s, i) => (
            <div key={s.title} className="relative">
              <span className="font-mono text-sm font-medium text-cta">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
