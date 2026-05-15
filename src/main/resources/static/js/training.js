let chart = null;
let volumeChart = null;
let allRecords = [];
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalRecords = 0;

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

    // GroupBy action_name
    const map = {};
    for (const r of records) {
        if (!map[r.actionName]) map[r.actionName] = [];
        const est1rm = epley1rm(r.weightKg, r.reps);
        map[r.actionName].push({ date: r.recordDate, est1rm });
    }

    const colors = ['#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];
    let ci = 0;

    const series = Object.entries(map).map(([name, pts]) => {
        pts.sort((a, b) => a.date.localeCompare(b.date));
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

function renderTable(records) {
    const tbody = document.getElementById('historyBody');
    const sorted = [...records].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
    tbody.innerHTML = sorted.map(r => `
        <tr>
            <td>${r.recordDate}</td>
            <td>${r.actionName}</td>
            <td>${r.weightKg}</td>
            <td>${r.sets}×${r.reps}</td>
            <td>${r.rpe}</td>
            <td><button class="delete-btn" data-id="${r.id}">删除</button></td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
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

document.getElementById('trainingForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
        actionName: fd.get('actionName'),
        weightKg: parseFloat(fd.get('weightKg')),
        sets: parseInt(fd.get('sets')),
        reps: parseInt(fd.get('reps')),
        rpe: parseFloat(fd.get('rpe')),
        recordDate: fd.get('recordDate')
    };
    try {
        await api.post('/training-records', data);
        showToast('训练记录已保存', 'success');
        e.target.reset();
        document.getElementById('rpeVal').textContent = '7';
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
    } catch (_) {}
}

initChart();
initVolumeChart();
loadTable();
loadChart();
loadVolumeChart();
