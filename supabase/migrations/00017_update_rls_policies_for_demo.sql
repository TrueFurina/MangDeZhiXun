-- 删除旧的RLS策略
DROP POLICY IF EXISTS "learning_records_select_own" ON learning_records;
DROP POLICY IF EXISTS "learning_records_insert_own" ON learning_records;
DROP POLICY IF EXISTS "course_progress_select_own" ON course_progress;
DROP POLICY IF EXISTS "course_progress_insert_own" ON course_progress;
DROP POLICY IF EXISTS "course_progress_update_own" ON course_progress;
DROP POLICY IF EXISTS "user_achievements_select_own" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_insert_own" ON user_achievements;
DROP POLICY IF EXISTS "growth_paths_select_own" ON growth_paths;
DROP POLICY IF EXISTS "growth_paths_insert_own" ON growth_paths;
DROP POLICY IF EXISTS "growth_paths_update_own" ON growth_paths;
DROP POLICY IF EXISTS "user_stats_select_own" ON user_stats;
DROP POLICY IF EXISTS "user_stats_insert_own" ON user_stats;
DROP POLICY IF EXISTS "user_stats_update_own" ON user_stats;

-- 创建新的RLS策略（允许所有人访问，用于演示）
CREATE POLICY "learning_records_all" ON learning_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "course_progress_all" ON course_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "user_achievements_all" ON user_achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "growth_paths_all" ON growth_paths FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "user_stats_all" ON user_stats FOR ALL USING (true) WITH CHECK (true);