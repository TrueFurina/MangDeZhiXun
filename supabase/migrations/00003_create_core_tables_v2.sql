-- 用户扩展信息表（关联auth.users）
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  vip_level TEXT DEFAULT 'free' CHECK (vip_level IN ('free', 'premium', 'enterprise')),
  vip_expire_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 岗位收藏表
CREATE TABLE IF NOT EXISTS job_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  job_id INTEGER NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, job_id)
);

-- 测评记录表
CREATE TABLE IF NOT EXISTS assessment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  job_title TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  tech_score INTEGER NOT NULL,
  general_score INTEGER NOT NULL,
  behavior_score INTEGER NOT NULL,
  experience_score INTEGER NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会员订单表
CREATE TABLE IF NOT EXISTS vip_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  vip_level TEXT NOT NULL CHECK (vip_level IN ('premium', 'enterprise')),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_proof_url TEXT,
  bank_card_number TEXT DEFAULT '6222031402011005175',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  resource_id INTEGER NOT NULL,
  resource_title TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'document', 'course')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_position INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, resource_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_job_favorites_user_email ON job_favorites(user_email);
CREATE INDEX IF NOT EXISTS idx_assessment_records_user_email ON assessment_records(user_email);
CREATE INDEX IF NOT EXISTS idx_vip_orders_user_email ON vip_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_learning_records_user_email ON learning_records(user_email);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_records_updated_at BEFORE UPDATE ON learning_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入测试用户
INSERT INTO user_profiles (email, nickname, phone, avatar_url) 
VALUES ('zhangsan@example.com', '张三', '138****8888', '')
ON CONFLICT (email) DO NOTHING;

-- 插入测试测评记录
INSERT INTO assessment_records (user_email, job_title, total_score, tech_score, general_score, behavior_score, experience_score, completed_at)
VALUES 
  ('zhangsan@example.com', 'AI算法工程师胜任力测评', 85, 88, 82, 85, 85, NOW() - INTERVAL '2 days'),
  ('zhangsan@example.com', '通用能力测评', 78, 75, 82, 80, 75, NOW() - INTERVAL '7 days'),
  ('zhangsan@example.com', '数据分析师胜任力测评', 82, 85, 78, 82, 83, NOW() - INTERVAL '12 days'),
  ('zhangsan@example.com', 'Python开发工程师测评', 80, 82, 78, 80, 80, NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;