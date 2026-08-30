-- 创建学生认证表
CREATE TABLE IF NOT EXISTS student_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  real_name TEXT NOT NULL,
  student_card_image_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMPTZ,
  rejected_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_student_verifications_user_id ON student_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_student_verifications_status ON student_verifications(verification_status);

-- 添加RLS策略
ALTER TABLE student_verifications ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的认证记录
CREATE POLICY "Users can view own verification"
  ON student_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以创建自己的认证申请
CREATE POLICY "Users can create own verification"
  ON student_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的认证申请（仅在pending状态）
CREATE POLICY "Users can update own pending verification"
  ON student_verifications
  FOR UPDATE
  USING (auth.uid() = user_id AND verification_status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- 创建Storage bucket用于存储学生证照片
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-cards', 'student-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket的RLS策略
CREATE POLICY "Users can upload own student card"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'student-cards' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view student cards"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'student-cards');

-- 添加触发器自动更新updated_at
CREATE OR REPLACE FUNCTION update_student_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_verification_updated_at
  BEFORE UPDATE ON student_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_student_verification_updated_at();