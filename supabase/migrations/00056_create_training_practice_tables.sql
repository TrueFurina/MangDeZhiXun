-- 班级表：适配高校课程考核制度的外壳
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  university_email text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 班级学生表：脱敏名单（仅学号后4位+性别+政治面貌）
CREATE TABLE public.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_no text NOT NULL,
  gender text,
  political_status text,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_no)
);

-- 实训任务表：教师下发（复用已有training_tasks结构，新增班级关联字段）
ALTER TABLE public.training_tasks
  ADD COLUMN class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  ADD COLUMN scene_type text,
  ADD COLUMN difficulty text,
  ADD COLUMN deadline timestamptz,
  ADD COLUMN status text NOT NULL DEFAULT 'published',
  ADD COLUMN university_email text;

-- 实训提交表：完整对话交互证据链持久化
CREATE TABLE public.training_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.training_tasks(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_no text NOT NULL,
  evidence_chain jsonb NOT NULL DEFAULT '[]'::jsonb,
  script jsonb,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_comment text,
  teacher_override jsonb,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_class_students_class ON public.class_students(class_id);
CREATE INDEX idx_training_tasks_class ON public.training_tasks(class_id);
CREATE INDEX idx_training_submissions_task ON public.training_submissions(task_id);
CREATE INDEX idx_training_submissions_student ON public.training_submissions(student_no);

-- 启用 RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_submissions ENABLE ROW LEVEL SECURITY;

-- classes：院校教师按邮箱管理，admin全权限
CREATE POLICY classes_select_auth ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY classes_insert_auth ON public.classes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY classes_update_auth ON public.classes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY classes_delete_auth ON public.classes FOR DELETE TO authenticated USING (true);

-- class_students
CREATE POLICY cs_select_auth ON public.class_students FOR SELECT TO authenticated USING (true);
CREATE POLICY cs_insert_auth ON public.class_students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cs_update_auth ON public.class_students FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY cs_delete_auth ON public.class_students FOR DELETE TO authenticated USING (true);

-- training_tasks（已有表，补充策略）
CREATE POLICY tt_select_auth ON public.training_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY tt_insert_auth ON public.training_tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY tt_update_auth ON public.training_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY tt_delete_auth ON public.training_tasks FOR DELETE TO authenticated USING (true);

-- training_submissions
CREATE POLICY ts_select_auth ON public.training_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY ts_insert_auth ON public.training_submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY ts_update_auth ON public.training_submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY ts_delete_auth ON public.training_submissions FOR DELETE TO authenticated USING (true);