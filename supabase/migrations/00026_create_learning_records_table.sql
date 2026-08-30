-- 【高危漏洞修复 H-1】创建 learning_records 表并配置 RLS 策略

-- 创建学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  course_id BIGINT NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 300),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_learning_records_user ON learning_records(user_email);
CREATE INDEX IF NOT EXISTS idx_learning_records_course ON learning_records(course_id);

-- 启用 RLS
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看和插入自己的学习记录
CREATE POLICY "learning_records_select_own" 
  ON learning_records FOR SELECT 
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "learning_records_insert_own" 
  ON learning_records FOR INSERT 
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 管理员策略：允许管理员查看所有记录
CREATE POLICY "learning_records_select_admin" 
  ON learning_records FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@mangdehenzhi.com'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

-- 添加注释
COMMENT ON TABLE learning_records IS '学习记录表：记录用户每次学习的时长';
COMMENT ON COLUMN learning_records.duration_minutes IS '学习时长（分钟），范围：1-300分钟';
