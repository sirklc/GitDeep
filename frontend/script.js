// ─────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:8000/api';
const POLL_INTERVAL_MS = 2500;   // Poll Celery every 2.5 seconds
const POLL_MAX_RETRIES = 60;      // ~2.5 minutes total before giving up

// ─────────────────────────────────────────────
//  DOM References
// ─────────────────────────────────────────────
const form = document.getElementById('analyze-form');
const urlInput = document.getElementById('repo-url');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');
const resultsSection = document.getElementById('results-section');
const logOutput = document.getElementById('log-output');

let activityChartInstance = null;
let intentChartInstance = null;

// ─────────────────────────────────────────────
//  Token Management
// ─────────────────────────────────────────────
function getToken() { return localStorage.getItem('access_token'); }
function getRefreshToken() { return localStorage.getItem('refresh_token'); }
function saveTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
}
function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}
function isLoggedIn() { return !!getToken(); }

/** Builds fetch headers with Bearer token if available. */
function authHeaders(extra = {}) {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...extra
    };
}

/** Try to get a new access token using the stored refresh token. */
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
        const data = await res.json();
        saveTokens(data.access_token, data.refresh_token);
        return true;
    } catch { return false; }
}

// ─────────────────────────────────────────────
//  Auth UI (Login / Register Modal)
// ─────────────────────────────────────────────
function buildAuthModal() {
    if (document.getElementById('auth-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'auth-modal';
    overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;
        align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);
    `;

    overlay.innerHTML = `
        <div style="background:#1a1a2e;border:1px solid rgba(107,76,255,0.3);border-radius:16px;
                    padding:36px 40px;width:380px;box-shadow:0 8px 40px rgba(0,0,0,0.6);">
            <h2 style="margin:0 0 6px;color:#f0f0f0;font-size:1.4rem;">🔐 GitDeep Login</h2>
            <p style="margin:0 0 24px;color:#888;font-size:.85rem;">Analiz yapmak için giriş yapın.</p>

            <div style="display:flex;gap:8px;margin-bottom:20px;">
                <button id="tab-login"  class="tab-btn tab-active">Giriş Yap</button>
                <button id="tab-register" class="tab-btn">Kayıt Ol</button>
            </div>

            <input id="auth-username" type="text" placeholder="Kullanıcı adı"
                style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid rgba(107,76,255,0.3);
                       background:#0d0d1a;color:#f0f0f0;font-size:.9rem;box-sizing:border-box;margin-bottom:12px;"/>
            <input id="auth-password" type="password" placeholder="Şifre"
                style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid rgba(107,76,255,0.3);
                       background:#0d0d1a;color:#f0f0f0;font-size:.9rem;box-sizing:border-box;margin-bottom:20px;"/>

            <button id="auth-submit-btn"
                style="width:100%;padding:11px;border-radius:8px;border:none;background:linear-gradient(135deg,#6b4cff,#9b6bff);
                       color:#fff;font-size:.95rem;font-weight:600;cursor:pointer;letter-spacing:.5px;">
                Giriş Yap
            </button>
            <p id="auth-error" style="color:#ff5252;font-size:.82rem;margin-top:12px;min-height:18px;"></p>
        </div>

        <style>
            .tab-btn { flex:1;padding:8px;border-radius:8px;border:1px solid rgba(107,76,255,0.3);
                       background:transparent;color:#888;cursor:pointer;font-size:.85rem;transition:all .2s; }
            .tab-active { background:rgba(107,76,255,0.2);color:#6b4cff;border-color:#6b4cff; }
        </style>
    `;
    document.body.appendChild(overlay);

    let mode = 'login';
    const tabLogin = overlay.querySelector('#tab-login');
    const tabReg = overlay.querySelector('#tab-register');
    const submitB = overlay.querySelector('#auth-submit-btn');
    const errEl = overlay.querySelector('#auth-error');

    tabLogin.addEventListener('click', () => {
        mode = 'login';
        tabLogin.classList.add('tab-active'); tabReg.classList.remove('tab-active');
        submitB.textContent = 'Giriş Yap'; errEl.textContent = '';
    });
    tabReg.addEventListener('click', () => {
        mode = 'register';
        tabReg.classList.add('tab-active'); tabLogin.classList.remove('tab-active');
        submitB.textContent = 'Kayıt Ol'; errEl.textContent = '';
    });

    submitB.addEventListener('click', async () => {
        const username = overlay.querySelector('#auth-username').value.trim();
        const password = overlay.querySelector('#auth-password').value.trim();
        if (!username || !password) { errEl.textContent = 'Kullanıcı adı ve şifre gerekli.'; return; }

        submitB.disabled = true;
        submitB.textContent = '...';
        errEl.textContent = '';

        try {
            if (mode === 'register') {
                const res = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                if (!res.ok) {
                    const d = await res.json();
                    throw new Error(d.detail || 'Kayıt başarısız.');
                }
            }
            // Login (also used after register)
            const formBody = new URLSearchParams({ username, password });
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.detail || 'Giriş başarısız.');
            }
            const data = await res.json();
            saveTokens(data.access_token, data.refresh_token);
            overlay.remove();
            updateAuthBar();
            addLog('✅ Giriş başarılı. Analiz başlatılıyor...');
            // Re-submit the form after login
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        } catch (e) {
            errEl.textContent = e.message;
        } finally {
            submitB.disabled = false;
            submitB.textContent = mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol';
        }
    });
}

function updateAuthBar() {
    let bar = document.getElementById('auth-bar');
    if (!bar) return;
    if (isLoggedIn()) {
        bar.innerHTML = `<span style="color:#888;font-size:.85rem;">Giriş yapıldı</span>
            <button id="logout-btn" style="margin-left:12px;padding:5px 14px;border-radius:8px;border:1px solid rgba(255,82,82,0.4);
            background:rgba(255,82,82,0.1);color:#ff5252;cursor:pointer;font-size:.8rem;">Çıkış</button>`;
        document.getElementById('logout-btn').addEventListener('click', () => {
            clearTokens(); updateAuthBar();
            addLog('👋 Oturumunuz kapatıldı.');
        });
    } else {
        bar.innerHTML = `<button id="login-btn" style="padding:6px 18px;border-radius:8px;border:1px solid rgba(107,76,255,0.4);
            background:rgba(107,76,255,0.1);color:#6b4cff;cursor:pointer;font-size:.85rem;">Giriş Yap</button>`;
        document.getElementById('login-btn').addEventListener('click', buildAuthModal);
    }
}

// ─────────────────────────────────────────────
//  Log Helper
// ─────────────────────────────────────────────
function addLog(message) {
    const p = document.createElement('p');
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    p.innerHTML = `<span style="color:#6b4cff">[${time}]</span> ${message}`;
    logOutput.appendChild(p);
    logOutput.scrollTop = logOutput.scrollHeight;
}

// ─────────────────────────────────────────────
//  Celery Async Polling
// ─────────────────────────────────────────────
async function pollTaskResult(taskId) {
    let retries = 0;
    addLog(`⏳ Görev kuyruğa alındı (ID: ${taskId}). Sonuç bekleniyor...`);
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            retries++;
            if (retries > POLL_MAX_RETRIES) {
                clearInterval(interval);
                reject(new Error('Analiz zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.'));
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/analyze/${taskId}`, { headers: authHeaders() });
                const data = await res.json();

                if (data.status === 'success') {
                    clearInterval(interval);
                    resolve(data.result);
                } else if (data.status === 'failed') {
                    clearInterval(interval);
                    reject(new Error(data.message || 'Analiz başarısız.'));
                } else {
                    addLog(`🔄 ${data.message || 'İşleniyor...'}`);
                }
            } catch (e) {
                clearInterval(interval);
                reject(e);
            }
        }, POLL_INTERVAL_MS);
    });
}

// ─────────────────────────────────────────────
//  Render Results
// ─────────────────────────────────────────────
function renderResults(data) {
    if (!data || !data.details) return;

    document.getElementById('result-title').textContent = `Analysis: ${data.details.stars > 0 ? 'Live' : 'Done'}`;
    document.getElementById('val-stars').textContent = (data.details.stars || 0).toLocaleString();
    document.getElementById('val-issues').textContent = (data.details.open_issues || 0).toLocaleString();
    document.getElementById('val-bus-factor').textContent = data.details.bus_factor || '-';
    document.getElementById('val-stagnant').textContent = data.details.is_stagnant ? 'Evet' : 'Hayır';

    setTimeout(() => {
        document.getElementById('bar-stars').style.width = `${Math.min((data.details.stars / 1000) * 100, 100)}%`;
        document.getElementById('bar-issues').style.width = `${Math.min((data.details.open_issues / 500) * 100, 100)}%`;
        document.getElementById('bar-bus-factor').style.width = `${Math.min((data.details.bus_factor / 10) * 100, 100)}%`;
        document.getElementById('bar-stagnant').style.width = data.details.is_stagnant ? '100%' : '0%';
    }, 100);

    const badge = document.getElementById('result-badge');
    const score = data.health_score ?? 0;
    if (score < 50) {
        badge.textContent = `DEAD (Score: ${score})`;
        badge.style.cssText += 'background:rgba(255,82,82,0.1);color:var(--danger);border-color:rgba(255,82,82,0.2)';
    } else if (score < 80) {
        badge.textContent = `AT RISK (Score: ${score})`;
        badge.style.cssText += 'background:rgba(255,171,64,0.1);color:#ffab40;border-color:rgba(255,171,64,0.2)';
    } else {
        badge.textContent = `ACTIVE (Score: ${score})`;
        badge.style.cssText += 'background:rgba(0,230,118,0.1);color:var(--success);border-color:rgba(0,230,118,0.2)';
    }

    // File Metrics
    const fileMetrics = data.details.file_metrics;
    if (fileMetrics && fileMetrics.total_files_tracked > 0) {
        document.getElementById('file-health-section').style.display = 'block';
        const renderList = (elementId, items, formatFn) => {
            const ul = document.getElementById(elementId);
            ul.innerHTML = '';
            if (!items || items.length === 0) { ul.innerHTML = '<li style="opacity:.5">None detected</li>'; return; }
            items.forEach(item => {
                const li = document.createElement('li');
                li.style.cssText = 'margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
                const short = item.filename.length > 40 ? '...' + item.filename.slice(-37) : item.filename;
                li.innerHTML = `<span style="color:#fff" title="${item.filename}">${short}</span> <span style="opacity:.7">${formatFn(item)}</span>`;
                ul.appendChild(li);
            });
        };
        renderList('list-bug-prone', fileMetrics.bug_prone, i => `(${i.commit_count} commits)`);
        renderList('list-hotspots', fileMetrics.hotspots, i => `(${i.changes} changes)`);
        renderList('list-legacy', fileMetrics.legacy_candidates, i => `(${i.age_days} days dormant)`);
    }

    // Plagiarism results
    const plag = data.details.plagiarism;
    const plagSection = document.getElementById('plagiarism-section');
    if (plag && plagSection) {
        plagSection.style.display = 'block';
        const dupPct = document.getElementById('val-duplication');
        if (dupPct) dupPct.textContent = `${(plag.internal_duplication_pct || 0).toFixed(1)}%`;
        const origEl = document.getElementById('val-originality');
        if (origEl && plag.originality) origEl.textContent = plag.originality.verdict || '-';
    }

    // Summary & PDF
    const summaryBox = document.getElementById('report-summary-box');
    const summaryText = document.getElementById('report-summary-text');
    const downloadBtn = document.getElementById('download-btn');
    summaryText.textContent = data.message;
    summaryBox.style.display = 'block';
    if (data.pdf_url) {
        downloadBtn.href = data.pdf_url;
        downloadBtn.classList.remove('hidden');
        addLog('📄 PDF raporu hazır. İndirmek için tıklayın.');
    }

    // Charts
    if (data.chart_data) {
        document.getElementById('charts-grid').style.display = 'grid';
        drawCharts(data.chart_data.activity_trend, data.chart_data.intent_breakdown);
        addLog('📊 Grafikler oluşturuldu.');
    }

    addLog(`✅ Analiz tamamlandı. ${data.details.commits_analyzed || 0} commit incelendi.`);
}

// ─────────────────────────────────────────────
//  Form Submit
// ─────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    // If not logged in, show auth modal and abort
    if (!isLoggedIn()) {
        buildAuthModal();
        return;
    }

    // Reset UI
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing...';
    statusMessage.textContent = 'Backend\'e bağlanılıyor...';
    statusMessage.className = 'status-message loading';
    resultsSection.classList.remove('hidden');
    document.getElementById('report-summary-box').style.display = 'none';
    document.getElementById('charts-grid').style.display = 'none';
    document.getElementById('file-health-section').style.display = 'none';
    document.getElementById('download-btn').classList.add('hidden');
    ['bar-stars', 'bar-issues', 'bar-bus-factor', 'bar-stagnant'].forEach(id => {
        document.getElementById(id).style.width = '0%';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    logOutput.innerHTML = `
        <div class="loading-wrapper">
            <div class="spinner"></div>
            <div class="loading-text">Depo Analiz Ediliyor...</div>
            <div class="loading-subtext">Commitler çekiliyor, NLP çalıştırılıyor</div>
        </div>
    `;
    addLog(`🔍 Analiz başlatıldı: ${url}`);

    try {
        let res = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ url })
        });

        // Access token expired → try refreshing once
        if (res.status === 401) {
            const refreshed = await tryRefresh();
            if (refreshed) {
                res = await fetch(`${API_BASE_URL}/analyze`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ url })
                });
            } else {
                clearTokens(); updateAuthBar(); buildAuthModal();
                throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
            }
        }

        if (res.status === 429) throw new Error('⏱ GitHub API rate limit aşıldı. Lütfen bir saat bekleyin.');
        if (!res.ok) {
            const d = await res.json();
            throw new Error(d.detail || 'Analiz başarısız oldu.');
        }

        const data = await res.json();
        addLog(`📨 Yanıt alındı: ${data.message}`);

        let finalResult = data;

        // If backend returned a task_id, start Celery polling
        if (data.status === 'processing' && data.details?.task_id) {
            statusMessage.textContent = 'Analiz sıraya alındı, bekleniyor...';
            finalResult = await pollTaskResult(data.details.task_id);
        }

        renderResults(finalResult);
        statusMessage.textContent = 'Analiz tamamlandı!';
        statusMessage.className = 'status-message success';

        setTimeout(() => {
            document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

    } catch (error) {
        console.error('Error:', error);
        statusMessage.textContent = error.message;
        statusMessage.className = 'status-message error';
        addLog(`<span style="color:#ff5252">Hata: ${error.message}</span>`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Analyze Repo';
    }
});

// ─────────────────────────────────────────────
//  History Carousel (uses public /api/history)
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateAuthBar();
    loadHistory();
});

async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/history`);
        if (!response.ok) return;

        const data = await response.json();
        const historyData = data.history || [];
        if (historyData.length === 0) return;

        const section = document.getElementById('history-section');
        const track = document.getElementById('history-track');
        track.innerHTML = '';

        historyData.forEach(item => {
            const date = new Date(item.analyzed_at).toLocaleDateString('tr-TR');
            const score = item.score || 0;
            const color = score >= 80 ? 'var(--success)' : score >= 50 ? '#ffab40' : 'var(--danger)';

            const card = document.createElement('div');
            card.className = 'history-card';
            card.innerHTML = `
                <div>
                    <div class="history-card-header">
                        <span class="history-repo-name">${item.repo_name}</span>
                        <span class="badge" style="background:${color}22;color:${color};border:1px solid ${color}44;">
                            ${score}/100
                        </span>
                    </div>
                    <div class="history-summary">${item.summary || ''}</div>
                </div>
                <div class="history-card-footer">
                    <span class="history-date">${date}</span>
                    <div style="display:flex;gap:10px;">
                        ${item.pdf_url ? `<a href="${item.pdf_url}" target="_blank" class="history-download-btn"
                            style="color:#6b4cff;display:flex;align-items:center;gap:4px;text-decoration:none;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                 stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg> PDF
                        </a>` : ''}
                        <a href="#" class="history-view-btn"
                           data-repo="https://github.com/${item.repo_name}"
                           style="color:var(--accent);text-decoration:none;display:flex;align-items:center;">
                           Görüntüle →
                        </a>
                    </div>
                </div>
            `;
            track.appendChild(card);
        });

        section.style.display = 'block';

        track.addEventListener('click', (e) => {
            const btn = e.target.closest('.history-view-btn');
            if (!btn) return;
            e.preventDefault();
            urlInput.value = btn.getAttribute('data-repo');
            if (!submitBtn.disabled)
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        });

    } catch (e) {
        console.error('History yüklenemedi:', e);
    }
}

// ─────────────────────────────────────────────
//  Charts
// ─────────────────────────────────────────────
function drawCharts(activityTrend, intentBreakdown) {
    Chart.defaults.color = '#888888';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    if (activityChartInstance) activityChartInstance.destroy();
    if (intentChartInstance) intentChartInstance.destroy();

    const ctxActivity = document.getElementById('activityChart').getContext('2d');
    const gradient = ctxActivity.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(107,76,255,0.5)');
    gradient.addColorStop(1, 'rgba(107,76,255,0.0)');

    activityChartInstance = new Chart(ctxActivity, {
        type: 'line',
        data: {
            labels: Object.keys(activityTrend || {}),
            datasets: [{
                label: 'Commit Activity',
                data: Object.values(activityTrend || {}),
                borderColor: '#6b4cff', backgroundColor: gradient,
                borderWidth: 2, fill: true, tension: 0.4,
                pointBackgroundColor: '#00e676', pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff', pointHoverBorderColor: '#00e676'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Commit Activity Trend', color: '#f0f0f0', font: { size: 16 } },
                legend: { display: false }
            },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
            }
        }
    });

    const ctxIntent = document.getElementById('intentChart').getContext('2d');
    let labels = Object.keys(intentBreakdown || {});
    let sizes = Object.values(intentBreakdown || {});

    const fl = [], fs = [];
    for (let i = 0; i < sizes.length; i++) {
        if (sizes[i] > 0) { fl.push(labels[i]); fs.push(sizes[i]); }
    }
    if (fs.length === 0) { fl.push('Unknown'); fs.push(1); }

    intentChartInstance = new Chart(ctxIntent, {
        type: 'doughnut',
        data: {
            labels: fl,
            datasets: [{
                data: fs,
                backgroundColor: ['#00e676', '#ff5252', '#ffab40', '#42a5f5', '#9e9e9e'],
                borderColor: 'transparent', borderWidth: 0, hoverOffset: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: {
                title: { display: true, text: 'Development Focus (Semantic)', color: '#f0f0f0', font: { size: 16 } },
                legend: { position: 'bottom', labels: { padding: 20 } }
            }
        }
    });
}
