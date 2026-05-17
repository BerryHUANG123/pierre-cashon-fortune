// ==================== 游戏静态数据 ====================
// 此文件包含所有不应在运行时修改的静态数据
// 依赖：无（纯数据定义）
//
// 架构说明：
//   所有"内容型"数据（皮肤/商店/成就/任务）集中在此文件
//   运行时状态（owned/locked/unlocked/progress）由 state.js 初始化
//   新增内容只需编辑此文件，无需修改任何逻辑代码

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

// ==================== 音效包定义 ====================
const SOUND_PACKS = {
    jazz: { id: 'sound1', name: '🎵 爵士音效包', desc: '解锁古典爵士风格背景音乐', price: 80 },
    electronic: { id: 'sound2', name: '🎵 电子音效包', desc: '解锁电子舞曲风格背景音乐', price: 80 }
};

// ==================== 消耗品定义 ====================
const CONSUMABLE_ITEMS = {
    accelerate:    { id: 'accelerate',    name: '⚡ 加速卡 x3',    desc: '下次抽卡动画速度减半',     price: 30, icon: '⚡', count: 3 },
    xray:          { id: 'xray',          name: '🔮 透视眼镜',    desc: '查看下次抽卡的概率分布',   price: 50, icon: '🔮', count: 1 },
    'lucky-charm': { id: 'lucky-charm',   name: '🍀 幸运符',      desc: '下次抽卡稀有率 +15%',     price: 40, icon: '🍀', count: 1 }
};

// ==================== 皮肤静态定义 ====================
// 纯视觉配置（CSS/颜色/字体），不含运行时状态
// 新增皮肤只需在此添加一个条目，系统自动注册拥有状态和商店商品
//
// 价格梯度（Phase 1 经济平衡调整后）：
//   free   — 默认皮肤
//   basic  — 入门款 (80~120)，新手可触碰，3~5天存够
//   mid    — 中端款 (150~250)，中期目标，1~2周存够
//   high   — 高端款 (300~450)，炫耀性消费，需要刻意存钱
//   premium— 至尊款 (600~1000)，顶级社交货币，需要数周积累
const SKINS_DATA = {
    'default': {
        name: '经典金色',
        desc: '皮尔卡松的经典金色主题',
        tier: 'free',
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
        specialEffects: 'none'
    },
    // ── 入门款 (basic): 80~120 ──
    'royal-purple': {
        name: '皇家紫・贵族盛宴',
        desc: '中世纪皇家宫廷，奢华紫色调 + 金色粒子',
        tier: 'basic',
        price: 80,
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
        specialEffects: 'royal'
    },
    'cyber-neon': {
        name: '赛博霓虹・未来都市',
        desc: '2077 年赛博朋克，霓虹扫描 + 数据流',
        tier: 'basic',
        price: 100,
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
        specialEffects: 'cyber'
    },
    'dark-ghost': {
        name: '暗夜幽灵・神秘赌场',
        desc: '哥特式神秘，暗黑优雅 + 烟雾流动',
        tier: 'basic',
        price: 100,
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
        specialEffects: 'ghost'
    },
    'aurora-dream': {
        name: '极光幻境・梦幻世界',
        desc: '北极光幻境，梦幻绚丽 + 雪花飘落',
        tier: 'basic',
        price: 120,
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
        specialEffects: 'aurora'
    },
    'fire-hell': {
        name: '火焰地狱・狂热赌场',
        desc: '地狱火焰，狂热刺激 + 火星飞溅',
        tier: 'basic',
        price: 100,
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
        specialEffects: 'fire'
    },
    // ── 中端款 (mid): 150~250 ──
    'ocean-abyss': {
        name: '深海深渊・静谧之海',
        desc: '万米深海，幽蓝静谧 + 气泡上升',
        tier: 'mid',
        price: 150,
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
        specialEffects: 'ocean'
    },
    'forest-mystic': {
        name: '神秘森林・精灵之域',
        desc: '古老森林，神秘翠绿 + 光斑闪烁',
        tier: 'mid',
        price: 160,
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
        specialEffects: 'forest'
    },
    'desert-sands': {
        name: '黄金沙漠・落日余晖',
        desc: '无垠沙漠，金黄沙丘 + 热浪扭曲',
        tier: 'mid',
        price: 155,
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
        specialEffects: 'desert'
    },
    'volcano-magma': {
        name: '火山熔岩・大地怒火',
        desc: '活跃火山，炽热熔岩 + 火山灰',
        tier: 'mid',
        price: 170,
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
        specialEffects: 'volcano'
    },
    'storm-lightning': {
        name: '雷霆风暴・闪电之怒',
        desc: '暴风雨夜，闪电撕裂 + 雷鸣滚滚',
        tier: 'mid',
        price: 180,
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
        specialEffects: 'storm'
    },
    'crystal-ice': {
        name: '水晶冰原・极寒之地',
        desc: '冰封世界，晶莹剔透 + 冰晶闪烁',
        tier: 'mid',
        price: 190,
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
        specialEffects: 'ice'
    },
    'golden-empire': {
        name: '黄金帝国・至尊奢华',
        desc: '古代黄金帝国，极致奢华 + 钻石光芒',
        tier: 'mid',
        price: 200,
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
        specialEffects: 'gold'
    },
    'nebula-cosmic': {
        name: '星云宇宙・星河璀璨',
        desc: '浩瀚星河，绚丽星云 + 流星雨',
        tier: 'mid',
        price: 210,
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
        specialEffects: 'nebula'
    },
    'venom-toxic': {
        name: '剧毒沼泽・腐化之地',
        desc: '毒液腐蚀，诡异绿色 + 气泡涌动',
        tier: 'mid',
        price: 175,
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
        specialEffects: 'venom'
    },
    'cosmic-void': {
        name: '宇宙虚空・无尽深渊',
        desc: '深邃宇宙，星云漩涡 + 流星划过',
        tier: 'mid',
        price: 195,
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
        specialEffects: 'cosmic'
    },
    'plasma-energy': {
        name: '等离子・能量风暴',
        desc: '高能等离子，电弧闪烁 + 能量脉冲',
        tier: 'mid',
        price: 220,
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
        specialEffects: 'plasma'
    },
    // ── 高端款 (high): 300~450 ──
    'diamond-luxury': {
        name: '钻石王冠・顶级奢华',
        desc: '璀璨钻石，极致闪耀 + 星光闪烁',
        tier: 'high',
        price: 300,
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
        specialEffects: 'diamond'
    },
    'inferno-blaze': {
        name: '炼狱烈焰・毁灭之光',
        desc: '地狱熔岩，毁灭性火焰 + 灰烬飞舞',
        tier: 'high',
        price: 380,
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
        specialEffects: 'inferno'
    },
    'pierre-cashon-original': {
        name: '皮尔卡松・赌神本色',
        desc: '皮尔卡松本尊主题，黑金至尊 + 永恒之火',
        tier: 'high',
        price: 450,
        preview: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 30%, #0d0d0d 60%, #1a1500 100%)',
        bodyBg: `
            repeating-conic-gradient(from 0deg at 50% 50%,
                transparent 0deg,
                transparent 8deg,
                rgba(255, 215, 0, 0.04) 9deg,
                rgba(255, 215, 0, 0.04) 10deg),
            radial-gradient(ellipse at 50% 0%,
                rgba(255, 215, 0, 0.12) 0%,
                transparent 45%),
            radial-gradient(ellipse at 50% 100%,
                rgba(255, 100, 0, 0.08) 0%,
                transparent 40%),
            linear-gradient(135deg, #050505 0%, #0a0a0a 40%, #1a1a1a 100%)
        `,
        containerBg: 'rgba(10, 10, 10, 0.95)',
        borderColor: 'rgba(255, 215, 0, 0.9)',
        accentColor: '#ffd700',
        cardBg: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
        buttonGradient: 'linear-gradient(135deg, #ffd700, #ff8c00)',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        specialEffects: 'gold'
    }
};

// ==================== 商店物品静态定义 ====================
// 运行时 owned 状态由 initShopItems() 根据拥有情况生成
// 皮肤商品自动从 SKINS_DATA 生成（见 SHOP_ITEMS_GENERATED below）
const SHOP_ITEMS_MANUAL = [
    { id: 'sound1', type: 'sound', soundId: 'jazz', name: '🎵 爵士音效包', desc: '解锁古典爵士风格背景音乐', price: 80 },
    { id: 'sound2', type: 'sound', soundId: 'electronic', name: '🎵 电子音效包', desc: '解锁电子舞曲风格背景音乐', price: 80 },
    { id: 'accelerate', type: 'consumable', name: '⚡ 加速卡 x3', desc: '下次抽卡动画速度减半', price: 30, count: 3 },
    { id: 'xray', type: 'consumable', name: '🔮 透视眼镜', desc: '查看下次抽卡的概率分布', price: 50, count: 1 },
    { id: 'lucky-charm', type: 'consumable', name: '🍀 幸运符', desc: '下次抽卡稀有率 +15%', price: 40, count: 1 }
];

// ==================== 成就定义 ====================
// 不含 unlocked/progress/streak 运行时状态
// 带 target 的成就会自动追踪 progress，带 streakTarget 的会追踪 streak
const ACHIEVEMENTS_DATA = {
    firstDraw: {
        id: 'firstDraw',
        badge: '🌟',
        name: '初出茅庐',
        desc: '首次抽卡',
        quote: '哼，新手？在赌桌上，每个人都是从零开始！'
    },
    smallWinner: {
        id: 'smallWinner',
        badge: '💎',
        name: '小有斩获',
        desc: '累计获得 100 筹码',
        quote: '100 筹码？这才哪到哪！不过算是个开始。',
        target: 100
    },
    legendHunter: {
        id: 'legendHunter',
        badge: '👑',
        name: '传说猎手',
        desc: '抽到终极王牌',
        quote: '抽到王牌？运气不错！但别高兴太早。'
    },
    skinCollector: {
        id: 'skinCollector',
        badge: '🎨',
        name: '皮肤收藏家',
        desc: '收集 3 种皮肤',
        quote: '喜欢收集皮肤？品味不错，但还不够！',
        target: 3
    },
    luckyStreak: {
        id: 'luckyStreak',
        badge: '🍀',
        name: '欧皇附体',
        desc: '连续 3 次高运',
        quote: '连续高运？看来你今天确实被幸运女神眷顾。',
        streakTarget: 3
    }
};

// ==================== 每日任务模板 ====================
const DAILY_TASKS_TEMPLATE = {
    draw15:     { reward: 25, name: '抽卡达人', desc: '抽卡 15 次', count: 0, target: 15 },
    legend:     { reward: 30, name: '传说猎手', desc: '抽到传说牌', charmReward: 1 },
    combo10:    { reward: 35, name: '连击大师', desc: '达成 10 连击' },
    chipGuard:  { reward: 20, name: '筹码守卫', desc: '单日抽卡净亏损≤10' },
    luckyWheel3:{ reward: 15, name: '幸运轮手', desc: '转盘 3 次', count: 0, target: 3 }
};

// ==================== 每日挑战模板 ====================
const DAILY_CHALLENGES_TEMPLATE = {
    speed:   { max: 3, name: '速抽挑战', desc: '10 秒内抽 3 次' },
    accuracy:{ max: 3, name: '精准挑战', desc: '连续 3 次中运以上' },
    combo:   { max: 3, name: '连击挑战', desc: '单次达成 10 连击' }
};
