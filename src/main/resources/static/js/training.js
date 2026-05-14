let chart = null;
let allRecords = [];

function initChart() {
    const dom = document.getElementById('strengthTrendChart');
    chart = echarts.init(dom);
    window.addEventListener('resize', () => chart && chart.resize());
}

function renderChart(records) {
    if (!chart) return;

    // GroupBy action_name
    const map = {};
    for (const r of records) {
        if (!map[r.actionName]) map[r.actionName] = [];
        map[r.actionName].push({ date: r.recordDate, weight: r.weightKg });
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
            data: pts.map(p => [p.date, p.weight])
        };
    });

    const actionNames = Object.keys(map);

    chart.setOption({
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(30,30,30,0.9)',
            borderColor: 'rgba(255,255,255,0.08)',
            textStyle: { color: '#E0E0E0', fontSize: 12 }
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
            name: '重量 (kg)',
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
                loadData();
            } catch (_) {}
        });
    });
}

async function loadData() {
    try {
        allRecords = await api.get('/training-records') || [];
    } catch (_) {
        allRecords = [];
    }
    renderChart(allRecords);
    renderTable(allRecords);
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
        loadData();
    } catch (_) {}
});

initChart();
loadData();
