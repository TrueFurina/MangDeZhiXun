-- 用户上传存储桶（简历图片、头像等）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-uploads', 'user-uploads', true, 1048576, ARRAY['image/jpeg','image/png','image/gif','image/webp','image/avif']);

-- 公开读取策略
CREATE POLICY "user_uploads_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'user-uploads');
-- 认证用户可上传
CREATE POLICY "user_uploads_insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'user-uploads');
-- 用户可更新自己的文件
CREATE POLICY "user_uploads_update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'user-uploads');
-- 用户可删除自己的文件
CREATE POLICY "user_uploads_delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'user-uploads');