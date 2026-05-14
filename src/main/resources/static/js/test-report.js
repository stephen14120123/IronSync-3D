function checkIframeLoaded(iframe) {
    try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc || !doc.body || doc.body.innerHTML.trim() === '') {
            iframe.style.display = 'none';
            document.getElementById('fallbackMsg').style.display = 'flex';
        }
    } catch (e) {
        // cross-origin or empty
        iframe.style.display = 'none';
        document.getElementById('fallbackMsg').style.display = 'flex';
    }
}

async function loadOverview() {
    try {
        const data = await api.get('/test/report/latest');
        if (data) {
            document.getElementById('reportTime').textContent = data.timestamp || '--';
            document.getElementById('totalCount').textContent = data.total ?? '--';
            document.getElementById('passCount').textContent = data.passed ?? '--';
            document.getElementById('failCount').textContent = data.failed ?? '--';
        }
    } catch (_) {
        // Keep defaults
    }
}

loadOverview();
