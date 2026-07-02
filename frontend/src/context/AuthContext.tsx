import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { clearSession, getStoredUser, login as apiLogin, register as apiRegister } from '../api/client'

interface AuthContextValue {
  user: string | null
  login: (username: string, password: string, turnstileToken: string) => Promise<void>
  register: (username: string, password: string, turnstileToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(getStoredUser())

  const login = useCallback(async (username: string, password: string, turnstileToken: string) => {
    await apiLogin(username, password, turnstileToken)
    setUser(username)
  }, [])

  // Registration does NOT auto-login: Turnstile tokens are single-use, so the
  // user signs in with a fresh token afterwards (the modal switches to login mode).
  const register = useCallback(async (username: string, password: string, turnstileToken: string) => {
    await apiRegister(username, password, turnstileToken)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
