// ==================== 主入口：认证、云同步、初始化 ====================
// 此文件包含 Supabase 认证、云端数据存取和游戏初始化
// 依赖：data.js, state.js, ui.js, engine.js, features.js

// ==================== Supabase 认证 ====================
let isAuthMode = 'login';
let currentUser = null;
let isSaving = false;
let currentSessionId = null;
let sessionPollingTimer = null;
const SESSION_POLL_INTERVAL = 30000;

function handleAuthBtnClick() {
    if (currentUser) {
        showLoggedInPanel();
        document.getElementById('authModal').classList.add('active');
    }
}

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

        await registerSession();

        const cloudLoaded = await loadCloudData();
        if (!cloudLoaded) {
            totalChipsEarned = 100;
            inventory['accelerate'] = { count: 3, name: '⚡ 加速卡 x3', desc: '下次抽卡动画速度翻倍', icon: '⚡', item: shopItems.find(i => i.id === 'accelerate') || { id: 'accelerate', count: 3 } };
            inventory['lucky-charm'] = { count: 1, name: '🍀 幸运符', desc: '下次抽卡稀有率 +15%', icon: '🍀', item: shopItems.find(i => i.id === 'lucky-charm') || { id: 'lucky-charm', count: 1 } };
            saveData();
            setTimeout(() => showTooltip('🎁 新手礼包已到账：加速卡×3、幸运符×1！', 'success', 5000), 500);
        }

        document.getElementById('authModal').classList.remove('active');
        showTooltip(isAuthMode === 'login' ? '🎉 登录成功！' : '🎉 注册成功！', 'success', 3000);
    } catch (err) {
        console.error('认证错误:', err);
        showTooltip('网络错误，请重试', 'error', 3000);
    }

    btn.disabled = false;
    btn.textContent = isAuthMode === 'login' ? '登录' : '注册';
}

async function handleLogout() {
    await clearSession();

    try {
        await supabaseClient.auth.signOut();
    } catch (e) {
        console.error('登出错误:', e);
    }
    currentUser = null;

    localStorage.removeItem(GameState.STORAGE_KEY);
    localStorage.removeItem('pierresCasinoLastSave');

    resetGameToDefaults();

    showLoginForm();
    document.getElementById('authModal').classList.add('active');
    updateAuthButton();
    showTooltip('已退出登录', 'info', 3000);

    document.getElementById('authCloseBtn').style.display = 'none';
}

function closeAuthModal() {
    if (currentUser) {
        document.getElementById('authModal').classList.remove('active');
    }
}

function confirmLogout() {
    document.getElementById('authLoggedIn').style.display = 'none';
    document.getElementById('authLogoutConfirm').style.display = 'block';
}

function cancelLogout() {
    document.getElementById('authLogoutConfirm').style.display = 'none';
    document.getElementById('authLoggedIn').style.display = 'block';
}

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

    Object.keys(achievements).forEach(key => {
        achievements[key].unlocked = false;
        if (achievements[key].progress !== undefined) achievements[key].progress = 0;
        if (achievements[key].streak !== undefined) achievements[key].streak = 0;
    });

    shopItems.forEach(item => {
        if (item.type !== 'consumable') item.owned = false;
    });

    Object.keys(skins).forEach(skinId => {
        if (skinId !== 'default') skins[skinId].locked = true;
    });

    updateChipDisplay(false);
    updateHistoryDisplay();
    applySkin('default');
    updateMiningButton();
    updateInventoryBadge();
    document.getElementById('chipCount').textContent = '100';
}

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

function showLoggedInPanel() {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('authLoggedIn').style.display = 'block';
    document.getElementById('authLogoutConfirm').style.display = 'none';
    document.getElementById('authCloseBtn').style.display = 'block';
    document.getElementById('authUserEmail').textContent = currentUser.email;
}

// ==================== 单点登录（踢人机制） ====================
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

        startSessionPolling();
    } catch (err) {
        console.error('注册会话异常:', err);
    }
}

function startSessionPolling() {
    stopSessionPolling();
    sessionPollingTimer = setInterval(checkSessionValidity, SESSION_POLL_INTERVAL);
}

function stopSessionPolling() {
    if (sessionPollingTimer) {
        clearInterval(sessionPollingTimer);
        sessionPollingTimer = null;
    }
}

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
            await forceKickout();
        }
    } catch (err) {
        console.error('会话检查异常:', err);
    }
}

async function forceKickout() {
    stopSessionPolling();
    currentSessionId = null;

    localStorage.removeItem(GameState.STORAGE_KEY);
    localStorage.removeItem('pierresCasinoLastSave');
    resetGameToDefaults();

    try {
        await supabaseClient.auth.signOut();
    } catch (e) {
        console.error('踢出登出错误:', e);
    }

    currentUser = null;
    showLoginForm();
    document.getElementById('authModal').classList.add('active');
    updateAuthButton();

    showTooltip('⚠️ 您的账号已在其他设备登录，您已被强制下线', 'error', 6000);
}

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
            localStorage.setItem(GameState.STORAGE_KEY, JSON.stringify(data.data));
            GameState.load();

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

        return false;
    } catch (err) {
        console.error('加载云端数据错误:', err);
        return false;
    }
}

async function saveToCloud() {
    if (!currentUser || isSaving) return;
    isSaving = true;

    try {
        const saved = localStorage.getItem(GameState.STORAGE_KEY);
        const gameData = saved ? JSON.parse(saved) : {};

        const { data: existing } = await supabaseClient
            .from('game_data')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();

        if (existing) {
            const { error } = await supabaseClient
                .from('game_data')
                .update({ data: gameData })
                .eq('user_id', currentUser.id);
            if (error) throw error;
        } else {
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

// 猴子补丁 saveData：先写本地缓存，再异步写云端
const _originalSaveData = saveData;
saveData = function() {
    _originalSaveData();
    if (currentUser && !isSaving) {
        saveToCloud().catch(err => console.error('自动云端保存失败:', err));
    }
};

// ==================== 游戏初始化 ====================

// 初始化显示（基础 UI，数据将在登录后从云端加载）
updateHistoryDisplay();
updateChipDisplay(false);
updatePaydayTimer();
updateBgmButton();

// 初始化特效 Canvas
initEffectCanvas();

applySkin(currentSkin);

// 初始化成就系统
checkAchievements();

setInterval(updatePaydayTimer, 1000);

// 初始化多元化筹码获取系统
updateMiningButton();
setInterval(updateMiningButton, 60000);

// 检查每日任务是否需要重置
checkDailyReset();

// 定期自动保存
setInterval(saveData, 30000);

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

// ==================== 暴露全局函数（供 HTML onclick 调用） ====================
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

window.handleAuthBtnClick = handleAuthBtnClick;
window.toggleAuthMode = toggleAuthMode;
window.submitAuth = submitAuth;
window.handleLogout = handleLogout;
window.closeAuthModal = closeAuthModal;
window.confirmLogout = confirmLogout;
window.cancelLogout = cancelLogout;

// ==================== 认证初始化 ====================
(async function initAuth() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            currentUser = session.user;
            updateAuthButton();

            await registerSession();

            const loaded = await loadCloudData();
            if (!loaded) {
                totalChipsEarned = 100;
                inventory['accelerate'] = { count: 3, name: '⚡ 加速卡 x3', desc: '下次抽卡动画速度翻倍', icon: '⚡', item: shopItems.find(i => i.id === 'accelerate') || { id: 'accelerate', count: 3 } };
                inventory['lucky-charm'] = { count: 1, name: '🍀 幸运符', desc: '下次抽卡稀有率 +15%', icon: '🍀', item: shopItems.find(i => i.id === 'lucky-charm') || { id: 'lucky-charm', count: 1 } };
                saveData();
            }
            document.getElementById('authModal').classList.remove('active');
        } else {
            showLoginForm();
            document.getElementById('authModal').classList.add('active');
        }
    } catch (err) {
        console.error('初始化认证失败:', err);
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
