// ==================== 游戏静态数据 ====================
// 此文件包含所有不应在运行时修改的静态数据
// 依赖：无（纯数据定义）

// ==================== 抽卡运气卡片数据 ====================
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

// ==================== 命运牌局系统常量 ====================
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

// ==================== 命运修饰符定义 ====================
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

// ==================== 特殊事件定义 ====================
const FATE_EVENTS = {
    pierce_appear: { icon: '🃏', title: '皮尔卡松降临', desc: '大佬级排面！额外 +30 筹码' },
    black_swan:    { icon: '💀', title: '黑天鹅事件', desc: '噩梦！失去当前 50% 筹码！' },
    god_favor:     { icon: '🎰', title: '赌神眷顾', desc: '连续3次最差...下次必定大吉×3！' },
    fate_wheel:    { icon: '🔄', title: '命运轮转', desc: '命运再次旋转...' }
};
