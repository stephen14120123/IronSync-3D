/* ============================================================
   IronSync-3D · MCP Diary Search
   — Glassmorphism · Mock fallback · XSS-safe rendering
   ============================================================ */

const $id = id => document.getElementById(id);
const searchInput = $id('searchInput');
const searchBtn = $id('searchBtn');
const resultsList = $id('resultsList');
const resultsPlaceholder = $id('resultsPlaceholder');
const previewPanel = $id('previewPanel');

let lastKeyword = '';

// ---- Mock diary data (3 items, used as fallback) ----
const MOCK_DATA = [
    {
        filePath: 'notes/2026-06-12.md',
        title: '2026-06-12 力量突破',
        snippet: '今日罗马尼亚硬拉 140KG 突破成功，腰部无不适，核心稳定性明显提升。\n深蹲 100kg × 5 × 5，体重新低 78.5kg，减脂期还能 PR 说明计划执行到位。',
        matchLines: [1, 3, 8],
        html: '<h1>2026-06-12 力量突破</h1><h2>训练数据</h2><ul><li><strong>杠铃深蹲</strong>: 100kg × 5 × 5 <code>PR</code></li><li><strong>罗马尼亚硬拉</strong>: 80kg × 6 × 5</li><li><strong>卧推</strong>: 77.5kg × 5 × 5</li></ul><h2>感受</h2><p>这四周的渐进超负荷计划效果明显。体重降到 78.5kg，但力量反而涨了。减脂期还能 PR，说明计划执行到位。</p><blockquote>深蹲破百！100kg × 5 × 5 感觉自己又回来了。</blockquote>'
    },
    {
        filePath: 'notes/饮食记录-碳循环总结.md',
        title: '饮食记录 — 碳循环总结',
        snippet: '今日高碳日：碳水 300g，蛋白质 170g，脂肪 55g，情绪评分 9/10。\n训练日高碳（200-280g碳水），休息日低碳（120-180g碳水），四周体重从 82kg 降到 78kg。',
        matchLines: [2, 5, 12],
        html: '<h1>碳循环饮食总结</h1><h2>周期安排</h2><ul><li>训练日：高碳（200-280g 碳水）</li><li>休息日：低碳（120-180g 碳水）</li></ul><h2>宏量营养素目标</h2><p>蛋白质：体重的 2 倍（约 160g）<br>脂肪：控制在 50-70g<br>总热量：训练日约 2400kcal / 休息日约 1800kcal</p><h2>四周效果</h2><p><strong>体重</strong>: 82kg → 78kg <code>-4kg</code><br><strong>体脂率</strong>: 18% → 15% <code>-3%</code><br>深蹲 1RM 提升约 120kg，肌肉线条明显更清晰。</p>'
    },
    {
        filePath: 'notes/2026-05-31.md',
        title: '2026-05-31 中期回顾',
        snippet: '第三周开始！重量已经恢复到以前的水平。深蹲 80kg × 5 × 5 状态不错。\n现在严格执行碳水循环，体重降到 80.5kg，体脂也在下降。继续保持！',
        matchLines: [2, 8],
        html: '<h1>2026-05-31 训练日记</h1><h2>今日训练</h2><p>第三周开始！重量已经恢复到以前的水平。</p><ul><li><strong>杠铃深蹲</strong>: 80kg × 5 × 5</li><li><strong>推举</strong>: 37.5kg × 5 × 5</li><li><strong>引体向上</strong>: 12 × 5</li></ul><h2>饮食</h2><p>严格执行碳水循环。今天高碳日。<br>体重降到 80.5kg 了，体脂也在下降。继续保持！</p>'
    }
];

// ---- XSS-safe escape ----
function escapeHTML(str) {
    if (str == null) return '';
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// ---- Highlight keyword in text ----
function highlightText(text, keyword) {
    var escaped = escapeHTML(text);
    if (!keyword) return escaped;
    var terms = keyword.trim().split(/\s+/);
    var result = escaped;
    terms.forEach(function(kw) {
        var re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        result = result.replace(re, '<mark>$1</mark>');
    });
    return result;
}

// ---- Render results list ----
function renderResults(results, keyword, isMock) {
    resultsList.innerHTML = '';

    if (isMock) {
        var notice = document.createElement('div');
        notice.className = 'mock-notice';
        notice.textContent = '// 后端数据不可用，已加载本地演示数据 (' + results.length + ' 条)';
        resultsList.appendChild(notice);
    }

    var count = document.createElement('div');
    count.className = 'hit-count';
    count.textContent = '> Found ' + results.length + ' result(s) for "' + escapeHTML(keyword) + '"';
    resultsList.appendChild(count);

    results.forEach(function(r, idx) {
        var el = document.createElement('div');
        el.className = 'result-item' + (idx === 0 ? ' active' : '');
        el.dataset.idx = idx;

        var pathHtml = '<div class="file-path">'
            + '<span class="tag">MD</span> '
            + escapeHTML(r.filePath)
            + ' <span class="tag" style="color:var(--text-disabled);border-color:var(--glass-border);">' + (r.matchLines ? r.matchLines.length : 0) + ' hits</span>'
            + '</div>';
        var titleHtml = '<div class="title">' + highlightText(r.title, keyword) + '</div>';
        var snippetHtml = '<div class="snippet">' + highlightText(r.snippet, keyword) + '</div>';

        el.innerHTML = pathHtml + titleHtml + snippetHtml;

        el.addEventListener('click', function() {
            resultsList.querySelectorAll('.result-item').forEach(function(item) {
                item.classList.remove('active');
            });
            el.classList.add('active');
            // Show preview
            renderPreview(results, idx, isMock);
        });

        resultsList.appendChild(el);
    });

    // Auto-show first preview
    renderPreview(results, 0, isMock);
    resultsPlaceholder.style.display = 'none';
}

// ---- Render preview panel ----
function renderPreview(results, idx, isMock) {
    var r = results[idx];
    if (!r) return;

    var html = '';
    if (isMock) {
        html += '<div class="mock-notice" style="margin-bottom:8px;">// 本地缓存内容预览</div>';
    }
    html += '<div class="preview-title">' + escapeHTML(r.title) + '</div>';
    html += '<div style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);margin-bottom:12px;">'
        + 'PATH: ' + escapeHTML(r.filePath) + '</div>';

    if (r.html) {
        html += r.html;
    } else {
        html += '<pre><code>' + escapeHTML(r.snippet) + '</code></pre>';
    }

    previewPanel.innerHTML = html;
}

// ---- Perform search ----
function doSearch() {
    var keyword = searchInput.value.trim();
    if (!keyword) return;
    lastKeyword = keyword;

    resultsList.innerHTML = '';
    resultsPlaceholder.style.display = 'none';
    previewPanel.innerHTML = '<div class="placeholder">加载中...</div>';

    // Try backend first
    api.get('/mcp/search?q=' + encodeURIComponent(keyword))
        .then(function(results) {
            if (results && results.length > 0) {
                renderResults(results, keyword, false);
            } else {
                // Backend returned empty → use mock
                renderMockResults(keyword);
            }
        })
        .catch(function() {
            // Backend error → use mock
            renderMockResults(keyword);
        });
}

// ---- Fallback: render mock data ----
function renderMockResults(keyword) {
    var lowerKw = keyword.toLowerCase();
    var filtered = MOCK_DATA.filter(function(r) {
        return r.title.toLowerCase().indexOf(lowerKw) !== -1
            || r.snippet.toLowerCase().indexOf(lowerKw) !== -1;
    });
    // If no match across mock, show all 3 with a notice
    if (filtered.length === 0) {
        filtered = MOCK_DATA;
    }
    renderResults(filtered, keyword, true);
}

// ---- Event bindings ----
searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch();
});

// ---- Initial placeholder ----
resultsPlaceholder.style.display = 'block';
