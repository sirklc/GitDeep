import type { AnalysisResult, HistoryItem, ProgressFn } from '../types'

const API = '/api'

// ── Token storage ─────────────────────────────────────────────────────────────
const ACCESS_KEY = 'gitdeep_token'
const REFRESH_KEY = 'gitdeep_refresh_token'
const USER_KEY = 'gitdeep_user'

export const getToken = () => localStorage.getItem(ACCESS_KEY)
export const getStoredUser = () => localStorage.getItem(USER_KEY)

function saveTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Errors ────────────────────────────────────────────────────────────────────
function parseError(status: number, data: { detail?: string; message?: string } | null): string {
  switch (status) {
    case 401: return 'Session expired. Please sign in again.'
    case 403: return 'You are not allowed to perform this action.'
    case 429: return 'Rate limit exceeded. Please wait a while and try again.'
    case 500: return 'Server error. Please try again later.'
    default: return data?.detail || data?.message || `Request failed (${status})`
  }
}

// ── Silent refresh + authenticated fetch ─────────────────────────────────────
async function tryRefresh(): Promise<boolean> {
  const rt = localStorage.getItem(REFRESH_KEY)
  if (!rt) return false
  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    })
    if (!res.ok) return false
    const d = await res.json()
    saveTokens(d.access_token, d.refresh_token)
    return true
  } catch {
    return false
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const withAuth = (): RequestInit => {
    const token = getToken()
    return {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  }

  let res = await fetch(url, withAuth())
  if (res.status === 401 && getToken()) {
    if (await tryRefresh()) {
      res = await fetch(url, withAuth())
    } else {
      clearSession()
    }
  }
  return res
}

// ── Analysis ──────────────────────────────────────────────────────────────────
export async function analyzeRepository(url: string, onProgress: ProgressFn): Promise<AnalysisResult> {
  const res = await fetchWithAuth(`${API}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(parseError(res.status, data))

  // Cached result returns immediately
  if (data.status === 'success') return data as AnalysisResult

  const taskId: string | undefined = data.details?.task_id
  if (!taskId) throw new Error('Could not obtain a task id.')
  return pollTask(taskId, onProgress)
}

async function pollTask(taskId: string, onProgress: ProgressFn): Promise<AnalysisResult> {
  const MAX_RETRIES = 100 // 100 × 3s = 5 minutes
  const INTERVAL_MS = 3000

  for (let i = 0; i < MAX_RETRIES; i++) {
    await new Promise((r) => setTimeout(r, INTERVAL_MS))
    const res = await fetchWithAuth(`${API}/analyze/${taskId}`)
    const data = await res.json()
    if (!res.ok) throw new Error(parseError(res.status, data))

    if (data.status === 'success') return data.result as AnalysisResult
    if (data.status === 'failed') throw new Error(data.message || 'Analysis failed.')
    if (data.message) onProgress(data.message, data.progress ?? null)
  }
  throw new Error('Analysis timed out (5 minutes).')
}

// ── History ───────────────────────────────────────────────────────────────────
export async function getHistory(): Promise<HistoryItem[]> {
  const endpoint = getToken() ? `${API}/me/history` : `${API}/history`
  const res = await fetchWithAuth(endpoint)
  if (!res.ok) {
    if (res.status === 401) return []
    throw new Error(parseError(res.status, await res.json().catch(() => null)))
  }
  const data = await res.json()
  return data.history ?? []
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(username: string, password: string, turnstileToken: string) {
  const body = new URLSearchParams({ username, password, cf_turnstile_response: turnstileToken })
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(parseError(res.status, data))
  saveTokens(data.access_token, data.refresh_token)
  localStorage.setItem(USER_KEY, username)
  return data
}

export async function register(username: string, password: string, turnstileToken: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, cf_turnstile_response: turnstileToken }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(parseError(res.status, data))
  return data
}

// ── Public config ─────────────────────────────────────────────────────────────
export async function getPublicConfig(): Promise<{ turnstile_site_key?: string }> {
  try {
    const res = await fetch(`${API}/config`)
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}
