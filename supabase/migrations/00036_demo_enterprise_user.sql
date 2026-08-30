INSERT INTO user_profiles (id, email, nickname, phone, avatar_url, vip_level)
VALUES (
  '12345678-1234-1234-1234-123456789012',
  'demo@company.com',
  '阿里巴巴集团HR',
  '138****0001',
  '',
  'enterprise'
)
ON CONFLICT (email) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  vip_level = EXCLUDED.vip_level,
  updated_at = NOW();