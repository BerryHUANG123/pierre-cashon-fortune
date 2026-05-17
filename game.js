        // ==================== 游戏数据 ====================
        const luckCards = [
            {
                icon: '🎭',
                title: '终极王牌・皮尔卡松',
                desc: '拥有大佬级排面，出场即可气场碾压，掌控牌局节奏。',
                luck: '传说',
                luckClass: 'luck-legend',
                probability: 1.2,
                reward: 35
            },
            {
                icon: '🍀',
                title: '天选之子',
                desc: '今日运势如虹，万事顺遂。任何挑战都将成为你晋升的阶梯。',
                luck: '极高',
                luckClass: 'luck-high',
                probability: 4,
                reward: 15
            },
            {
                icon: '🚀',
                title: '势如破竹',
                desc: '机遇降临，把握时机。你的决策将带来意想不到的收获。',
                luck: '高',
                luckClass: 'luck-high',
                probability: 12,
                reward: 12
            },
            {
                icon: '⚡',
                title: '稳中求胜',
                desc: '保持冷静，步步为营。今天的你比任何时候都更加敏锐。',
                luck: '中上',
                luckClass: 'luck-medium',
                probability: 25,
                reward: 6
            },
            {
                icon: '🎯',
                title: '精准出击',
                desc: '目标明确，行动果断。小风险可能带来大回报。',
                luck: '中等',
                luckClass: 'luck-medium',
                probability: 32,
                reward: 5
            },
            {
                icon: '🛡️',
                title: '防守反击',
                desc: '谨慎行事，避免冲动。等待更好的时机再出手。',
                luck: '中下',
                luckClass: 'luck-medium',
                probability: 16,
                reward: 3
            },
            {
                icon: '⚠️',
                title: '小心陷阱',
                desc: '今日需谨慎，有人可能在暗处设局。保持警惕。',
                luck: '低',
                luckClass: 'luck-low',
                probability: 7.5,
                reward: 1
            },
            {
                icon: '💀',
                title: '背运缠身',
                desc: '今天不是好日子，建议低调行事，避免重大决策。',
                luck: '极低',
                luckClass: 'luck-low',
                probability: 2.3,
                reward: 0
            }
        ];

        // ==================== 命运牌局系统 ====================

        let fateTableActive = false;    // 牌桌是否激活
        let fateCards = [];             // 当前5张牌数据
        let fateTimerInterval = null;   // 倒计时定时器
        let fateNextFree = false;       // 下次免费（锁定修饰）
        let fateNextDoubleCost = false; // 下次费用翻倍（诅咒修饰）
        let fateWorstStreak = 0;        // 连续选最差牌计数

        // 命运层级定义
        const FATE_LEVELS = {
            major:    { icon: '🌟', label: '大吉', rewardRange: [20, 50], class: 'fate-level-major' },
            good:     { icon: '✨', label: '中吉', rewardRange: [8, 15],  class: 'fate-level-good' },
            slight:   { icon: '🌙', label: '小吉', rewardRange: [3, 7],   class: 'fate-level-slight' },
            reversal: { icon: '⚡', label: '变卦', rewardRange: [-15, -5],class: 'fate-level-reversal' },
            drama:    { icon: '🎭', label: '戏剧', rewardRange: null,     class: 'fate-level-drama' }
        };

        // ==================== 老虎机常量 ====================
        const SLOT_SYMBOLS = [
            { emoji: '🍒', weight: 30 },
            { emoji: '🍊', weight: 25 },
            { emoji: '🔔', weight: 20 },
            { emoji: '⭐', weight: 15 },
            { emoji: '7️⃣', weight: 8 },
            { emoji: '💎', weight: 2 },
        ];

        const SLOT_PAYOUTS = {
            '💎💎💎': { reward: 1000, label: 'JACKPOT!' },
            '7️⃣7️⃣7️⃣': { reward: 200, label: '三个7!' },
            '⭐⭐⭐': { reward: 100, label: '三个星星!' },
            '🔔🔔🔔': { reward: 50, label: '三个铃铛!' },
            '🍊🍊🍊': { reward: 30, label: '三个桔子!' },
            '🍒🍒🍒': { reward: 15, label: '三个樱桃!' },
        };

        const SLOT_COST = 10;
        const SLOT_SYMBOLS_LIST = SLOT_SYMBOLS.map(s => s.emoji);


        // 修饰定义
        const FATE_MODIFIERS = [
            { id: 'double',    label: '双倍', weight: 8, cssClass: 'fate-mod-double' },
            { id: 'triple',    label: '三倍', weight: 3, cssClass: 'fate-mod-triple' },
            { id: 'flip',      label: '翻转', weight: 5, cssClass: 'fate-mod-flip' },
            { id: 'immune',    label: '免疫', weight: 4, cssClass: 'fate-mod-immune' },
            { id: 'chain',     label: '连锁', weight: 4, cssClass: 'fate-mod-chain' },
            { id: 'bankrupt',  label: '破产', weight: 2, cssClass: 'fate-mod-bankrupt' },
            { id: 'absorb',    label: '吸收', weight: 3, cssClass: 'fate-mod-absorb' },
            { id: 'lock',      label: '锁定', weight: 3, cssClass: 'fate-mod-lock' },
            { id: 'curse',     label: '诅咒', weight: 3, cssClass: 'fate-mod-curse' },
            { id: 'none',      label: '',     weight: 65, cssClass: '' }
        ];

        // 特殊事件定义
        const FATE_EVENTS = {
            pierce_appear: { icon: '🃏', title: '皮尔卡松降临', desc: '大佬级排面！额外 +30 筹码' },
            black_swan:    { icon: '💀', title: '黑天鹅事件', desc: '噩梦！失去当前 50% 筹码！' },
            god_favor:     { icon: '🎰', title: '赌神眷顾', desc: '连续3次最差...下次必定大吉×3！' },
            fate_wheel:    { icon: '🔄', title: '命运轮转', desc: '命运再次旋转...' }
        };

        /**
         * 生成5张命运牌
         */
        function generateFateTable() {
            const cards = [];
            // 保证1张大吉
            const levels = ['major'];

            // 分配剩余4张
            const pool = ['good', 'good', 'slight', 'slight', 'reversal', 'drama'];
            for (let i = 0; i < 4; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                levels.push(pool.splice(idx, 1)[0]);
            }

            // 打乱顺序
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
                    // 戏剧牌：随机奖励范围
                    const dramaRoll = Math.random();
                    if (dramaRoll < 0.3) baseReward = -(5 + Math.floor(Math.random() * 16));       // 亏损
                    else if (dramaRoll < 0.7) baseReward = 3 + Math.floor(Math.random() * 13);     // 小赚
                    else baseReward = 25 + Math.floor(Math.random() * 26);                         // 大赚
                }

                // 分配修饰
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

            // 如果下次免费（锁定效果），确保此次不应用诅咒
            if (fateNextFree) fateNextFree = false;

            return cards;
        }

        /**
         * 随机分配修饰词
         */
        function rollModifier() {
            const totalWeight = FATE_MODIFIERS.reduce((s, m) => s + m.weight, 0);
            let r = Math.random() * totalWeight;
            for (const mod of FATE_MODIFIERS) {
                r -= mod.weight;
                if (r <= 0) return mod;
            }
            return FATE_MODIFIERS[FATE_MODIFIERS.length - 1];
        }

        /**
         * 计算牌的最终奖励
         */
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
                    // 获得其他4张牌奖励总和的10%
                    const otherTotal = allCards
                        .filter(c => c.position !== card.position)
                        .reduce((s, c) => s + c.baseReward, 0);
                    reward += Math.round(otherTotal * 0.1);
                    break;
                // immune, chain, lock, curse 在结算时特殊处理
            }

            return reward;
        }

        /**
         * 渲染牌桌UI
         */
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

        /**
         * 启动倒计时
         */
        function startFateTimer(seconds, onTimeout) {
            const fill = document.getElementById('fateTimerFill');
            const text = document.getElementById('fateTimerText');
            let remaining = seconds;
            const circumference = 2 * Math.PI * 15.9; // ~100

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
        let slotSpinning = false;
        let slotReels = [null, null, null];
        let slotRunningIntervals = [null, null, null];


        function stopFateTimer() {
            if (fateTimerInterval) {
                clearInterval(fateTimerInterval);
                fateTimerInterval = null;
            }
        }

        /**
         * 处理点击牌
         */
        function handleFateCardClick(index) {
            if (!fateTableActive) return;
            if (fateCards[index].revealed) return;

            fateTableActive = false;
            stopFateTimer();

            // 标记选中
            fateCards[index].chosen = true;
            const cardEl = document.querySelectorAll('.fate-card')[index];
            cardEl.classList.add('fate-card-chosen');

            // 计算所有牌的最终奖励
            fateCards.forEach(card => {
                card.finalReward = calculateFinalReward(card, fateCards);
            });

            // 翻开选中的牌
            setTimeout(() => {
                flipCard(index, true);
            }, 300);

            // 1秒后依次翻开其余牌
            const others = fateCards
                .map((c, i) => i)
                .filter(i => i !== index);

            others.forEach((i, delay) => {
                setTimeout(() => flipCard(i, false), 1000 + delay * 400);
            });

            // 全部翻完后结算
            const totalDelay = 1000 + others.length * 400 + 500;
            setTimeout(() => settleFateResult(index), totalDelay);
        }

        /**
         * 翻牌动画
         */
        function flipCard(index, isChosen) {
            const card = fateCards[index];
            card.revealed = true;

            const cardEl = document.querySelectorAll('.fate-card')[index];
            cardEl.classList.add('flipped');

            if (!isChosen) {
                cardEl.classList.add('fate-card-revealed');
            }

            // 更新牌面内容
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

        /**
         * 结算结果
         */
        function settleFateResult(chosenIndex) {
            const chosen = fateCards[chosenIndex];
            let finalReward = chosen.finalReward;

            // 检查破产修饰：本轮奖励归零
            if (chosen.modifier && chosen.modifier.id === 'bankrupt') {
                finalReward = 0;
            }

            // 应用连击倍数
            finalReward = Math.floor(finalReward * comboMultiplier);

            // 检查特殊事件
            checkFateEvent(chosen, finalReward);

            // 应用奖励
            chips += finalReward;
            totalChipsEarned += Math.max(0, finalReward);
            updateChipDisplay(true, true, finalReward);

            // 连击提示
            if (comboMultiplier > 1) {
                showTooltip(`连击 ×${comboMultiplier}！奖励 ${finalReward} 筹码`, 'success', 3000);
            }

            // 处理修饰效果
            applyFateModifierEffect(chosen);

            // 更新抽卡统计
            totalDraws++;
            if (chosen.fateLevel === 'major') {
                unlockLegendHunter();
            }
            updateConsecutiveHighLuck(chosen.fateLevel === 'major' ? '传说' :
                                       chosen.fateLevel === 'good' ? '极高' :
                                       chosen.fateLevel === 'slight' ? '高' : '低');
            checkAchievements();

            // 添加历史记录（转换为新格式兼容旧格式）
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

            // 检查是否选了最差的牌
            const worstReward = Math.min(...fateCards.map(c => c.finalReward));
            if (chosen.finalReward === worstReward) {
                fateWorstStreak++;
                if (fateWorstStreak >= 3) {
                    fateNextFree = true; // 赌神眷顾
                    showFateEventToast(FATE_EVENTS.god_favor);
                    fateWorstStreak = 0;
                }
            } else {
                fateWorstStreak = 0;
            }

            // 2秒后恢复待命状态
            setTimeout(() => {
                document.getElementById('fateTable').style.display = 'none';
                document.getElementById('cardIdle').style.display = 'flex';
                isShuffling = false;
                document.getElementById('drawBtn').disabled = false;
            }, 2000);
        }

        /**
         * 检查特殊事件
         */
        function checkFateEvent(card, reward) {
            // 皮尔卡松降临：大吉 + 双倍
            if (card.fateLevel === 'major' && card.modifier && card.modifier.id === 'double') {
                const bonus = 30;
                chips += bonus;
                totalChipsEarned += bonus;
                updateChipDisplay(true, true, bonus);
                card.event = 'pierce_appear';
                setTimeout(() => showFateEventToast(FATE_EVENTS.pierce_appear), 500);
            }

            // 黑天鹅：变卦 + 破产
            if (card.fateLevel === 'reversal' && card.modifier && card.modifier.id === 'bankrupt') {
                const loss = Math.floor(chips * 0.5);
                chips = Math.max(0, chips - loss);
                updateChipDisplay(true, true, -loss);
                card.event = 'black_swan';
                setTimeout(() => showFateEventToast(FATE_EVENTS.black_swan), 500);
            }

            // 命运轮转：戏剧牌
            if (card.fateLevel === 'drama') {
                card.event = 'fate_wheel';
                setTimeout(() => showFateEventToast(FATE_EVENTS.fate_wheel), 500);
            }
        }

        /**
         * 应用修饰效果
         */
        function applyFateModifierEffect(card) {
            if (!card.modifier) return;

            switch (card.modifier.id) {
                case 'immune':
                    // 下次超时不中断连击
                    consecutiveDraws = 0; // 重置让下次从0开始
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

        /**
         * 显示事件提示
         */
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

        /**
         * 超时自动翻牌
         */
        function fateAutoPick() {
            if (!fateTableActive) return;
            // 随机选一张未翻开的
            const available = fateCards.filter(c => !c.revealed);
            if (available.length > 0) {
                handleFateCardClick(available[Math.floor(Math.random() * available.length)].position);
            }
        }

        // ==================== 游戏状态变量 ====================
        let isShuffling = false;
        let history = [];
        let soundEnabled = true;
        let chips = 100;
        let lastPayday = new Date();
        let accelerateCount = 0;
        let xrayActive = false;
        let luckyCharmActive = false;  // 幸运符效果：下次抽卡稀有率 +15%
        let currentBgMusic = null;
        let bgMusicPlaying = false;
        let ownedSounds = {
            jazz: false,
            electronic: false
        };
        let activeOscillators = [];
        let currentSkin = 'default'; // default, royal-purple, cyber-neon
        let ownedSkins = {
            'royal-purple': false,
            'cyber-neon': false,
            'dark-ghost': false,
            'golden-empire': false,
            'aurora-dream': false,
            'fire-hell': false,
            'diamond-luxury': false,
            'cosmic-void': false,
            'venom-toxic': false,
            'plasma-energy': false,
            'inferno-blaze': false,
            'ocean-abyss': false,
            'forest-mystic': false,
            'desert-sands': false,
            'volcano-magma': false,
            'storm-lightning': false,
            'crystal-ice': false,
            'nebula-cosmic': false
        };
        let selectedSkinForEquip = null;
        let currentSkinTab = 'all';
        let currentShopCategory = 'all';
        let inventory = {};  // 库存：{ itemId: { count: number, name: string, desc: string, icon: string, item: object } }
    
        // ==================== GameState 统一数据管理 ====================
        class GameState {
            static STORAGE_KEY = 'pierresCasinoData_v4';
            static VERSION = 4;

            static getDefaultData() {
                return {
                    _version: GameState.VERSION,
                    chips: 100,
                    history: [],
                    ownedSounds: { jazz: false, electronic: false },
                    ownedSkins: {
                        'royal-purple': false, 'cyber-neon': false, 'dark-ghost': false,
                        'golden-empire': false, 'aurora-dream': false, 'fire-hell': false,
                        'diamond-luxury': false, 'cosmic-void': false, 'venom-toxic': false,
                        'plasma-energy': false, 'inferno-blaze': false, 'ocean-abyss': false,
                        'forest-mystic': false, 'desert-sands': false, 'volcano-magma': false,
                        'storm-lightning': false, 'crystal-ice': false, 'nebula-cosmic': false
                    },
                    currentSkin: 'default',
                    accelerateCount: 0,
                    lastPayday: new Date().toISOString(),
                    shopItemsOwned: [],
                    dailyTasks: null, // 使用默认值
                    lastCheckInDate: '',
                                        miningStart: Date.now(),
                    sharedCount: 0,
                    dailyChallenges: null, // 使用默认值
                    chestKeys: 0,
                    achievements: null, // 使用默认值
                    totalChipsEarned: 0,
                    consecutiveHighLuck: 0,
                    totalDraws: 0,
                    skinsCollected: 0,
                    inventory: {}  // 库存：{ itemId: count }
                };
            }

            static migrate(data) {
                // v1 -> v2: 添加新字段
                if (!data._version || data._version < 2) {
                    data._version = 2;
                }
                // v2 -> v3: 标准化数据结构
                if (data._version < 3) {
                    // 确保 ownedSkins 包含所有皮肤
                    const defaultSkins = GameState.getDefaultData().ownedSkins;
                    Object.keys(defaultSkins).forEach(key => {
                        if (data.ownedSkins && !(key in data.ownedSkins)) {
                            data.ownedSkins[key] = false;
                        }
                    });
                    data._version = 3;
                }
                // v3 -> v4: 添加库存系统
                if (data._version < 4) {
                    data.inventory = data.inventory || {};
                    data._version = 4;
                }
                return data;
            }

            static save() {
                const data = {
                    _version: GameState.VERSION,
                    chips: chips,
                    history: history,
                    ownedSounds: ownedSounds,
                    ownedSkins: ownedSkins,
                    currentSkin: currentSkin,
                    accelerateCount: accelerateCount,
                    lastPayday: lastPayday.toISOString(),
                    shopItemsOwned: shopItems.filter(item => item.owned && item.type !== 'consumable').map(item => item.id),
                    dailyTasks: dailyTasks,
                    lastCheckInDate: lastCheckInDate,
                                        miningStart: miningStart,
                    sharedCount: sharedCount,
                    dailyChallenges: dailyChallenges,
                    chestKeys: chestKeys,
                    achievements: achievements,
                    totalChipsEarned: totalChipsEarned,
                    consecutiveHighLuck: consecutiveHighLuck,
                    totalDraws: totalDraws,
                    skinsCollected: skinsCollected,
                    inventory: inventory
                };
                localStorage.setItem(GameState.STORAGE_KEY, JSON.stringify(data));
                localStorage.setItem('pierresCasinoLastSave', Date.now().toString());
            }

            static load() {
                const saved = localStorage.getItem(GameState.STORAGE_KEY);
                if (!saved) return false;

                try {
                    let data = JSON.parse(saved);

                    // 数据迁移
                    data = GameState.migrate(data);

                    // 应用数据
                    chips = data.chips || 100;
                    history = data.history || [];
                    ownedSounds = data.ownedSounds || { jazz: false, electronic: false };
                    ownedSkins = data.ownedSkins || {};
                    currentSkin = data.currentSkin || 'default';
                    accelerateCount = data.accelerateCount || 0;
                    lastPayday = new Date(data.lastPayday || new Date());

                    // 更新商店物品状态
                    if (data.shopItemsOwned) {
                        shopItems.forEach(item => {
                            if (item.type !== 'consumable') {
                                item.owned = data.shopItemsOwned.includes(item.id);
                            } else {
                                item.owned = false;
                            }
                        });
                    }

                    // 更新皮肤锁定状态
                    Object.keys(skins).forEach(skinId => {
                        if (skinId !== 'default') {
                            skins[skinId].locked = !ownedSkins[skinId];
                        }
                    });

                    // 多元化筹码获取系统数据
                    if (data.dailyTasks) {
                        dailyTasks = { ...dailyTasks, ...data.dailyTasks };
                    }
                    lastCheckInDate = data.lastCheckInDate || '';
                                        miningStart = data.miningStart || Date.now();
                    sharedCount = data.sharedCount || 0;
                    if (data.dailyChallenges) {
                        dailyChallenges = { ...dailyChallenges, ...data.dailyChallenges };
                    }
                    chestKeys = data.chestKeys || 0;

                    // 成就系统数据
                    if (data.achievements) {
                        Object.keys(achievements).forEach(key => {
                            if (data.achievements[key]) {
                                achievements[key] = { ...achievements[key], ...data.achievements[key] };
                            }
                        });
                    }
                    totalChipsEarned = data.totalChipsEarned || 0;
                    consecutiveHighLuck = data.consecutiveHighLuck || 0;
                    totalDraws = data.totalDraws || 0;
                    skinsCollected = data.skinsCollected || Object.values(ownedSkins).filter(v => v).length;
                    inventory = data.inventory || {};
    
                    return true;
                } catch (e) {
                    console.error('加载数据失败:', e);
                    return false;
                }
            }
        }

        // 兼容旧的函数调用
        function saveData() {
            GameState.save();
        }

        function loadData() {
            return GameState.load();
        }

        // ==================== 连抽暴击系统 ====================
        let consecutiveDraws = 0; // 连续抽卡次数
        let comboLevel = 0; // 当前连击等级：0=无，1=小暴击，2=大暴击，3=赌神附体
        let comboMultiplier = 1; // 奖励倍数
        let comboRareBonus = 0; // 稀有率加成
        let lastDrawTime = 0; // 上次抽卡时间（用于判断是否中断连击）
        const COMBO_TIMEOUT = 3500; // 5 秒内未抽卡则中断连击

        // ==================== 多元化筹码获取系统 ====================

        // --- 每日任务系统 ---
        let dailyTasks = {
            draw15:     { done: false, reward: 25, name: '抽卡达人', desc: '抽卡 15 次', count: 0, target: 15 },
            legend:     { done: false, reward: 30, name: '传说猎手', desc: '抽到传说牌', charmReward: 1 },
            combo10:    { done: false, reward: 35, name: '连击大师', desc: '达成 10 连击' },
            chipGuard:  { done: false, reward: 20, name: '筹码守卫', desc: '单日抽卡净亏损≤10' },
            luckyWheel3:{ done: false, reward: 15, name: '幸运轮手', desc: '转盘 3 次', count: 0, target: 3 }
        };
        let lastCheckInDate = '';


        // --- 挖矿模式 ---
        let miningStart = Date.now();
        let miningRate = 8; // 每小时 5 筹码
        let maxMiningHours = 24;
        let miningPaused = false;

        // --- 好友助力 ---
        let sharedCount = 0;
        const MAX_SHARE_REWARD = 50;
        const SHARE_REWARD = 5;

        // --- 挑战模式 ---
        let dailyChallenges = {
            speed: { used: 0, max: 3, name: '速抽挑战', desc: '10 秒内抽 3 次' },
            accuracy: { used: 0, max: 3, name: '精准挑战', desc: '连续 3 次中运以上' },
            combo: { used: 0, max: 3, name: '连击挑战', desc: '单次达成 10 连击' }
        };
        let challengeTimer = null;
        let challengeDraws = [];

        // --- 宝箱系统 ---
        let chestKeys = 0;
        let chests = [];

        // --- 节日活动 ---
        let activeBonus = 1; // 奖励倍数
        let bonusReason = '';

        // ==================== 成就系统 ====================
        const achievements = {
            firstDraw: {
                id: 'firstDraw',
                badge: '🌟',
                name: '初出茅庐',
                desc: '首次抽卡',
                quote: '哼，新手？在赌桌上，每个人都是从零开始！',
                unlocked: false
            },
            smallWinner: {
                id: 'smallWinner',
                badge: '💎',
                name: '小有斩获',
                desc: '累计获得 100 筹码',
                quote: '100 筹码？这才哪到哪！不过算是个开始。',
                unlocked: false,
                progress: 0,
                target: 100
            },
            legendHunter: {
                id: 'legendHunter',
                badge: '👑',
                name: '传说猎手',
                desc: '抽到终极王牌',
                quote: '抽到王牌？运气不错！但别高兴太早。',
                unlocked: false
            },
            skinCollector: {
                id: 'skinCollector',
                badge: '🎨',
                name: '皮肤收藏家',
                desc: '收集 3 种皮肤',
                quote: '喜欢收集皮肤？品味不错，但还不够！',
                unlocked: false,
                progress: 0,
                target: 3
            },
            luckyStreak: {
                id: 'luckyStreak',
                badge: '🍀',
                name: '欧皇附体',
                desc: '连续 3 次高运',
                quote: '连续高运？看来你今天确实被幸运女神眷顾。',
                unlocked: false,
                streak: 0
            }
        };

        // 统计变量
        let totalChipsEarned = 0; // 累计获得筹码（从 0 开始）
        let consecutiveHighLuck = 0; // 连续高运次数
        let totalDraws = 0; // 总抽卡次数
        let skinsCollected = 0; // 已收集皮肤数量

        // ==================== 成就系统函数 ====================

        /**
         * 检查并更新所有成就
         */
        function checkAchievements() {
            let dataChanged = false;

            // 初出茅庐 - 首次抽卡
            if (totalDraws > 0 && !achievements.firstDraw.unlocked) {
                achievements.firstDraw.unlocked = true;
                showTooltip('🏆 成就解锁：初出茅庐！', 'success', 3000);
                dataChanged = true;
            }

            // 小有斩获 - 累计获得 100 筹码（始终更新进度）
            if (achievements.smallWinner.progress !== totalChipsEarned) {
                achievements.smallWinner.progress = totalChipsEarned;
                dataChanged = true;
            }
            if (!achievements.smallWinner.unlocked && totalChipsEarned >= achievements.smallWinner.target) {
                achievements.smallWinner.unlocked = true;
                showTooltip('🏆 成就解锁：小有斩获！', 'success', 3000);
                dataChanged = true;
            }

            // 传说猎手 - 抽到终极王牌
            // 这个会在抽卡时单独检查

            // 皮肤收藏家 - 收集 3 种皮肤（始终更新进度）
            if (achievements.skinCollector.progress !== skinsCollected) {
                achievements.skinCollector.progress = skinsCollected;
                dataChanged = true;
            }
            if (!achievements.skinCollector.unlocked && skinsCollected >= achievements.skinCollector.target) {
                achievements.skinCollector.unlocked = true;
                showTooltip('🏆 成就解锁：皮肤收藏家！', 'success', 3000);
                dataChanged = true;
            }

            // 欧皇附体 - 连续 3 次高运（始终更新进度）
            if (achievements.luckyStreak.streak !== consecutiveHighLuck) {
                achievements.luckyStreak.streak = consecutiveHighLuck;
                dataChanged = true;
            }
            if (!achievements.luckyStreak.unlocked && consecutiveHighLuck >= 3) {
                achievements.luckyStreak.unlocked = true;
                showTooltip('🏆 成就解锁：欧皇附体！', 'success', 3000);
                dataChanged = true;
            }

            // 只有在数据发生变化时才保存
            if (dataChanged) {
                saveData();
            }
        }

        /**
         * 解锁传说猎手成就
         */
        function unlockLegendHunter() {
            if (!achievements.legendHunter.unlocked) {
                achievements.legendHunter.unlocked = true;
                showTooltip('🏆 成就解锁：传说猎手！', 'success', 3000);
                saveData();
            }
        }

        // ==================== 通用粒子特效引擎 ====================
        class ParticleEffectEngine {
            constructor(canvas, ctx) {
                this.canvas = canvas;
                this.ctx = ctx;
                this.particles = [];
                this.animationId = null;
                this.time = 0;
                this.customState = {};
                this.preset = null;
                this.presetId = null;
            }

            stop() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                this.particles = [];
                this.customState = {};
                this.time = 0;
                if (this.ctx && this.canvas) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
            }

            start(presetId) {
                const preset = ParticleEffectEngine.PRESETS[presetId];
                if (!preset) return;

                this.stop();
                this.presetId = presetId;
                this.preset = preset;
                this.particles = [];
                this.time = 0;
                this.customState = preset.initState ? preset.initState(this.canvas.width, this.canvas.height) : {};

                if (preset.createParticles) {
                    this.particles = preset.createParticles(this.canvas.width, this.canvas.height);
                }

                this._animate();
            }

            _animate() {
                const preset = this.preset;
                const ctx = this.ctx;
                const width = this.canvas.width;
                const height = this.canvas.height;

                this.time += preset.timeStep || 0.02;

                ctx.clearRect(0, 0, width, height);

                if (preset.drawBackground) {
                    preset.drawBackground(ctx, width, height, this.time, this.customState, this.particles);
                }

                if (preset.updateParticles) {
                    preset.updateParticles(this.particles, width, height, this.time, this.customState);
                }

                if (preset.drawParticles) {
                    preset.drawParticles(ctx, this.particles, this.time, this.customState);
                }

                this.animationId = requestAnimationFrame(() => this._animate());
            }
        }

        // ==================== 特效预设定义 ====================
        ParticleEffectEngine.PRESETS = {
            'royal': {
                timeStep: 0.02,
                createParticles: (w, h) => {
                    const particles = [];
                    for (let i = 0; i < 50; i++) {
                        particles.push({
                            x: Math.random() * w,
                            y: Math.random() * h - h,
                            size: Math.random() * 3 + 1,
                            speed: Math.random() * 2 + 1,
                            opacity: Math.random() * 0.5 + 0.3,
                            type: 'gold'
                        });
                    }
                    return particles;
                },
                drawBackground: (ctx, w, h, time) => {
                    const glowSize = Math.sin(time) * 50 + 200;
                    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, glowSize);
                    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
                    gradient.addColorStop(0.5, 'rgba(189, 76, 255, 0.05)');
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, w, h);
                },
                updateParticles: (particles, w, h) => {
                    particles.forEach(p => {
                        p.y += p.speed;
                        if (p.y > h) {
                            p.y = -10;
                            p.x = Math.random() * w;
                        }
                    });
                },
                drawParticles: (ctx, particles) => {
                    particles.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity * 0.3})`;
                        ctx.fill();
                    });
                }
            },

            'cyber': {
                timeStep: 0.02,
                initState: (w, h) => ({ scanLineY: 0, scanDirection: 1 }),
                createParticles: (w, h) => {
                    const particles = [];
                    for (let i = 0; i < 30; i++) {
                        particles.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            size: Math.random() * 2 + 1,
                            speed: Math.random() * 3 + 2,
                            opacity: Math.random() * 0.6 + 0.2,
                            type: 'data'
                        });
                    }
                    return particles;
                },
                drawBackground: (ctx, w, h, time, state) => {
                    state.scanLineY += 2 * state.scanDirection;
                    if (state.scanLineY >= h - 50 || state.scanLineY <= 50) {
                        state.scanDirection *= -1;
                    }

                    const scanGradient = ctx.createLinearGradient(0, state.scanLineY - 20, 0, state.scanLineY + 20);
                    scanGradient.addColorStop(0, 'transparent');
                    scanGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
                    scanGradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = scanGradient;
                    ctx.fillRect(0, state.scanLineY - 20, w, 40);

                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
                    ctx.lineWidth = 1;
                    for (let x = 0; x < w; x += 50) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, h);
                        ctx.stroke();
                    }
                    for (let y = 0; y < h; y += 50) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(w, y);
                        ctx.stroke();
                    }
                },
                updateParticles: (particles, w, h) => {
                    particles.forEach(p => {
                        p.y += p.speed;
                        if (p.y > h) {
                            p.y = 0;
                            p.x = Math.random() * w;
                        }
                    });
                },
                drawParticles: (ctx, particles) => {
                    particles.forEach(p => {
                        const chars = '01';
                        const char = chars[Math.floor(Math.random() * chars.length)];
                        ctx.font = `${p.size * 10}px monospace`;
                        ctx.fillStyle = `rgba(0, 255, 255, ${p.opacity})`;
                        ctx.fillText(char, p.x, p.y);
                    });
                }
            },

            'ghost': {
                timeStep: 0.02,
                createParticles: (w, h) => {
                    const particles = [];
                    for (let i = 0; i < 40; i++) {
                        particles.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            size: Math.random() * 100 + 50,
                            speedX: Math.random() * 1 - 0.5,
                            speedY: Math.random() * 1 - 0.5,
                            opacity: Math.random() * 0.1 + 0.05,
                            type: 'smoke'
                        });
                    }
                    return particles;
                },
                drawBackground: (ctx, w, h, time) => {
                    const glowSize = Math.sin(time * 0.5) * 30 + 150;
                    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, glowSize);
                    gradient.addColorStop(0, 'rgba(255, 20, 20, 0.08)');
                    gradient.addColorStop(0.5, 'rgba(100, 0, 0, 0.03)');
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, w, h);
                },
                updateParticles: (particles, w, h) => {
                    particles.forEach(p => {
                        p.x += p.speedX;
                        p.y += p.speedY;
                        if (p.x < -p.size || p.x > w + p.size) p.speedX *= -1;
                        if (p.y < -p.size || p.y > h + p.size) p.speedY *= -1;
                    });
                },
                drawParticles: (ctx, particles) => {
                    particles.forEach(p => {
                        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                        gradient.addColorStop(0, `rgba(50, 50, 50, ${p.opacity})`);
                        gradient.addColorStop(0.5, `rgba(30, 30, 30, ${p.opacity * 0.5})`);
                        gradient.addColorStop(1, 'transparent');
                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }
            },

            'gold': {
                timeStep: 0.03,
                createParticles: (w, h) => {
                    const particles = [];
                    for (let i = 0; i < 30; i++) {
                        particles.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            size: Math.random() * 4 + 2,
                            angle: Math.random() * Math.PI * 2,
                            speed: Math.random() * 0.02 + 0.01,
                            opacity: Math.random() * 0.6 + 0.4,
                            type: 'diamond'
                        });
                    }
                    return particles;
                },
                drawBackground: (ctx, w, h, time) => {
                    const glowOpacity = (Math.sin(time) + 1) / 2 * 0.1 + 0.05;
                    const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
                    gradient.addColorStop(0, `rgba(255, 215, 0, ${glowOpacity})`);
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, w, h);
                },
                updateParticles: (particles, w, h, time) => {
                    particles.forEach(p => {
                        p.angle += p.speed;
                    });
                },
                drawParticles: (ctx, particles, time) => {
                    particles.forEach(p => {
                        const centerX = ctx.canvas.width / 2 + Math.cos(p.angle) * 100;
                        const centerY = ctx.canvas.height / 2 + Math.sin(p.angle) * 100;

                        ctx.beginPath();
                        for (let i = 0; i < 8; i++) {
                            const angle = (Math.PI * 2 / 8) * i + time;
                            const r = i % 2 === 0 ? p.size * 3 : p.size;
                            const x = centerX + Math.cos(angle) * r;
                            const y = centerY + Math.sin(angle) * r;
                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity * 0.5})`;
                        ctx.fill();
                    });
                }
            },

            'aurora': {
                timeStep: 0.01,
                createParticles: (w, h) => {
                    const particles = [];
                    for (let i = 0; i < 60; i++) {
                        particles.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            size: Math.random() * 2 + 1,
                            speed: Math.random() * 1 + 0.5,
                            opacity: Math.random() * 0.5 + 0.3,
                            type: 'snow'
                        });
                    }
                    return particles;
                },
                drawBackground: (ctx, w, h, time) => {
                    const auroraColors = [
                        'rgba(100, 200, 255, 0.15)',
                        'rgba(100, 255, 200, 0.15)',
                        'rgba(200, 150, 255, 0.15)'
                    ];

                    for (let i = 0; i < 3; i++) {
                        const gradient = ctx.createLinearGradient(0, h * 0.2 + Math.sin(time + i) * 50, 0, h * 0.6 + Math.sin(time + i + 1) * 50);
                        gradient.addColorStop(0, 'transparent');
                        gradient.addColorStop(0.5, auroraColors[i]);
                        gradient.addColorStop(1, 'transparent');

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.moveTo(0, h * 0.3 + Math.sin(time + i) * 100);
                        for (let x = 0; x <= w; x += 50) {
                            ctx.lineTo(x, h * 0.4 + Math.sin(time * 2 + x * 0.01 + i) * 80);
                        }
                        ctx.lineTo(w, h * 0.7);
                        ctx.lineTo(0, h * 0.7);
                        ctx.fill();
                    }
                },
                updateParticles: (particles, w, h) => {
                    particles.forEach(p => {
                        p.y += p.speed;
                        if (p.y > h) {
                            p.y = -10;
                            p.x = Math.random() * w;
                        }
                    });
                },
                drawParticles: (ctx, particles) => {
                    particles.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                        ctx.fill();
                    });
                }
            },

            'fire': {
                timeStep: 0.05,
                createParticles: (w, h) => {
                    const particles = [];
                    for (let i = 0; i < 80; i++) {
                        particles.push({
                            x: Math.random() * w,
                            y: h + Math.random() * 100,
                            size: Math.random() * 3 + 1,
                            speed: Math.random() * 3 + 2,
                            angle: Math.random() * 0.5 - 0.25,
                            opacity: Math.random() * 0.7 + 0.3,
                            life: Math.random() * 100 + 50,
                            type: 'spark'
                        });
                    }
                    return particles;
                },
                drawBackground: (ctx, w, h, time) => {
                    const fireGradient = ctx.createLinearGradient(0, h - 200, 0, h);
                    fireGradient.addColorStop(0, 'transparent');
                    fireGradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.1 + Math.sin(time) * 0.05})`);
                    fireGradient.addColorStop(1, `rgba(255, 50, 0, ${0.2 + Math.sin(time * 2) * 0.1})`);
                    ctx.fillStyle = fireGradient;
                    ctx.fillRect(0, h - 200, w, 200);
                },
                updateParticles: (particles, w, h) => {
                    particles.forEach(p => {
                        p.y -= p.speed;
                        p.x += p.angle * p.speed;
                        p.life--;
                        p.opacity = p.life / 150;

                        if (p.life <= 0 || p.y < -50 || p.x < -50 || p.x > w + 50) {
                            p.y = h + Math.random() * 100;
                            p.x = Math.random() * w;
                            p.life = Math.random() * 100 + 50;
                            p.opacity = Math.random() * 0.7 + 0.3;
                        }
                    });
                },
                drawParticles: (ctx, particles) => {
                    particles.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        const sparkColor = p.opacity > 0.7 ? '#ffff00' : '#ff6600';
                        ctx.fillStyle = `${sparkColor}${Math.floor(p.opacity * 255).toString(16).padStart(2, '0')}`;
                        ctx.fill();

                        if (p.opacity > 0.3) {
                            ctx.beginPath();
                            ctx.arc(p.x, p.y + p.speed * 2, p.size * 0.5, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(255, 100, 0, ${p.opacity * 0.5})`;
                            ctx.fill();
                        }
                    });
                }
            }
        };

        // ==================== 特效系统变量 ====================
        let effectCanvas = null;
        let effectCtx = null;
        let effectParticles = [];
        let particleEngine = null;

        function initEffectCanvas() {
            effectCanvas = document.getElementById('effectCanvas');
            effectCtx = effectCanvas.getContext('2d');
            particleEngine = new ParticleEffectEngine(effectCanvas, effectCtx);
            resizeEffectCanvas();
            window.addEventListener('resize', resizeEffectCanvas);
        }

        function resizeEffectCanvas() {
            if (effectCanvas) {
                effectCanvas.width = window.innerWidth;
                effectCanvas.height = window.innerHeight;
            }
        }

        function stopEffect() {
            if (particleEngine) {
                particleEngine.stop();
            }
        }

        function startEffectForSkin(skinId) {
            const skin = skins[skinId];
            if (!skin || skin.specialEffects === 'none') {
                stopEffect();
                return;
            }

            if (particleEngine) {
                particleEngine.start(skin.specialEffects);
            }
        }
        let audioContext = null;

        /**
         * 获取 AudioContext 实例（延迟初始化，兼容浏览器自动播放策略）
         */
        function getAudioContext() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            // 恢复挂起状态（浏览器需要用户交互后才能播放音频）
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            return audioContext;
        }

        // ==================== UI 公共组件 ====================
        let tooltipTimeout = null;

        /**
         * 显示全局 Tooltip 提示
         * @param {string} message - 提示消息
         * @param {string} type - 类型：'success' | 'error' | 'info' (默认 'info')
         * @param {number} duration - 显示时长 (毫秒)，默认 3000
         */
        function showTooltip(message, type = 'info', duration = 3000) {
            const tooltip = document.getElementById('globalTooltip');
            const iconEl = document.getElementById('tooltipIcon');
            const titleEl = document.getElementById('tooltipTitle');
            const messageEl = document.getElementById('tooltipMessage');

            // 清除之前的定时器
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }

            // 设置图标和标题
            const config = {
                success: { icon: '✅', title: '成功' },
                error: { icon: '❌', title: '错误' },
                info: { icon: 'ℹ️', title: '提示' }
            };

            const cfg = config[type] || config.info;
            iconEl.textContent = cfg.icon;
            titleEl.textContent = cfg.title;
            messageEl.textContent = message;

            // 移除所有类型类
            tooltip.classList.remove('success', 'error', 'info');
            // 添加当前类型类
            tooltip.classList.add(type);

            // 显示 Tooltip
            tooltip.classList.add('show');

            // 自动隐藏
            tooltipTimeout = setTimeout(() => {
                tooltip.classList.remove('show');
            }, duration);
        }

        // ==================== 连抽暴击系统函数 ====================

        /**
         * 更新连抽状态
         */
        function updateComboSystem() {
            const now = Date.now();

            // 检查是否超时中断连击
            if (lastDrawTime > 0 && (now - lastDrawTime) > COMBO_TIMEOUT) {
                resetCombo();
                return;
            }

            // 根据连续抽卡次数计算连击等级
            if (consecutiveDraws >= 10) {
                comboLevel = 3; // 赌神附体
                comboMultiplier = 1.6;
                comboRareBonus = 30; // 稀有率 +100%
            } else if (consecutiveDraws >= 5) {
                comboLevel = 2; // 大暴击
                comboMultiplier = 2;
                comboRareBonus = 50; // 稀有率 +50%
            } else if (consecutiveDraws >= 3) {
                comboLevel = 1; // 小暴击
                comboMultiplier = 1.3;
                comboRareBonus = 15; // 稀有率 +25%
            } else {
                comboLevel = 0; // 无连击
                comboMultiplier = 1;
                comboRareBonus = 0;
            }

            // 更新 UI
            updateComboUI();
        }

        /**
         * 更新连抽 UI 显示
         */
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

            // 移除所有等级类
            indicator.classList.remove('level-1', 'level-2', 'level-3');
            // 添加当前等级类
            indicator.classList.add('show', `level-${comboLevel}`);

            // 设置图标和标题
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

        /**
         * 重置连击
         */
        function resetCombo() {
            consecutiveDraws = 0;
            comboLevel = 0;
            comboMultiplier = 1;
            comboRareBonus = 0;
            lastDrawTime = 0;
            updateComboUI();
        }

        /**
         * 增加连击次数
         */
        function addCombo() {
            const now = Date.now();

            // 检查是否超时
            if (lastDrawTime > 0 && (now - lastDrawTime) > COMBO_TIMEOUT) {
                resetCombo();
            }

            consecutiveDraws++;
            lastDrawTime = now;
            updateComboSystem();

            // 触发升级特效
            if (comboLevel > 0) {
                showComboEffect();
            }
        }

        /**
         * 显示连抽特效文字
         */
        function showComboEffect() {
            const config = {
                1: { text: '小暴击！', color: '#00ff00', voice: '有点意思！' },
                2: { text: '大暴击！', color: '#00ffff', voice: '这才像话！' },
                3: { text: '赌神附体！', color: '#ff00ff', voice: '我就是赌神！' }
            };

            const cfg = config[comboLevel];

            // 创建浮动文字
            const effectEl = document.createElement('div');
            effectEl.className = 'combo-text-effect';
            effectEl.textContent = cfg.text;
            effectEl.style.color = cfg.color;
            effectEl.style.left = '50%';
            effectEl.style.top = '30%';
            effectEl.style.transform = 'translate(-50%, -50%)';
            document.body.appendChild(effectEl);

            // 2 秒后移除
            setTimeout(() => {
                effectEl.remove();
            }, 2000);

            // 播放语音（如果音效开启）
            if (soundEnabled && comboLevel >= 2) {
                playComboVoice(cfg.voice);
            }
        }

        /**
         * 播放连抽语音
         */
        function playComboVoice(text) {
            // 使用 Web Speech API 播放语音
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'zh-CN';
                utterance.rate = 1.2;
                utterance.pitch = 1.1;
                window.speechSynthesis.speak(utterance);
            }
        }

        // ==================== 多元化筹码获取系统函数 ====================

        /**
         * 领取挖矿奖励
         */
        function collectMining() {
            const now = Date.now();
            const hoursPassed = (now - miningStart) / (1000 * 60 * 60);

            if (hoursPassed <= 0) {
                showTooltip('再等一会儿，还没挖到筹码呢~', 'info', 2500);
                return;
            }

            // 计算可领取的最大小时数
            const claimableHours = Math.min(hoursPassed, maxMiningHours);
            const reward = Math.floor(claimableHours * miningRate);

            if (reward <= 0) {
                showTooltip('再等一会儿，还没挖到筹码呢~', 'info', 2500);
                return;
            }

            // 发放奖励（显示 +X 浮动动画）
            chips += reward;
            updateChipDisplay(true, true, reward);
            miningStart = now; // 重置挖矿时间

            showTooltip(`⛏️ 挖矿成功！获得 ${reward} 筹码！`, 'success', 3000);
            saveData();

            // 延迟更新按钮状态，让用户先看到成功提示
            setTimeout(updateMiningButton, 500);
        }

        /**
         * 更新挖矿按钮显示
         */
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
                // 显示等待时间
                const minutesPassed = Math.floor(hoursPassed * 60);
                const minutesRemaining = 60 - minutesPassed;
                btn.textContent = `⛏️ 正在挖矿... (${minutesRemaining}分钟后)`;
                btn.disabled = true;
            }
        }

        /**
         * 打开轮盘弹窗
         */

        /**
         * 关闭轮盘弹窗
         */
                /**
         * 开始旋转轮盘
         */
        

        // 皮肤定义 - 20 种精选主题（极致浮夸背景图案）
        const skins = {
            'default': {
                name: '经典金色',
                desc: '皮尔卡松的经典金色主题',
                preview: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #0f0f1a 100%)',
                bodyBg: `
                    repeating-linear-gradient(45deg,
                        #0a0a0a 0px,
                        #0a0a0a 20px,
                        #0f0f0f 20px,
                        #0f0f0f 40px),
                    linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #0f0f1a 100%)
                `,
                containerBg: 'rgba(10, 10, 10, 0.85)',
                borderColor: 'rgba(255, 215, 0, 0.4)',
                accentColor: '#ffd700',
                cardBg: 'linear-gradient(145deg, #2a2a4a, #1a1a3a)',
                buttonGradient: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                fontFamily: "'Microsoft YaHei', 'Segoe UI', Arial, sans-serif",
                specialEffects: 'none',
                locked: false
            },
            'ocean-abyss': {
                name: '深海深渊・静谧之海',
                desc: '万米深海，幽蓝静谧 + 气泡上升',
                preview: 'linear-gradient(135deg, #001a2e 0%, #002a4e 50%, #001f3f 100%)',
                bodyBg: `
                    repeating-linear-gradient(0deg,
                        transparent 0px,
                        transparent 89px,
                        rgba(100, 200, 255, 0.02) 90px,
                        transparent 91px),
                    radial-gradient(ellipse at 50% 0%,
                        rgba(100, 200, 255, 0.1) 0%,
                        transparent 40%),
                    linear-gradient(135deg, #000a15 0%, #001a2e 40%, #002a4e 100%)
                `,
                containerBg: 'rgba(0, 20, 40, 0.91)',
                borderColor: 'rgba(100, 200, 255, 0.5)',
                accentColor: '#4fc3f7',
                cardBg: 'linear-gradient(145deg, #002a4e, #001a2e)',
                buttonGradient: 'linear-gradient(135deg, #4fc3f7, #29b6f6)',
                fontFamily: "'Verdana', sans-serif",
                specialEffects: 'ocean',
                locked: !ownedSkins['ocean-abyss']
            },
            'forest-mystic': {
                name: '神秘森林・精灵之域',
                desc: '古老森林，神秘翠绿 + 光斑闪烁',
                preview: 'linear-gradient(135deg, #0a1a0a 0%, #0f2f0f 50%, #0a250a 100%)',
                bodyBg: `
                    radial-gradient(circle at 30% 20%,
                        rgba(150, 255, 150, 0.08) 0%,
                        transparent 35%),
                    radial-gradient(circle at 70% 40%,
                        rgba(150, 255, 150, 0.08) 0%,
                        transparent 35%),
                    repeating-linear-gradient(15deg,
                        rgba(100, 200, 100, 0.02) 0px,
                        rgba(100, 200, 100, 0.02) 1px,
                        transparent 1px,
                        transparent 40px),
                    linear-gradient(135deg, #051005 0%, #0a1a0a 40%, #0f2f0f 100%)
                `,
                containerBg: 'rgba(10, 25, 10, 0.92)',
                borderColor: 'rgba(150, 255, 150, 0.6)',
                accentColor: '#98fb98',
                cardBg: 'linear-gradient(145deg, #0f2f0f, #0a1a0a)',
                buttonGradient: 'linear-gradient(135deg, #98fb98, #3cb371)',
                fontFamily: "'Georgia', serif",
                specialEffects: 'forest',
                locked: !ownedSkins['forest-mystic']
            },
            'desert-sands': {
                name: '黄金沙漠・落日余晖',
                desc: '无垠沙漠，金黄沙丘 + 热浪扭曲',
                preview: 'linear-gradient(135deg, #2a1a00 0%, #4a2a00 50%, #3a1f00 100%)',
                bodyBg: `
                    repeating-linear-gradient(0deg,
                        rgba(255, 200, 100, 0.02) 0px,
                        rgba(255, 200, 100, 0.02) 2px,
                        transparent 2px,
                        transparent 45px),
                    radial-gradient(ellipse at 80% 0%,
                        rgba(255, 200, 100, 0.15) 0%,
                        transparent 50%),
                    linear-gradient(135deg, #150a00 0%, #2a1a00 40%, #4a2a00 100%)
                `,
                containerBg: 'rgba(30, 20, 0, 0.93)',
                borderColor: 'rgba(255, 200, 100, 0.6)',
                accentColor: '#ffd700',
                cardBg: 'linear-gradient(145deg, #4a2a00, #2a1a00)',
                buttonGradient: 'linear-gradient(135deg, #ffd700, #ffa500)',
                fontFamily: "'Trebuchet MS', sans-serif",
                specialEffects: 'desert',
                locked: !ownedSkins['desert-sands']
            },
            'volcano-magma': {
                name: '火山熔岩・大地怒火',
                desc: '活跃火山，炽热熔岩 + 火山灰',
                preview: 'linear-gradient(135deg, #2a0500 0%, #4f0f00 50%, #2f0a00 100%)',
                bodyBg: `
                    radial-gradient(ellipse at 50% 100%,
                        rgba(255, 100, 0, 0.15) 0%,
                        transparent 45%),
                    repeating-linear-gradient(90deg,
                        rgba(255, 80, 0, 0.03) 0px,
                        rgba(255, 80, 0, 0.03) 2px,
                        transparent 2px,
                        transparent 35px),
                    linear-gradient(135deg, #150500 0%, #2a0500 40%, #4f0f00 100%)
                `,
                containerBg: 'rgba(35, 10, 0, 0.94)',
                borderColor: 'rgba(255, 100, 0, 0.7)',
                accentColor: '#ff4500',
                cardBg: 'linear-gradient(145deg, #4f0f00, #2a0500)',
                buttonGradient: 'linear-gradient(135deg, #ff4500, #ff6347)',
                fontFamily: "'Impact', sans-serif",
                specialEffects: 'volcano',
                locked: !ownedSkins['volcano-magma']
            },
            'storm-lightning': {
                name: '雷霆风暴・闪电之怒',
                desc: '暴风雨夜，闪电撕裂 + 雷鸣滚滚',
                preview: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2f 50%, #0a153a 100%)',
                bodyBg: `
                    repeating-linear-gradient(30deg,
                        transparent 0px,
                        transparent 99px,
                        rgba(255, 255, 200, 0.02) 100px,
                        transparent 101px),
                    radial-gradient(circle at 20% 30%,
                        rgba(255, 255, 200, 0.08) 0%,
                        transparent 40%),
                    linear-gradient(135deg, #050510 0%, #0a0a1a 40%, #0f0f2f 100%)
                `,
                containerBg: 'rgba(10, 15, 30, 0.92)',
                borderColor: 'rgba(255, 255, 200, 0.6)',
                accentColor: '#ffffe0',
                cardBg: 'linear-gradient(145deg, #0f0f2f, #0a0a1a)',
                buttonGradient: 'linear-gradient(135deg, #ffffe0, #ffd700)',
                fontFamily: "'Arial Black', sans-serif",
                specialEffects: 'storm',
                locked: !ownedSkins['storm-lightning']
            },
            'crystal-ice': {
                name: '水晶冰原・极寒之地',
                desc: '冰封世界，晶莹剔透 + 冰晶闪烁',
                preview: 'linear-gradient(135deg, #0a1a2e 0%, #0f1f3f 50%, #0a254e 100%)',
                bodyBg: `
                    repeating-conic-gradient(from 0deg at 50% 50%,
                        transparent 0deg,
                        transparent 11deg,
                        rgba(200, 230, 255, 0.03) 12deg,
                        rgba(200, 230, 255, 0.03) 13deg),
                    radial-gradient(circle at 50% 50%,
                        rgba(200, 230, 255, 0.1) 0%,
                        transparent 60%),
                    linear-gradient(135deg, #050a15 0%, #0a1a2e 40%, #0f1f3f 100%)
                `,
                containerBg: 'rgba(10, 20, 40, 0.91)',
                borderColor: 'rgba(200, 230, 255, 0.7)',
                accentColor: '#e0ffff',
                cardBg: 'linear-gradient(145deg, #0f1f3f, #0a1a2e)',
                buttonGradient: 'linear-gradient(135deg, #e0ffff, #b0e0e6)',
                fontFamily: "'Lucida Console', monospace",
                specialEffects: 'ice',
                locked: !ownedSkins['crystal-ice']
            },
            'nebula-cosmic': {
                name: '星云宇宙・星河璀璨',
                desc: '浩瀚星河，绚丽星云 + 流星雨',
                preview: 'linear-gradient(135deg, #0a001a 0%, #0f002f 50%, #0a003a 100%)',
                bodyBg: `
                    radial-gradient(ellipse at 30% 30%,
                        rgba(255, 100, 200, 0.1) 0%,
                        transparent 45%),
                    radial-gradient(ellipse at 70% 60%,
                        rgba(100, 150, 255, 0.1) 0%,
                        transparent 45%),
                    repeating-linear-gradient(0deg,
                        transparent 0px,
                        transparent 199px,
                        rgba(255, 255, 255, 0.02) 200px,
                        transparent 201px),
                    linear-gradient(135deg, #05000a 0%, #0a001a 40%, #0f002f 100%)
                `,
                containerBg: 'rgba(15, 5, 25, 0.93)',
                borderColor: 'rgba(255, 150, 200, 0.6)',
                accentColor: '#ff69b4',
                cardBg: 'linear-gradient(145deg, #0f002f, #0a001a)',
                buttonGradient: 'linear-gradient(135deg, #ff69b4, #da70d6)',
                fontFamily: "'Courier New', monospace",
                specialEffects: 'nebula',
                locked: !ownedSkins['nebula-cosmic']
            },
            'royal-purple': {
                name: '皇家紫・贵族盛宴',
                desc: '中世纪皇家宫廷，奢华紫色调 + 金色粒子',
                preview: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1e0f3a 100%)',
                bodyBg: `
                    repeating-radial-gradient(circle at 50% 50%,
                        transparent 0,
                        transparent 30px,
                        rgba(189, 76, 255, 0.05) 31px,
                        rgba(189, 76, 255, 0.05) 62px),
                    repeating-linear-gradient(90deg,
                        rgba(189, 76, 255, 0.03) 0px,
                        rgba(189, 76, 255, 0.03) 1px,
                        transparent 1px,
                        transparent 50px),
                    linear-gradient(135deg, #0d0417 0%, #1a0a2e 40%, #2d1b4e 100%)
                `,
                containerBg: 'rgba(26, 10, 46, 0.9)',
                borderColor: 'rgba(189, 76, 255, 0.6)',
                accentColor: '#d4af37',
                cardBg: 'linear-gradient(145deg, #2d1b4e, #1a0a2e)',
                buttonGradient: 'linear-gradient(135deg, #d4af37, #b8860b)',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                specialEffects: 'royal',
                locked: !ownedSkins['royal-purple']
            },
            'cyber-neon': {
                name: '赛博霓虹・未来都市',
                desc: '2077 年赛博朋克，霓虹扫描 + 数据流',
                preview: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2f 50%, #0a153a 100%)',
                bodyBg: `
                    repeating-linear-gradient(0deg,
                        transparent 0px,
                        transparent 48px,
                        rgba(0, 255, 255, 0.05) 49px,
                        rgba(0, 255, 255, 0.05) 50px),
                    repeating-linear-gradient(90deg,
                        transparent 0px,
                        transparent 48px,
                        rgba(0, 255, 255, 0.05) 49px,
                        rgba(0, 255, 255, 0.05) 50px),
                    linear-gradient(135deg, #050510 0%, #0a0a1a 40%, #0f0f2f 100%)
                `,
                containerBg: 'rgba(10, 15, 30, 0.92)',
                borderColor: 'rgba(0, 255, 255, 0.5)',
                accentColor: '#00ffff',
                cardBg: 'linear-gradient(145deg, #0f1535, #0a0f25)',
                buttonGradient: 'linear-gradient(135deg, #00ffff, #0088ff)',
                fontFamily: "'Courier New', monospace",
                specialEffects: 'cyber',
                locked: !ownedSkins['cyber-neon']
            },
            'dark-ghost': {
                name: '暗夜幽灵・神秘赌场',
                desc: '哥特式神秘，暗黑优雅 + 烟雾流动',
                preview: 'linear-gradient(135deg, #0a0000 0%, #1a0505 50%, #2a0a0a 100%)',
                bodyBg: `
                    radial-gradient(circle at 20% 80%,
                        rgba(255, 20, 20, 0.08) 0%,
                        transparent 50%),
                    radial-gradient(circle at 80% 20%,
                        rgba(255, 20, 20, 0.08) 0%,
                        transparent 50%),
                    repeating-linear-gradient(45deg,
                        transparent 0px,
                        transparent 79px,
                        rgba(255, 20, 20, 0.03) 80px,
                        rgba(255, 20, 20, 0.03) 160px),
                    linear-gradient(135deg, #050000 0%, #0a0000 40%, #1a0505 100%)
                `,
                containerBg: 'rgba(15, 5, 5, 0.92)',
                borderColor: 'rgba(255, 20, 20, 0.5)',
                accentColor: '#ff3333',
                cardBg: 'linear-gradient(145deg, #1a0505, #0a0000)',
                buttonGradient: 'linear-gradient(135deg, #ff3333, #cc0000)',
                fontFamily: "'Times New Roman', serif",
                specialEffects: 'ghost',
                locked: !ownedSkins['dark-ghost']
            },
            'golden-empire': {
                name: '黄金帝国・至尊奢华',
                desc: '古代黄金帝国，极致奢华 + 钻石光芒',
                preview: 'linear-gradient(135deg, #3d2900 0%, #5c4000 50%, #8b6900 100%)',
                bodyBg: `
                    repeating-conic-gradient(from 0deg at 50% 50%,
                        transparent 0deg,
                        transparent 17deg,
                        rgba(255, 215, 0, 0.05) 18deg,
                        rgba(255, 215, 0, 0.05) 19deg),
                    radial-gradient(circle at 50% 50%,
                        rgba(255, 215, 0, 0.1) 0%,
                        transparent 70%),
                    linear-gradient(135deg, #1a1000 0%, #3d2900 40%, #5c4000 100%)
                `,
                containerBg: 'rgba(40, 30, 10, 0.93)',
                borderColor: 'rgba(255, 215, 0, 0.8)',
                accentColor: '#ffd700',
                cardBg: 'linear-gradient(145deg, #5c4000, #3d2900)',
                buttonGradient: 'linear-gradient(135deg, #ffd700, #ffaa00)',
                fontFamily: "'Georgia', serif",
                specialEffects: 'gold',
                locked: !ownedSkins['golden-empire']
            },
            'aurora-dream': {
                name: '极光幻境・梦幻世界',
                desc: '北极光幻境，梦幻绚丽 + 雪花飘落',
                preview: 'linear-gradient(135deg, #0a1a2e 0%, #1a3a5e 50%, #0a2a4e 100%)',
                bodyBg: `
                    repeating-linear-gradient(0deg,
                        transparent 0px,
                        transparent 99px,
                        rgba(100, 200, 255, 0.03) 100px,
                        rgba(100, 200, 255, 0.03) 101px),
                    radial-gradient(ellipse at 50% 0%,
                        rgba(100, 200, 255, 0.15) 0%,
                        transparent 60%),
                    linear-gradient(135deg, #050a15 0%, #0a1a2e 40%, #1a3a5e 100%)
                `,
                containerBg: 'rgba(10, 20, 40, 0.9)',
                borderColor: 'rgba(100, 200, 255, 0.5)',
                accentColor: '#7df9ff',
                cardBg: 'linear-gradient(145deg, #1a3a5e, #0a1a2e)',
                buttonGradient: 'linear-gradient(135deg, #7df9ff, #00aaff)',
                fontFamily: "'Arial', sans-serif",
                specialEffects: 'aurora',
                locked: !ownedSkins['aurora-dream']
            },
            'fire-hell': {
                name: '火焰地狱・狂热赌场',
                desc: '地狱火焰，狂热刺激 + 火星飞溅',
                preview: 'linear-gradient(135deg, #2a0a00 0%, #4a1a00 50%, #6a2a00 100%)',
                bodyBg: `
                    repeating-radial-gradient(circle at 50% 100%,
                        transparent 0%,
                        transparent 30%,
                        rgba(255, 100, 0, 0.05) 31%,
                        rgba(255, 100, 0, 0.05) 32%),
                    repeating-linear-gradient(90deg,
                        rgba(255, 100, 0, 0.03) 0px,
                        rgba(255, 100, 0, 0.03) 2px,
                        transparent 2px,
                        transparent 40px),
                    linear-gradient(135deg, #150500 0%, #2a0a00 40%, #4a1a00 100%)
                `,
                containerBg: 'rgba(30, 10, 0, 0.92)',
                borderColor: 'rgba(255, 100, 0, 0.6)',
                accentColor: '#ff6600',
                cardBg: 'linear-gradient(145deg, #4a1a00, #2a0a00)',
                buttonGradient: 'linear-gradient(135deg, #ff6600, #cc3300)',
                fontFamily: "'Impact', sans-serif",
                specialEffects: 'fire',
                locked: !ownedSkins['fire-hell']
            },
            'diamond-luxury': {
                name: '钻石王冠・顶级奢华',
                desc: '璀璨钻石，极致闪耀 + 星光闪烁',
                preview: 'linear-gradient(135deg, #0a1a2e 0%, #1a2a4e 50%, #0f1f3f 100%)',
                bodyBg: `
                    repeating-radial-gradient(circle at 50% 50%,
                        transparent 0%,
                        transparent 10%,
                        rgba(255, 255, 255, 0.03) 11%,
                        rgba(255, 255, 255, 0.03) 12%),
                    repeating-linear-gradient(55deg,
                        rgba(255, 255, 255, 0.02) 0px,
                        rgba(255, 255, 255, 0.02) 1px,
                        transparent 1px,
                        transparent 30px),
                    radial-gradient(ellipse at 50% 30%,
                        rgba(255, 255, 255, 0.15) 0%,
                        transparent 50%),
                    linear-gradient(135deg, #050a15 0%, #0a1a2e 40%, #1a2a4e 100%)
                `,
                containerBg: 'rgba(10, 20, 40, 0.94)',
                borderColor: 'rgba(255, 255, 255, 0.7)',
                accentColor: '#e0ffff',
                cardBg: 'linear-gradient(145deg, #1a2a4e, #0a1a2e)',
                buttonGradient: 'linear-gradient(135deg, #e0ffff, #b0e0e6)',
                fontFamily: "'Palatino Linotype', serif",
                specialEffects: 'diamond',
                locked: !ownedSkins['diamond-luxury']
            },
            'cosmic-void': {
                name: '宇宙虚空・无尽深渊',
                desc: '深邃宇宙，星云漩涡 + 流星划过',
                preview: 'linear-gradient(135deg, #0a001a 0%, #1a003a 50%, #0f002f 100%)',
                bodyBg: `
                    radial-gradient(circle at 20% 30%,
                        rgba(255, 100, 255, 0.1) 0%,
                        transparent 40%),
                    radial-gradient(circle at 80% 70%,
                        rgba(100, 100, 255, 0.1) 0%,
                        transparent 40%),
                    repeating-linear-gradient(0deg,
                        transparent 0px,
                        transparent 199px,
                        rgba(255, 255, 255, 0.02) 200px,
                        transparent 201px),
                    linear-gradient(135deg, #05000a 0%, #0a001a 40%, #1a003a 100%)
                `,
                containerBg: 'rgba(15, 5, 25, 0.93)',
                borderColor: 'rgba(255, 100, 255, 0.6)',
                accentColor: '#ff69b4',
                cardBg: 'linear-gradient(145deg, #1a003a, #0a001a)',
                buttonGradient: 'linear-gradient(135deg, #ff69b4, #da70d6)',
                fontFamily: "'Trebuchet MS', sans-serif",
                specialEffects: 'cosmic',
                locked: !ownedSkins['cosmic-void']
            },
            'venom-toxic': {
                name: '剧毒沼泽・腐化之地',
                desc: '毒液腐蚀，诡异绿色 + 气泡涌动',
                preview: 'linear-gradient(135deg, #0a1a0a 0%, #0f2f0f 50%, #0a250a 100%)',
                bodyBg: `
                    repeating-radial-gradient(circle at 30% 80%,
                        transparent 0%,
                        transparent 25%,
                        rgba(100, 255, 100, 0.05) 26%,
                        rgba(100, 255, 100, 0.05) 27%),
                    repeating-radial-gradient(circle at 70% 20%,
                        transparent 0%,
                        transparent 35%,
                        rgba(100, 255, 100, 0.05) 36%,
                        rgba(100, 255, 100, 0.05) 37%),
                    repeating-linear-gradient(25deg,
                        rgba(100, 255, 100, 0.02) 0px,
                        rgba(100, 255, 100, 0.02) 2px,
                        transparent 2px,
                        transparent 45px),
                    linear-gradient(135deg, #051005 0%, #0a1a0a 40%, #0f2f0f 100%)
                `,
                containerBg: 'rgba(10, 25, 10, 0.92)',
                borderColor: 'rgba(100, 255, 100, 0.6)',
                accentColor: '#66ff66',
                cardBg: 'linear-gradient(145deg, #0f2f0f, #0a1a0a)',
                buttonGradient: 'linear-gradient(135deg, #66ff66, #32cd32)',
                fontFamily: "'Comic Sans MS', cursive",
                specialEffects: 'venom',
                locked: !ownedSkins['venom-toxic']
            },
            'plasma-energy': {
                name: '等离子・能量风暴',
                desc: '高能等离子，电弧闪烁 + 能量脉冲',
                preview: 'linear-gradient(135deg, #1a0a1a 0%, #2f0f2f 50%, #1f0a1f 100%)',
                bodyBg: `
                    repeating-conic-gradient(from 0deg at 50% 50%,
                        transparent 0deg,
                        transparent 14deg,
                        rgba(255, 100, 255, 0.05) 15deg,
                        rgba(255, 100, 255, 0.05) 16deg),
                    radial-gradient(circle at 50% 50%,
                        rgba(255, 100, 255, 0.12) 0%,
                        transparent 65%),
                    repeating-linear-gradient(65deg,
                        rgba(255, 100, 255, 0.03) 0px,
                        rgba(255, 100, 255, 0.03) 1px,
                        transparent 1px,
                        transparent 35px),
                    linear-gradient(135deg, #0f050f 0%, #1a0a1a 40%, #2f0f2f 100%)
                `,
                containerBg: 'rgba(25, 10, 25, 0.93)',
                borderColor: 'rgba(255, 100, 255, 0.7)',
                accentColor: '#ff69b4',
                cardBg: 'linear-gradient(145deg, #2f0f2f, #1a0a1a)',
                buttonGradient: 'linear-gradient(135deg, #ff69b4, #ff1493)',
                fontFamily: "'Arial Black', sans-serif",
                specialEffects: 'plasma',
                locked: !ownedSkins['plasma-energy']
            },
            'inferno-blaze': {
                name: '炼狱烈焰・毁灭之光',
                desc: '地狱熔岩，毁灭性火焰 + 灰烬飞舞',
                preview: 'linear-gradient(135deg, #2a0500 0%, #4f0f00 50%, #2f0a00 100%)',
                bodyBg: `
                    repeating-radial-gradient(ellipse at 50% 100%,
                        transparent 0%,
                        transparent 15%,
                        rgba(255, 150, 0, 0.06) 16%,
                        rgba(255, 150, 0, 0.06) 17%),
                    repeating-linear-gradient(0deg,
                        rgba(255, 100, 0, 0.03) 0px,
                        rgba(255, 100, 0, 0.03) 3px,
                        transparent 3px,
                        transparent 50px),
                    radial-gradient(ellipse at 50% 100%,
                        rgba(255, 100, 0, 0.2) 0%,
                        transparent 55%),
                    linear-gradient(135deg, #150500 0%, #2a0500 40%, #4f0f00 100%)
                `,
                containerBg: 'rgba(35, 10, 0, 0.94)',
                borderColor: 'rgba(255, 150, 0, 0.8)',
                accentColor: '#ff8c00',
                cardBg: 'linear-gradient(145deg, #4f0f00, #2a0500)',
                buttonGradient: 'linear-gradient(135deg, #ff8c00, #ff4500)',
                fontFamily: "'Impact', sans-serif",
                specialEffects: 'inferno',
                locked: !ownedSkins['inferno-blaze']
            }
        };

        // 商店物品
        const shopItems = [
            {
                id: 'skin-royal-purple',
                name: '🎨 皇家紫・贵族盛宴',
                desc: '中世纪皇家宫廷，奢华紫色调 + 金色花纹',
                price: 100,
                owned: ownedSkins['royal-purple'],
                type: 'skin',
                skinId: 'royal-purple'
            },
            {
                id: 'sound1',
                name: '🎵 爵士音效包',
                desc: '解锁古典爵士风格背景音乐',
                price: 80,
                owned: ownedSounds.jazz,
                type: 'sound'
            },
            {
                id: 'accelerate',
                name: '⚡ 加速卡 x3',
                desc: '下次抽卡动画速度减半',
                price: 30,
                owned: false,
                type: 'consumable',
                count: 3
            },
            {
                id: 'xray',
                name: '🔮 透视眼镜',
                desc: '查看下次抽卡的概率分布',
                price: 50,
                owned: false,
                type: 'consumable',
                count: 1
            },
            {
                id: 'lucky-charm',
                name: '🍀 幸运符',
                desc: '下次抽卡稀有率 +15%',
                price: 40,
                owned: false,
                type: 'consumable',
                count: 1
            },
            {
                id: 'skin-cyber-neon',
                name: '🎨 赛博霓虹・未来都市',
                desc: '2077 年赛博朋克，霓虹科技感 + 全息投影',
                price: 120,
                owned: ownedSkins['cyber-neon'],
                type: 'skin',
                skinId: 'cyber-neon'
            },
            {
                id: 'skin-dark-ghost',
                name: '🎨 暗夜幽灵・神秘赌场',
                desc: '哥特式神秘，暗黑优雅 + 烟雾效果',
                price: 130,
                owned: ownedSkins['dark-ghost'],
                type: 'skin',
                skinId: 'dark-ghost'
            },
            {
                id: 'skin-golden-empire',
                name: '🎨 黄金帝国・至尊奢华',
                desc: '古代黄金帝国，极致奢华 + 钻石镶嵌',
                price: 150,
                owned: ownedSkins['golden-empire'],
                type: 'skin',
                skinId: 'golden-empire'
            },
            {
                id: 'skin-aurora-dream',
                name: '🎨 极光幻境・梦幻世界',
                desc: '北极光幻境，梦幻绚丽 + 星空背景',
                price: 140,
                owned: ownedSkins['aurora-dream'],
                type: 'skin',
                skinId: 'aurora-dream'
            },
            {
                id: 'skin-fire-hell',
                name: '🎨 火焰地狱・狂热赌场',
                desc: '地狱火焰，狂热刺激 + 熔岩流动',
                price: 135,
                owned: ownedSkins['fire-hell'],
                type: 'skin',
                skinId: 'fire-hell'
            },
            {
                id: 'skin-diamond-luxury',
                name: '🎨 钻石王冠・顶级奢华',
                desc: '璀璨钻石，极致闪耀 + 星光闪烁',
                price: 180,
                owned: ownedSkins['diamond-luxury'],
                type: 'skin',
                skinId: 'diamond-luxury'
            },
            {
                id: 'skin-cosmic-void',
                name: '🎨 宇宙虚空・无尽深渊',
                desc: '深邃宇宙，星云漩涡 + 流星划过',
                price: 170,
                owned: ownedSkins['cosmic-void'],
                type: 'skin',
                skinId: 'cosmic-void'
            },
            {
                id: 'skin-venom-toxic',
                name: '🎨 剧毒沼泽・腐化之地',
                desc: '毒液腐蚀，诡异绿色 + 气泡涌动',
                price: 160,
                owned: ownedSkins['venom-toxic'],
                type: 'skin',
                skinId: 'venom-toxic'
            },
            {
                id: 'skin-plasma-energy',
                name: '🎨 等离子・能量风暴',
                desc: '高能等离子，电弧闪烁 + 能量脉冲',
                price: 175,
                owned: ownedSkins['plasma-energy'],
                type: 'skin',
                skinId: 'plasma-energy'
            },
            {
                id: 'skin-inferno-blaze',
                name: '🎨 炼狱烈焰・毁灭之光',
                desc: '地狱熔岩，毁灭性火焰 + 灰烬飞舞',
                price: 185,
                owned: ownedSkins['inferno-blaze'],
                type: 'skin',
                skinId: 'inferno-blaze'
            },
            {
                id: 'skin-ocean-abyss',
                name: '🎨 深海深渊・静谧之海',
                desc: '万米深海，幽蓝静谧 + 气泡上升',
                price: 145,
                owned: ownedSkins['ocean-abyss'],
                type: 'skin',
                skinId: 'ocean-abyss'
            },
            {
                id: 'skin-forest-mystic',
                name: '🎨 神秘森林・精灵之域',
                desc: '古老森林，神秘翠绿 + 光斑闪烁',
                price: 155,
                owned: ownedSkins['forest-mystic'],
                type: 'skin',
                skinId: 'forest-mystic'
            },
            {
                id: 'skin-desert-sands',
                name: '🎨 黄金沙漠・落日余晖',
                desc: '无垠沙漠，金黄沙丘 + 热浪扭曲',
                price: 150,
                owned: ownedSkins['desert-sands'],
                type: 'skin',
                skinId: 'desert-sands'
            },
            {
                id: 'skin-volcano-magma',
                name: '🎨 火山熔岩・大地怒火',
                desc: '活跃火山，炽热熔岩 + 火山灰',
                price: 165,
                owned: ownedSkins['volcano-magma'],
                type: 'skin',
                skinId: 'volcano-magma'
            },
            {
                id: 'skin-storm-lightning',
                name: '🎨 雷霆风暴・闪电之怒',
                desc: '暴风雨夜，闪电撕裂 + 雷鸣滚滚',
                price: 160,
                owned: ownedSkins['storm-lightning'],
                type: 'skin',
                skinId: 'storm-lightning'
            },
            {
                id: 'skin-crystal-ice',
                name: '🎨 水晶冰原・极寒之地',
                desc: '冰封世界，晶莹剔透 + 冰晶闪烁',
                price: 170,
                owned: ownedSkins['crystal-ice'],
                type: 'skin',
                skinId: 'crystal-ice'
            },
            {
                id: 'skin-nebula-cosmic',
                name: '🎨 星云宇宙・星河璀璨',
                desc: '浩瀚星河，绚丽星云 + 流星雨',
                price: 175,
                owned: ownedSkins['nebula-cosmic'],
                type: 'skin',
                skinId: 'nebula-cosmic'
            },
            {
                id: 'sound2',
                name: '🎵 电子音效包',
                desc: '解锁电子舞曲风格背景音乐',
                price: 80,
                owned: ownedSounds.electronic,
                type: 'sound'
            }
        ];

        // 背景音乐系统
        function playJazzMusic() {
            if (!ownedSounds.jazz || !soundEnabled) {
                stopBgMusic();
                return;
            }

            // 确保先停止之前的音乐
            stopBgMusic();

            bgMusicPlaying = true;

            // 创建爵士风格的和弦循环
            const jazzChords = [
                [261.63, 329.63, 392.00, 493.88], // Cmaj7
                [329.63, 415.30, 493.88, 622.25], // Dm7
                [392.00, 493.88, 587.33, 739.99], // Em7
                [349.23, 440.00, 523.25, 659.25]  // Fmaj7
            ];

            let chordIndex = 0;
            const chordDuration = 2000; // 每个和弦 2 秒

            const playJazzChord = () => {
                // 双重检查：确保音乐应该播放
                if (!bgMusicPlaying || !ownedSounds.jazz || !soundEnabled) {
                    stopBgMusic();
                    return;
                }

                const chord = jazzChords[chordIndex];
                chord.forEach((freq, i) => {
                    const oscillator = getAudioContext().createOscillator();
                    const gainNode = getAudioContext().createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(getAudioContext().destination);

                    const now = getAudioContext().currentTime + (i * 0.1);

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(freq, now);

                    // 爵士风格的音量包络
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(0.03, now + 0.3);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + chordDuration - 200);

                    oscillator.start(now);
                    oscillator.stop(now + chordDuration);

                    activeOscillators.push(oscillator);

                    // 清理已停止的 oscillator
                    setTimeout(() => {
                        const index = activeOscillators.indexOf(oscillator);
                        if (index > -1) {
                            activeOscillators.splice(index, 1);
                        }
                    }, chordDuration + 100);
                });

                chordIndex = (chordIndex + 1) % jazzChords.length;
            };

            playJazzChord();
            currentBgMusic = setInterval(playJazzChord, chordDuration);
        }

        function playElectronicMusic() {
            if (!ownedSounds.electronic || !soundEnabled) {
                stopBgMusic();
                return;
            }

            // 确保先停止之前的音乐
            stopBgMusic();

            bgMusicPlaying = true;

            // 创建电子舞曲风格的节拍
            const beatDuration = 500; // 每拍 0.5 秒

            const playBeat = () => {
                // 双重检查：确保音乐应该播放
                if (!bgMusicPlaying || !ownedSounds.electronic || !soundEnabled) {
                    stopBgMusic();
                    return;
                }

                const oscillator = getAudioContext().createOscillator();
                const gainNode = getAudioContext().createGain();

                oscillator.connect(gainNode);
                gainNode.connect(getAudioContext().destination);

                const now = getAudioContext().currentTime;

                // 电子低音
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(110, now); // A2

                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                oscillator.start(now);
                oscillator.stop(now + 0.3);

                activeOscillators.push(oscillator);

                // 清理已停止的 oscillator
                setTimeout(() => {
                    const index = activeOscillators.indexOf(oscillator);
                    if (index > -1) {
                        activeOscillators.splice(index, 1);
                    }
                }, 400);
            };

            playBeat();
            currentBgMusic = setInterval(playBeat, beatDuration);
        }

        function stopAllOscillators() {
            // 停止所有活跃的 oscillator
            const now = getAudioContext().currentTime;
            activeOscillators.forEach(osc => {
                try {
                    // 立即停止，不管之前设置的停止时间
                    if (osc && !osc.stopped) {
                        osc.stop(now);
                    }
                } catch (e) {
                    // 忽略已经停止的 oscillator
                }
            });
            activeOscillators = [];
        }

        function stopBgMusic() {
            if (currentBgMusic) {
                clearInterval(currentBgMusic);
                currentBgMusic = null;
            }
            // 多次调用确保完全停止
            stopAllOscillators();
            setTimeout(() => stopAllOscillators(), 10);
            setTimeout(() => stopAllOscillators(), 50);
            bgMusicPlaying = false;
        }

        function playSound(type) {
            if (!soundEnabled) return;

            const oscillator = getAudioContext().createOscillator();
            const gainNode = getAudioContext().createGain();

            oscillator.connect(gainNode);
            gainNode.connect(getAudioContext().destination);

            const now = getAudioContext().currentTime;

            switch(type) {
                case 'shuffle':
                    // 洗牌声 - 快速的高频音
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(800, now);
                    oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                    gainNode.gain.setValueAtTime(0.03, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    oscillator.start(now);
                    oscillator.stop(now + 0.05);
                    break;

                case 'reveal':
                    // 揭示声 - 华丽的和弦
                    playChord([523.25, 659.25, 783.99], 0.3);
                    break;

                case 'legend':
                    // 王牌声 - 震撼的和弦
                    playChord([261.63, 329.63, 392.00, 523.25], 0.8);
                    setTimeout(() => playSweep(523.25, 1046.50, 1.0), 400);
                    break;

                case 'high':
                    // 好运声 - 上升的音调
                    playSweep(440, 880, 0.5);
                    break;

                case 'medium':
                    // 中等运声 - 平稳的音调
                    playSweep(330, 440, 0.4);
                    break;

                case 'low':
                    // 背运声 - 下降的音调
                    playSweep(440, 220, 0.5);
                    break;

                case 'click':
                    // 点击声 - 清脆的音
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(1200, now);
                    gainNode.gain.setValueAtTime(0.05, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    oscillator.start(now);
                    oscillator.stop(now + 0.1);
                    break;
            }
        }

        function playChord(frequencies, duration) {
            frequencies.forEach((freq, index) => {
                const oscillator = getAudioContext().createOscillator();
                const gainNode = getAudioContext().createGain();

                oscillator.connect(gainNode);
                gainNode.connect(getAudioContext().destination);

                const now = getAudioContext().currentTime + (index * 0.05);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, now);
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.08, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

                oscillator.start(now);
                oscillator.stop(now + duration);
            });
        }

        function playSweep(startFreq, endFreq, duration) {
            const oscillator = getAudioContext().createOscillator();
            const gainNode = getAudioContext().createGain();

            oscillator.connect(gainNode);
            gainNode.connect(getAudioContext().destination);

            const now = getAudioContext().currentTime;

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(startFreq, now);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            oscillator.start(now);
            oscillator.stop(now + duration);
        }

        function toggleSound() {
            soundEnabled = !soundEnabled;
            const soundBtn = document.getElementById('soundBtn');
            soundBtn.classList.toggle('muted', !soundEnabled);
            playSound('click');

            // 如果音效关闭，也停止背景音乐
            if (!soundEnabled && bgMusicPlaying) {
                stopBgMusic();
                updateBgmButton();
            }
        }

        function toggleBgMusic() {
            if (bgMusicPlaying) {
                stopBgMusic();
            } else {
                // 根据拥有的音效包选择播放
                if (ownedSounds.jazz) {
                    playJazzMusic();
                } else if (ownedSounds.electronic) {
                    playElectronicMusic();
                } else {
                    showTooltip('请先在商店购买音效包！', 'error', 3500);
                    return;
                }
            }
            updateBgmButton();
        }

        function updateBgmButton() {
            const bgmBtn = document.getElementById('bgmBtn');
            if (ownedSounds.jazz || ownedSounds.electronic) {
                bgmBtn.style.display = 'inline-block';
                bgmBtn.classList.toggle('playing', bgMusicPlaying);
                bgmBtn.textContent = bgMusicPlaying ? '⏸️ 暂停' : '🎵 音乐';
            } else {
                bgmBtn.style.display = 'none';
            }
        }

        function getRandomCard() {
            // 计算稀有率加成 = 连击加成 + 幸运符加成
            const luckyBonus = luckyCharmActive ? 15 : 0;
            const totalRareBonus = comboRareBonus + luckyBonus;

            // 应用稀有率加成
            const adjustedCards = luckCards.map(card => {
                // 根据稀有度计算加成
                let rarityBonus = 1;
                if (card.luck === '传说') {
                    rarityBonus = 1 + (totalRareBonus / 100) * 2; // 传说牌加成翻倍
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
            return luckCards[3]; // fallback
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

        function drawCard() {
            let drawCost = 7;

            // 应用诅咒修饰
            if (fateNextDoubleCost) {
                drawCost *= 2;
                fateNextDoubleCost = false;
            }

            // 应用锁定修饰（免费）
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

            // 扣除筹码
            if (drawCost > 0) {
                chips -= drawCost;
                updateChipDisplay(true, true, -drawCost);
            }

            // 增加连击次数
            addCombo();

            // 确保 AudioContext 已初始化
            if (getAudioContext().state === 'suspended') {
                getAudioContext().resume();
            }

            playSound('click');
            document.getElementById('drawBtn').disabled = true;

            // 切换到牌桌视图
            document.getElementById('cardIdle').style.display = 'none';
            document.getElementById('fateTable').style.display = 'flex';

            // 生成5张牌
            fateCards = generateFateTable();
            renderFateTable();

            // 幸运符效果：排除1张最差的牌（翻面显示但不参与选择）
            if (luckyCharmActive) {
                luckyCharmActive = false;
                // 找到基础奖励最低的牌并自动翻开
                let worstIdx = 0;
                for (let i = 1; i < fateCards.length; i++) {
                    if (fateCards[i].baseReward < fateCards[worstIdx].baseReward) {
                        worstIdx = i;
                    }
                }
                // 延迟翻开最差牌
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

            // 启动牌桌
            fateTableActive = true;
            startFateTimer(5, fateAutoPick);
        }

        function updateCardDisplay(card, isShuffling) {
            const cardElement = document.getElementById('card');
            cardElement.innerHTML = `
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.title}</div>
                <div class="card-desc">${card.desc}</div>
                <div class="card-luck ${card.luckClass}">牌运：${card.luck}</div>
            `;
        }

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

        // 筹码动画相关变量
        let chipAnimationInterval = null;
        let lastChipValue = 100; // 初始值

        /**
         * 显示浮动数字动画
         * @param {number} changeValue - 变化值（正数表示增加，负数表示减少）
         */
        function showFloatingNumber(changeValue) {
            const chipDisplay = document.querySelector('.chip-display');
            if (!chipDisplay) return;

            // 确保 chip-display 是 relative 定位
            chipDisplay.style.position = 'relative';

            // 创建浮动数字元素
            const floatEl = document.createElement('div');
            floatEl.className = 'floating-number';

            // 设置文本和颜色
            const sign = changeValue > 0 ? '+' : '';
            floatEl.textContent = `${sign}${changeValue}`;

            if (changeValue > 0) {
                floatEl.classList.add('floating-positive');
                floatEl.style.color = '#00ff00';
            } else {
                floatEl.classList.add('floating-negative');
                floatEl.style.color = '#ff4444';
            }

            // 设置为 absolute 定位，相对于 chip-display
            floatEl.style.position = 'absolute';
            floatEl.style.right = '10px'; // 在容器右侧 10px
            floatEl.style.top = '50%';
            floatEl.style.transform = 'translateY(-50%)';
            floatEl.style.fontSize = '28px';
            floatEl.style.fontWeight = 'bold';
            floatEl.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8)';
            floatEl.style.pointerEvents = 'none';
            floatEl.style.zIndex = '100';
            floatEl.style.transition = 'all 1s ease-out';
            floatEl.style.opacity = '1';

            // 添加到 chip-display 容器内
            chipDisplay.appendChild(floatEl);

            // 触发动画
            requestAnimationFrame(() => {
                floatEl.style.transform = 'translateY(-80px) translateX(20px) scale(1.5)';
                floatEl.style.opacity = '0';
            });

            // 1 秒后移除元素
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

                // 如果显示浮动数字，立即显示
                if (showFloat && changeValue !== 0) {
                    showFloatingNumber(changeValue);
                }
                return;
            }

            // 清除之前的动画
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

                    // 动画结束后显示浮动数字
                    if (showFloat && diff !== 0) {
                        showFloatingNumber(diff);
                    }
                } else {
                    chipElement.textContent = Math.floor(newValue);
                }
            }, 50);
        }

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

            // 检查是否需要补充筹码
            if (now.getDate() !== lastPayday.getDate()) {
                chips += 50;
                updateChipDisplay();
        if (typeof initSlotReels === "function") initSlotReels();
                lastPayday = now;
                showTooltip('发薪日！获得 50 个筹码！', 'success', 4000);
            }
        }

        // 商店功能
        function openShop() {
            renderShopItems();
            document.getElementById('shopModal').classList.add('active');
        }

        function closeShop() {
            document.getElementById('shopModal').classList.remove('active');
        }

        // 皮肤库功能
        function openSkinLibrary() {
            renderSkinLibrary();
            document.getElementById('skinLibraryModal').classList.add('active');
        }

        function closeSkinLibrary() {
            document.getElementById('skinLibraryModal').classList.remove('active');
        }

        function showSkinTab(tab) {
            currentSkinTab = tab;

            // 更新标签状态
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

            // 更新选中状态
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

        /**
         * 应用皮肤（使用 CSS 变量）
         */
        function applySkin(skinId) {
            const skin = skins[skinId];
            if (!skin) return;

            currentSkin = skinId;
            const root = document.documentElement;

            // 设置 CSS 变量
            root.style.setProperty('--skin-body-bg', skin.bodyBg || 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 40%, #0f0f1a 100%)');
            root.style.setProperty('--skin-container-bg', skin.containerBg || 'rgba(10, 10, 10, 0.85)');
            root.style.setProperty('--skin-border-color', skin.borderColor || 'rgba(255, 215, 0, 0.4)');
            root.style.setProperty('--skin-accent', skin.accentColor || '#ffd700');
            root.style.setProperty('--skin-card-bg', skin.cardBg || 'linear-gradient(145deg, #2a2a4a, #1a1a3a)');
            root.style.setProperty('--skin-button-gradient', skin.buttonGradient || 'linear-gradient(135deg, #ffd700, #ff8c00)');

            // 提取 RGB 值用于 rgba() 函数
            const rgbMatch = (skin.accentColor || '#ffd700').match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1], 16);
                const g = parseInt(rgbMatch[2], 16);
                const b = parseInt(rgbMatch[3], 16);
                root.style.setProperty('--skin-accent-rgb', `${r}, ${g}, ${b}`);
                root.style.setProperty('--skin-glow', `rgba(${r}, ${g}, ${b}, 0.1)`);
            }

            // 启动对应的特效
            startEffectForSkin(skinId);
        }

        function filterShopCategory(category) {
            currentShopCategory = category;

            // 更新按钮状态
            document.querySelectorAll('.shop-category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // 更新分类标题
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

            // 根据分类过滤商品
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
            // 根据物品类型返回图标
            if (item.type === 'skin') {
                return '🎨';
            } else if (item.type === 'sound') {
                return '🎵';
            } else if (item.id === 'accelerate') {
                return '⚡';
            } else if (item.id === 'xray') {
                return '🔮';
            }
            return '🎁';
        }

        function getShopName(item) {
            // 返回简短名称（只保留核心名称，去掉前缀图标）
            let name = item.name;

            // 移除开头的 emoji 图标（使用更可靠的方法）
            if (name.startsWith('🎨 ')) name = name.substring(3);
            else if (name.startsWith('🎵 ')) name = name.substring(3);
            else if (name.startsWith('⚡ ')) name = name.substring(3);
            else if (name.startsWith('🔮 ')) name = name.substring(3);
            else {
                // 尝试移除第一个字符（如果是 emoji）
                name = name.substring(1).trim();
            }

            // 进一步简化名称
            if (name.includes('・')) {
                name = name.split('・')[0].trim();
            }
            if (name.includes('音效包')) {
                name = name.replace('音效包', '').trim();
            }
            if (name.includes('卡 x3')) {
                name = '加速卡';
            }
            if (name.includes('x3')) {
                name = name.replace('x3', '').trim();
            }

            // 确保返回非空字符串
            return name || item.name;
        }

        // 道具购买数量管理
        const itemQuantities = {};

        function openQuantitySelector(itemId) {
            // 初始化数量为 1
            if (!itemQuantities[itemId]) {
                itemQuantities[itemId] = 1;
            }
            // 更新显示
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

            // 限制数量范围 1-99
            if (itemQuantities[itemId] < 1) itemQuantities[itemId] = 1;
            if (itemQuantities[itemId] > 99) itemQuantities[itemId] = 99;

            // 更新显示
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

            // 道具类商品使用传入的数量，其他商品数量为 1
            const buyQuantity = item.type === 'consumable' ? quantity : 1;
            const totalPrice = item.price * buyQuantity;

            if (chips < totalPrice) {
                showTooltip('筹码不足！', 'error', 3000);
                return;
            }

            chips -= totalPrice;
            updateChipDisplay();

            if (item.type === 'consumable') {
                // 道具加入库存，而非立即生效
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
    
        /**
         * 使用仓库中的道具
         * @param {string} itemId - 道具ID
         */
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
    
            // 根据道具ID应用效果
            if (itemId === 'accelerate') {
                accelerateCount += item.count || 1;
                showTooltip(`使用了 ${item.name || '加速卡'}，下次抽卡动画加速！`, 'success', 3000);
            } else if (itemId === 'xray') {
                xrayActive = true;
                showTooltip(`使用了 ${item.name || '透视眼镜'}，下次抽卡将显示概率分布！`, 'info', 4000);
                setTimeout(() => { xrayActive = false; }, 15000);
            } else if (itemId === 'lucky-charm') {
                // 幸运符：本次抽卡稀有率 +15%
                luckyCharmActive = true;
                showTooltip(`使用了 ${item.name || '幸运符'}，下次抽卡稀有率 +15%！`, 'success', 3000);
            }
    
            saveData();
            renderInventoryItems();
        }
    
        /**
         * 渲染「我的物品」列表
         */
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
    
            // 更新仓库入口按钮上的数量角标
            updateInventoryBadge();
        }
    
        /**
         * 更新仓库按钮上的数量角标
         */
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
    
        /**
         * 打开「我的物品」弹窗
         */
        function openInventory() {
            renderInventoryItems();
            document.getElementById('inventoryModal').classList.add('active');
        }
    
        /**
         * 关闭「我的物品」弹窗
         */
        function closeInventory() {
            document.getElementById('inventoryModal').classList.remove('active');
        }
    
        // 数据保存功能 - 已迁移到 GameState.save()

        // 数据加载功能 - 已迁移到 GameState.load()

        // 初始化显示（基础 UI，数据将在登录后从云端加载）
        updateHistoryDisplay();
        updateChipDisplay(false); // 初始化时不播放动画
        updatePaydayTimer();
        updateBgmButton();

        // 初始化特效 Canvas
        initEffectCanvas();

        applySkin(currentSkin); // 应用保存的皮肤或默认皮肤

        // 初始化成就系统
        checkAchievements(); // 初始化成就进度

        // 新手礼包逻辑已移至 loadCloudData() 中处理
        // 首次注册的新用户将在云端无数据时获得新手礼包

        setInterval(updatePaydayTimer, 1000);

        // 初始化多元化筹码获取系统
        updateMiningButton();
        setInterval(updateMiningButton, 60000); // 每分钟更新挖矿按钮

        // 检查每日任务是否需要重置
        function checkDailyReset() {
            const today = new Date().toDateString();
            if (lastCheckInDate !== today) {
                // 重置每日任务
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
        checkDailyReset();

        // 每分钟检查轮盘冷却
                
        // 定期自动保存
        setInterval(saveData, 30000); // 每 30 秒自动保存

        // 在关键操作后保存
        const originalBuyItem = buyItem;
        buyItem = function(itemId) {
            originalBuyItem(itemId);
            setTimeout(saveData, 500);
        };

        const originalEquipSelectedSkin = equipSelectedSkin;
        equipSelectedSkin = function() {
            originalEquipSelectedSkin();
            setTimeout(saveData, 500);
        };

        // ==================== 成就系统函数 ====================

        /**
         * 检查并解锁成就
         * @param {string} achievementId - 成就 ID
         */
        function unlockAchievement(achievementId) {
            const achievement = achievements[achievementId];
            if (!achievement || achievement.unlocked) return;

            achievement.unlocked = true;

            // 显示解锁提示
            showTooltip(`🏆 成就解锁：${achievement.name}！`, 'success', 4000);

            // 播放解锁音效
            playUnlockSound();

            saveData();
        }

        /**
         * 检查所有成就条件（已删除，避免重复定义覆盖主函数）
         * 注意：主 checkAchievements() 函数在第 2425 行定义，会正确更新进度
         */

        /**
         * 更新连续高运计数
         * @param {string} luck - 运气等级
         */
        function updateConsecutiveHighLuck(luck) {
            if (luck === '高运' || luck === '终极王牌') {
                consecutiveHighLuck++;
            } else {
                consecutiveHighLuck = 0;
            }
        }

        /**
         * 播放解锁音效
         */
        function playUnlockSound() {
            try {
                const oscillator = getAudioContext().createOscillator();
                const gainNode = getAudioContext().createGain();

                oscillator.connect(gainNode);
                gainNode.connect(getAudioContext().destination);

                oscillator.frequency.value = 523.25; // C5
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, getAudioContext().currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, getAudioContext().currentTime + 0.5);

                oscillator.start(getAudioContext().currentTime);
                oscillator.stop(getAudioContext().currentTime + 0.5);
            } catch (e) {
                console.error('音效播放失败:', e);
            }
        }

        /**
         * 打开成就弹窗
         */
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

            // 更新统计
            document.getElementById('achievedCount').textContent = unlockedCount;
            document.getElementById('totalCount').textContent = Object.keys(achievements).length;
            const progressPercent = Math.floor((unlockedCount / Object.keys(achievements).length) * 100);
            document.getElementById('achievementProgress').textContent = progressPercent + '%';

            // 显示弹窗
            document.getElementById('achievementModal').classList.add('active');
        }
    
        /**
         * 关闭成就弹窗
         */
        function closeAchievements() {
            document.getElementById('achievementModal').classList.remove('active');
        }
    
        // 全局函数（供HTML中的onclick调用）
        window.drawCard = drawCard;
        window.handleFateCardClick = handleFateCardClick;
        window.openSlotMachine = openSlotMachine;
        window.closeSlotMachine = closeSlotMachine;
        window.spinSlotMachine = spinSlotMachine;
        window.initSlotReels = initSlotReels;

        window.closeAchievements = closeAchievements;
        window.openInventory = openInventory;
        window.closeInventory = closeInventory;
        window.useItem = useItem;
    
        // ==================== Supabase 认证（强制登录，云端主存储） ====================
        let isAuthMode = 'login'; // 'login' | 'register'
        let currentUser = null;   // 当前登录用户
        let isSaving = false;     // 防止并发保存
        let currentSessionId = null;    // 当前会话ID（单点登录踢人机制）
        let sessionPollingTimer = null; // 会话轮询定时器
        const SESSION_POLL_INTERVAL = 30000; // 30秒轮询一次
    
        /**
         * 处理顶部认证按钮点击（已登录时显示用户信息）
         */
        function handleAuthBtnClick() {
            if (currentUser) {
                showLoggedInPanel();
                document.getElementById('authModal').classList.add('active');
            }
        }
    
        /**
         * 切换登录/注册模式
         */
        function toggleAuthMode() {
            if (isAuthMode === 'login') {
                isAuthMode = 'register';
                document.getElementById('authModalTitle').textContent = '📝 注册';
                document.getElementById('authSubmitBtn').textContent = '注册';
                document.getElementById('authSwitchText').textContent = '已有账号？';
                document.getElementById('authSwitchLink').textContent = '去登录';
            } else {
                isAuthMode = 'login';
                document.getElementById('authModalTitle').textContent = '🎰 皮尔卡松的牌运预测';
                document.getElementById('authSubmitBtn').textContent = '登录';
                document.getElementById('authSwitchText').textContent = '没有账号？';
                document.getElementById('authSwitchLink').textContent = '注册新账号';
            }
        }
    
        /**
         * 提交登录/注册
         */
        async function submitAuth() {
            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value;
    
            if (!email || !password) {
                showTooltip('请填写邮箱和密码！', 'error', 3000);
                return;
            }
    
            if (password.length < 6) {
                showTooltip('密码至少6位！', 'error', 3000);
                return;
            }
    
            const btn = document.getElementById('authSubmitBtn');
            btn.disabled = true;
            btn.textContent = isAuthMode === 'login' ? '登录中...' : '注册中...';
    
            try {
                let result;
                if (isAuthMode === 'login') {
                    result = await supabaseClient.auth.signInWithPassword({ email, password });
                } else {
                    result = await supabaseClient.auth.signUp({ email, password });
                }
    
                if (result.error) {
                    let msg = result.error.message;
                    if (msg.includes('Invalid login credentials')) msg = '邮箱或密码错误';
                    if (msg.includes('User already registered')) msg = '该邮箱已注册，请直接登录';
                    if (msg.includes('Email not confirmed')) msg = '注册成功！请查收邮箱验证后登录';
                    showTooltip(msg, 'error', 4000);
                    btn.disabled = false;
                    btn.textContent = isAuthMode === 'login' ? '登录' : '注册';
                    return;
                }
    
                currentUser = result.data.user;
                updateAuthButton();

                // 注册当前会话（单点登录：覆盖其他设备的会话）
                await registerSession();

                // 登录成功：从云端加载数据
                const cloudLoaded = await loadCloudData();
                if (!cloudLoaded) {
                    // 云端无数据 → 新用户，给新手礼包
                    totalChipsEarned = 100;
                    inventory['accelerate'] = { count: 3, name: '⚡ 加速卡 x3', desc: '下次抽卡动画速度翻倍', icon: '⚡', item: shopItems.find(i => i.id === 'accelerate') || { id: 'accelerate', count: 3 } };
                    inventory['lucky-charm'] = { count: 1, name: '🍀 幸运符', desc: '下次抽卡稀有率 +15%', icon: '🍀', item: shopItems.find(i => i.id === 'lucky-charm') || { id: 'lucky-charm', count: 1 } };
                    saveData(); // 保存默认数据+新手礼包到云端
                    setTimeout(() => showTooltip('🎁 新手礼包已到账：加速卡×3、幸运符×1！', 'success', 5000), 500);
                }
    
                // 关闭登录弹窗，进入游戏
                document.getElementById('authModal').classList.remove('active');
                showTooltip(isAuthMode === 'login' ? '🎉 登录成功！' : '🎉 注册成功！', 'success', 3000);
            } catch (err) {
                console.error('认证错误:', err);
                showTooltip('网络错误，请重试', 'error', 3000);
            }
    
            btn.disabled = false;
            btn.textContent = isAuthMode === 'login' ? '登录' : '注册';
        }
    
        /**
         * 退出登录：清空本地数据，回到登录界面
         */
        async function handleLogout() {
            // 清理会话记录（单点登录）
            await clearSession();

            try {
                await supabaseClient.auth.signOut();
            } catch (e) {
                console.error('登出错误:', e);
            }
            currentUser = null;
    
            // 清空本地缓存数据
            localStorage.removeItem(GameState.STORAGE_KEY);
            localStorage.removeItem('pierresCasinoLastSave');
    
            // 重置所有游戏变量为默认值
            resetGameToDefaults();
    
            // 显示登录弹窗
            showLoginForm();
            document.getElementById('authModal').classList.add('active');
            updateAuthButton();
            showTooltip('已退出登录', 'info', 3000);

            // 退出登录后隐藏关闭按钮
            document.getElementById('authCloseBtn').style.display = 'none';
        }

        /**
         * 关闭认证弹窗（仅已登录时可关闭）
         */
        function closeAuthModal() {
            if (currentUser) {
                document.getElementById('authModal').classList.remove('active');
            }
        }

        /**
         * 退出登录确认
         */
        function confirmLogout() {
            document.getElementById('authLoggedIn').style.display = 'none';
            document.getElementById('authLogoutConfirm').style.display = 'block';
        }

        /**
         * 取消退出登录
         */
        function cancelLogout() {
            document.getElementById('authLogoutConfirm').style.display = 'none';
            document.getElementById('authLoggedIn').style.display = 'block';
        }
    
        /**
         * 重置游戏变量为默认值（登出时使用）
         */
        function resetGameToDefaults() {
            chips = 100;
            history = [];
            ownedSounds = { jazz: false, electronic: false };
            ownedSkins = {};
            currentSkin = 'default';
            accelerateCount = 0;
            lastPayday = new Date();
            consecutiveHighLuck = 0;
            totalDraws = 0;
            totalChipsEarned = 0;
            skinsCollected = 0;
            inventory = {};
            dailyTasks = {
                checkIn: { done: false, reward: 10, name: '每日签到', desc: '首次打开游戏' },
                draw5: { done: false, reward: 20, name: '抽卡达人', desc: '抽卡 5 次', count: 0, target: 5 },
                legend: { done: false, reward: 30, name: '传说猎手', desc: '抽到传说牌' },
                combo5: { done: false, reward: 25, name: '连击大师', desc: '达成 5 连击' }
            };
            lastCheckInDate = '';
            miningStart = Date.now();
            sharedCount = 0;
            dailyChallenges = {
                speed: { used: 0, max: 3, name: '速抽挑战', desc: '10 秒内抽 3 次' },
                accuracy: { used: 0, max: 3, name: '精准挑战', desc: '连续 3 次中运以上' },
                combo: { used: 0, max: 3, name: '连击挑战', desc: '单次达成 10 连击' }
            };
            chestKeys = 0;
            consecutiveDraws = 0;
            comboLevel = 0;
            comboMultiplier = 1;
            comboRareBonus = 0;
            luckyCharmActive = false;
    
            // 重置成就
            Object.keys(achievements).forEach(key => {
                achievements[key].unlocked = false;
                if (achievements[key].progress !== undefined) achievements[key].progress = 0;
                if (achievements[key].streak !== undefined) achievements[key].streak = 0;
            });
    
            // 重置商店物品状态
            shopItems.forEach(item => {
                if (item.type !== 'consumable') item.owned = false;
            });
    
            // 重置皮肤
            Object.keys(skins).forEach(skinId => {
                if (skinId !== 'default') skins[skinId].locked = true;
            });
    
            // 刷新 UI
            updateChipDisplay(false);
            updateHistoryDisplay();
            applySkin('default');
            updateMiningButton();
            updateInventoryBadge();
            document.getElementById('chipCount').textContent = '100';
        }
    
        /**
         * 更新顶部认证按钮状态
         */
        function updateAuthButton() {
            const btn = document.getElementById('authBtn');
            if (!btn) return;
            if (currentUser) {
                btn.textContent = '👤';
                btn.title = currentUser.email;
                btn.classList.add('auth-btn-logged-in');
            } else {
                btn.textContent = '👤';
                btn.title = '请先登录';
                btn.classList.remove('auth-btn-logged-in');
            }
        }
    
        /**
         * 显示登录表单
         */
        function showLoginForm() {
            isAuthMode = 'login';
            document.getElementById('authModalTitle').textContent = '🎰 皮尔卡松的牌运预测';
            document.getElementById('authSubmitBtn').textContent = '登录';
            document.getElementById('authSwitchText').textContent = '没有账号？';
            document.getElementById('authSwitchLink').textContent = '注册新账号';
            document.getElementById('authForm').style.display = 'block';
            document.getElementById('authLoggedIn').style.display = 'none';
            document.getElementById('authLogoutConfirm').style.display = 'none';
            document.getElementById('authCloseBtn').style.display = 'none';
        }
    
        /**
         * 显示已登录面板
         */
        function showLoggedInPanel() {
            document.getElementById('authForm').style.display = 'none';
            document.getElementById('authLoggedIn').style.display = 'block';
            document.getElementById('authLogoutConfirm').style.display = 'none';
            document.getElementById('authCloseBtn').style.display = 'block';
            document.getElementById('authUserEmail').textContent = currentUser.email;
        }
    
        // ==================== 单点登录（踢人机制） ====================
    
        /**
         * 注册当前会话到云端（登录成功后调用）
         * 每次登录生成唯一 sessionId，写入 user_sessions 表
         * 其他设备登录同一账号时，sessionId 被覆盖，旧设备轮询时检测到不匹配即被踢
         */
        async function registerSession() {
            if (!currentUser) return;
            const sessionId = crypto.randomUUID();
            currentSessionId = sessionId;
    
            try {
                const { error } = await supabaseClient
                    .from('user_sessions')
                    .upsert({
                        user_id: currentUser.id,
                        session_id: sessionId,
                        device_info: navigator.userAgent.substring(0, 200),
                        created_at: new Date().toISOString()
                    });
    
                if (error) {
                    console.error('注册会话失败:', error);
                }
    
                // 启动会话轮询
                startSessionPolling();
            } catch (err) {
                console.error('注册会话异常:', err);
            }
        }
    
        /**
         * 启动会话有效性轮询
         */
        function startSessionPolling() {
            stopSessionPolling();
            sessionPollingTimer = setInterval(checkSessionValidity, SESSION_POLL_INTERVAL);
        }
    
        /**
         * 停止会话轮询
         */
        function stopSessionPolling() {
            if (sessionPollingTimer) {
                clearInterval(sessionPollingTimer);
                sessionPollingTimer = null;
            }
        }
    
        /**
         * 检查当前会话是否仍为最新（是否被其他设备踢出）
         */
        async function checkSessionValidity() {
            if (!currentUser || !currentSessionId) return;
    
            try {
                const { data, error } = await supabaseClient
                    .from('user_sessions')
                    .select('session_id')
                    .eq('user_id', currentUser.id)
                    .single();
    
                if (error) {
                    console.error('检查会话失败:', error);
                    return;
                }
    
                if (data && data.session_id !== currentSessionId) {
                    // 会话已被其他设备覆盖 → 强制下线
                    await forceKickout();
                }
            } catch (err) {
                console.error('会话检查异常:', err);
            }
        }
    
        /**
         * 被踢下线：清空数据、退出登录、显示提示
         */
        async function forceKickout() {
            stopSessionPolling();
            currentSessionId = null;
    
            // 清空本地数据
            localStorage.removeItem(GameState.STORAGE_KEY);
            localStorage.removeItem('pierresCasinoLastSave');
            resetGameToDefaults();
    
            // 退出 Supabase 会话
            try {
                await supabaseClient.auth.signOut();
            } catch (e) {
                console.error('踢出登出错误:', e);
            }
    
            currentUser = null;
            showLoginForm();
            document.getElementById('authModal').classList.add('active');
            updateAuthButton();
    
            // 显示被踢提示
            showTooltip('⚠️ 您的账号已在其他设备登录，您已被强制下线', 'error', 6000);
        }
    
        /**
         * 清理会话记录（主动退出登录时调用）
         */
        async function clearSession() {
            if (!currentUser) return;
            stopSessionPolling();
            currentSessionId = null;
    
            try {
                await supabaseClient
                    .from('user_sessions')
                    .delete()
                    .eq('user_id', currentUser.id);
            } catch (err) {
                console.error('清理会话失败:', err);
            }
        }
    
        // ==================== 云端数据存取 ====================
    
        /**
         * 从云端加载数据（登录后的唯一数据源）
         * @returns {boolean} 是否成功加载到云端数据
         */
        async function loadCloudData() {
            if (!currentUser) return false;
    
            try {
                const { data, error } = await supabaseClient
                    .from('game_data')
                    .select('data')
                    .eq('user_id', currentUser.id)
                    .single();
    
                if (error && error.code !== 'PGRST116') {
                    console.error('云端数据读取失败:', error);
                    return false;
                }
    
                if (data && data.data) {
                    // 写入 localStorage 缓存，然后通过 GameState.load() 加载到内存
                    localStorage.setItem(GameState.STORAGE_KEY, JSON.stringify(data.data));
                    GameState.load();
    
                    // 刷新 UI
                    updateChipDisplay(false);
                    updateHistoryDisplay();
                    updateBgmButton();
                    applySkin(currentSkin);
                    checkAchievements();
                    updateMiningButton();
                                        if (Object.keys(inventory).length > 0) {
                        updateInventoryBadge();
                    }
                    return true;
                }
    
                // 云端无数据
                return false;
            } catch (err) {
                console.error('加载云端数据错误:', err);
                return false;
            }
        }
    
        /**
         * 将数据保存到云端（每次 saveData 时自动调用）
         */
        async function saveToCloud() {
            if (!currentUser || isSaving) return;
            isSaving = true;
    
            try {
                // 读取 localStorage 中的最新数据
                const saved = localStorage.getItem(GameState.STORAGE_KEY);
                const gameData = saved ? JSON.parse(saved) : {};
    
                // 查询云端是否已有记录
                const { data: existing } = await supabaseClient
                    .from('game_data')
                    .select('id')
                    .eq('user_id', currentUser.id)
                    .single();
    
                if (existing) {
                    // 更新
                    const { error } = await supabaseClient
                        .from('game_data')
                        .update({ data: gameData })
                        .eq('user_id', currentUser.id);
                    if (error) throw error;
                } else {
                    // 插入
                    const { error } = await supabaseClient
                        .from('game_data')
                        .insert({ user_id: currentUser.id, data: gameData });
                    if (error) throw error;
                }
            } catch (err) {
                console.error('保存到云端失败:', err);
            } finally {
                isSaving = false;
            }
        }
    
        /**
         * 猴子补丁 saveData：先写本地缓存，再异步写云端
         */
        const _originalSaveData = saveData;
        saveData = function() {
            _originalSaveData();
            // 异步保存到云端（不阻塞游戏）
            if (currentUser && !isSaving) {
                saveToCloud().catch(err => console.error('自动云端保存失败:', err));
            }
        };
    
        /**
         * 初始化：检查 Supabase 是否已有登录会话
         */
        (async function initAuth() {
            try {
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (session && session.user) {
                    currentUser = session.user;
                    updateAuthButton();

                    // 恢复会话：注册当前设备（单点登录）
                    await registerSession();

                    // 从云端加载数据
                    const loaded = await loadCloudData();
                    if (!loaded) {
                        // 云端无数据 → 新用户，给新手礼包并保存
                        totalChipsEarned = 100;
                        inventory['accelerate'] = { count: 3, name: '⚡ 加速卡 x3', desc: '下次抽卡动画速度翻倍', icon: '⚡', item: shopItems.find(i => i.id === 'accelerate') || { id: 'accelerate', count: 3 } };
                        inventory['lucky-charm'] = { count: 1, name: '🍀 幸运符', desc: '下次抽卡稀有率 +15%', icon: '🍀', item: shopItems.find(i => i.id === 'lucky-charm') || { id: 'lucky-charm', count: 1 } };
                        saveData();
                    }
                    // 关闭登录弹窗
                    document.getElementById('authModal').classList.remove('active');
                } else {
                    // 未登录 → 显示登录弹窗（阻止游戏）
                    showLoginForm();
                    document.getElementById('authModal').classList.add('active');
                }
            } catch (err) {
                console.error('初始化认证失败:', err);
                // 出错也显示登录
                showLoginForm();
                document.getElementById('authModal').classList.add('active');
            }
        })();
    
        // 监听认证状态变化
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                updateAuthButton();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                stopSessionPolling();
                currentSessionId = null;
                resetGameToDefaults();
                showLoginForm();
                document.getElementById('authModal').classList.add('active');
                updateAuthButton();
            }
        });
    
        // 暴露认证相关全局函数
        window.handleAuthBtnClick = handleAuthBtnClick;
        window.toggleAuthMode = toggleAuthMode;
        window.submitAuth = submitAuth;
        window.handleLogout = handleLogout;
        window.closeAuthModal = closeAuthModal;
        window.confirmLogout = confirmLogout;
        window.cancelLogout = cancelLogout;
