import { useAuth } from '../context/AuthContext'

interface Props {
  onOpenAuth: (mode: 'login' | 'register') => void
}

export default function Navbar({ onOpenAuth }: Props) {
  const { user, logout } = useAuth()

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-xl border border-edge bg-panel/90 px-5 py-3 backdrop-blur">
        <a href="#" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v6M12 15v6M3 12h6M15 12h6" strokeLinecap="round" />
          </svg>
          <span className="font-mono">Git<span className="text-primary">Deep</span></span>
        </a>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-ink-muted sm:block" aria-label="Signed in user">
                {user}
              </span>
              <button
                onClick={logout}
                className="cursor-pointer rounded-lg border border-edge px-4 py-2 text-sm text-ink transition-colors duration-200 hover:border-primary hover:text-primary focus:outline-2 focus:outline-primary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="cursor-pointer whitespace-nowrap rounded-lg px-3 py-2 text-sm text-ink transition-colors duration-200 hover:text-primary focus:outline-2 focus:outline-primary sm:px-4"
              >
                Sign in
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-cta px-3 py-2 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-amber-400 focus:outline-2 focus:outline-offset-2 focus:outline-cta sm:px-4"
              >
                Create account
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
