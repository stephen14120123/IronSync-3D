/* ============================================================
   IronSync-3D · Global API Client
   — Relative paths, auto-token, 401 redirect, XSS-safe escape
   ============================================================ */

// ---- XSS 防御：实体转义 ----
function escapeHTML(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ---- Auth helpers ----
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

function clearAuth() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
}

function redirectToLogin() {
    clearAuth();
    if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = '/login.html';
    }
}

// ---- Toast 通知系统（不依赖内联样式，使用 CSS 类）----
function showToast(message, type) {
    const container = document.querySelector('.toast-wrap') || (() => {
        const c = document.createElement('div');
        c.className = 'toast-wrap';
        document.body.appendChild(c);
        return c;
    })();

    const el = document.createElement('div');
    el.className = 'toast toast-' + (type === 'error' ? 'error' : 'success');
    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
    }, 2500);
}

// ---- 全局 API 请求封装 ----
const API_PREFIX = '/api';

const api = {
    /**
     * 核心请求方法
     *  - 自动给路径加 /api 前缀（前端 js 传 /training-records → /api/training-records）
     *  - 自动携带 Authorization: Bearer token
     *  - 401/403 → 清空 token 并跳转登录
     *  - 解析后端统一 Result 包 { code, message, data }
     *  - 仅 code === 200 返回 data，其余抛出 Error
     */
    async request(method, path, body) {
        const headers = { 'Content-Type': 'application/json' };
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        const options = { method, headers };
        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }
        // ★ 自动补全 /api 前缀
        const url = path.startsWith(API_PREFIX) ? path : API_PREFIX + path;
        try {
            const res = await fetch(url, options);

            // 401/403 → Token 失效，强制跳转
            if (res.status === 401 || res.status === 403) {
                redirectToLogin();
                throw new Error('未登录或 Token 已失效');
            }

            let json;
            try {
                json = await res.json();
            } catch (_) {
                throw new Error('服务器返回了非 JSON 数据，请检查后端状态');
            }

            if (json && json.code === 200) {
                return json.data;
            }

            const msg = (json && json.message) || '请求失败 (' + res.status + ')';
            showToast(msg, 'error');
            throw new Error(msg);

        } catch (e) {
            // 忽略已由 401 分支抛出的 Error，避免重复 Toast
            if (e.message !== '未登录或 Token 已失效') {
                console.error('[API]', method, path, e.message);
                showToast('网络异常: ' + e.message, 'error');
            }
            throw e;
        }
    },

    get(path)            { return this.request('GET', path); },
    post(path, body)     { return this.request('POST', path, body); },
    put(path, body)      { return this.request('PUT', path, body); },
    del(path)            { return this.request('DELETE', path); }
};

// ---- Auth guard: 未登录时自动跳转 ----
(function () {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html');
    const isTestReport = path.startsWith('/test-reports');
    const isStaticAsset = path.match(/\.(css|js|png|jpg|svg|ico|glb)$/);
    if (isLoginPage || isTestReport || isStaticAsset) return;

    if (!getAuthToken()) {
        window.location.href = '/login.html';
    }
})();

// ============================================================
//  SHARED NAV — user display + logout (used by all pages)
// ============================================================

function setNavUser() {
    const el = document.getElementById('navUser');
    if (!el) return;
    const user = localStorage.getItem('auth_user') || '—';
    el.textContent = user;
}

function bindLogout() {
    const btn = document.getElementById('btnLogout');
    if (!btn) return;
    btn.addEventListener('click', handleLogout);
}

async function handleLogout() {
    const token = getAuthToken();

    if (token) {
        try {
            await api.post('/auth/logout');
        } catch (_) {
            // Best-effort server invalidation
        }
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    showToast('已安全退出登录', 'success');

    setTimeout(function () {
        window.location.href = '/login.html';
    }, 600);
}

// ---- Auto-init nav on every page ----
document.addEventListener('DOMContentLoaded', function () {
    setNavUser();
    bindLogout();
});
