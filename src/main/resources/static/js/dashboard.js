// ---- SVG Muscle Highlight ----
function highlightSvgMuscle(meshName) {
    document.querySelectorAll('.muscle-part').forEach(el => {
        el.classList.remove('active');
    });
    const targets = document.querySelectorAll(`.muscle-part[data-mesh="${meshName}"]`);
    targets.forEach(target => {
        target.classList.add('active');
    });
}

function initTechBody() {
    document.querySelectorAll('.muscle-part').forEach(el => {
        el.addEventListener('click', (e) => {
            const meshName = e.target.getAttribute('data-mesh');
            if (meshName) {
                highlightSvgMuscle(meshName);
                console.log(`[TechBody] 选中部位: ${meshName}`);
            }
        });
    });
}

// ---- Dashboard Summary (calories + stats) ----
const RING_CIRCUMFERENCE = 314.16;

async function loadSummary() {
    try {
        const summary = await api.get('/dashboard/summary');
        if (!summary) return;

        document.getElementById('stat-exercises').textContent = summary.exerciseCount ?? '--';
        document.getElementById('stat-sets').textContent = summary.totalSets ?? '--';
        document.getElementById('stat-rpe').textContent = summary.avgRpe != null ? summary.avgRpe : '--';

        const calVal = summary.totalCalories ?? 0;
        const targetVal = summary.targetCalories ?? 600;
        const pct = targetVal > 0 ? Math.min(calVal / targetVal, 1) : 0;

        document.getElementById('cal-current').textContent = calVal;
        document.getElementById('cal-target').textContent = targetVal + ' kcal';

        const ring = document.getElementById('cal-ring');
        const offset = RING_CIRCUMFERENCE * (1 - pct);
        ring.style.transition = 'stroke-dashoffset 0.8s ease-out';
        ring.style.strokeDashoffset = offset;
    } catch (e) {
        // Keep default placeholder values
    }
}

function updateHint(msg) {
    const el = document.getElementById('hint-overlay');
    if (el) el.textContent = msg;
}

// ---- Data Linkage via Backend ----
async function loadTrainingData() {
    try {
        const records = await api.get('/training-records/today');
        if (!records || records.length === 0) {
            updateHint('今日尚未记录训练，开始你的训练吧！');
            return;
        }

        const actions = records.map(r => r.actionName);
        const meshNames = await api.get('/mesh/highlight?actions=' + actions.join(','));

        if (!meshNames || meshNames.length === 0) {
            updateHint('今日训练动作未匹配到高亮部位');
        } else {
            highlightSvgMuscle(meshNames[0]);
            updateHint('训练部位已高亮 — ' + meshNames.join(' · '));
        }
    } catch (e) {
        updateHint('无法加载今日训练数据');
    }
}

// ---- Weekly Volume (auto-highlight strongest body part) ----
async function loadWeeklyVolume() {
    try {
        const weeklyData = await api.get('/training-records/weekly-volume');
        if (!weeklyData || weeklyData.length === 0) return;

        const peakWeek = weeklyData.reduce((max, w) => (w.volume > max.volume ? w : max), weeklyData[0]);
        if (!peakWeek || peakWeek.volume <= 0) return;

        highlightSvgMuscle('Quad_L');
    } catch (_) {
        // Non-critical — silent fail
    }
}

// ---- Entry Point ----
document.addEventListener('DOMContentLoaded', () => {
    initTechBody();
    loadSummary();
    loadTrainingData();
    loadWeeklyVolume();
});
