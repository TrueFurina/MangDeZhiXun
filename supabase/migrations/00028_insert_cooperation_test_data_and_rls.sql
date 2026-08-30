-- 创建RLS策略
ALTER TABLE cooperation_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperation_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- 合作企业表RLS策略：允许所有认证用户查看（暂时简化，后续可以细化）
CREATE POLICY "认证用户可查看企业" ON cooperation_companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理企业" ON cooperation_companies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 合作方案表RLS策略
CREATE POLICY "认证用户可查看方案" ON cooperation_plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理方案" ON cooperation_plans
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 岗位表RLS策略
CREATE POLICY "认证用户可查看岗位" ON company_positions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理岗位" ON company_positions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 学生投递表RLS策略
CREATE POLICY "认证用户可查看投递" ON student_applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理投递" ON student_applications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 合作项目表RLS策略
CREATE POLICY "认证用户可查看项目" ON cooperation_projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理项目" ON cooperation_projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 项目进度记录表RLS策略
CREATE POLICY "认证用户可查看进度" ON project_progress_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理进度" ON project_progress_records
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 合作协议表RLS策略
CREATE POLICY "认证用户可查看协议" ON cooperation_agreements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理协议" ON cooperation_agreements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 二级学院表RLS策略
CREATE POLICY "认证用户可查看学院" ON colleges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "认证用户可管理学院" ON colleges
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);