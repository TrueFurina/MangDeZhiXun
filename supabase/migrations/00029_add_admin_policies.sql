-- 【中危漏洞修复 M-4】配置管理端特殊权限

-- 为 course_progress 表添加管理员查看权限
CREATE POLICY "course_progress_select_admin" 
  ON course_progress FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@mangdehenzhi.com'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

-- 为 user_stats 表添加管理员查看权限
CREATE POLICY "user_stats_select_admin" 
  ON user_stats FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@mangdehenzhi.com'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

-- 为 user_achievements 表添加管理员查看权限
CREATE POLICY "user_achievements_select_admin" 
  ON user_achievements FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@mangdehenzhi.com'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

-- 为 growth_paths 表添加管理员查看权限
CREATE POLICY "growth_paths_select_admin" 
  ON growth_paths FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'admin@mangdehenzhi.com'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

-- 添加注释
COMMENT ON POLICY "course_progress_select_admin" ON course_progress IS '管理员可查看所有用户的课程进度';
COMMENT ON POLICY "user_stats_select_admin" ON user_stats IS '管理员可查看所有用户的统计数据';
COMMENT ON POLICY "user_achievements_select_admin" ON user_achievements IS '管理员可查看所有用户的成就';
COMMENT ON POLICY "growth_paths_select_admin" ON growth_paths IS '管理员可查看所有用户的成长路径';
