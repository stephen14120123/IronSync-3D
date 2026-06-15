let chart = null;
let editingId = null;

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
            <td><button class="del-btn" data-id="${r.id}">删除</button>
                <button class="edit-btn" data-id="${r.id}">编辑</button>
            </td>
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

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const record = allList.find(r => r.id === id);
            if (!record) return;
            startEdit(record);
        });
    });
}

let allList = [];

async function loadData() {
    const end = new Date().toISOString().slice(0,10);
    const start = new Date(Date.now() - 90*86400000).toISOString().slice(0,10);
    try {
        const list = await api.get(`/body-metrics?from=${start}&to=${end}`) || [];
        allList = list;
        renderStats(list);
        renderChart(list);
        renderTable(list);
    } catch (_) {}
}

function renderStats(list) {
    if (!list || list.length === 0) return;
    var latest = list[list.length - 1];

    document.getElementById('ms-latestWeight').textContent = latest.weightKg || '--';
    document.getElementById('ms-latestBodyfat').textContent = latest.bodyFatPercentage != null ? latest.bodyFatPercentage : '--';

    var dates = {};
    list.forEach(function (r) { dates[r.recordDate] = true; });
    var count = Object.keys(dates).length;
    document.getElementById('ms-totalRecords').textContent = count;
    document.getElementById('ms-dateRange').textContent = list[0].recordDate + ' ~ ' + list[list.length - 1].recordDate;

    var sum = 0, n = 0;
    list.forEach(function (r) { if (r.weightKg != null) { sum += parseFloat(r.weightKg); n++; } });

    // Weight change vs 7 days ago
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    var beforeStr = sevenDaysAgo.toISOString().slice(0, 10);

    var oldRecord = null;
    for (var i = 0; i < list.length; i++) {
        if (list[i].recordDate >= beforeStr) {
            if (i > 0) oldRecord = list[i - 1];
            break;
        }
    }
    if (!oldRecord && list.length > 0) oldRecord = list[0];

    if (oldRecord && oldRecord.weightKg != null && latest.weightKg != null) {
        var delta = parseFloat(latest.weightKg) - parseFloat(oldRecord.weightKg);
        var sign = delta >= 0 ? '↑' : '↓';
        document.getElementById('ms-weightChange').textContent = sign + Math.abs(delta).toFixed(1);
        document.getElementById('ms-weightChange').style.color = delta >= 0 ? 'var(--neon-red)' : 'var(--neon-green)';
    } else {
        document.getElementById('ms-weightChange').textContent = '--';
    }

    if (oldRecord && oldRecord.bodyFatPercentage != null && latest.bodyFatPercentage != null) {
        var deltaBf = parseFloat(latest.bodyFatPercentage) - parseFloat(oldRecord.bodyFatPercentage);
        document.getElementById('ms-bodyfatDelta').textContent = (deltaBf >= 0 ? '↑' : '↓') + Math.abs(deltaBf).toFixed(1);
    }

    document.getElementById('ms-totalRecords').textContent = count;
    document.getElementById('ms-dateRange').textContent = list[0].recordDate + ' ~ ' + list[list.length - 1].recordDate;
}

function startEdit(record) {
    editingId = record.id;
    document.querySelector('[name="recordDate"]').value = record.recordDate;
    document.querySelector('[name="weightKg"]').value = record.weightKg;
    document.querySelector('[name="bodyFatPercentage"]').value = record.bodyFatPercentage || '';
    document.querySelector('[name="note"]').value = record.note || '';
    document.querySelector('#metricsForm button[type="submit"]').textContent = '更新';
    document.getElementById('metricsCancelBtn').style.display = 'inline-flex';
}

function cancelEdit() {
    editingId = null;
    document.getElementById('metricsForm').reset();
    document.querySelector('#metricsForm button[type="submit"]').textContent = '保存';
    document.getElementById('metricsCancelBtn').style.display = 'none';
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
        if (editingId) {
            await api.put('/body-metrics/' + editingId, data);
            showToast('已更新', 'success');
            cancelEdit();
        } else {
            await api.post('/body-metrics', data);
            showToast('已保存', 'success');
            e.target.reset();
        }
        loadData();
    } catch (_) {}
});

initChart();
loadData();
