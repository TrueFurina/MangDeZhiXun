-- 创建咨询预约表
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX idx_consultations_status ON consultations(status);

-- 允许匿名用户插入咨询记录
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许匿名用户提交咨询" ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "允许匿名用户查看自己的咨询" ON consultations
  FOR SELECT
  TO anon
  USING (true);