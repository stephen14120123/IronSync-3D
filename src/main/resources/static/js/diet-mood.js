let chart = null;
let editingId = null;

function initChart() {
    const dom = document.getElementById('dietMoodChart');
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
            data: ['碳水 (g)', '蛋白质 (g)', '脂肪 (g)'],
            textStyle: { color: '#9E9E9E' }
        },
        grid: { left: 50, right: 24, top: 50, bottom: 30 },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: { color: '#9E9E9E', fontSize: 11 },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
        },
        yAxis: {
            type: 'value', name: '克 (g)',
            nameTextStyle: { color: '#9E9E9E', fontSize: 11 },
            axisLabel: { color: '#9E9E9E' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
        },
        series: [
            {
                name: '碳水 (g)',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#4CAF50' },
                itemStyle: { color: '#4CAF50' },
                areaStyle: { color: 'rgba(76,175,80,0.12)' },
                data: sorted.map(r => r.carbsG)
            },
            {
                name: '蛋白质 (g)',
                type: 'line',
                smooth: true,
                symbol: 'diamond',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#FF9800' },
                itemStyle: { color: '#FF9800' },
                data: sorted.map(r => r.proteinG)
            },
            {
                name: '脂肪 (g)',
                type: 'line',
                smooth: true,
                symbol: 'triangle',
                symbolSize: 6,
                lineStyle: { width: 2, color: '#2196F3' },
                itemStyle: { color: '#2196F3' },
                data: sorted.map(r => r.fatG)
            }
        ],
        backgroundColor: 'transparent'
    }, true);
}

function renderTable(list) {
    const tbody = document.getElementById('dietBody');
    const sorted = [...list].sort((a, b) => b.recordDate.localeCompare(a.recordDate));
    tbody.innerHTML = sorted.map(r => `
        <tr>
            <td>${r.recordDate}</td>
            <td>${r.carbsG}</td>
            <td>${r.proteinG}</td>
            <td>${r.fatG}</td>
            <td>${r.note ?? ''}</td>
            <td><button class="del-btn" data-id="${r.id}">删除</button>
                <button class="edit-btn" data-id="${r.id}">编辑</button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await api.del('/diet-mood/' + btn.dataset.id);
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
        const list = await api.get(`/diet-mood?from=${start}&to=${end}`) || [];
        allList = list;
        renderDietStats(list);
        renderChart(list);
        renderTable(list);
    } catch (_) {}
}

function renderDietStats(list) {
    if (!list || list.length === 0) return;

    var today = new Date().toISOString().slice(0, 10);
    var todayRecords = list.filter(function (r) { return r.recordDate === today; });

    if (todayRecords.length === 0) {
        // Show most recent day's data instead
        var latest = list[list.length - 1];
        if (latest) {
            var d = latest.recordDate;
            document.getElementById('ds-carbs').textContent = latest.carbsG || '0';
            document.getElementById('ds-protein').textContent = latest.proteinG || '0';
            document.getElementById('ds-fat').textContent = latest.fatG || '0';
            var total = (parseFloat(latest.carbsG || 0) + parseFloat(latest.proteinG || 0) + parseFloat(latest.fatG || 0)).toFixed(1);
            document.getElementById('ds-total').textContent = total;
            document.querySelector('#dietStatRow .block-amber .sub').textContent = d + ' 碳水';
            document.querySelector('#dietStatRow .block-pass .sub').textContent = d + ' 蛋白质';
            document.querySelector('#dietStatRow .block-time .sub').textContent = d + ' 脂肪';
            document.querySelector('#dietStatRow .block-total .sub').textContent = d + ' 总计';
        }
        return;
    }

    var carbs = 0, protein = 0, fat = 0;
    todayRecords.forEach(function (r) {
        carbs += parseFloat(r.carbsG || 0);
        protein += parseFloat(r.proteinG || 0);
        fat += parseFloat(r.fatG || 0);
    });

    document.getElementById('ds-carbs').textContent = carbs.toFixed(1);
    document.getElementById('ds-protein').textContent = protein.toFixed(1);
    document.getElementById('ds-fat').textContent = fat.toFixed(1);
    document.getElementById('ds-total').textContent = (carbs + protein + fat).toFixed(1);

    // Reset labels
    document.querySelector('#dietStatRow .block-amber .sub').textContent = 'g · ' + today;
    document.querySelector('#dietStatRow .block-pass .sub').textContent = 'g · ' + today;
    document.querySelector('#dietStatRow .block-time .sub').textContent = 'g · ' + today;
    document.querySelector('#dietStatRow .block-total .sub').textContent = 'g · ' + today;
}

function startEdit(record) {
    editingId = record.id;
    document.querySelector('[name="recordDate"]').value = record.recordDate;
    document.querySelector('[name="carbsG"]').value = record.carbsG;
    document.querySelector('[name="proteinG"]').value = record.proteinG;
    document.querySelector('[name="fatG"]').value = record.fatG;
    document.querySelector('[name="note"]').value = record.note || '';
    document.querySelector('#dietForm button[type="submit"]').textContent = '更新';
    document.getElementById('dietCancelBtn').style.display = 'inline-flex';
}

function cancelEdit() {
    editingId = null;
    document.getElementById('dietForm').reset();
    document.querySelector('#dietForm button[type="submit"]').textContent = '保存';
    document.getElementById('dietCancelBtn').style.display = 'none';
}

document.getElementById('dietForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
        recordDate: fd.get('recordDate'),
        carbsG: parseFloat(fd.get('carbsG')),
        proteinG: parseFloat(fd.get('proteinG')),
        fatG: parseFloat(fd.get('fatG')),
        note: fd.get('note') || ''
    };
    try {
        if (editingId) {
            await api.put('/diet-mood/' + editingId, data);
            showToast('已更新', 'success');
            cancelEdit();
        } else {
            await api.post('/diet-mood', data);
            showToast('已保存', 'success');
            e.target.reset();
        }
        loadData();
    } catch (_) {}
});

initChart();
loadData();
