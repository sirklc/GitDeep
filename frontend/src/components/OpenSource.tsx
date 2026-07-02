import { useLocale } from '../i18n'

const GITHUB_URL = 'https://github.com/betaforevers/GitDeep'

const ICONS = [
  'M13 10V3L4 14h7v7l9-11h-7z', // bolt — use the app
  'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', // cube — self-host
  'M12 21C7 17 2 13.5 2 9a5 5 0 0110-1 5 5 0 0110 1c0 4.5-5 8-10 12z', // heart — contribute
]

interface Props {
  onGetStarted: () => void
}

export default function OpenSource({ onGetStarted }: Props) {
  const { t } = useLocale()
  const actions = [
    { onClick: onGetStarted },
    { href: `${GITHUB_URL}#readme` },
    { href: GITHUB_URL },
  ]

  return (
    <section id="open-source" aria-label={t.open.title} className="scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t.open.title}</h2>
        <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">{t.open.sub}</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.open.cards.map((card, i) => (
            <div key={card.title} className="flex flex-col rounded-xl border border-edge bg-panel p-6">
              <div className="mb-4 inline-flex w-fit rounded-lg bg-cta/10 p-2.5 text-cta">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={ICONS[i]} />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{card.desc}</p>
              {actions[i].href ? (
                <a
                  href={actions[i].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block w-fit cursor-pointer text-sm font-medium text-cta transition-colors duration-200 hover:text-teal-300 focus:outline-2 focus:outline-cta"
                >
                  {card.cta} →
                </a>
              ) : (
                <button
                  onClick={actions[i].onClick}
                  className="mt-4 w-fit cursor-pointer text-left text-sm font-medium text-cta transition-colors duration-200 hover:text-teal-300 focus:outline-2 focus:outline-cta"
                >
                  {card.cta} →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
