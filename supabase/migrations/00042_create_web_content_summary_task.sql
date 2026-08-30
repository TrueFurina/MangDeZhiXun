-- 网页内容总结任务表
CREATE TABLE public.web_content_summary_task (
  task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  task_name text NOT NULL,
  url_list jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary_result jsonb NOT NULL DEFAULT '[]'::jsonb,
  status smallint NOT NULL DEFAULT 0,
  progress int NOT NULL DEFAULT 0,
  current_url text,
  generation_log text,
  create_time timestamptz NOT NULL DEFAULT now(),
  update_time timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_web_summary_user ON public.web_content_summary_task(user_id, create_time DESC);

ALTER TABLE public.web_content_summary_task ENABLE ROW LEVEL SECURITY;

-- 用户：只能操作自己的任务
CREATE POLICY "用户查看自己的总结任务" ON public.web_content_summary_task
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "用户创建总结任务" ON public.web_content_summary_task
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "用户更新自己的总结任务" ON public.web_content_summary_task
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "用户删除自己的总结任务" ON public.web_content_summary_task
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 管理员：全部权限
CREATE POLICY "管理员查看所有总结任务" ON public.web_content_summary_task
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND user_role = 'admin')
  );
CREATE POLICY "管理员更新所有总结任务" ON public.web_content_summary_task
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND user_role = 'admin')
  );
CREATE POLICY "管理员删除所有总结任务" ON public.web_content_summary_task
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND user_role = 'admin')
  );