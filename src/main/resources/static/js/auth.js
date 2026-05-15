(function () {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('errorMsg');

    if (!loginForm) return;

    // If already logged in, redirect to dashboard
    if (localStorage.getItem('auth_token')) {
        window.location.href = '/';
        return;
    }

    function setLoading(loading) {
        loginBtn.disabled = loading;
        loginBtn.textContent = loading ? '登录中...' : '登 录';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            errorMsg.textContent = '请输入用户名和密码';
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const json = await res.json();

            if (json.code !== 200) {
                errorMsg.textContent = json.message || '登录失败';
                setLoading(false);
                return;
            }

            localStorage.setItem('auth_token', json.data.token);
            window.location.href = '/';
        } catch (err) {
            errorMsg.textContent = '网络异常，请检查服务器是否运行';
            setLoading(false);
        }
    });
})();
