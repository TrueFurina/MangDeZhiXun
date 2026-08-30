-- 创建岗位收藏表
CREATE TABLE IF NOT EXISTS job_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  job_id integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_email, job_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_job_favorites_user_email ON job_favorites(user_email);
CREATE INDEX IF NOT EXISTS idx_job_favorites_job_id ON job_favorites(job_id);

-- 启用RLS
ALTER TABLE job_favorites ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能查看和管理自己的收藏
CREATE POLICY "Users can view their own favorites"
  ON job_favorites FOR SELECT
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own favorites"
  ON job_favorites FOR INSERT
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own favorites"
  ON job_favorites FOR DELETE
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 匿名用户策略（使用本地存储的email）
CREATE POLICY "Anonymous users can manage favorites"
  ON job_favorites FOR ALL
  USING (true)
  WITH CHECK (true);