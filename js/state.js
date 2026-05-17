// ==================== 游戏状态管理 ====================
// 此文件包含所有可变状态、数据驱动初始化、GameState 类
// 依赖：data.js（SKINS_DATA, SHOP_ITEMS_MANUAL, ACHIEVEMENTS_DATA, DAILY_TASKS_TEMPLATE, DAILY_CHALLENGES_TEMPLATE）

// ==================== 运行时状态变量 ====================

// --- 音频与皮肤拥有状态 ---
let ownedSounds = { jazz: false, electronic: false };
let ownedSkins = {};
let currentSkin = 'default';

// --- 运行时数据对象（由 init 函数生成） ---
let skins = {};
let shopItems = [];
let achievements = {};

// --- 核心游戏状态 ---
let isShuffling = false;
let history = [];
let soundEnabled = true;
let chips = 100;
let lastPayday = new Date();
let accelerateCount = 0;
let xrayActive = false;
let luckyCharmActive = false;
let currentBgMusic = null;
let bgMusicPlaying = false;
let activeOscillators = [];
let selectedSkinForEquip = null;
let currentSkinTab = 'all';
let currentShopCategory = 'all';
let inventory = {};

// --- 连抽暴击系统 ---
let consecutiveDraws = 0;
let comboLevel = 0;
let comboMultiplier = 1;
let comboRareBonus = 0;
let lastDrawTime = 0;
const COMBO_TIMEOUT = 3500;

// --- 挖矿模式 ---
let miningStart = Date.now();
let miningRate = 8;
let maxMiningHours = 24;
let miningPaused = false;

// --- 好友助力 ---
let sharedCount = 0;
const MAX_SHARE_REWARD = 50;
const SHARE_REWARD = 5;

// --- 挑战模式 ---
let challengeTimer = null;
let challengeDraws = [];
let dailyChallenges = {};

// --- 宝箱系统 ---
let chestKeys = 0;
let chests = [];

// --- 节日活动 ---
let activeBonus = 1;
let bonusReason = '';

// --- 每日任务 ---
let dailyTasks = {};
let lastCheckInDate = '';

// --- 统计变量 ---
let totalChipsEarned = 0;
let consecutiveHighLuck = 0;
let totalDraws = 0;
let skinsCollected = 0;

// ==================== 数据驱动初始化函数 ====================

/**
 * 从 SKINS_DATA 自动生成 ownedSkins 键
 */
function initOwnedSkins() {
    Object.keys(SKINS_DATA).forEach(id => {
        if (id !== 'default') {
            if (!(id in ownedSkins)) {
                ownedSkins[id] = false;
            }
        }
    });
}

/**
 * 从 SKINS_DATA 创建运行时 skins 对象，附加 locked 状态
 */
function initSkins() {
    Object.keys(SKINS_DATA).forEach(id => {
        const def = SKINS_DATA[id];
        skins[id] = { ...def };
        if (id !== 'default') {
            skins[id].locked = !ownedSkins[id];
        }
    });
}

/**
 * 从手动定义 + SKINS_DATA 自动生成商店物品
 * 皮肤商品从 SKINS_DATA 中非 default 的条目自动生成
 */
function initShopItems() {
    // 手动定义的商品（音效包、消耗品）
    const manual = SHOP_ITEMS_MANUAL.map(item => {
        const runtime = { ...item };
        if (runtime.type === 'sound' && runtime.soundId) {
            runtime.owned = !!ownedSounds[runtime.soundId];
        } else {
            runtime.owned = false;
        }
        return runtime;
    });

    // 自动生成皮肤商品
    const skinItems = [];
    const skinOrder = ['royal-purple', 'cyber-neon', 'dark-ghost', 'golden-empire',
        'aurora-dream', 'fire-hell', 'diamond-luxury', 'cosmic-void',
        'venom-toxic', 'plasma-energy', 'inferno-blaze',
        'ocean-abyss', 'forest-mystic', 'desert-sands',
        'volcano-magma', 'storm-lightning', 'crystal-ice', 'nebula-cosmic'];
    skinOrder.forEach(skinId => {
        if (SKINS_DATA[skinId]) {
            const def = SKINS_DATA[skinId];
            skinItems.push({
                id: 'skin-' + skinId,
                name: '🎨 ' + def.name,
                desc: def.desc,
                price: def.price || 100,
                owned: !!ownedSkins[skinId],
                type: 'skin',
                skinId: skinId
            });
        }
    });

    shopItems = [...manual.slice(0, 1), ...skinItems.slice(0, 1), ...manual.slice(1, 2), ...manual.slice(2, 4),
                 ...skinItems.slice(1, 5), ...manual.slice(4), ...skinItems.slice(5, 10),
                 ...skinItems.slice(10, 18)];
    // Reorder: sound1 → royal-purple → sound2 → consumables → skin items
    // Simpler: just put manual first, then skins
    shopItems = [
        ...SHOP_ITEMS_MANUAL.slice(0, 1),  // sound1
        ...skinItems,                        // all skins
        ...SHOP_ITEMS_MANUAL.slice(1),      // sound2 + consumables
    ];
    // Re-apply owned state to all
    shopItems.forEach(item => {
        if (item.type === 'skin' && item.skinId) {
            item.owned = !!ownedSkins[item.skinId];
        } else if (item.type === 'sound' && item.soundId) {
            item.owned = !!ownedSounds[item.soundId];
        } else {
            item.owned = false;
        }
    });
}

/**
 * 从 ACHIEVEMENTS_DATA 创建运行时成就对象
 * 自动附加 unlocked/progress/streak 运行时字段
 */
function initAchievements() {
    achievements = {};
    Object.keys(ACHIEVEMENTS_DATA).forEach(key => {
        const def = ACHIEVEMENTS_DATA[key];
        achievements[key] = { ...def, unlocked: false };
        if (def.target !== undefined) {
            achievements[key].progress = 0;
        }
        if (def.streakTarget !== undefined) {
            achievements[key].streak = 0;
        }
    });
}

/**
 * 从 DAILY_TASKS_TEMPLATE 创建每日任务（带 done 状态）
 */
function createFreshDailyTasks() {
    const tasks = {};
    Object.keys(DAILY_TASKS_TEMPLATE).forEach(key => {
        const tmpl = DAILY_TASKS_TEMPLATE[key];
        tasks[key] = { ...tmpl, done: false };
        if (tmpl.count !== undefined) tasks[key].count = 0;
    });
    return tasks;
}

/**
 * 从 DAILY_CHALLENGES_TEMPLATE 创建每日挑战（带 used 状态）
 */
function createFreshDailyChallenges() {
    const challenges = {};
    Object.keys(DAILY_CHALLENGES_TEMPLATE).forEach(key => {
        const tmpl = DAILY_CHALLENGES_TEMPLATE[key];
        challenges[key] = { ...tmpl, used: 0 };
    });
    return challenges;
}

// ==================== 执行初始化 ====================
initOwnedSkins();
initSkins();
initShopItems();
initAchievements();
dailyTasks = createFreshDailyTasks();
dailyChallenges = createFreshDailyChallenges();

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
            ownedSkins: {},
            currentSkin: 'default',
            accelerateCount: 0,
            lastPayday: new Date().toISOString(),
            shopItemsOwned: [],
            dailyTasks: null,
            lastCheckInDate: '',
            miningStart: Date.now(),
            sharedCount: 0,
            dailyChallenges: null,
            chestKeys: 0,
            achievements: null,
            totalChipsEarned: 0,
            consecutiveHighLuck: 0,
            totalDraws: 0,
            skinsCollected: 0,
            inventory: {}
        };
    }

    static migrate(data) {
        if (!data._version || data._version < 2) {
            data._version = 2;
        }
        if (data._version < 3) {
            // 确保所有已知皮肤都有 ownedSkins 键
            Object.keys(SKINS_DATA).forEach(key => {
                if (key !== 'default') {
                    if (!data.ownedSkins) data.ownedSkins = {};
                    if (!(key in data.ownedSkins)) {
                        data.ownedSkins[key] = false;
                    }
                }
            });
            data._version = 3;
        }
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
            data = GameState.migrate(data);

            chips = data.chips || 100;
            history = data.history || [];
            ownedSounds = data.ownedSounds || { jazz: false, electronic: false };
            ownedSkins = data.ownedSkins || {};
            currentSkin = data.currentSkin || 'default';
            accelerateCount = data.accelerateCount || 0;
            lastPayday = new Date(data.lastPayday || new Date());

            if (data.shopItemsOwned) {
                shopItems.forEach(item => {
                    if (item.type !== 'consumable') {
                        item.owned = data.shopItemsOwned.includes(item.id);
                    } else {
                        item.owned = false;
                    }
                });
            }

            initOwnedSkins();
            initSkins();
            initShopItems();

            if (data.dailyTasks) {
                dailyTasks = { ...createFreshDailyTasks(), ...data.dailyTasks };
            }
            lastCheckInDate = data.lastCheckInDate || '';
            miningStart = data.miningStart || Date.now();
            sharedCount = data.sharedCount || 0;

            if (data.dailyChallenges) {
                dailyChallenges = { ...createFreshDailyChallenges(), ...data.dailyChallenges };
            }
            chestKeys = data.chestKeys || 0;

            if (data.achievements) {
                initAchievements();
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
