// ==================== 游戏功能模块 ====================
// 此文件包含所有游戏核心功能：命运牌局、老虎机、商店、皮肤、仓库、成就、连击
// 依赖：data.js, state.js, ui.js, engine.js

// ==================== 命运牌局系统 ====================
let fateTableActive = false;
let fateCards = [];
let fateTimerInterval = null;
let fateNextFree = false;
let fateNextDoubleCost = false;
let fateWorstStreak = 0;
let slotSpinning = false;
let slotReels = [null, null, null];
let slotRunningIntervals = [null, null, null];

function generateFateTable() {
    const cards = [];
    const levels = ['major'];
    const pool = ['good', 'good', 'slight', 'slight', 'reversal', 'drama'];
    for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        levels.push(pool.splice(idx, 1)[0]);
    }

    for (let i = levels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [levels[i], levels[j]] = [levels[j], levels[i]];
    }

    for (let i = 0; i < 5; i++) {
        const level = levels[i];
        const levelDef = FATE_LEVELS[level];
        let baseReward = 0;
        if (levelDef.rewardRange) {
            baseReward = levelDef.rewardRange[0] + Math.floor(Math.random() * (levelDef.rewardRange[1] - levelDef.rewardRange[0] + 1));
        } else {
            const dramaRoll = Math.random();
            if (dramaRoll < 0.3) baseReward = -(5 + Math.floor(Math.random() * 16));
            else if (dramaRoll < 0.7) baseReward = 3 + Math.floor(Math.random() * 13);
            else baseReward = 25 + Math.floor(Math.random() * 26);
        }

        const modifier = rollModifier();

        cards.push({
            position: i,
            fateLevel: level,
            baseReward: baseReward,
            modifier: modifier.id === 'none' ? null : modifier,
            event: null,
            finalReward: 0,
            revealed: false,
            chosen: false
        });
    }

    if (fateNextFree) fateNextFree = false;
    return cards;
}

function rollModifier() {
    const totalWeight = FATE_MODIFIERS.reduce((s, m) => s + m.weight, 0);
    let r = Math.random() * totalWeight;
    for (const mod of FATE_MODIFIERS) {
        r -= mod.weight;
        if (r <= 0) return mod;
    }
    return FATE_MODIFIERS[FATE_MODIFIERS.length - 1];
}

function calculateFinalReward(card, allCards) {
    let reward = card.baseReward;
    if (!card.modifier) return reward;

    switch (card.modifier.id) {
        case 'double':
            reward *= 2;
            break;
        case 'triple':
            reward *= 3;
            break;
        case 'flip':
            reward = -reward;
            break;
        case 'bankrupt':
            reward = 0;
            break;
        case 'absorb':
            const otherTotal = allCards
                .filter(c => c.position !== card.position)
                .reduce((s, c) => s + c.baseReward, 0);
            reward += Math.round(otherTotal * 0.1);
            break;
    }
    return reward;
}

function renderFateTable() {
    const slots = document.getElementById('fateSlots');
    slots.innerHTML = '';

    fateCards.forEach((card, i) => {
        const el = document.createElement('div');
        el.className = `fate-card ${FATE_LEVELS[card.fateLevel].class}`;
        el.dataset.index = i;
        el.onclick = () => handleFateCardClick(i);
        el.innerHTML = `
            <div class="fate-card-inner">
                <div class="fate-card-front"></div>
                <div class="fate-card-back">
                    <div class="fate-card-icon">${FATE_LEVELS[card.fateLevel].icon}</div>
                    <div class="fate-card-label">${FATE_LEVELS[card.fateLevel].label}</div>
                    <div class="fate-card-reward" id="fateReward${i}">...</div>
                    <div class="fate-card-modifier" id="fateMod${i}"></div>
                </div>
            </div>
        `;
        slots.appendChild(el);
    });
}

function startFateTimer(seconds, onTimeout) {
    const fill = document.getElementById('fateTimerFill');
    const text = document.getElementById('fateTimerText');
    let remaining = seconds;
    const circumference = 2 * Math.PI * 15.9;

    text.textContent = remaining;
    fill.style.strokeDasharray = circumference;
    fill.style.strokeDashoffset = '0';

    fateTimerInterval = setInterval(() => {
        remaining--;
        text.textContent = Math.max(0, remaining);
        fill.style.strokeDashoffset = ((seconds - remaining) / seconds * circumference).toString();

        if (remaining <= 0) {
            clearInterval(fateTimerInterval);
            fateTimerInterval = null;
            onTimeout();
        }
    }, 1000);
}

function stopFateTimer() {
    if (fateTimerInterval) {
        clearInterval(fateTimerInterval);
        fateTimerInterval = null;
    }
}

function handleFateCardClick(index) {
    if (!fateTableActive) return;
    if (fateCards[index].revealed) return;

    fateTableActive = false;
    stopFateTimer();

    fateCards[index].chosen = true;
    const cardEl = document.querySelectorAll('.fate-card')[index];
    cardEl.classList.add('fate-card-chosen');

    fateCards.forEach(card => {
        card.finalReward = calculateFinalReward(card, fateCards);
    });

    setTimeout(() => {
        flipCard(index, true);
    }, 300);

    const others = fateCards
        .map((c, i) => i)
        .filter(i => i !== index);

    others.forEach((i, delay) => {
        setTimeout(() => flipCard(i, false), 1000 + delay * 400);
    });

    const totalDelay = 1000 + others.length * 400 + 500;
    setTimeout(() => settleFateResult(index), totalDelay);
}

function flipCard(index, isChosen) {
    const card = fateCards[index];
    card.revealed = true;

    const cardEl = document.querySelectorAll('.fate-card')[index];
    cardEl.classList.add('flipped');

    if (!isChosen) {
        cardEl.classList.add('fate-card-revealed');
    }

    const rewardEl = document.getElementById(`fateReward${index}`);
    const modEl = document.getElementById(`fateMod${index}`);

    const rewardText = card.finalReward >= 0
        ? `+${card.finalReward}`
        : `${card.finalReward}`;
    rewardEl.textContent = rewardText;
    rewardEl.style.color = card.finalReward >= 0 ? '#00ff00' : '#ff4444';

    if (card.modifier) {
        modEl.textContent = `[${card.modifier.label}]`;
        modEl.className = `fate-card-modifier ${card.modifier.cssClass}`;
    }
}

function settleFateResult(chosenIndex) {
    const chosen = fateCards[chosenIndex];
    let finalReward = chosen.finalReward;

    if (chosen.modifier && chosen.modifier.id === 'bankrupt') {
        finalReward = 0;
    }

    finalReward = Math.floor(finalReward * comboMultiplier);

    checkFateEvent(chosen, finalReward);

    chips += finalReward;
    totalChipsEarned += Math.max(0, finalReward);
    updateChipDisplay(true, true, finalReward);

    if (comboMultiplier > 1) {
        showTooltip(`连击 ×${comboMultiplier}！奖励 ${finalReward} 筹码`, 'success', 3000);
    }

    applyFateModifierEffect(chosen);

    totalDraws++;
    if (chosen.fateLevel === 'major') {
        unlockLegendHunter();
    }
    updateConsecutiveHighLuck(chosen.fateLevel === 'major' ? '传说' :
                               chosen.fateLevel === 'good' ? '极高' :
                               chosen.fateLevel === 'slight' ? '高' : '低');
    checkAchievements();

    addToHistory({
        icon: FATE_LEVELS[chosen.fateLevel].icon,
        title: chosen.fateLevel === 'drama' ? '命运轮转' :
               chosen.fateLevel === 'major' ? '大吉' :
               chosen.fateLevel === 'good' ? '中吉' :
               chosen.fateLevel === 'slight' ? '小吉' : '变卦',
        desc: chosen.modifier ? `修饰: ${chosen.modifier.label}` : '',
        luck: FATE_LEVELS[chosen.fateLevel].label,
        luckClass: chosen.fateLevel === 'major' ? 'luck-legend' :
                   chosen.fateLevel === 'good' ? 'luck-high' :
                   chosen.fateLevel === 'reversal' ? 'luck-low' : 'luck-medium',
        reward: finalReward
    });

    saveData();

    const worstReward = Math.min(...fateCards.map(c => c.finalReward));
    if (chosen.finalReward === worstReward) {
        fateWorstStreak++;
        if (fateWorstStreak >= 3) {
            fateNextFree = true;
            showFateEventToast(FATE_EVENTS.god_favor);
            fateWorstStreak = 0;
        }
    } else {
        fateWorstStreak = 0;
    }

    setTimeout(() => {
        document.getElementById('fateTable').style.display = 'none';
        document.getElementById('cardIdle').style.display = 'flex';
        isShuffling = false;
        document.getElementById('drawBtn').disabled = false;
    }, 2000);
}

function checkFateEvent(card, reward) {
    if (card.fateLevel === 'major' && card.modifier && card.modifier.id === 'double') {
        const bonus = 30;
        chips += bonus;
        totalChipsEarned += bonus;
        updateChipDisplay(true, true, bonus);
        card.event = 'pierce_appear';
        setTimeout(() => showFateEventToast(FATE_EVENTS.pierce_appear), 500);
    }

    if (card.fateLevel === 'reversal' && card.modifier && card.modifier.id === 'bankrupt') {
        const loss = Math.floor(chips * 0.5);
        chips = Math.max(0, chips - loss);
        updateChipDisplay(true, true, -loss);
        card.event = 'black_swan';
        setTimeout(() => showFateEventToast(FATE_EVENTS.black_swan), 500);
    }

    if (card.fateLevel === 'drama') {
        card.event = 'fate_wheel';
        setTimeout(() => showFateEventToast(FATE_EVENTS.fate_wheel), 500);
    }
}

function applyFateModifierEffect(card) {
    if (!card.modifier) return;

    switch (card.modifier.id) {
        case 'immune':
            consecutiveDraws = 0;
            lastDrawTime = 0;
            break;
        case 'chain':
            if (Math.random() < 0.5) {
                const chainReward = 5 + Math.floor(Math.random() * 11);
                chips += chainReward;
                totalChipsEarned += chainReward;
                updateChipDisplay(true, true, chainReward);
                showTooltip(`连锁触发！额外 +${chainReward} 筹码`, 'success', 2500);
            }
            break;
        case 'lock':
            fateNextFree = true;
            showTooltip('锁定！下次抽卡免费', 'success', 2500);
            break;
        case 'curse':
            fateNextDoubleCost = true;
            showTooltip('诅咒...下次抽卡花费翻倍', 'error', 2500);
            break;
    }
}

function showFateEventToast(event) {
    const existing = document.querySelector('.fate-event-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'fate-event-toast';
    toast.innerHTML = `
        <div class="event-icon">${event.icon}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-desc">${event.desc}</div>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

function fateAutoPick() {
    if (!fateTableActive) return;
    const available = fateCards.filter(c => !c.revealed);
    if (available.length > 0) {
        handleFateCardClick(available[Math.floor(Math.random() * available.length)].position);
    }
}

// ==================== 连抽暴击系统 ====================
function updateComboSystem() {
    const now = Date.now();

    if (lastDrawTime > 0 && (now - lastDrawTime) > COMBO_TIMEOUT) {
        resetCombo();
        return;
    }

    if (consecutiveDraws >= 10) {
        comboLevel = 3;
        comboMultiplier = 1.6;
        comboRareBonus = 30;
    } else if (consecutiveDraws >= 5) {
        comboLevel = 2;
        comboMultiplier = 2;
        comboRareBonus = 50;
    } else if (consecutiveDraws >= 3) {
        comboLevel = 1;
        comboMultiplier = 1.3;
        comboRareBonus = 15;
    } else {
        comboLevel = 0;
        comboMultiplier = 1;
        comboRareBonus = 0;
    }

    updateComboUI();
}

function resetCombo() {
    consecutiveDraws = 0;
    comboLevel = 0;
    comboMultiplier = 1;
    comboRareBonus = 0;
    lastDrawTime = 0;
    updateComboUI();
}

function addCombo() {
    const now = Date.now();

    if (lastDrawTime > 0 && (now - lastDrawTime) > COMBO_TIMEOUT) {
        resetCombo();
    }

    consecutiveDraws++;
    lastDrawTime = now;
    updateComboSystem();

    if (comboLevel > 0) {
        showComboEffect();
    }
}

// ==================== 老虎机函数 ====================
function openSlotMachine() {
    document.getElementById('slotMachineModal').classList.add('active');
    document.getElementById('slotChipsDisplay').textContent = chips;
    resetSlotReels();
}

function closeSlotMachine() {
    document.getElementById('slotMachineModal').classList.remove('active');
}

function resetSlotReels() {
    for (let i = 0; i < 3; i++) {
        const inner = document.getElementById('slotReelInner' + i);
        if (inner) {
            inner.style.transition = 'none';
            inner.style.transform = 'translateY(0)';
        }
        const reel = document.getElementById('slotReel' + i);
        if (reel) reel.classList.remove('winning');
        document.getElementById('slotResult').textContent = '';
        document.getElementById('slotResult').className = 'slot-result';
    }
    slotReels = [null, null, null];
}

function spinSlotMachine() {
    if (slotSpinning) return;
    if (chips < SLOT_COST) {
        showTooltip('筹码不足！每次旋转需要 ' + SLOT_COST + ' 筹码', 'error', 3000);
        return;
    }

    slotSpinning = true;
    chips -= SLOT_COST;
    updateChipDisplay(true, true, -SLOT_COST);
    document.getElementById('slotChipsDisplay').textContent = chips;
    document.getElementById('slotSpinBtn').disabled = true;
    document.getElementById('slotSpinBtn').textContent = '🎰 旋转中...';
    document.getElementById('slotResult').textContent = '';
    document.getElementById('slotResult').className = 'slot-result';

    for (let i = 0; i < 3; i++) {
        startSlotReel(i, 1500 + i * 1500);
    }
}

function startSlotReel(reelIndex, stopDelay) {
    const inner = document.getElementById('slotReelInner' + reelIndex);
    const reel = document.getElementById('slotReel' + reelIndex);
    if (!inner) return;

    inner.innerHTML = '';
    const symbolHeight = 120;
    const symbolCount = 30;
    for (let i = 0; i < symbolCount; i++) {
        const sym = document.createElement('div');
        sym.className = 'slot-symbol';
        sym.textContent = SLOT_SYMBOLS_LIST[Math.floor(Math.random() * SLOT_SYMBOLS_LIST.length)];
        inner.appendChild(sym);
    }

    const finalSymbol = weightedRandomSlot(SLOT_SYMBOLS);
    slotReels[reelIndex] = finalSymbol;

    inner.style.transition = 'none';
    inner.style.transform = 'translateY(0)';
    inner.offsetHeight;

    const targetY = -(symbolCount - 3) * symbolHeight;
    setTimeout(() => {
        inner.style.transition = 'transform ' + (stopDelay / 1000 * 0.8) + 's cubic-bezier(0.25, 0.1, 0.25, 1)';
        inner.style.transform = 'translateY(' + targetY + 'px)';
        setTimeout(() => {
            const symbols = inner.querySelectorAll('.slot-symbol');
            if (symbols[symbolCount - 2]) symbols[symbolCount - 2].textContent = finalSymbol;
        }, stopDelay * 0.6);
    }, 50);

    setTimeout(() => {
        const symbols = inner.querySelectorAll('.slot-symbol');
        if (symbols[symbolCount - 2]) symbols[symbolCount - 2].textContent = finalSymbol;
        if (reel) reel.classList.remove('spinning');
        checkAllReelsStopped();
    }, stopDelay);
}

function weightedRandomSlot(items) {
    const totalWeight = items.reduce((s, item) => s + item.weight, 0);
    let r = Math.random() * totalWeight;
    for (const item of items) {
        r -= item.weight;
        if (r <= 0) return item.emoji;
    }
    return items[items.length - 1].emoji;
}

function checkAllReelsStopped() {
    if (slotReels[0] === null || slotReels[1] === null || slotReels[2] === null) return;
    slotSpinning = false;
    document.getElementById('slotSpinBtn').disabled = false;
    document.getElementById('slotSpinBtn').textContent = '🎰 拉动拉杆 ' + SLOT_COST + '筹码';
    calculateSlotResult();
}

function calculateSlotResult() {
    const [a, b, c] = slotReels;
    const key = a + b + c;
    const resultEl = document.getElementById('slotResult');

    if (SLOT_PAYOUTS[key]) {
        const payout = SLOT_PAYOUTS[key];
        chips += payout.reward;
        updateChipDisplay(true, true, payout.reward);
        resultEl.textContent = '🎉 ' + payout.label + ' 获得 ' + payout.reward + ' 筹码！';
        resultEl.className = 'slot-result win';
        showSlotWinEffect();
        for (let i = 0; i < 3; i++) {
            const reel = document.getElementById('slotReel' + i);
            if (reel) reel.classList.add('winning');
        }
    } else if (a === b || b === c || a === c) {
        chips += 5;
        updateChipDisplay(true, true, 5);
        resultEl.textContent = '😅 任意两个相同！获得 5 筹码';
        resultEl.className = 'slot-result win';
    } else {
        resultEl.textContent = '💸 谢谢参与，下次好运！';
        resultEl.className = 'slot-result lose';
    }

    saveData();
    document.getElementById('slotChipsDisplay').textContent = chips;
    totalDraws++;
    checkAchievements();
}

function showSlotWinEffect() {
    const flash = document.createElement('div');
    flash.className = 'slot-win-flash';
    document.body.appendChild(flash);
    setTimeout(() => { flash.remove(); }, 1200);
}

function initSlotReels() {
    for (let i = 0; i < 3; i++) {
        const inner = document.getElementById('slotReelInner' + i);
        if (!inner) continue;
        inner.innerHTML = '';
        for (let j = 0; j < 3; j++) {
            const sym = document.createElement('div');
            sym.className = 'slot-symbol';
            sym.textContent = SLOT_SYMBOLS_LIST[Math.floor(Math.random() * SLOT_SYMBOLS_LIST.length)];
            inner.appendChild(sym);
        }
        inner.style.transform = 'translateY(0)';
    }
}

// ==================== 抽卡系统 ====================
function getRandomCard() {
    const luckyBonus = luckyCharmActive ? 15 : 0;
    const totalRareBonus = comboRareBonus + luckyBonus;

    const adjustedCards = luckCards.map(card => {
        let rarityBonus = 1;
        if (card.luck === '传说') {
            rarityBonus = 1 + (totalRareBonus / 100) * 2;
        } else if (card.luck === '极高' || card.luck === '高') {
            rarityBonus = 1 + (totalRareBonus / 100) * 1.5;
        } else if (card.luck === '中上' || card.luck === '中等') {
            rarityBonus = 1 + (totalRareBonus / 100);
        }

        return {
            ...card,
            probability: card.probability * rarityBonus
        };
    });

    const total = adjustedCards.reduce((sum, card) => sum + card.probability, 0);
    let random = Math.random() * total;

    for (const card of adjustedCards) {
        if (random < card.probability) {
            return card;
        }
        random -= card.probability;
    }
    return luckCards[3];
}

function drawCard() {
    let drawCost = 7;

    if (fateNextDoubleCost) {
        drawCost *= 2;
        fateNextDoubleCost = false;
    }

    if (fateNextFree) {
        drawCost = 0;
        fateNextFree = false;
    }

    if (chips < drawCost) {
        showTooltip('筹码不足！请等待发薪日补充筹码。', 'error', 3500);
        return;
    }

    if (isShuffling) return;
    isShuffling = true;

    if (drawCost > 0) {
        chips -= drawCost;
        updateChipDisplay(true, true, -drawCost);
    }

    addCombo();

    if (getAudioContext().state === 'suspended') {
        getAudioContext().resume();
    }

    playSound('click');
    document.getElementById('drawBtn').disabled = true;

    document.getElementById('cardIdle').style.display = 'none';
    document.getElementById('fateTable').style.display = 'flex';

    fateCards = generateFateTable();
    renderFateTable();

    if (luckyCharmActive) {
        luckyCharmActive = false;
        let worstIdx = 0;
        for (let i = 1; i < fateCards.length; i++) {
            if (fateCards[i].baseReward < fateCards[worstIdx].baseReward) {
                worstIdx = i;
            }
        }
        setTimeout(() => {
            const cardEl = document.querySelectorAll('.fate-card')[worstIdx];
            cardEl.classList.add('flipped', 'fate-card-revealed', 'disabled');
            fateCards[worstIdx].revealed = true;
            fateCards[worstIdx].finalReward = calculateFinalReward(fateCards[worstIdx], fateCards);
            const rewardEl = document.getElementById(`fateReward${worstIdx}`);
            rewardEl.textContent = fateCards[worstIdx].finalReward >= 0
                ? `+${fateCards[worstIdx].finalReward}`
                : `${fateCards[worstIdx].finalReward}`;
            rewardEl.style.color = fateCards[worstIdx].finalReward >= 0 ? '#00ff00' : '#ff4444';
            showTooltip('幸运符排除了最差的牌！', 'success', 2000);
        }, 600);
    }

    fateTableActive = true;
    startFateTimer(5, fateAutoPick);
}

// ==================== 商店系统 ====================
function openShop() {
    renderShopItems();
    document.getElementById('shopModal').classList.add('active');
}

function closeShop() {
    document.getElementById('shopModal').classList.remove('active');
}

function filterShopCategory(category) {
    currentShopCategory = category;

    document.querySelectorAll('.shop-category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const titleMap = {
        'all': '📦 全部商品',
        'skin': '🎨 皮肤',
        'sound': '🎵 音效',
        'consumable': '⚡ 道具'
    };
    document.getElementById('shopCategoryTitle').textContent = titleMap[category] || '📦 全部商品';

    renderShopItems();
}

function renderShopItems() {
    const shopItemsContainer = document.getElementById('shopItems');

    let filteredItems = shopItems;
    if (currentShopCategory !== 'all') {
        filteredItems = shopItems.filter(item => item.type === currentShopCategory);
    }

    if (filteredItems.length === 0) {
        shopItemsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">
                <div style="font-size: 3em; margin-bottom: 10px;">📭</div>
                <div>该分类暂无商品</div>
            </div>
        `;
        return;
    }

    shopItemsContainer.innerHTML = `
        ${filteredItems.map(item => {
            const isConsumable = item.type === 'consumable';
            const isOwned = item.owned && !isConsumable;

            return `
            <div class="shop-grid-item ${isOwned ? 'owned' : ''}"
                 onclick="${!isOwned ? `event.stopPropagation(); ${isConsumable ? 'openQuantitySelector(\'' + item.id + '\')' : 'buyItem(\'' + item.id + '\')'}` : ''}">
                <div class="shop-grid-icon">${getShopIcon(item)}</div>
                <div class="shop-grid-name">${getShopName(item)}</div>
                <div class="shop-grid-price">${isOwned ? '✓ 已拥有' : `💰 ${item.price}`}</div>

                <div class="shop-grid-tooltip" style="min-height: 140px; display: flex; flex-direction: column;">
                    <div class="shop-grid-desc" style="flex-shrink: 0; margin-bottom: 8px; font-size: 0.82em; line-height: 1.4; color: #aaa;">${item.desc}</div>
                    ${isConsumable ? `
                        <div style="flex-shrink: 0; margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255,215,0,0.2);">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <button class="quantity-btn" onclick="event.stopPropagation(); adjustQuantity('${item.id}', -1)" style="background: rgba(255,215,0,0.2); border: 1px solid rgba(255,215,0,0.5); color: #ffd700; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 0.9em; font-weight: bold; display: flex; align-items: center; justify-content: center; line-height: 1;">-</button>
                                    <span id="qty-${item.id}" style="color: #fff; font-weight: bold; font-size: 0.95em; min-width: 22px; text-align: center;">1</span>
                                    <button class="quantity-btn" onclick="event.stopPropagation(); adjustQuantity('${item.id}', 1)" style="background: rgba(255,215,0,0.2); border: 1px solid rgba(255,215,0,0.5); color: #ffd700; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 0.9em; font-weight: bold; display: flex; align-items: center; justify-content: center; line-height: 1;">+</button>
                                </div>
                                <span style="color: #ffd700; font-size: 0.85em; font-weight: bold;">💰 <span id="total-${item.id}">${item.price}</span></span>
                            </div>
                            <button class="shop-grid-btn" onclick="event.stopPropagation(); buyItem('${item.id}', parseInt(document.getElementById('qty-${item.id}').textContent))" style="width: 100%; padding: 6px; font-size: 0.85em;">购买</button>
                        </div>
                    ` : isOwned ? `
                        <div style="flex-shrink: 0; margin-top: auto; padding-top: 8px;">
                            <button class="shop-grid-btn owned" disabled style="width: 100%; padding: 6px; font-size: 0.85em;">已拥有</button>
                        </div>
                    ` : `
                        <div style="flex-shrink: 0; margin-top: auto; padding-top: 8px;">
                            <button class="shop-grid-btn" onclick="event.stopPropagation(); buyItem('${item.id}')" style="width: 100%; padding: 6px; font-size: 0.85em;">购买</button>
                        </div>
                    `}
                </div>
            </div>
            `;
        }).join('')}
    `;
}

function getShopIcon(item) {
    if (item.type === 'skin') return '🎨';
    else if (item.type === 'sound') return '🎵';
    else if (item.id === 'accelerate') return '⚡';
    else if (item.id === 'xray') return '🔮';
    return '🎁';
}

function getShopName(item) {
    let name = item.name;
    if (name.startsWith('🎨 ')) name = name.substring(3);
    else if (name.startsWith('🎵 ')) name = name.substring(3);
    else if (name.startsWith('⚡ ')) name = name.substring(3);
    else if (name.startsWith('🔮 ')) name = name.substring(3);
    else {
        name = name.substring(1).trim();
    }

    if (name.includes('・')) name = name.split('・')[0].trim();
    if (name.includes('音效包')) name = name.replace('音效包', '').trim();
    if (name.includes('卡 x3')) name = '加速卡';
    if (name.includes('x3')) name = name.replace('x3', '').trim();

    return name || item.name;
}

// 道具购买数量管理
const itemQuantities = {};

function openQuantitySelector(itemId) {
    if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 1;
    }
    const qtyEl = document.getElementById(`qty-${itemId}`);
    if (qtyEl) {
        qtyEl.textContent = itemQuantities[itemId];
        updateTotalPrice(itemId);
    }
}

function adjustQuantity(itemId, delta) {
    if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 1;
    }

    itemQuantities[itemId] += delta;

    if (itemQuantities[itemId] < 1) itemQuantities[itemId] = 1;
    if (itemQuantities[itemId] > 99) itemQuantities[itemId] = 99;

    const qtyEl = document.getElementById(`qty-${itemId}`);
    if (qtyEl) {
        qtyEl.textContent = itemQuantities[itemId];
        updateTotalPrice(itemId);
    }
}

function updateTotalPrice(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    const totalEl = document.getElementById(`total-${itemId}`);
    if (totalEl) {
        totalEl.textContent = item.price * itemQuantities[itemId];
    }
}

function buyItem(itemId, quantity = 1) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;

    const buyQuantity = item.type === 'consumable' ? quantity : 1;
    const totalPrice = item.price * buyQuantity;

    if (chips < totalPrice) {
        showTooltip('筹码不足！', 'error', 3000);
        return;
    }

    chips -= totalPrice;
    updateChipDisplay();

    if (item.type === 'consumable') {
        const actualCount = (item.count || 1) * buyQuantity;
        if (!inventory[item.id]) {
            inventory[item.id] = { count: 0, name: getShopName(item), desc: item.desc, icon: getShopIcon(item), item: item };
        }
        inventory[item.id].count += actualCount;
        saveData();
        showTooltip(`${getShopName(item)} 已存入仓库！去「我的物品」查看。`, 'success', 3500);
    } else if (item.type === 'sound') {
        if (item.id === 'sound1') {
            ownedSounds.jazz = true;
            showTooltip('爵士音效包已解锁！现在可以播放古典爵士背景音乐。', 'success', 4000);
        } else if (item.id === 'sound2') {
            ownedSounds.electronic = true;
            showTooltip('电子音效包已解锁！现在可以播放电子舞曲背景音乐。', 'success', 4000);
        }
        item.owned = true;
        updateBgmButton();
    } else if (item.type === 'skin' && item.skinId) {
        ownedSkins[item.skinId] = true;
        skins[item.skinId].locked = false;
        item.owned = true;
        skinsCollected++;
        showTooltip(`${getShopName(item)}已解锁！前往皮肤库装备。`, 'success', 3500);
        checkAchievements();
    } else {
        item.owned = true;
        showTooltip(`已解锁：${getShopName(item)}`, 'success', 3000);
    }

    renderShopItems();
}

function updateShopItems() {
    renderShopItems();
}

// ==================== 皮肤库系统 ====================
function openSkinLibrary() {
    renderSkinLibrary();
    document.getElementById('skinLibraryModal').classList.add('active');
}

function closeSkinLibrary() {
    document.getElementById('skinLibraryModal').classList.remove('active');
}

function showSkinTab(tab) {
    currentSkinTab = tab;

    document.querySelectorAll('.skin-tab').forEach(t => {
        t.classList.remove('active');
    });
    event.target.classList.add('active');

    renderSkinLibrary();
}

function renderSkinLibrary() {
    const skinGrid = document.getElementById('skinGrid');
    const skinIds = Object.keys(skins);

    let filteredSkins = skinIds;
    if (currentSkinTab === 'owned') {
        filteredSkins = skinIds.filter(id => !skins[id].locked);
    } else if (currentSkinTab === 'locked') {
        filteredSkins = skinIds.filter(id => skins[id].locked);
    }

    skinGrid.innerHTML = filteredSkins.map(skinId => {
        const skin = skins[skinId];
        const isActive = currentSkin === skinId;

        return `
            <div class="skin-card ${skin.locked ? 'locked' : ''} ${isActive ? 'active' : ''}"
                 onclick="${skin.locked ? '' : `selectSkinForEquip('${skinId}')`}">
                <div class="skin-preview" style="background: ${skin.preview}"></div>
                <div class="skin-name">${skin.name}</div>
                <div class="skin-status">${skin.locked ? '🔒 未解锁' : (isActive ? '✓ 已装备' : '点击装备')}</div>
            </div>
        `;
    }).join('');

    updateEquipButton();
}

function selectSkinForEquip(skinId) {
    if (skins[skinId].locked) return;

    selectedSkinForEquip = skinId;

    document.querySelectorAll('.skin-card').forEach(card => {
        card.style.borderColor = card.classList.contains('active') ?
            '#00ff00' : 'rgba(255, 215, 0, 0.3)';
    });

    const selectedCard = event.target.closest('.skin-card');
    if (selectedCard) {
        selectedCard.style.borderColor = '#ffd700';
    }

    updateEquipButton();
}

function updateEquipButton() {
    const equipBtn = document.getElementById('equipSkinBtn');
    equipBtn.disabled = selectedSkinForEquip === null;
    equipBtn.textContent = selectedSkinForEquip ? '装备皮肤' : '选择皮肤';
}

function equipSelectedSkin() {
    if (!selectedSkinForEquip) return;

    applySkin(selectedSkinForEquip);

    showTooltip(`已装备：${skins[selectedSkinForEquip].name}`, 'success', 2500);

    closeSkinLibrary();
}

function applySkin(skinId) {
    const skin = skins[skinId];
    if (!skin) return;

    currentSkin = skinId;
    const root = document.documentElement;

    root.style.setProperty('--skin-body-bg', skin.bodyBg || 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #0f0f1a 100%)');
    root.style.setProperty('--skin-container-bg', skin.containerBg || 'rgba(10, 10, 10, 0.85)');
    root.style.setProperty('--skin-border-color', skin.borderColor || 'rgba(255, 215, 0, 0.4)');
    root.style.setProperty('--skin-accent', skin.accentColor || '#ffd700');
    root.style.setProperty('--skin-card-bg', skin.cardBg || 'linear-gradient(145deg, #2a2a4a, #1a1a3a)');
    root.style.setProperty('--skin-button-gradient', skin.buttonGradient || 'linear-gradient(135deg, #ffd700, #ff8c00)');

    const rgbMatch = (skin.accentColor || '#ffd700').match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 16);
        const g = parseInt(rgbMatch[2], 16);
        const b = parseInt(rgbMatch[3], 16);
        root.style.setProperty('--skin-accent-rgb', `${r}, ${g}, ${b}`);
        root.style.setProperty('--skin-glow', `rgba(${r}, ${g}, ${b}, 0.1)`);
    }

    startEffectForSkin(skinId);
}

// ==================== 仓库系统 ====================
function useItem(itemId) {
    const inv = inventory[itemId];
    if (!inv || inv.count <= 0) {
        showTooltip('道具不足！', 'error', 2000);
        return;
    }

    const item = inv.item;
    inv.count -= 1;
    if (inv.count <= 0) {
        delete inventory[itemId];
    }

    if (itemId === 'accelerate') {
        accelerateCount += item.count || 1;
        showTooltip(`使用了 ${item.name || '加速卡'}，下次抽卡动画加速！`, 'success', 3000);
    } else if (itemId === 'xray') {
        xrayActive = true;
        showTooltip(`使用了 ${item.name || '透视眼镜'}，下次抽卡将显示概率分布！`, 'info', 4000);
        setTimeout(() => { xrayActive = false; }, 15000);
    } else if (itemId === 'lucky-charm') {
        luckyCharmActive = true;
        showTooltip(`使用了 ${item.name || '幸运符'}，下次抽卡稀有率 +15%！`, 'success', 3000);
    }

    saveData();
    renderInventoryItems();
}

function renderInventoryItems() {
    const container = document.getElementById('inventoryItems');
    if (!container) return;

    const itemIds = Object.keys(inventory);
    if (itemIds.length === 0) {
        container.innerHTML = '<div class="inventory-empty">📦 仓库空空如也，快去商店购买道具吧！</div>';
        return;
    }

    container.innerHTML = itemIds.map(itemId => {
        const inv = inventory[itemId];
        const item = inv.item;
        const isAccelerate = itemId === 'accelerate';
        const isXray = itemId === 'xray';
        const isLuckyCharm = itemId === 'lucky-charm';
        let effectDesc = item.desc;
        if (isAccelerate) effectDesc = `下次抽卡动画速度翻倍（现有 ${accelerateCount} 张加速卡）`;
        if (isXray) effectDesc = '下次抽卡显示概率分布';
        if (isLuckyCharm) effectDesc = '下次抽卡稀有率 +15%';

        return `
        <div class="inventory-item">
            <div class="inventory-item-icon">${inv.icon}</div>
            <div class="inventory-item-info">
                <div class="inventory-item-name">${inv.name}</div>
                <div class="inventory-item-count">× ${inv.count}</div>
                <div class="inventory-item-desc">${effectDesc}</div>
            </div>
            <button class="inventory-use-btn" onclick="useItem('${itemId}')">使用</button>
        </div>`;
    }).join('');

    updateInventoryBadge();
}

function updateInventoryBadge() {
    const btn = document.getElementById('inventoryBtn');
    if (!btn) return;
    const total = Object.values(inventory).reduce((sum, inv) => sum + inv.count, 0);
    let badge = document.getElementById('inventoryBadge');
    if (total > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'inventoryBadge';
            badge.style.cssText = 'position:absolute;top:-6px;right:-6px;background:#e74c3c;color:#fff;font-size:11px;font-weight:bold;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;';
            btn.style.position = 'relative';
            btn.appendChild(badge);
        }
        badge.textContent = total > 99 ? '99+' : total;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

function openInventory() {
    renderInventoryItems();
    document.getElementById('inventoryModal').classList.add('active');
}

function closeInventory() {
    document.getElementById('inventoryModal').classList.remove('active');
}

// ==================== 多元化筹码获取系统 ====================
function collectMining() {
    const now = Date.now();
    const hoursPassed = (now - miningStart) / (1000 * 60 * 60);

    if (hoursPassed <= 0) {
        showTooltip('再等一会儿，还没挖到筹码呢~', 'info', 2500);
        return;
    }

    const claimableHours = Math.min(hoursPassed, maxMiningHours);
    const reward = Math.floor(claimableHours * miningRate);

    if (reward <= 0) {
        showTooltip('再等一会儿，还没挖到筹码呢~', 'info', 2500);
        return;
    }

    chips += reward;
    updateChipDisplay(true, true, reward);
    miningStart = now;

    showTooltip(`⛏️ 挖矿成功！获得 ${reward} 筹码！`, 'success', 3000);
    saveData();

    setTimeout(updateMiningButton, 500);
}

function updateMiningButton() {
    const btn = document.getElementById('miningBtn');
    if (!btn) return;

    const now = Date.now();
    const hoursPassed = (now - miningStart) / (1000 * 60 * 60);
    const claimableHours = Math.min(hoursPassed, maxMiningHours);
    const reward = Math.floor(claimableHours * miningRate);

    if (reward > 0) {
        btn.textContent = `⛏️ 领取 ${reward} 筹码`;
        btn.disabled = false;
    } else {
        const minutesPassed = Math.floor(hoursPassed * 60);
        const minutesRemaining = 60 - minutesPassed;
        btn.textContent = `⛏️ 正在挖矿... (${minutesRemaining}分钟后)`;
        btn.disabled = true;
    }
}

// ==================== 成就系统逻辑 ====================
function checkAchievements() {
    let dataChanged = false;

    if (totalDraws > 0 && !achievements.firstDraw.unlocked) {
        achievements.firstDraw.unlocked = true;
        showTooltip('🏆 成就解锁：初出茅庐！', 'success', 3000);
        dataChanged = true;
    }

    if (achievements.smallWinner.progress !== totalChipsEarned) {
        achievements.smallWinner.progress = totalChipsEarned;
        dataChanged = true;
    }
    if (!achievements.smallWinner.unlocked && totalChipsEarned >= achievements.smallWinner.target) {
        achievements.smallWinner.unlocked = true;
        showTooltip('🏆 成就解锁：小有斩获！', 'success', 3000);
        dataChanged = true;
    }

    if (achievements.skinCollector.progress !== skinsCollected) {
        achievements.skinCollector.progress = skinsCollected;
        dataChanged = true;
    }
    if (!achievements.skinCollector.unlocked && skinsCollected >= achievements.skinCollector.target) {
        achievements.skinCollector.unlocked = true;
        showTooltip('🏆 成就解锁：皮肤收藏家！', 'success', 3000);
        dataChanged = true;
    }

    if (achievements.luckyStreak.streak !== consecutiveHighLuck) {
        achievements.luckyStreak.streak = consecutiveHighLuck;
        dataChanged = true;
    }
    if (!achievements.luckyStreak.unlocked && consecutiveHighLuck >= 3) {
        achievements.luckyStreak.unlocked = true;
        showTooltip('🏆 成就解锁：欧皇附体！', 'success', 3000);
        dataChanged = true;
    }

    if (dataChanged) {
        saveData();
    }
}

function unlockLegendHunter() {
    if (!achievements.legendHunter.unlocked) {
        achievements.legendHunter.unlocked = true;
        showTooltip('🏆 成就解锁：传说猎手！', 'success', 3000);
        saveData();
    }
}

function unlockAchievement(achievementId) {
    const achievement = achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;

    showTooltip(`🏆 成就解锁：${achievement.name}！`, 'success', 4000);

    playUnlockSound();

    saveData();
}

function updateConsecutiveHighLuck(luck) {
    if (luck === '高运' || luck === '终极王牌') {
        consecutiveHighLuck++;
    } else {
        consecutiveHighLuck = 0;
    }
}

// ==================== 每日重置 ====================
function checkDailyReset() {
    const today = new Date().toDateString();
    if (lastCheckInDate !== today) {
        dailyTasks = {
            draw15:     { done: false, reward: 25, name: '抽卡达人', desc: '抽卡 15 次', count: 0, target: 15 },
            legend:     { done: false, reward: 30, name: '传说猎手', desc: '抽到传说牌', charmReward: 1 },
            combo10:    { done: false, reward: 35, name: '连击大师', desc: '达成 10 连击' },
            chipGuard:  { done: false, reward: 20, name: '筹码守卫', desc: '单日抽卡净亏损≤10' },
            luckyWheel3:{ done: false, reward: 15, name: '幸运轮手', desc: '转盘 3 次', count: 0, target: 3 }
        };
        lastCheckInDate = today;
        saveData();
    }
}
