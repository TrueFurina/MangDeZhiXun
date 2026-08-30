-- 添加第三方登录字段
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wechat_openid TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wechat_unionid TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS qq_openid TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS alipay_user_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS login_type TEXT DEFAULT 'phone' CHECK (login_type IN ('phone', 'wechat', 'qq', 'alipay'));

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_wechat_openid ON user_profiles(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_qq_openid ON user_profiles(qq_openid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_alipay_user_id ON user_profiles(alipay_user_id);

-- 更新已有用户的login_type
UPDATE user_profiles SET login_type = 'phone' WHERE login_type IS NULL;