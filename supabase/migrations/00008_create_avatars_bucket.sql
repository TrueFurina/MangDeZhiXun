-- 创建avatars存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 设置avatars bucket的RLS策略
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');