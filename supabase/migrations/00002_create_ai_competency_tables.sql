-- 用户表
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL,
  user_phone VARCHAR(11),
  education VARCHAR(20) NOT NULL CHECK (education IN ('专科', '本科', '硕士', '博士')),
  work_experience INT NOT NULL CHECK (work_experience >= 0),
  create_time TIMESTAMPTZ DEFAULT NOW()
);

-- 岗位表
CREATE TABLE IF NOT EXISTS positions (
  position_id SERIAL PRIMARY KEY,
  position_name VARCHAR(100) NOT NULL,
  position_type SMALLINT NOT NULL CHECK (position_type IN (1, 2, 3, 4)),
  salary_range VARCHAR(50) NOT NULL,
  required_skills JSONB NOT NULL,
  position_desc VARCHAR(500),
  update_time TIMESTAMPTZ DEFAULT NOW()
);

-- 测评表
CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  position_id INT REFERENCES positions(position_id) ON DELETE SET NULL,
  evaluation_time TIMESTAMPTZ DEFAULT NOW(),
  user_skills JSONB NOT NULL,
  evaluation_tags JSONB,
  ai_generated_flag SMALLINT DEFAULT 1 CHECK (ai_generated_flag IN (1, 2)),
  role_type VARCHAR(50) NOT NULL
);

-- 匹配表
CREATE TABLE IF NOT EXISTS matches (
  match_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  position_id INT NOT NULL REFERENCES positions(position_id) ON DELETE CASCADE,
  match_score DECIMAL(5,1) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_tags JSONB,
  match_time TIMESTAMPTZ DEFAULT NOW(),
  status SMALLINT DEFAULT 1 CHECK (status IN (1, 2))
);

-- 创建索引
CREATE INDEX idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX idx_evaluations_time ON evaluations(evaluation_time DESC);
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_score ON matches(match_score DESC);

-- RLS策略（允许匿名访问）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许匿名用户操作users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "允许匿名用户操作positions" ON positions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "允许匿名用户操作evaluations" ON evaluations FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "允许匿名用户操作matches" ON matches FOR ALL TO anon USING (true) WITH CHECK (true);