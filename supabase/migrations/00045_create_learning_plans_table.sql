CREATE TABLE public.learning_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  target_company text,
  target_position text,
  plan_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "learning_plans_select_all" ON public.learning_plans FOR SELECT USING (true);
CREATE POLICY "learning_plans_insert_all" ON public.learning_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "learning_plans_update_all" ON public.learning_plans FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "learning_plans_delete_all" ON public.learning_plans FOR DELETE USING (true);

CREATE INDEX idx_learning_plans_user ON public.learning_plans(user_email, created_at DESC);