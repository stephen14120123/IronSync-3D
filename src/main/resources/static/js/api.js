const API_BASE = 'http://localhost:8080/api';

// ---- Toast 通知系统 ----
function showToast(message, type) {
    const existing = document.querySelector('.toast-container');
    let container = existing;
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed', top: '72px', right: '24px',
            zIndex: '9999', display: 'flex', flexDirection: 'column',
            gap: '8px', maxWidth: '360px'
        });
        document.body.appendChild(container);
    }

    const el = document.createElement('div');
    const bgColor = type === 'error' ? '#F44336' : '#4CAF50';
    Object.assign(el.style, {
        background: bgColor, color: '#fff',
        padding: '12px 18px', borderRadius: '8px',
        fontSize: '14px', lineHeight: '1.4',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        opacity: '1', transition: 'opacity 0.4s ease'
    });
    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
    }, 2500);
}

const api = {
    async request(method, path, body) {
        const url = API_BASE + path;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }
        try {
            const res = await fetch(url, options);
            const json = await res.json();
            if (json.code !== 200) {
                const msg = json.message || '请求失败';
                const detail = json.data ? '\n' + JSON.stringify(json.data) : '';
                showToast('请求错误: ' + msg, 'error');
                throw new Error(msg);
            }
            return json.data;
        } catch (e) {
            if (e.name !== 'Error' || !e.message.startsWith('请求错误')) {
                showToast('网络异常: ' + e.message, 'error');
            }
            throw e;
        }
    },

    get(path)  { return this.request('GET', path); },
    post(path, body) { return this.request('POST', path, body); },
    put(path, body)  { return this.request('PUT', path, body); },
    del(path)  { return this.request('DELETE', path); }
};
