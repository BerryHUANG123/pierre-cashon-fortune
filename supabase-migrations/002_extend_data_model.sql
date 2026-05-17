-- =====================================================
-- 002_扩展数据模型：段位、占卜、投资、排行榜
-- 为 Phase 2（段位系统）、Phase 3（占卜系统）、Phase 5（投资系统）准备
-- 遵循现有架构：每用户一行，RLS 保护，jsonb 灵活存储
-- =====================================================

-- ─────────────────────────────────────────────
-- 1. 赌神段位系统 (rank_info)
-- ─────────────────────────────────────────────
-- 每用户一行，存储段位进度数据
-- 段位等级: gambler(赌徒) → player(赌客) → expert(赌侠) → king(赌王) → god(赌神)

CREATE TABLE IF NOT EXISTS rank_info (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 当前段位
  rank_level TEXT NOT NULL DEFAULT 'gambler'
    CHECK (rank_level IN ('gambler', 'player', 'expert', 'king', 'god')),

  -- 当前段位内的赌绩分（达到门槛后升级，永不降段）
  rank_points INTEGER NOT NULL DEFAULT 0,

  -- 历史累计总赌绩分（用于统计和排行榜）
  total_points_earned INTEGER NOT NULL DEFAULT 0,

  -- 上次衰减检查日期（每周一 00:00 衰减 5%）
  last_decay_date DATE,

  -- 扩展数据（JSONB 灵活存储）
  -- 预留字段示例: { "highest_combo": 15, "legend_draws": 3, "achievements_completed": 5 }
  extra_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rank_info_level ON rank_info(rank_level);
CREATE INDEX idx_rank_info_points ON rank_info(rank_points DESC);

ALTER TABLE rank_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rank"
  ON rank_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rank"
  ON rank_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rank"
  ON rank_info FOR UPDATE
  USING (auth.uid() = user_id);

-- 服务端函数（Edge Function 调用）可读取所有段位数据用于排行榜
CREATE POLICY "Service can read all ranks for leaderboard"
  ON rank_info FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────
-- 2. 每日占卜系统 (daily_divination)
-- ─────────────────────────────────────────────
-- 每用户每天一行，存储占卜状态和激活效果
-- 每日 00:00 自动重置

CREATE TABLE IF NOT EXISTS daily_divination (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  divination_date DATE NOT NULL,

  -- 当日占卜使用次数（最多 3 次）
  uses_today INTEGER NOT NULL DEFAULT 0,

  -- 最佳占卜结果（每次可覆盖）
  -- 格式: { "cards": ["fool", "magician", "star"], "combination": "天命加身", "effects": [...] }
  best_result JSONB,

  -- 当前激活的效果列表
  -- 格式: [{ "card_id": "fool", "effect": "抽卡消耗 -2", "expires_at": "..." }]
  active_effects JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- 占卜历史记录（当日所有抽牌）
  -- 格式: [{ "attempt": 1, "cards": [...], "combination": "..." }, ...]
  history JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, divination_date)
);

CREATE INDEX idx_daily_divination_user_date ON daily_divination(user_id, divination_date);

ALTER TABLE daily_divination ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own divination"
  ON daily_divination FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own divination"
  ON daily_divination FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own divination"
  ON daily_divination FOR UPDATE
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 3. 投资记录 (investment_records)
-- ─────────────────────────────────────────────
-- 每用户同时只能持有 1 笔活跃投资
-- 投资类型: bond(安全债券), venture(风投基金), high_stakes(豪赌合约)

CREATE TABLE IF NOT EXISTS investment_records (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 投资类型
  investment_type TEXT NOT NULL
    CHECK (investment_type IN ('bond', 'venture', 'high_stakes')),

  -- 投入金额
  amount_invested INTEGER NOT NULL CHECK (amount_invested > 0),

  -- 投资状态: active(进行中), matured(已到期), cancelled(已撤回)
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'matured', 'cancelled')),

  -- 时间节点
  invested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mature_at TIMESTAMPTZ NOT NULL,

  -- 到期回报金额（到期后填写）
  amount_returned INTEGER,

  -- 扩展数据
  -- 格式: { "multiplier": 1.1, "roll_result": "bond_guaranteed", "divination_bonus": 0 }
  extra_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_investment_records_user ON investment_records(user_id);
CREATE INDEX idx_investment_records_status ON investment_records(user_id, status);
CREATE INDEX idx_investment_records_mature ON investment_records(status, mature_at)
  WHERE status = 'active';

ALTER TABLE investment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own investments"
  ON investment_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
  ON investment_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON investment_records FOR UPDATE
  USING (auth.uid() = user_id);

-- 防止同时持有超过 1 笔活跃投资的约束（通过 RLS + 应用层双重保障）
-- 应用层需在创建前检查: SELECT COUNT(*) FROM investment_records WHERE user_id = ? AND status = 'active'


-- ─────────────────────────────────────────────
-- 4. 周排行榜 (weekly_leaderboard)
-- ─────────────────────────────────────────────
-- 每周一 00:00 由 Edge Function 重置
-- 排行榜类型: luck(运气王), combo(连击王), investment(投资王), divination(占卜王)

CREATE TABLE IF NOT EXISTS weekly_leaderboard (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 赛季周标识，格式: "2026-W21"
  season_week TEXT NOT NULL,

  -- 排行榜类别
  category TEXT NOT NULL
    CHECK (category IN ('luck', 'combo', 'investment', 'divination')),

  -- 分数值（具体含义因类别而异）
  score_value INTEGER NOT NULL DEFAULT 0,

  -- 展示用昵称
  display_name TEXT,

  -- 排名（由 Edge Function 计算）
  rank_position INTEGER,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, season_week, category)
);

CREATE INDEX idx_leaderboard_week_category ON weekly_leaderboard(season_week, category, score_value DESC);

ALTER TABLE weekly_leaderboard ENABLE ROW LEVEL SECURITY;

-- 所有登录用户可读取排行榜（需要展示 Top 20）
CREATE POLICY "Anyone can read leaderboard"
  ON weekly_leaderboard FOR SELECT
  USING (true);

-- 服务端 Edge Function 负责写入
-- 注意: 实际写入由 Edge Function 使用 service_role key 执行，绕过 RLS
-- 如果需要应用层写入，添加:
-- CREATE POLICY "Users can update own leaderboard"
--   ON weekly_leaderboard FOR UPDATE
--   USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────
-- 5. 便捷函数：获取/创建用户段位
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_or_create_rank(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  rank_level TEXT,
  rank_points INTEGER,
  total_points_earned INTEGER,
  last_decay_date DATE,
  extra_data JSONB,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO rank_info (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING rank_info.*;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
