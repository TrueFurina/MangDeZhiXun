-- 数据库索引审计：为高频查询字段补充复合索引
CREATE INDEX idx_evaluations_user_created ON public.evaluations(user_id, created_at DESC);
CREATE INDEX idx_resume_optimizations_user ON public.resume_optimizations(user_id, created_at DESC);
CREATE INDEX idx_positions_company_status ON public.positions(company_id, status, update_time DESC);
CREATE INDEX idx_courses_status_rating ON public.courses(status, rating DESC);
CREATE INDEX idx_error_log_function_time ON public.error_log(function_name, error_time DESC);
CREATE INDEX idx_performance_monitor_function_time ON public.performance_monitor(function_name, start_time DESC);

-- RLS 收紧：对新增的含 user_email 的表增加基于邮箱的严格策略（与宽松策略并存）
CREATE POLICY "study_checkins_strict_user" ON public.study_checkins
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "resume_versions_strict_user" ON public.resume_versions
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "job_applications_strict_user" ON public.job_applications
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "learning_plans_strict_user" ON public.learning_plans
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');