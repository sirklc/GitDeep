// ── API Base URL ──────────────────────────────────────────────────────────────
// Auto-detects local vs production environment
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `http://${window.location.hostname}:8000/api`
    : '/api';

// ── Token Helpers ─────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('gitdeep_token'); }
function getRefreshToken() { return localStorage.getItem('gitdeep_refresh_token'); }

function saveTokens(access, refresh) {
    localStorage.setItem('gitdeep_token', access);
    if (refresh) localStorage.setItem('gitdeep_refresh_token', refresh);
}

export function logout() {
    localStorage.removeItem('gitdeep_token');
    localStorage.removeItem('gitdeep_refresh_token');
    localStorage.removeItem('gitdeep_user');
}

function authHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ── Human-readable error messages by HTTP status ──────────────────────────────
function parseError(response, data) {
    switch (response.status) {
        case 401: return 'Oturum süresi doldu. Lütfen tekrar giriş yapın.';
        case 403: return 'Bu işlem için yetkiniz yok.';
        case 429: return '⏱ GitHub API hız limiti aşıldı. Lütfen bir saat bekleyin.';
        case 500: return '⚠️ Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        default: return data?.detail || data?.message || `Hata: ${response.status}`;
    }
}

// ── Silent token refresh ──────────────────────────────────────────────────────
async function tryRefresh() {
    const rt = getRefreshToken();
    if (!rt) return false;
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: rt })
        });
        if (!res.ok) return false;
        const d = await res.json();
        saveTokens(d.access_token, d.refresh_token);
        return true;
    } catch { return false; }
}

// ── fetchWithAuth: auto-retry on 401 ─────────────────────────────────────────
async function fetchWithAuth(url, options = {}) {
    options.headers = { ...(options.headers || {}), ...authHeaders() };
    let res = await fetch(url, options);

    if (res.status === 401) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            options.headers = { ...(options.headers || {}), ...authHeaders() };
            res = await fetch(url, options);
        } else {
            logout();
            throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
    }
    return res;
}

// ── analyzeRepository ─────────────────────────────────────────────────────────
export async function analyzeRepository(url, onProgress) {
    const response = await fetchWithAuth(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(parseError(response, data));
    }

    // Cached result — return immediately
    if (data.status === 'success') {
        return data;
    }

    // Async Celery task — start polling
    const taskId = data.details?.task_id;
    if (!taskId) throw new Error('Görev ID alınamadı.');
    return await pollTaskStatus(taskId, onProgress);
}

// ── Celery polling loop ───────────────────────────────────────────────────────
async function pollTaskStatus(taskId, onProgress) {
    const MAX_RETRIES = 100;  // 100 × 3s = 5 minutes
    const INTERVAL_MS = 3000;

    for (let i = 0; i < MAX_RETRIES; i++) {
        await new Promise(r => setTimeout(r, INTERVAL_MS));

        const res = await fetchWithAuth(`${API_BASE_URL}/analyze/${taskId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(parseError(res, data));

        if (data.status === 'success') {
            return data.result;
        } else if (data.status === 'failed') {
            throw new Error(data.message || 'Analiz başarısız oldu.');
        } else {
            if (onProgress && data.message) onProgress(data.message, data.progress);
        }
    }
    throw new Error('Analiz zaman aşımına uğradı (5 dakika).');
}

// ── History ───────────────────────────────────────────────────────────────────
export async function getHistory() {
    // If logged in, return personal history; otherwise return public history
    const endpoint = getToken()
        ? `${API_BASE_URL}/me/history`
        : `${API_BASE_URL}/history`;

    const res = await fetchWithAuth(endpoint);

    if (!res.ok) {
        if (res.status === 401) return { history: [] };   // not logged in
        throw new Error(parseError(res, await res.json()));
    }
    return await res.json();
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function login(username, password) {
    const cfToken = document.querySelector('#login-form .cf-turnstile-response')?.value || '';
    const formData = new URLSearchParams({ username, password, cf_turnstile_response: cfToken });
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(parseError(res, data));

    saveTokens(data.access_token, data.refresh_token);
    localStorage.setItem('gitdeep_user', username);
    return data;
}

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(username, password) {
    const cfToken = document.querySelector('#register-form .cf-turnstile-response')?.value || '';
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, cf_turnstile_response: cfToken })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(parseError(res, data));
    return data;
}
