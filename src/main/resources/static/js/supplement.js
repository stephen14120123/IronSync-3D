let allSupplements = [];
let statusData = [];
let editingId = null;
let supplementChart = null;

const $ = id => document.getElementById(id);
const modal = $('modal');
const modalTitle = $('modalTitle');
const modalForm = $('modalForm');

// ---- Render ----
function renderCards(list) {
    const grid = $('supplementGrid');
    if (!list.length) {
        grid.innerHTML = '<div style="color:#666;text-align:center;padding:60px 0;">暂无补剂数据</div>';
        return;
    }
    grid.innerHTML = list.map(s => {
        const days = s.remainingDays !== undefined ? Math.floor(s.remainingDays) : 0;
        const pct = s.remainingDays !== undefined
            ? Math.min(100, (s.remainingDays / 60) * 100) : 0;
        const fillClass = s.status === '告急' ? 'red' : s.status === '偏低' ? 'orange' : 'green';

        return `
            <div class="sup-card status-${s.status}">
                <h4>${s.name}</h4>
                <div class="meta">
                    <span>库存 ${s.currentStockG}g</span>
                    <span>日耗 ${s.dailyConsumptionG}g</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill ${fillClass}" style="width:${Math.min(pct,100)}%"></div>
                </div>
                <div class="days-label">约可维持 ${days} 天</div>
                <div class="card-actions">
                    <button class="edit-btn" data-id="${s.id}">编辑</button>
                    <button class="del-btn" data-id="${s.id}">删除</button>
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.edit-btn').forEach(b =>
        b.addEventListener('click', () => openEdit(b.dataset.id))
    );
    grid.querySelectorAll('.del-btn').forEach(b =>
        b.addEventListener('click', () => delSup(b.dataset.id))
    );
}

// ---- Supplement Horizontal Bar Chart ----
const STATUS_COLOR_MAP = { '告急': '#F44336', '偏低': '#FF9800', '充足': '#4CAF50' };

function initSupplementChart() {
    const dom = document.getElementById('supplementChart');
    if (!dom) return;
    supplementChart = echarts.init(dom);
    window.addEventListener('resize', () => supplementChart && supplementChart.resize());
}

function renderSupplementChart(list) {
    if (!supplementChart || !list.length) return;
    const sorted = [...list].sort((a, b) => b.currentStockG - a.currentStockG);

    supplementChart.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(30,30,30,0.9)',
            borderColor: 'rgba(255,255,255,0.08)',
            textStyle: { color: '#E0E0E0', fontSize: 12 },
            valueFormatter: (v) => v + ' g'
        },
        grid: { left: 100, right: 40, top: 10, bottom: 10 },
        xAxis: {
            type: 'value',
            name: '库存 (g)',
            nameTextStyle: { color: '#9E9E9E', fontSize: 11 },
            axisLabel: { color: '#9E9E9E' },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
        },
        yAxis: {
            type: 'category',
            data: sorted.map(s => s.name),
            axisLabel: { color: '#E0E0E0', fontSize: 12 },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
        },
        series: [{
            type: 'bar',
            barWidth: '60%',
            label: {
                show: true,
                position: 'right',
                color: '#9E9E9E',
                fontSize: 11,
                formatter: (p) => p.value + ' g'
            },
            data: sorted.map(s => ({
                value: s.currentStockG,
                itemStyle: { color: STATUS_COLOR_MAP[s.status] || '#2196F3' }
            }))
        }],
        backgroundColor: 'transparent'
    }, true);
}

function mergeStatus() {
    const map = {};
    statusData.forEach(s => { map[s.id] = s; });
    allSupplements.forEach(s => {
        const dyn = map[s.id];
        if (dyn) {
            s.status = dyn.status;
            s.remainingDays = dyn.remainingDays;
        }
    });
}

// ---- CRUD ----
async function loadData() {
    try {
        allSupplements = await api.get('/supplements') || [];
        statusData = await api.get('/supplements/status') || [];
        mergeStatus();
    } catch (_) {
        allSupplements = [];
        statusData = [];
    }
    applyFilter();
    renderSupplementChart(allSupplements);
}

function applyFilter() {
    const kw = $('searchInput').value.toLowerCase().trim();
    const filtered = kw
        ? allSupplements.filter(s => s.name.toLowerCase().includes(kw))
        : allSupplements;
    renderCards(filtered);
}

async function delSup(id) {
    if (!confirm('确认删除此补剂？')) return;
    try {
        await api.del('/supplements/' + id);
        showToast('已删除', 'success');
        loadData();
    } catch (_) {}
}

// ---- Modal ----
function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function openAdd() {
    editingId = null;
    modalTitle.textContent = '新增补剂';
    modalForm.reset();
    modalForm.elements['id'].value = '';
    openModal();
}

function openEdit(id) {
    const sup = allSupplements.find(s => s.id == id);
    if (!sup) return;
    editingId = id;
    modalTitle.textContent = '编辑补剂';
    modalForm.elements['id'].value = sup.id;
    modalForm.elements['name'].value = sup.name;
    modalForm.elements['currentStockG'].value = sup.currentStockG;
    modalForm.elements['dailyConsumptionG'].value = sup.dailyConsumptionG;
    openModal();
}

modalForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(modalForm);
    const data = {
        name: fd.get('name'),
        currentStockG: parseFloat(fd.get('currentStockG')),
        dailyConsumptionG: parseFloat(fd.get('dailyConsumptionG'))
    };
    try {
        if (editingId) {
            await api.put('/supplements/' + editingId, data);
            showToast('已更新', 'success');
        } else {
            await api.post('/supplements', data);
            showToast('已添加', 'success');
        }
        closeModal();
        loadData();
    } catch (_) {}
});

$('modalCancel').addEventListener('click', closeModal);
$('addBtn').addEventListener('click', openAdd);
$('searchInput').addEventListener('input', applyFilter);

// ---- Init ----
initSupplementChart();
loadData();
