// ==================== UI 辅助组件 ====================
// 此文件包含所有 UI 显示与动画辅助函数
// 依赖：state.js（游戏状态变量）、engine.js（showTooltip 被 engine.js 的 updateBgmButton 调用前需先加载 ui.js）
// 注意：此文件必须在 engine.js 之前加载（因为 engine.js 中的 toggleSound 调用 showTooltip）

// ==================== 全局 Tooltip ====================
let tooltipTimeout = null;

function showTooltip(message, type = 'info', duration = 3000) {
    const tooltip = document.getElementById('globalTooltip');
    const iconEl = document.getElementById('tooltipIcon');
    const titleEl = document.getElementById('tooltipTitle');
    const messageEl = document.getElementById('tooltipMessage');

    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
    }

    const config = {
        success: { icon: '✅', title: '成功' },
        error: { icon: '❌', title: '错误' },
        info: { icon: 'ℹ️', title: '提示' }
    };

    const cfg = config[type] || config.info;
    iconEl.textContent = cfg.icon;
    titleEl.textContent = cfg.title;
    messageEl.textContent = message;

    tooltip.classList.remove('success', 'error', 'info');
    tooltip.classList.add(type);

    tooltip.classList.add('show');

    tooltipTimeout = setTimeout(() => {
        tooltip.classList.remove('show');
    }, duration);
}

// ==================== 筹码显示动画 ====================
let chipAnimationInterval = null;
let lastChipValue = 100;

function showFloatingNumber(changeValue) {
    const chipDisplay = document.querySelector('.chip-display');
    if (!chipDisplay) return;

    chipDisplay.style.position = 'relative';

    const floatEl = document.createElement('div');
    floatEl.className = 'floating-number';

    const sign = changeValue > 0 ? '+' : '';
    floatEl.textContent = `${sign}${changeValue}`;

    if (changeValue > 0) {
        floatEl.classList.add('floating-positive');
        floatEl.style.color = '#00ff00';
    } else {
        floatEl.classList.add('floating-negative');
        floatEl.style.color = '#ff4444';
    }

    floatEl.style.position = 'absolute';
    floatEl.style.right = '10px';
    floatEl.style.top = '50%';
    floatEl.style.transform = 'translateY(-50%)';
    floatEl.style.fontSize = '28px';
    floatEl.style.fontWeight = 'bold';
    floatEl.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
    floatEl.style.pointerEvents = 'none';
    floatEl.style.zIndex = '100';
    floatEl.style.transition = 'all 1s ease-out';
    floatEl.style.opacity = '1';

    chipDisplay.appendChild(floatEl);

    requestAnimationFrame(() => {
        floatEl.style.transform = 'translateY(-80px) translateX(20px) scale(1.5)';
        floatEl.style.opacity = '0';
    });

    setTimeout(() => {
        floatEl.remove();
    }, 1000);
}

function updateChipDisplay(animate = true, showFloat = false, changeValue = 0) {
    const chipElement = document.getElementById('chipCount');
    const currentValue = parseInt(chipElement.textContent) || lastChipValue;
    const target = chips;

    if (!animate || currentValue === target) {
        chipElement.textContent = target;
        lastChipValue = target;

        if (showFloat && changeValue !== 0) {
            showFloatingNumber(changeValue);
        }
        return;
    }

    if (chipAnimationInterval) {
        clearInterval(chipAnimationInterval);
    }

    const diff = target - currentValue;
    const steps = Math.max(Math.abs(Math.floor(Math.abs(diff) / 3)), 1);
    const stepValue = diff / steps;
    let currentStep = 0;

    chipAnimationInterval = setInterval(() => {
        currentStep++;
        const newValue = currentValue + stepValue * currentStep;

        if ((diff > 0 && newValue >= target) || (diff < 0 && newValue <= target)) {
            clearInterval(chipAnimationInterval);
            chipElement.textContent = target;
            lastChipValue = target;

            if (showFloat && diff !== 0) {
                showFloatingNumber(diff);
            }
        } else {
            chipElement.textContent = Math.floor(newValue);
        }
    }, 50);
}

// ==================== 历史记录显示 ====================
function addToHistory(card) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const historyItem = {
        time: timeStr,
        card: card
    };

    history.unshift(historyItem);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <span class="history-time">[${item.time}]</span>
            <span>${item.card.icon} ${item.card.title}</span>
            <span class="${item.card.luckClass}" style="margin-left: 10px;">${item.card.luck}</span>
            <span style="color: #00ff00; margin-left: 10px;">+${item.card.reward}</span>
        </div>
    `).join('');
}

// ==================== 发薪日计时器 ====================
function updatePaydayTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('paydayTimer').textContent =
        `下次发薪日：${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (now.getDate() !== lastPayday.getDate()) {
        chips += 50;
        updateChipDisplay();
        if (typeof initSlotReels === "function") initSlotReels();
        lastPayday = now;
        showTooltip('发薪日！获得 50 个筹码！', 'success', 4000);
    }
}

// ==================== 连击 UI 更新 ====================
function updateComboUI() {
    const indicator = document.getElementById('comboIndicator');
    const iconEl = document.getElementById('comboIcon');
    const countEl = document.getElementById('comboCount');
    const titleEl = document.getElementById('comboTitle');
    const bonusEl = document.getElementById('comboBonus');

    if (comboLevel === 0) {
        indicator.classList.remove('show', 'level-1', 'level-2', 'level-3');
        return;
    }

    indicator.classList.remove('level-1', 'level-2', 'level-3');
    indicator.classList.add('show', `level-${comboLevel}`);

    const config = {
        1: { icon: '⚡', title: '小暴击', color: '#00ff00' },
        2: { icon: '🔥', title: '大暴击', color: '#00ffff' },
        3: { icon: '👑', title: '赌神附体', color: '#ff00ff' }
    };

    const cfg = config[comboLevel];
    iconEl.textContent = cfg.icon;
    iconEl.style.color = cfg.color;
    countEl.textContent = consecutiveDraws;
    countEl.style.color = cfg.color;
    titleEl.textContent = cfg.title;
    titleEl.style.color = cfg.color;
    bonusEl.innerHTML = `奖励 ×${comboMultiplier}<span>稀有率 +${comboRareBonus}%</span>`;
}

function showComboEffect() {
    const config = {
        1: { text: '小暴击！', color: '#00ff00', voice: '有点意思！' },
        2: { text: '大暴击！', color: '#00ffff', voice: '这才像话！' },
        3: { text: '赌神附体！', color: '#ff00ff', voice: '我就是赌神！' }
    };

    const cfg = config[comboLevel];

    const effectEl = document.createElement('div');
    effectEl.className = 'combo-text-effect';
    effectEl.textContent = cfg.text;
    effectEl.style.color = cfg.color;
    effectEl.style.left = '50%';
    effectEl.style.top = '30%';
    effectEl.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(effectEl);

    setTimeout(() => {
        effectEl.remove();
    }, 2000);

    if (soundEnabled && comboLevel >= 2) {
        playComboVoice(cfg.voice);
    }
}

function playComboVoice(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
    }
}

// ==================== 成就 UI ====================
function openAchievements() {
    const grid = document.getElementById('achievementGrid');
    grid.innerHTML = '';

    let unlockedCount = 0;

    Object.values(achievements).forEach(ach => {
        if (ach.unlocked) unlockedCount++;

        const card = document.createElement('div');
        card.className = `achievement-card ${ach.unlocked ? 'unlocked' : ''}`;

        let progressHTML = '';
        if (ach.progress !== undefined) {
            const percent = Math.min(100, Math.floor((ach.progress / ach.target) * 100));
            progressHTML = `
                <div class="achievement-progress-bar">
                    <div class="achievement-progress-fill" style="width: ${percent}%"></div>
                </div>
                <div style="color: #999; font-size: 10px; margin-top: 5px;">进度：${ach.progress}/${ach.target}</div>
            `;
        }

        card.innerHTML = `
            <span class="achievement-badge">${ach.badge}</span>
            <span class="achievement-name">${ach.name}</span>
            <span class="achievement-desc">${ach.desc}</span>
            ${progressHTML}
            <span class="achievement-quote">"${ach.quote}"</span>
        `;

        grid.appendChild(card);
    });

    document.getElementById('achievedCount').textContent = unlockedCount;
    document.getElementById('totalCount').textContent = Object.keys(achievements).length;
    const progressPercent = Math.floor((unlockedCount / Object.keys(achievements).length) * 100);
    document.getElementById('achievementProgress').textContent = progressPercent + '%';

    document.getElementById('achievementModal').classList.add('active');
}

function closeAchievements() {
    document.getElementById('achievementModal').classList.remove('active');
}
