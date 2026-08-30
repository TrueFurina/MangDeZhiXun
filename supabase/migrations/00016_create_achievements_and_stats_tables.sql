-- 用户成就表
CREATE TABLE user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, achievement_id)
);

-- 成长路径表
CREATE TABLE growth_paths (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  assessment_id BIGINT,
  path_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户统计数据表
CREATE TABLE user_stats (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  total_learning_minutes INT DEFAULT 0,
  completed_courses INT DEFAULT 0,
  ability_improvement_percent DECIMAL(5,2) DEFAULT 0,
  ranking_percent DECIMAL(5,2) DEFAULT 100,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_achievements_user ON user_achievements(user_email);
CREATE INDEX idx_growth_paths_user ON growth_paths(user_email);

-- RLS策略
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_select_own" ON user_achievements FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "user_achievements_insert_own" ON user_achievements FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "growth_paths_select_own" ON growth_paths FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "growth_paths_insert_own" ON growth_paths FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "growth_paths_update_own" ON growth_paths FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "user_stats_select_own" ON user_stats FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "user_stats_insert_own" ON user_stats FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "user_stats_update_own" ON user_stats FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');