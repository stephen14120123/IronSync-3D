let chart = null;

function initChart() {
    const dom = document.getElementById('bodyMetricsChart');
    chart = echarts.init(dom);
    window.addEventListener('resize', () => chart && chart.resize());
}

function renderChart(list) {
    if (!chart) return;
    const sorted = [...list].sort((a, b) => a.recordDate.localeCompare(b.recordDate));
    const dates = sorted.map(r => r.recordDate);

    chart.setOption({
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(30,30,30,0.9)',
            borderColor: 'rgba(255,255,255,0.08)',
            textStyle: { color: '#E0E0E0' }
        },
        legend: {
            data: ['体重 (kg)', '体脂率 (%)'],
            textStyle: { color: '#9E9E9E' }
        },
        grid: { left: 50, right: 50, top: 40, bottom: 30 },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: { color: '#9E9E9E', fontSize: 11 },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
        },
        yAxis: [
            {
                type: 'value', name: '体重 (kg)',
                nameTextStyle: { color: '#2196F3' },
                axisLabel: { color: '#9E9E9E' },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
            },
            {
                type: 'value', name: '体脂率 (%)',
                nameTextStyle: { color: '#FF9800' },
                axisLabel: { color: '#9E9E9E' },
                splitLine: { show: false }
            }
        ],
        series: [
            {
                name: '体重 (kg)',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#2196F3' },
                itemStyle: { color: '#2196F3' },
                data: sorted.map(r => r.weightKg)
            },
            {
                name: '体脂率 (%)',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                symbol: 'diamond',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#FF9800' },
                itemStyle: { color: '#FF9800' },
                data: sorted.map(r => r.bodyFatPercentage)
            }
        ],
        backgroundColor: 'transparent'
    }, true);
}

function renderTable(list) {
    const tbody = document.getElementById('metricsBody');
    const sorted = [...list].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
    tbody.innerHTML = sorted.map(r => `
        <tr>
            <td>${r.recordDate}</td>
            <td>${r.weightKg}</td>
            <td>${r.bodyFatPercentage ?? '--'}</td>
            <td>${r.note ?? ''}</td>
            <td><button class="del-btn" data-id="${r.id}">删除</button></td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await api.del('/body-metrics/' + btn.dataset.id);
                showToast('已删除', 'success');
                loadData();
            } catch (_) {}
        });
    });
}

async function loadData() {
    const end = new Date().toISOString().slice(0,10);
    const start = new Date(Date.now() - 90*86400000).toISOString().slice(0,10);
    try {
        const list = await api.get(`/body-metrics?from=${start}&to=${end}`) || [];
        renderChart(list);
        renderTable(list);
    } catch (_) {}
}

document.getElementById('metricsForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
        recordDate: fd.get('recordDate'),
        weightKg: parseFloat(fd.get('weightKg')),
        bodyFatPercentage: fd.get('bodyFatPercentage') ? parseFloat(fd.get('bodyFatPercentage')) : null,
        note: fd.get('note') || null
    };
    try {
        await api.post('/body-metrics', data);
        showToast('已保存', 'success');
        e.target.reset();
        loadData();
    } catch (_) {}
});

initChart();
loadData();
