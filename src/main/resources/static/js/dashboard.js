// ============================================================
//  IronSync-3D · Dashboard — Bento Box Controller
//  Greeting clock, summary loader, logout, animations
// ============================================================

// ============================================================
//  CLOCK — live greeting
// ============================================================
function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('greetingTime').textContent = hh + ':' + mm;

    // Greeting text (time-of-day based)
    const hour = now.getHours();
    let greet;
    if (hour < 6) greet = '夜深了，注意休息';
    else if (hour < 9) greet = '早上好，开始训练吧';
    else if (hour < 12) greet = '上午好，保持专注';
    else if (hour < 14) greet = '中午好，别忘了补充能量';
    else if (hour < 18) greet = '下午好，动起来';
    else if (hour < 22) greet = '晚上好，燃烧卡路里';
    else greet = '夜深了，记得拉伸放松';
    document.getElementById('greetingText').textContent = greet;

    // Date
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const day = days[now.getDay()];
    document.getElementById('greetingDate').textContent = y + '.' + m + '.' + d + ' 星期' + day;
}

// ============================================================
//  LOAD SUMMARY — training + calories
// ============================================================
async function loadSummary() {
    try {
        const summary = await api.get('/dashboard/summary');
        if (!summary) return;

        // Training metrics
        document.getElementById('ts-frequency').textContent = summary.exerciseCount ?? '--';
        document.getElementById('ts-squat').textContent = summary.squatVolume ?? '--';
        document.getElementById('ts-rdl').textContent = summary.rdlVolume ?? '--';

        // Calories
        const calVal = summary.totalCalories ?? 0;
        const targetVal = summary.targetCalories ?? 600;
        const pct = targetVal > 0 ? Math.min(calVal / targetVal, 1) : 0;

        document.getElementById('calNumber').textContent = calVal;
        document.getElementById('calBarFill').style.width = (pct * 100) + '%';
        document.getElementById('calBarLabel').textContent = calVal + ' / ' + targetVal + ' kcal';

        // Mini bar for training
        const weekPct = summary.weekProgress != null ? summary.weekProgress : (pct * 100);
        document.getElementById('miniBarFill').style.width = Math.min(weekPct, 100) + '%';

    } catch (e) {
        // Keep placeholder values on error
    }
}

// ============================================================
//  LOAD WEEKLY CAPACITY TREND — 7-day volume bars
// ============================================================
async function loadWeeklyVolumeTrend() {
    try {
        const volumes = await api.get('/dashboard/weekly-daily-volume');
        if (!volumes || volumes.length === 0) return;

        var container = document.getElementById('capacityBars');
        container.innerHTML = '';

        var maxVol = 0;
        volumes.forEach(function (v) { if (v.volume > maxVol) maxVol = v.volume; });

        var todayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
        var monOffset = todayIndex === 0 ? 6 : todayIndex - 1; // Mon=0 index

        var total = 0;
        volumes.forEach(function (v, i) {
            total += v.volume;

            var wrap = document.createElement('div');
            wrap.className = 'cap-bar-wrap';

            var valueEl = document.createElement('span');
            valueEl.className = 'cap-bar-value';
            valueEl.textContent = v.volume > 0
                ? (v.volume >= 1000 ? (v.volume / 1000).toFixed(1) + 't' : v.volume + 'kg')
                : '';
            wrap.appendChild(valueEl);

            var bar = document.createElement('div');
            bar.className = 'cap-bar';
            if (v.volume > 0) bar.classList.add('has-volume');
            if (i === monOffset) bar.classList.add('today');
            var heightPct = maxVol > 0 ? Math.max(8, (v.volume / maxVol) * 90) : 8;
            bar.style.height = heightPct + '%';
            wrap.appendChild(bar);

            var label = document.createElement('span');
            label.className = 'cap-bar-label';
            label.textContent = v.dayLabel;
            wrap.appendChild(label);

            container.appendChild(wrap);
        });

        document.getElementById('capTotal').textContent = total >= 1000
            ? (total / 1000).toFixed(1) + ' t'
            : total + ' kg';
    } catch (e) {
        // Keep placeholder
    }
}

// ============================================================
//  LOAD PROFILE STATS — identity + cumulative + body delta
// ============================================================
async function loadProfileStats() {
    try {
        const stats = await api.get('/dashboard/profile');
        if (!stats) return;

        // Avatar
        const initial = (stats.username || 'A').charAt(0).toUpperCase();
        document.getElementById('statsAvatar').textContent = initial;

        // Name
        document.getElementById('statsName').textContent = stats.username || '—';

        // Stats grid
        document.getElementById('ps-workouts').textContent = stats.totalWorkouts ?? '--';
        document.getElementById('ps-sets').textContent = stats.totalSets ?? '--';

        const vol = stats.totalVolumeKg != null
            ? (stats.totalVolumeKg >= 1000
                ? (stats.totalVolumeKg / 1000).toFixed(1) + 't'
                : stats.totalVolumeKg + 'kg')
            : '--';
        document.getElementById('ps-volume').textContent = vol;

        document.getElementById('ps-calories').textContent = stats.totalCalories != null
            ? stats.totalCalories + 'k'
            : '--';

        // Body stats row — weight & bodyfat with deltas
        var bodyRow = document.getElementById('statsBodyRow');
        bodyRow.innerHTML = '';

        function buildBodyItem(label, value, delta) {
            var item = document.createElement('div');
            item.className = 'stats-body-item';

            var valEl = document.createElement('span');
            valEl.className = 'stats-body-value';
            valEl.textContent = value != null ? value : '--';
            item.appendChild(valEl);

            if (delta != null) {
                var deltaEl = document.createElement('span');
                var absDelta = Math.abs(delta);
                if (delta > 0) {
                    deltaEl.className = 'stats-body-delta up';
                    deltaEl.textContent = '↑' + absDelta;
                } else if (delta < 0) {
                    deltaEl.className = 'stats-body-delta down';
                    deltaEl.textContent = '↓' + absDelta;
                } else {
                    deltaEl.className = 'stats-body-delta flat';
                    deltaEl.textContent = '—';
                }
                item.appendChild(deltaEl);
            }

            var lblEl = document.createElement('span');
            lblEl.className = 'stats-body-label';
            lblEl.textContent = label;
            item.appendChild(lblEl);

            return item;
        }

        bodyRow.appendChild(buildBodyItem('体重', stats.latestWeight, stats.weightDelta));
        bodyRow.appendChild(buildBodyItem('体脂', stats.latestBodyFat, stats.bodyFatDelta));
    } catch (e) {
        // Keep placeholder on error
    }
}
// ============================================================
//  LOAD SUPPLEMENT STOCK MINI — top 2 lowest stock
// ============================================================
async function loadSupplementMini() {
    try {
        var list = await api.get('/supplements');
        var container = document.getElementById('supMiniList');
        container.innerHTML = '';

        if (!list || list.length === 0) {
            container.innerHTML = '<div class="sup-mini-placeholder">暂无补剂</div>';
            return;
        }

        // Show top 2 (already sorted by status: 告急 → 偏低 → 充足)
        var items = list.slice(0, 2);
        items.forEach(function (s) {
            var item = document.createElement('div');
            item.className = 'sup-mini-item';

            var dot = document.createElement('span');
            dot.className = 'sup-mini-icon';
            if (s.status === '告急') dot.classList.add('status-critical');
            else if (s.status === '偏低') dot.classList.add('status-low');
            else dot.classList.add('status-ok');
            item.appendChild(dot);

            var name = document.createElement('span');
            name.className = 'sup-mini-name';
            name.textContent = s.name;
            item.appendChild(name);

            var stock = document.createElement('span');
            stock.className = 'sup-mini-stock';
            stock.innerHTML = s.currentStockG + '<small>g</small>';
            item.appendChild(stock);

            container.appendChild(item);
        });
    } catch (e) {
        // Keep placeholder
    }
}

// ============================================================
//  LOAD DIET-MOOD MINI — today's record
// ============================================================
async function loadDietMoodMini() {
    try {
        var now = new Date();
        var todayStr = now.getFullYear() + '-'
            + String(now.getMonth() + 1).padStart(2, '0') + '-'
            + String(now.getDate()).padStart(2, '0');

        var records = await api.get('/diet-mood?from=' + todayStr + '&to=' + todayStr);
        var body = document.getElementById('dietMiniBody');
        body.innerHTML = '';

        if (!records || records.length === 0) {
            body.innerHTML = '<div class="diet-mini-placeholder">暂无记录</div>';
            return;
        }

        var latest = records[records.length - 1];

        // Macros row
        var macrosEl = document.createElement('div');
        macrosEl.className = 'diet-macros';

        function buildMacroItem(label, value, cls) {
            var item = document.createElement('div');
            item.className = 'diet-macro-item ' + cls;

            var val = document.createElement('span');
            val.className = 'diet-macro-value';
            val.textContent = (value != null ? value : '--');
            item.appendChild(val);

            var lbl = document.createElement('span');
            lbl.className = 'diet-macro-label';
            lbl.textContent = label;
            item.appendChild(lbl);

            return item;
        }

        macrosEl.appendChild(buildMacroItem('碳水', latest.carbsG, 'carbs'));
        macrosEl.appendChild(buildMacroItem('蛋白质', latest.proteinG, 'protein'));
        macrosEl.appendChild(buildMacroItem('脂肪', latest.fatG, 'fat'));
        body.appendChild(macrosEl);

        // Note
        if (latest.note) {
            var noteEl = document.createElement('div');
            noteEl.className = 'diet-note';
            noteEl.textContent = '📝 ' + latest.note;
            body.appendChild(noteEl);
        }

    } catch (e) {
        // Keep placeholder
    }
}

// ============================================================
//  LOAD WEEKLY CALORIES TREND — 7-day calorie bars
// ============================================================
async function loadWeeklyCalories() {
    try {
        var data = await api.get('/dashboard/weekly-calories');
        if (!data || data.length === 0) return;

        var container = document.getElementById('weeklyCalBars');
        container.innerHTML = '';

        var maxCal = 0;
        data.forEach(function (d) { if (d.calories > maxCal) maxCal = d.calories; });

        var total = 0;
        var countWithData = 0;
        data.forEach(function (d, i) {
            total += d.calories;
            if (d.calories > 0) countWithData++;

            var wrap = document.createElement('div');
            wrap.className = 'wcal-bar-wrap';

            var valueEl = document.createElement('span');
            valueEl.className = 'wcal-bar-value';
            valueEl.textContent = d.calories > 0 ? d.calories : '';
            wrap.appendChild(valueEl);

            var bar = document.createElement('div');
            bar.className = 'wcal-bar';
            if (d.calories > 0) bar.classList.add('has-cal');
            if (i === data.length - 1) bar.classList.add('today');
            var heightPct = maxCal > 0 ? Math.max(12, (d.calories / maxCal) * 85) : 12;
            bar.style.height = heightPct + '%';
            wrap.appendChild(bar);

            var label = document.createElement('span');
            label.className = 'wcal-bar-label';
            label.textContent = d.dateLabel;
            wrap.appendChild(label);

            container.appendChild(wrap);
        });

        document.getElementById('weeklyCalTotal').textContent = total;

        // Update footer: add daily average
        var avgEl = document.querySelector('.weekly-cal-avg');
        if (avgEl) {
            var avg = countWithData > 0 ? Math.round(total / countWithData) : 0;
            avgEl.textContent = '日均 ' + avg + ' kcal';
        }
    } catch (e) {
        // Keep placeholder
    }
}

// ============================================================
//  MOOD CHECK-IN
// ============================================================
async function loadMood() {
    try {
        var res = await api.get('/mood/today');
        if (!res || res.moodScore == null) return;
        highlightMood(res.moodScore);
    } catch (_) {}
}

function highlightMood(score) {
    var btns = document.querySelectorAll('.mood-btn');
    btns.forEach(function (b) {
        b.classList.toggle('active', parseInt(b.dataset.score) === score);
    });
    document.getElementById('moodResult').textContent = '✓ 已记录';
    setTimeout(function () { document.getElementById('moodResult').textContent = ''; }, 3000);
}

async function setMood(score) {
    try {
        await api.post('/mood/today', { moodScore: score });
        highlightMood(score);
    } catch (_) {}
}

// Bind mood buttons
document.addEventListener('click', function (e) {
    var btn = e.target.closest('.mood-btn');
    if (btn) {
        var score = parseInt(btn.dataset.score);
        setMood(score);
    }
});

// ============================================================
//  ENTRY POINT
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    updateClock();
    loadSummary();
    loadWeeklyVolumeTrend();
    loadProfileStats();
    loadSupplementMini();
    loadDietMoodMini();
    loadWeeklyCalories();
    loadMood();

    // Live clock every 10 seconds
    setInterval(updateClock, 10000);

    bindLogout();
});
