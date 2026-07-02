import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import Turnstile from './Turnstile'

export type AuthMode = 'login' | 'register'

interface Props {
  mode: AuthMode
  siteKey: string
  onClose: () => void
}

export default function AuthModal({ mode: initialMode, siteKey, onClose }: Props) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cfToken, setCfToken] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(username, password, cfToken)
        onClose()
      } else {
        await register(username, password, cfToken)
        setNotice('Account created — please sign in.')
        setMode('login')
        setPassword('')
        setCfToken('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Sign in' : 'Create account'}
        className="w-full max-w-sm rounded-2xl border border-edge bg-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer rounded-lg p-1 text-ink-muted transition-colors duration-200 hover:text-ink focus:outline-2 focus:outline-primary"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {notice && mode === 'login' && (
          <p className="mb-4 rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-sm text-good">{notice}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-username" className="mb-1 block text-sm text-ink-muted">
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-edge bg-surface px-3 text-sm transition-colors duration-200 focus:border-primary focus:outline-2 focus:outline-primary"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1 block text-sm text-ink-muted">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-edge bg-surface px-3 text-sm transition-colors duration-200 focus:border-primary focus:outline-2 focus:outline-primary"
            />
          </div>

          {siteKey && <Turnstile key={mode} siteKey={siteKey} onToken={setCfToken} />}

          {error && (
            <p role="alert" className="text-sm text-bad">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="min-h-11 w-full cursor-pointer rounded-lg bg-primary font-semibold text-white transition-colors duration-200 hover:bg-blue-500 focus:outline-2 focus:outline-offset-2 focus:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-muted">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button onClick={() => { setMode('register'); setError(''); setCfToken('') }} className="cursor-pointer text-primary hover:underline focus:outline-2 focus:outline-primary">
                Create one
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button onClick={() => { setMode('login'); setError(''); setCfToken('') }} className="cursor-pointer text-primary hover:underline focus:outline-2 focus:outline-primary">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
