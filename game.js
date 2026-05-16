        // ==================== 游戏数据 ====================
        const luckCards = [
            {
                icon: '🎭',
                title: '终极王牌・皮尔卡松',
                desc: '拥有大佬级排面，出场即可气场碾压，掌控牌局节奏。',
                luck: '传说',
                luckClass: 'luck-legend',
                probability: 1.5,
                reward: 50
            },
            {
                icon: '🍀',
                title: '天选之子',
                desc: '今日运势如虹，万事顺遂。任何挑战都将成为你晋升的阶梯。',
                luck: '极高',
                luckClass: 'luck-high',
                probability: 5,
                reward: 20
            },
            {
                icon: '🚀',
                title: '势如破竹',
                desc: '机遇降临，把握时机。你的决策将带来意想不到的收获。',
                luck: '高',
                luckClass: 'luck-high',
                probability: 15,
                reward: 20
            },
            {
                icon: '⚡',
                title: '稳中求胜',
                desc: '保持冷静，步步为营。今天的你比任何时候都更加敏锐。',
                luck: '中上',
                luckClass: 'luck-medium',
                probability: 25,
                reward: 8
            },
            {
                icon: '🎯',
                title: '精准出击',
                desc: '目标明确，行动果断。小风险可能带来大回报。',
                luck: '中等',
                luckClass: 'luck-medium',
                probability: 30,
                reward: 8
            },
            {
                icon: '🛡️',
                title: '防守反击',
                desc: '谨慎行事，避免冲动。等待更好的时机再出手。',
                luck: '中下',
                luckClass: 'luck-medium',
                probability: 15,
                reward: 8
            },
            {
                icon: '⚠️',
                title: '小心陷阱',
                desc: '今日需谨慎，有人可能在暗处设局。保持警惕。',
                luck: '低',
                luckClass: 'luck-low',
                probability: 8,
                reward: 3
            },
            {
                icon: '💀',
                title: '背运缠身',
                desc: '今天不是好日子，建议低调行事，避免重大决策。',
                luck: '极低',
                luckClass: 'luck-low',
                probability: 2,
                reward: 3
            }
        ];

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
                    lastWheelTime: 0,
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
                    lastWheelTime: lastWheelTime,
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
                    lastWheelTime = data.lastWheelTime || 0;
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
        const COMBO_TIMEOUT = 5000; // 5 秒内未抽卡则中断连击

        // ==================== 多元化筹码获取系统 ====================

        // --- 每日任务系统 ---
        let dailyTasks = {
            checkIn: { done: false, reward: 10, name: '每日签到', desc: '首次打开游戏' },
            draw5: { done: false, reward: 20, name: '抽卡达人', desc: '抽卡 5 次', count: 0, target: 5 },
            legend: { done: false, reward: 30, name: '传说猎手', desc: '抽到传说牌' },
            combo5: { done: false, reward: 25, name: '连击大师', desc: '达成 5 连击' }
        };
        let lastCheckInDate = '';

        // --- 幸运轮盘 ---
        let lastWheelTime = 0;
        const WHEEL_COOLDOWN = 6 * 60 * 60 * 1000; // 6 小时

        // --- 挖矿模式 ---
        let miningStart = Date.now();
        let miningRate = 5; // 每小时 5 筹码
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
                comboMultiplier = 3;
                comboRareBonus = 100; // 稀有率 +100%
            } else if (consecutiveDraws >= 5) {
                comboLevel = 2; // 大暴击
                comboMultiplier = 2;
                comboRareBonus = 50; // 稀有率 +50%
            } else if (consecutiveDraws >= 3) {
                comboLevel = 1; // 小暴击
                comboMultiplier = 1.5;
                comboRareBonus = 25; // 稀有率 +25%
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
        function spinWheel() {
            const now = Date.now();
            const cooldownRemaining = lastWheelTime + WHEEL_COOLDOWN - now;

            if (cooldownRemaining > 0) {
                const minutes = Math.ceil(cooldownRemaining / (1000 * 60));
                showTooltip(`轮盘冷却中，还有 ${minutes} 分钟`, 'error', 3000);
                return;
            }

            // 更新冷却时间显示
            document.getElementById('wheelCooldownText').textContent = '6 小时';

            // 重置轮盘角度
            document.getElementById('wheel').style.transform = 'rotate(0deg)';
            document.getElementById('wheelSpinBtn').disabled = false;

            // 打开弹窗
            document.getElementById('wheelModal').classList.add('active');
        }

        /**
         * 关闭轮盘弹窗
         */
        function closeWheelModal() {
            document.getElementById('wheelModal').classList.remove('active');
        }

        /**
         * 开始旋转轮盘
         */
        function startWheelSpin() {
            const wheel = document.getElementById('wheel');
            const spinBtn = document.getElementById('wheelSpinBtn');
            const pointer = document.querySelector('.wheel-pointer');

            // 禁用按钮
            spinBtn.disabled = true;
            spinBtn.textContent = '🎰 旋转中...';

            // 添加旋转动画效果
            wheel.classList.add('spinning');
            pointer.classList.add('bouncing');

            // 计算随机旋转角度（至少旋转 5 圈，最多 10 圈）
            const minRotations = 5;
            const maxRotations = 10;
            const randomRotations = minRotations + Math.random() * (maxRotations - minRotations);
            const finalAngle = randomRotations * 360 + Math.random() * 360;

            // 旋转轮盘
            wheel.style.transform = `rotate(${finalAngle}deg)`;

            // 旋转结束后移除动画效果
            setTimeout(() => {
                wheel.classList.remove('spinning');
                pointer.classList.remove('bouncing');
            }, 3800);

            // 4 秒后停止并显示结果
            setTimeout(() => {
                // 计算最终角度（0-360）
                const actualAngle = finalAngle % 360;

                // 根据角度计算奖励（8 个扇区，每个 45 度）
                const segmentAngle = 360 / 8;
                const segmentIndex = Math.floor((360 - actualAngle + segmentAngle / 2) % 360 / segmentAngle);

                // 奖励定义
                const rewards = [
                    { type: 'chips', value: 10, text: '10 筹码' },
                    { type: 'chips', value: 20, text: '20 筹码' },
                    { type: 'chips', value: 30, text: '30 筹码' },
                    { type: 'chips', value: 50, text: '50 筹码' },
                    { type: 'chips', value: 80, text: '80 筹码' },
                    { type: 'chips', value: 100, text: '100 筹码' },
                    { type: 'accelerate', value: 1, text: '加速卡 x1' },
                    { type: 'free', value: 1, text: '免费抽卡' }
                ];

                const reward = rewards[segmentIndex];

                // 发放奖励（显示 +X 浮动动画）
                if (reward.type === 'chips') {
                    chips += reward.value;
                    updateChipDisplay(true, true, reward.value);
                    showTooltip(`🎡 幸运轮盘：获得 ${reward.value} 筹码！`, 'success', 3000);
                } else if (reward.type === 'accelerate') {
                    accelerateCount += 1;
                    showTooltip(`🎉 幸运轮盘：获得 加速卡 x1！`, 'success', 3000);
                } else if (reward.type === 'free') {
                    showTooltip(`🎉 幸运轮盘：获得 免费抽卡券！`, 'success', 3000);
                    // 这里可以添加免费抽卡逻辑
                }

                // 设置冷却时间
                lastWheelTime = Date.now();
                saveData();

                // 更新冷却显示
                document.getElementById('wheelCooldownText').textContent = '冷却中 (6 小时)';

                // 2 秒后关闭弹窗
                setTimeout(() => {
                    closeWheelModal();
                    spinBtn.textContent = '🎰 开始转动';
                }, 2000);
            }, 4000);
        }

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

        // ==================== 特效系统 ====================

        // 初始化特效 Canvas
        function initEffectCanvas() {
            effectCanvas = document.getElementById('effectCanvas');
            effectCtx = effectCanvas.getContext('2d');
            resizeEffectCanvas();
            window.addEventListener('resize', resizeEffectCanvas);
        }

        function resizeEffectCanvas() {
            if (effectCanvas) {
                effectCanvas.width = window.innerWidth;
                effectCanvas.height = window.innerHeight;
            }
        }

        // 停止当前特效
        function stopEffect() {
            if (effectAnimationId) {
                cancelAnimationFrame(effectAnimationId);
                effectAnimationId = null;
            }
            effectParticles = [];
            if (effectCtx) {
                effectCtx.clearRect(0, 0, effectCanvas.width, effectCanvas.height);
            }
        }

        // ==================== 特效系统函数结束 ====================

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

        function drawCard() {
            const drawCost = 5;

            if (chips < drawCost) {
                showTooltip('筹码不足！请等待发薪日补充筹码。', 'error', 3500);
                return;
            }

            if (isShuffling) return;
            isShuffling = true;

            // 扣除筹码（显示 -5 浮动动画）
            const oldChips = chips;
            chips -= drawCost;
            updateChipDisplay(true, true, -drawCost);

            // 增加连击次数
            addCombo();

            const cardElement = document.getElementById('card');
            const drawBtn = document.getElementById('drawBtn');

            // 确保 AudioContext 已初始化（浏览器需要用户交互后才能播放音频）
            if (getAudioContext().state === 'suspended') {
                getAudioContext().resume();
            }

            playSound('click');
            drawBtn.disabled = true;
            cardElement.classList.add('shuffling');

            // 检查是否使用加速卡
            const shuffleIntervalTime = accelerateCount > 0 ? 75 : 150;
            if (accelerateCount > 0) {
                accelerateCount--;
                updateShopItems();
            }

            let shuffleCount = 0;
            const maxShuffles = 20;
            const shuffleInterval = setInterval(() => {
                const tempCard = luckCards[Math.floor(Math.random() * luckCards.length)];
                updateCardDisplay(tempCard, true);
                shuffleCount++;

                // 播放洗牌音效
                if (shuffleCount % 2 === 0) {
                    playSound('shuffle');
                }

                if (shuffleCount >= maxShuffles) {
                    clearInterval(shuffleInterval);
                    const finalCard = getRandomCard();
                    updateCardDisplay(finalCard, false);
                    cardElement.classList.remove('shuffling');

                    // 播放揭示音效
                    playSound('reveal');

                    // 根据牌运播放不同音效
                    setTimeout(() => {
                        if (finalCard.luckClass === 'luck-legend') {
                            playSound('legend');
                        } else if (finalCard.luckClass === 'luck-high') {
                            playSound('high');
                        } else if (finalCard.luckClass === 'luck-medium') {
                            playSound('medium');
                        } else {
                            playSound('low');
                        }
                    }, 300);

                    // 奖励筹码（应用连抽倍数，显示 +X 浮动动画）
                    const finalReward = Math.floor(finalCard.reward * comboMultiplier);
                    chips += finalReward;
                    totalChipsEarned += finalReward;
                    updateChipDisplay(true, true, finalReward);

                    // 显示奖励提示（如果有连击加成）
                    if (comboMultiplier > 1) {
                        showTooltip(`连击奖励：${finalCard.reward} × ${comboMultiplier} = ${finalReward}筹码！`, 'success', 3500);
                    }

                    // 更新抽卡统计
                    totalDraws++;

                    // 检查传说王牌
                    if (finalCard.luck === '终极王牌') {
                        unlockLegendHunter();
                    }

                    // 更新连续高运次数
                    updateConsecutiveHighLuck(finalCard.luck);

                    // 检查所有成就
                    checkAchievements();

                    drawBtn.disabled = false;

                    addToHistory(finalCard);
                    isShuffling = false;

                    // 重置一次性道具效果（幸运符、透视眼镜均为一次性）
                    if (luckyCharmActive) {
                        luckyCharmActive = false;
                    }
                    // xrayActive 由 setTimeout 自动重置

                    // 抽卡完全结束后保存数据
                    saveData();

                    // 2 秒后自动重置卡片
                    setTimeout(() => {
                        const cardElement = document.getElementById('card');
                        cardElement.innerHTML = `
                            <div class="card-icon">🎴</div>
                            <div class="card-title">准备就绪</div>
                            <div class="card-desc">点击按钮抽取你的今日牌运<br><span style="color: #ffd700; font-size: 0.85em;">消耗：5 筹码</span></div>
                        `;
                    }, 2000);
                }
            }, shuffleIntervalTime);
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

        // 初始化显示
        const dataLoaded = loadData(); // 尝试加载数据
        updateHistoryDisplay();
        updateChipDisplay(false); // 初始化时不播放动画
        updatePaydayTimer();
        updateBgmButton();

        // 初始化特效 Canvas
        initEffectCanvas();

        applySkin(currentSkin); // 应用保存的皮肤或默认皮肤

        // 初始化成就系统 - 设置初始筹码并检查成就
        if (!dataLoaded) {
            totalChipsEarned = 100; // 新玩家初始筹码计入累计
        }
        checkAchievements(); // 初始化成就进度

        // 新手礼包：新用户赠送道具
        if (!dataLoaded) {
            inventory['accelerate'] = { count: 3, name: '⚡ 加速卡 x3', desc: '下次抽卡动画速度翻倍', icon: '⚡', item: shopItems.find(i => i.id === 'accelerate') || { id: 'accelerate', count: 3 } };
            inventory['lucky-charm'] = { count: 1, name: '🍀 幸运符', desc: '下次抽卡稀有率 +15%', icon: '🍀', item: shopItems.find(i => i.id === 'lucky-charm') || { id: 'lucky-charm', count: 1 } };
            showTooltip('🎁 新手礼包已到账：加速卡×3、幸运符×1！', 'success', 5000);
            saveData();
        }

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
                    watchAd: { done: false, reward: 10, name: '观看广告', desc: '观看 1 条广告' },
                    share: { done: false, reward: 20, name: '分享游戏', desc: '分享给好友' },
                    login: { done: false, reward: 30, name: '每日登录', desc: '每日首次登录' }
                };
                lastCheckInDate = today;
                saveData();
            }
        }
        checkDailyReset();

        // 每分钟检查轮盘冷却
        function updateWheelCooldown() {
            const btn = document.getElementById('wheelBtn');
            if (!btn) return;

            const now = Date.now();
            const cooldownRemaining = lastWheelTime + WHEEL_COOLDOWN - now;

            if (cooldownRemaining > 0) {
                const minutes = Math.ceil(cooldownRemaining / (1000 * 60));
                btn.textContent = `🎡 冷却中 (${minutes}分钟)`;
                btn.disabled = true;
            } else {
                btn.textContent = '🎡 幸运轮盘';
                btn.disabled = false;
            }
        }
        updateWheelCooldown();
        setInterval(updateWheelCooldown, 60000); // 每分钟更新轮盘状态

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
        window.toggleHistory = toggleHistory;
        window.toggleSettings = toggleSettings;
        window.changeSkin = changeSkin;
        window.resetGame = resetGame;
        window.closeAchievements = closeAchievements;
        window.openInventory = openInventory;
        window.closeInventory = closeInventory;
        window.useItem = useItem;
