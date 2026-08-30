-- 用户课程关联表（课程播放页完成时写入）
CREATE TABLE public.user_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  course_id uuid NOT NULL,
  progress int NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  create_time timestamptz NOT NULL DEFAULT now(),
  update_time timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_email, course_id)
);

CREATE INDEX idx_user_courses_email ON public.user_courses(user_email, create_time DESC);

ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "任意用户查看用户课程" ON public.user_courses
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "任意用户创建用户课程" ON public.user_courses
  FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "任意用户更新用户课程" ON public.user_courses
  FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);
CREATE POLICY "任意用户删除用户课程" ON public.user_courses
  FOR DELETE TO authenticated, anon USING (true);