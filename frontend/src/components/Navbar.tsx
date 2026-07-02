import { useAuth } from '../context/AuthContext'

interface Props {
  onOpenAuth: (mode: 'login' | 'register') => void
}

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Recent digs', href: '#history' },
]

export default function Navbar({ onOpenAuth }: Props) {
  const { user, logout } = useAuth()

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-edge bg-surface/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v6M12 15v6M3 12h6M15 12h6" strokeLinecap="round" />
            </svg>
            Git<span className="text-primary">Deep</span>
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="cursor-pointer text-sm text-ink-muted transition-colors duration-200 hover:text-ink focus:outline-2 focus:outline-primary"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/betaforevers/GitDeep"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitDeep on GitHub"
            className="cursor-pointer rounded-lg p-2 text-ink-muted transition-colors duration-200 hover:text-ink focus:outline-2 focus:outline-primary"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.8.55A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
          </a>
          {user ? (
            <>
              <span className="hidden text-sm text-ink-muted sm:block">{user}</span>
              <button
                onClick={logout}
                className="cursor-pointer whitespace-nowrap rounded-lg border border-edge px-3 py-2 text-sm transition-colors duration-200 hover:border-primary hover:text-primary focus:outline-2 focus:outline-primary sm:px-4"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-200 hover:text-ink focus:outline-2 focus:outline-primary"
              >
                Sign in
              </button>
              <a
                href="#analyze"
                className="cursor-pointer whitespace-nowrap rounded-lg bg-cta px-3 py-2 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-teal-300 focus:outline-2 focus:outline-offset-2 focus:outline-cta sm:px-4"
              >
                Start digging
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
