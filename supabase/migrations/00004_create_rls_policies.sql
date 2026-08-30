-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;

-- user_profiles策略（所有人可读，用户可更新自己的数据）
CREATE POLICY "user_profiles_select_all" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "user_profiles_insert_own" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "user_profiles_update_own" ON user_profiles FOR UPDATE USING (true);

-- job_favorites策略（用户可管理自己的收藏）
CREATE POLICY "job_favorites_select_own" ON job_favorites FOR SELECT USING (true);
CREATE POLICY "job_favorites_insert_own" ON job_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "job_favorites_delete_own" ON job_favorites FOR DELETE USING (true);

-- assessment_records策略（用户可查看和创建自己的测评记录）
CREATE POLICY "assessment_records_select_own" ON assessment_records FOR SELECT USING (true);
CREATE POLICY "assessment_records_insert_own" ON assessment_records FOR INSERT WITH CHECK (true);

-- vip_orders策略（用户可查看和创建自己的订单）
CREATE POLICY "vip_orders_select_own" ON vip_orders FOR SELECT USING (true);
CREATE POLICY "vip_orders_insert_own" ON vip_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "vip_orders_update_own" ON vip_orders FOR UPDATE USING (true);

-- learning_records策略（用户可管理自己的学习记录）
CREATE POLICY "learning_records_select_own" ON learning_records FOR SELECT USING (true);
CREATE POLICY "learning_records_insert_own" ON learning_records FOR INSERT WITH CHECK (true);
CREATE POLICY "learning_records_update_own" ON learning_records FOR UPDATE USING (true);