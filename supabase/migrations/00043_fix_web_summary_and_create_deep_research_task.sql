-- 1. 修复网页内容总结任务表：user_id 改为可空，移除默认值，放宽 RLS（演示场景）
ALTER TABLE public.web_content_summary_task ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.web_content_summary_task ALTER COLUMN user_id DROP DEFAULT;

DROP POLICY IF EXISTS "用户查看自己的总结任务" ON public.web_content_summary_task;
DROP POLICY IF EXISTS "用户创建总结任务" ON public.web_content_summary_task;
DROP POLICY IF EXISTS "用户更新自己的总结任务" ON public.web_content_summary_task;
DROP POLICY IF EXISTS "用户删除自己的总结任务" ON public.web_content_summary_task;
DROP POLICY IF EXISTS "管理员查看所有总结任务" ON public.web_content_summary_task;
DROP POLICY IF EXISTS "管理员更新所有总结任务" ON public.web_content_summary_task;
DROP POLICY IF EXISTS "管理员删除所有总结任务" ON public.web_content_summary_task;

CREATE POLICY "任意用户查看总结任务" ON public.web_content_summary_task
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "任意用户创建总结任务" ON public.web_content_summary_task
  FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "任意用户更新总结任务" ON public.web_content_summary_task
  FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "任意用户删除总结任务" ON public.web_content_summary_task
  FOR DELETE TO authenticated, anon USING (true);

-- 2. 创建深度研究任务表
CREATE TABLE public.deep_research_task (
  task_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  task_name text NOT NULL,
  research_topic text NOT NULL,
  report_type text NOT NULL DEFAULT '行业研究报告',
  reference_files jsonb NOT NULL DEFAULT '[]'::jsonb,
  report_outline jsonb NOT NULL DEFAULT '[]'::jsonb,
  report_content text,
  status smallint NOT NULL DEFAULT 0,
  progress int NOT NULL DEFAULT 0,
  current_stage text,
  generation_log text,
  share_link text,
  create_time timestamptz NOT NULL DEFAULT now(),
  update_time timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_deep_research_user ON public.deep_research_task(user_id, create_time DESC);

ALTER TABLE public.deep_research_task ENABLE ROW LEVEL SECURITY;

CREATE POLICY "任意用户查看研究任务" ON public.deep_research_task
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "任意用户创建研究任务" ON public.deep_research_task
  FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "任意用户更新研究任务" ON public.deep_research_task
  FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "任意用户删除研究任务" ON public.deep_research_task
  FOR DELETE TO authenticated, anon USING (true);