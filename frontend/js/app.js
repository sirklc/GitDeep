import { analyzeRepository, getHistory, login, register, logout } from './api.js?v=4';
import { elements, addLog, resetUI, displayResults, displayError, restoreUIState, renderHistory } from './ui.js?v=4';

async function handleAnalyze(url) {
    if (!url) return;

    resetUI();
    addLog(`Initiating analysis for: ${url}`);

    try {
        const data = await analyzeRepository(url, (msg) => {
            addLog(`Status Update: ${msg}`);
        });

        // Polling returns the result object directly on success.
        // We will mock the 'status' and 'message' to fit displayResults structure
        addLog(`Response received: Analysis complete`);

        if (data) {
            displayResults({ "status": "success", "message": "Analysis Complete", "details": data.details, "chart_data": data.chart_data, "pdf_url": data.pdf_url, "health_score": data.health_score });
        }
    } catch (error) {
        console.error('Error:', error);
        displayError(error);
    } finally {
        restoreUIState();
    }
}

elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.urlInput.value.trim();
    handleAnalyze(url);
});

async function loadHistory() {
    try {
        console.log("Fetching history from API...");
        const data = await getHistory();
        const historyData = data.history || [];
        console.log(`Fetched ${historyData.length} history items.`);

        const historyTrack = document.getElementById('history-track');
        const historyLoginPrompt = document.getElementById('history-login-prompt');
        const historySection = document.getElementById('history-section');

        if (!localStorage.getItem('gitdeep_token')) {
            historyTrack.style.display = 'none';
            historyLoginPrompt.style.display = 'block';
            historySection.style.display = 'block';
            return;
        }

        historyTrack.style.display = 'grid';
        historyLoginPrompt.style.display = 'none';

        if (historyData.length === 0) {
            historySection.style.display = 'none';
            return;
        }

        historySection.style.display = 'block';
        renderHistory(historyData, (repoUrl) => {
            elements.urlInput.value = repoUrl;
            if (!elements.submitBtn.disabled) {
                // Simulate form submission visually
                handleAnalyze(repoUrl);
            }
        });

    } catch (e) {
        console.error("Failed to fetch history:", e);
    }
}

// Authentication UI Logic
function updateAuthUI() {
    const user = localStorage.getItem('gitdeep_user');
    const headerBtns = {
        login: document.getElementById('login-modal-btn'),
        register: document.getElementById('register-modal-btn'),
        logout: document.getElementById('logout-btn'),
        greeting: document.getElementById('user-greeting')
    };

    if (user) {
        headerBtns.login.style.display = 'none';
        headerBtns.register.style.display = 'none';
        headerBtns.logout.style.display = 'block';
        headerBtns.greeting.style.display = 'block';
        headerBtns.greeting.textContent = `Hi, ${user}`;
    } else {
        headerBtns.login.style.display = 'block';
        headerBtns.register.style.display = 'block';
        headerBtns.logout.style.display = 'none';
        headerBtns.greeting.style.display = 'none';
    }
}

function setupAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';

        try {
            await login(
                document.getElementById('login-username').value,
                document.getElementById('login-password').value
            );
            document.getElementById('login-modal').style.display = 'none';
            loginForm.reset();
            updateAuthUI();
            loadHistory();
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });

    // Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('register-error');
        errorEl.textContent = '';

        try {
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            await register(username, password);

            // Auto login after register
            await login(username, password);

            document.getElementById('register-modal').style.display = 'none';
            registerForm.reset();
            updateAuthUI();
            loadHistory();
        } catch (err) {
            errorEl.textContent = err.message;
        }
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        logout();
        updateAuthUI();
        loadHistory();
    });

    // Modals
    document.getElementById('login-modal-btn').addEventListener('click', () => {
        document.getElementById('login-modal').style.display = 'flex';
    });

    document.getElementById('register-modal-btn').addEventListener('click', () => {
        document.getElementById('register-modal').style.display = 'flex';
    });

    updateAuthUI();
}

async function initTurnstile() {
    try {
        const res = await fetch('/api/config');
        if (!res.ok) return;
        const config = await res.json();
        if (config.turnstile_site_key) {
            document.querySelectorAll('.cf-turnstile').forEach(el => {
                el.setAttribute('data-sitekey', config.turnstile_site_key);
            });
        }
    } catch (e) {
        console.warn('Could not load Turnstile config:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
    loadHistory();
    initTurnstile();
});
