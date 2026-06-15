let chart = null;
let volumeChart = null;
let allRecords = [];
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalRecords = 0;
let editingId = null;

function initChart() {
    const dom = document.getElementById('strengthTrendChart');
    chart = echarts.init(dom);
    window.addEventListener('resize', () => chart && chart.resize());
}

// Epley formula: 1RM = Weight * (1 + Reps / 30)
function epley1rm(weight, reps) {
    return weight * (1 + reps / 30);
}

function renderChart(records) {
    if (!chart) return;

    // GroupBy action_name + date, take max 1RM per day
    const map = {};
    for (const r of records) {
        const key = r.actionName + '||' + r.recordDate;
        const est1rm = epley1rm(r.weightKg, r.reps);
        if (!map[r.actionName]) map[r.actionName] = {};
        if (!map[r.actionName][r.recordDate] || est1rm > map[r.actionName][r.recordDate]) {
            map[r.actionName][r.recordDate] = est1rm;
        }
    }

    const colors = ['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];
    let ci = 0;

    const series = Object.entries(map).map(([name, dayMap]) => {
        const pts = Object.entries(dayMap)
            .map(([date, est1rm]) => ({ date, est1rm }))
            .sort((a, b) => a.date.localeCompare(b.date));
        const color = colors[ci++ % colors.length];
        return {
            name,
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            itemStyle: { color },
            data: pts.map(p => [p.date, p.est1rm])
        };
    });

    const actionNames = Object.keys(map);

    chart.setOption({
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(30,30,30,0.9)',
            borderColor: 'rgba(255,255,255,0.08)',
            textStyle: { color: '#E0E0E0', fontSize: 12 },
            valueFormatter: (v) => v.toFixed(1) + ' kg'
        },
        legend: {
            data: actionNames,
            textStyle: { color: '#9E9E9E', fontSize: 12 },
            selected: Object.fromEntries(actionNames.map(n => [n, true]))
        },
        grid: { left: 50, right: 24, top: 50, bottom: 30 },
        xAxis: {
            type: 'time',
            axisLabel: { color: '#9E9E9E', fontSize: 11 },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
            splitLine: { show: false }
        },
        yAxis: {
            type: 'value',
            name: '1RM 估算值 (kg)',
            nameTextStyle: { color: '#9E9E9E', fontSize: 11 },
            axisLabel: { color: '#9E9E9E' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
        },
        series,
        backgroundColor: 'transparent'
    }, true);
}

/**
 * XSS-安全的表格渲染
 * 使用 escapeHTML() 转义所有后端返回的字符串，
 * 防止恶意数据注入 innerHTML。
 */
function renderTable(records) {
    const tbody = document.getElementById('historyBody');
    const sorted = [...records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
    tbody.innerHTML = sorted.map(r => `
        <tr>
            <td>${escapeHTML(r.recordDate)}</td>
            <td>${escapeHTML(r.actionName)}</td>
            <td>${r.actionName === '引体向上' ? (r.weightKg == 0 ? '自重' : escapeHTML(r.weightKg) + 'kg') : escapeHTML(r.weightKg)}</td>
            <td>${escapeHTML(r.sets)}×${escapeHTML(r.reps)}</td>
            <td>${escapeHTML(r.rpe)}</td>
            <td>
                <button class="text-btn" data-id="${escapeHTML(r.id)}">[ 编辑 ]</button>
                <button class="text-btn danger" data-id="${escapeHTML(r.id)}">[ 删除 ]</button>
            </td>
        </tr>
    `).join('');

    // Edit buttons
    tbody.querySelectorAll('.text-btn:not(.danger)').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const record = allRecords.find(r => r.id === id);
            if (!record) return;
            startEdit(record);
        });
    });

    // Delete buttons
    tbody.querySelectorAll('.text-btn.danger').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await api.del('/training-records/' + btn.dataset.id);
                showToast('已删除', 'success');
                loadTable();
            } catch (_) {}
        });
    });
}

function renderPagination() {
    const pageInfo = document.getElementById('pageInfo');
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (!pageInfo || !pageNumbers) return;

    if (totalPages <= 1) {
        pageInfo.textContent = `共 ${totalRecords} 条`;
        pageNumbers.innerHTML = '';
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }

    pageInfo.textContent = `共 ${totalRecords} 条，第 ${currentPage}/${totalPages} 页`;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    pageNumbers.innerHTML = html;

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    pageNumbers.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            loadTable();
        });
    });
    prevBtn.onclick = () => {
        if (currentPage > 1) { currentPage--; loadTable(); }
    };
    nextBtn.onclick = () => {
        if (currentPage < totalPages) { currentPage++; loadTable(); }
    };
}

async function loadTable() {
    try {
        const resp = await api.get(`/training-records?page=${currentPage}&size=${pageSize}`);
        allRecords = resp.list || [];
        currentPage = resp.pageNum;
        totalPages = resp.pages;
        totalRecords = resp.total;
    } catch (_) {
        allRecords = [];
    }
    renderTable(allRecords);
    renderPagination();
}

async function loadChart() {
    try {
        const chartData = await api.get('/training-records/chart') || [];
        renderChart(chartData);
    } catch (_) {}
}

// ---- Start editing a record ----
function startEdit(record) {
    editingId = record.id;

    var select = document.getElementById('actionSelect');
    var input = document.getElementById('actionInput');
    var hidden = document.getElementById('actionNameHidden');

    // Check if action is in the preset list
    var presetOptions = Array.from(select.options).map(function (o) { return o.value; });
    if (presetOptions.indexOf(record.actionName) !== -1 && record.actionName !== '__custom__') {
        select.value = record.actionName;
        select.style.display = 'block';
        input.style.display = 'none';
        hidden.value = record.actionName;
    } else {
        select.value = '__custom__';
        select.style.display = 'none';
        input.style.display = 'block';
        input.value = record.actionName;
        hidden.value = record.actionName;
    }

    // Trigger weight label update via change event
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('change', true, false);
    select.dispatchEvent(evt);

    document.querySelector('[name="weightKg"]').value = record.weightKg;
    document.querySelector('[name="sets"]').value = record.sets;
    document.querySelector('[name="reps"]').value = record.reps;
    document.querySelector('[name="rpe"]').value = record.rpe;
    document.getElementById('rpeVal').textContent = record.rpe;
    document.querySelector('[name="recordDate"]').value = record.recordDate;

    var btn = document.querySelector('#trainingForm button[type="submit"]');
    btn.textContent = '更新记录';
    document.getElementById('trainingCancelBtn').style.display = 'inline-flex';
}

function cancelEdit() {
    editingId = null;
    var form = document.getElementById('trainingForm');
    form.reset();
    document.getElementById('rpeVal').textContent = '7';
    var btn = document.querySelector('#trainingForm button[type="submit"]');
    btn.textContent = '提交记录';
    document.getElementById('trainingCancelBtn').style.display = 'none';

    var select = document.getElementById('actionSelect');
    select.value = '';
    select.style.display = 'block';
    document.getElementById('actionInput').style.display = 'none';
    document.getElementById('actionNameHidden').value = '';
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('change', true, false);
    select.dispatchEvent(evt);
}

document.getElementById('trainingForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rawWeight = fd.get('weightKg');
    const actionName = fd.get('actionName');
    const data = {
        actionName: actionName,
        weightKg: actionName === '引体向上'
            ? (rawWeight ? parseFloat(rawWeight) : 0)
            : parseFloat(rawWeight),
        sets: parseInt(fd.get('sets')),
        reps: parseInt(fd.get('reps')),
        rpe: parseFloat(fd.get('rpe')),
        recordDate: fd.get('recordDate')
    };
    try {
        if (editingId) {
            await api.put('/training-records/' + editingId, data);
            showToast('训练记录已更新', 'success');
            cancelEdit();
        } else {
            await api.post('/training-records', data);
            showToast('训练记录已保存', 'success');
            e.target.reset();
            document.getElementById('rpeVal').textContent = '7';
        }
        currentPage = 1;
        loadTable();
        loadChart();
    } catch (_) {}
});

// ---- Weekly Volume Bar Chart ----
function initVolumeChart() {
    const dom = document.getElementById('volumeChart');
    if (!dom) return;
    volumeChart = echarts.init(dom);
    window.addEventListener('resize', () => volumeChart && volumeChart.resize());
}

function renderVolumeChart(data) {
    if (!volumeChart || !data || !data.length) return;
    const weeks = data.map(d => d.weekStart);
    const values = data.map(d => d.volume);
    const maxVal = Math.max(...values, 1);

    volumeChart.setOption({
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(30,30,30,0.9)',
            borderColor: 'rgba(255,255,255,0.08)',
            textStyle: { color: '#E0E0E0', fontSize: 12 },
            valueFormatter: (v) => v.toLocaleString() + ' kg'
        },
        grid: { left: 60, right: 24, top: 30, bottom: 30 },
        xAxis: {
            type: 'category',
            data: weeks,
            axisLabel: { color: '#9E9E9E', fontSize: 11 },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
        },
        yAxis: {
            type: 'value',
            name: '训练容量 (kg)',
            nameTextStyle: { color: '#9E9E9E', fontSize: 11 },
            axisLabel: { color: '#9E9E9E' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
        },
        series: [{
            type: 'bar',
            data: values.map(v => ({
                value: v,
                itemStyle: {
                    color: v >= maxVal * 0.8 ? '#F44336'
                         : v >= maxVal * 0.5 ? '#FF9800'
                         : '#2196F3'
                }
            })),
            barWidth: '50%',
            itemStyle: { borderRadius: [4, 4, 0, 0] }
        }],
        backgroundColor: 'transparent'
    }, true);
}

async function loadVolumeChart() {
    try {
        const data = await api.get('/training-records/weekly-volume') || [];
        renderVolumeChart(data);

        // Update week range label from first data point
        var rangeEl = document.getElementById('volumeChartRange');
        if (rangeEl && data && data.length > 0) {
            var start = data[0].weekStart;
            if (start) {
                // Parse start (yyyy-MM-dd), add 6 days for end
                var parts = start.split('-').map(Number);
                var startDate = new Date(parts[0], parts[1] - 1, parts[2]);
                var endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                var fmt = function (d) {
                    return String(d.getMonth() + 1).padStart(2, '0') + '/'
                        + String(d.getDate()).padStart(2, '0');
                };
                rangeEl.textContent = fmt(startDate) + ' ~ ' + fmt(endDate);
            }
        }
    } catch (_) {}
}

initChart();
initVolumeChart();
loadTable();
loadChart();
loadVolumeChart();
