-- 添加缺失的字段到vip_orders表
ALTER TABLE vip_orders ADD COLUMN IF NOT EXISTS order_no TEXT;
ALTER TABLE vip_orders ADD COLUMN IF NOT EXISTS duration_months INTEGER;
ALTER TABLE vip_orders ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE vip_orders ADD COLUMN IF NOT EXISTS actual_price DECIMAL(10, 2);
ALTER TABLE vip_orders ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE vip_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 创建唯一约束
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vip_orders_order_no_key') THEN
    ALTER TABLE vip_orders ADD CONSTRAINT vip_orders_order_no_key UNIQUE (order_no);
  END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_vip_orders_user_email ON vip_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_vip_orders_order_no ON vip_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_vip_orders_payment_status ON vip_orders(payment_status);

-- 会员套餐配置表
CREATE TABLE IF NOT EXISTS vip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vip_level TEXT NOT NULL CHECK (vip_level IN ('premium', 'enterprise')),
  duration_months INTEGER NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2) NOT NULL,
  features JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vip_level, duration_months)
);

-- 插入默认会员套餐
INSERT INTO vip_plans (vip_level, duration_months, original_price, discount_price, features, sort_order) VALUES
('premium', 1, 99.00, 89.00, '["AI能力测评无限次", "岗位推荐优先级提升", "简历优化建议", "学习资源全开放"]'::jsonb, 1),
('premium', 3, 297.00, 249.00, '["AI能力测评无限次", "岗位推荐优先级提升", "简历优化建议", "学习资源全开放", "赠送1个月"]'::jsonb, 2),
('premium', 12, 1188.00, 899.00, '["AI能力测评无限次", "岗位推荐优先级提升", "简历优化建议", "学习资源全开放", "赠送3个月"]'::jsonb, 3),
('enterprise', 1, 299.00, 269.00, '["Premium全部权益", "1对1职业规划", "企业内推机会", "专属就业顾问", "优先参加线下活动"]'::jsonb, 4),
('enterprise', 3, 897.00, 749.00, '["Premium全部权益", "1对1职业规划", "企业内推机会", "专属就业顾问", "优先参加线下活动", "赠送1个月"]'::jsonb, 5),
('enterprise', 12, 3588.00, 2699.00, '["Premium全部权益", "1对1职业规划", "企业内推机会", "专属就业顾问", "优先参加线下活动", "赠送3个月"]'::jsonb, 6)
ON CONFLICT (vip_level, duration_months) DO NOTHING;

-- 启用RLS
ALTER TABLE vip_plans ENABLE ROW LEVEL SECURITY;

-- RLS策略：所有人可以查看套餐
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vip_plans_select_all' AND tablename = 'vip_plans') THEN
    CREATE POLICY "vip_plans_select_all" ON vip_plans FOR SELECT USING (true);
  END IF;
END $$;