// ==================== 游戏状态管理 ====================
// 此文件包含所有可变状态和 GameState 类
// 依赖：data.js（常量）、js/data.js 需要在本文件之前加载

// ==================== 音频与皮肤拥有状态 ====================
let ownedSounds = {
    jazz: false,
    electronic: false
};
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
let currentSkin = 'default';

// ==================== 皮肤定义 ====================
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

// ==================== 商店物品 ====================
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

// ==================== 游戏状态变量 ====================
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

// ==================== 连抽暴击系统 ====================
let consecutiveDraws = 0;
let comboLevel = 0;
let comboMultiplier = 1;
let comboRareBonus = 0;
let lastDrawTime = 0;
const COMBO_TIMEOUT = 3500;

// ==================== 多元化筹码获取系统 ====================
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
let miningRate = 8;
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
let activeBonus = 1;
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
let totalChipsEarned = 0;
let consecutiveHighLuck = 0;
let totalDraws = 0;
let skinsCollected = 0;

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
            const defaultSkins = GameState.getDefaultData().ownedSkins;
            Object.keys(defaultSkins).forEach(key => {
                if (data.ownedSkins && !(key in data.ownedSkins)) {
                    data.ownedSkins[key] = false;
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

            Object.keys(skins).forEach(skinId => {
                if (skinId !== 'default') {
                    skins[skinId].locked = !ownedSkins[skinId];
                }
            });

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
