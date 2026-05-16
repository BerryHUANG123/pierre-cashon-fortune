-- 单点登录（踢人机制）：user_sessions 表
-- 每个用户只保留一条记录，存储当前活跃的会话 ID
-- 新设备登录时覆盖 sessionId，旧设备轮询检测到不匹配即被踢下线

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  device_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 策略：用户只能读写自己的 session
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own session"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own session"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);
