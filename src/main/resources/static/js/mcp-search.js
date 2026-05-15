const $ = id => document.getElementById(id);
const searchInput = $('searchInput');
const resultsPanel = $('resultsPanel');
const previewPanel = $('previewPanel');

let lastKeyword = '';

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function highlightKeyword(text, keyword) {
    const escaped = escapeHtml(text);
    const keywords = keyword.trim().split(/\s+/);
    let result = escaped;
    keywords.forEach(kw => {
        const re = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        result = result.replace(re, '<mark>$1</mark>');
    });
    return result;
}

function renderResults(results, keyword) {
    if (!results || results.length === 0) {
        resultsPanel.innerHTML = '<div class="placeholder">未找到匹配内容</div>';
        return;
    }
    resultsPanel.innerHTML = results.map(r => `
        <div class="result-item" data-path="${escapeHtml(r.filePath)}">
            <div class="file-path">${escapeHtml(r.filePath)}</div>
            <div class="title">${escapeHtml(r.title)}</div>
            <div class="snippet">${highlightKeyword(r.snippet || '(无摘要)', keyword)}</div>
        </div>
    `).join('');

    resultsPanel.querySelectorAll('.result-item').forEach(el => {
        el.addEventListener('click', () => loadContent(el.dataset.path));
    });
}

async function loadContent(filePath) {
    previewPanel.innerHTML = '<div class="placeholder">加载中...</div>';
    try {
        const result = await api.get('/mcp/content?path=' + encodeURIComponent(filePath));
        previewPanel.innerHTML = result.html || '<div class="placeholder">无内容</div>';
    } catch (_) {
        previewPanel.innerHTML = '<div class="placeholder">加载失败</div>';
    }
}

async function doSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    lastKeyword = keyword;
    resultsPanel.innerHTML = '<div class="placeholder">搜索中...</div>';
    previewPanel.innerHTML = '<div class="placeholder">选择一条结果查看内容</div>';
    try {
        const results = await api.get('/mcp/search?q=' + encodeURIComponent(keyword));
        renderResults(results, keyword);
    } catch (_) {
        resultsPanel.innerHTML = '<div class="placeholder">搜索请求失败</div>';
    }
}

searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
});

$('resultsPanel').innerHTML = '<div class="placeholder">输入关键词后按回车检索</div>';
