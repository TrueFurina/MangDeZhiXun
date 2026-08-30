CREATE TABLE public.learning_plan_task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.learning_plans(id) ON DELETE CASCADE,
  task_key text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id, task_key)
);

ALTER TABLE public.learning_plan_task ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_plan_task_select_all" ON public.learning_plan_task FOR SELECT USING (true);
CREATE POLICY "learning_plan_task_insert_all" ON public.learning_plan_task FOR INSERT WITH CHECK (true);
CREATE POLICY "learning_plan_task_update_all" ON public.learning_plan_task FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "learning_plan_task_delete_all" ON public.learning_plan_task FOR DELETE USING (true);

CREATE INDEX idx_learning_plan_task_plan ON public.learning_plan_task(plan_id);

ALTER TABLE public.resume_versions ADD COLUMN keyword_hits jsonb;