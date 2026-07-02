const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Recent digs', href: '#history' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Source code', href: 'https://github.com/betaforevers/GitDeep' },
      { label: 'API docs', href: '/docs' },
      { label: 'Report an issue', href: 'https://github.com/betaforevers/GitDeep/issues' },
    ],
  },
  {
    title: 'Creators',
    links: [
      { label: 'Mehmet Kılıç', href: 'https://github.com/sirklc' },
      { label: 'Tuba Çetin', href: 'https://github.com/cetintuba' },
      { label: 'betaforevers', href: 'https://betaforevers.com' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v6M12 15v6M3 12h6M15 12h6" strokeLinecap="round" />
            </svg>
            GitDeep
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
            Software archaeology for public GitHub repositories — health, risk and intent in one report.
          </p>
          <a
            href="https://github.com/betaforevers/GitDeep"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitDeep on GitHub"
            className="mt-4 inline-flex cursor-pointer rounded-lg border border-edge p-2 text-ink-muted transition-colors duration-200 hover:border-primary hover:text-ink focus:outline-2 focus:outline-primary"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.8.55A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
          </a>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-semibold text-ink">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="cursor-pointer text-sm text-ink-muted transition-colors duration-200 hover:text-cta focus:outline-2 focus:outline-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-edge py-5 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} betaforevers — MIT License
      </div>
    </footer>
  )
}
