-- 添加邀请相关字段到 user_profiles 表
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES user_profiles(id);

-- 自动为现有的用户生成随机的 invite_code (使用简单的更新)
UPDATE user_profiles SET invite_code = SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8) WHERE invite_code IS NULL;

-- 创建分销收益记录表
CREATE TABLE IF NOT EXISTS affiliate_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promoter_id UUID NOT NULL REFERENCES user_profiles(id), -- 推广人(获利者)
    invitee_id UUID NOT NULL REFERENCES user_profiles(id),  -- 被邀请人(购买者)
    order_id UUID REFERENCES orders(id),            -- 对应的订单
    reward_amount DECIMAL(10,2) NOT NULL,           -- 返现金额
    status INTEGER DEFAULT 0,                       -- 0: 待结算, 1: 已结算
    create_time TIMESTAMPTZ DEFAULT NOW(),
    settle_time TIMESTAMPTZ
);

-- 为避免插入时没有 invite_code，我们创建一个触发器
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invite_code_profiles ON user_profiles;
CREATE TRIGGER trigger_generate_invite_code_profiles
BEFORE INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION generate_invite_code();
