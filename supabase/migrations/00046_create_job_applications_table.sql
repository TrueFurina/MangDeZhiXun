CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  company text NOT NULL,
  position text NOT NULL,
  status text NOT NULL DEFAULT 'applied',
  salary text,
  source text,
  interview_rounds integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_applications_select_all" ON public.job_applications FOR SELECT USING (true);
CREATE POLICY "job_applications_insert_all" ON public.job_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "job_applications_update_all" ON public.job_applications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "job_applications_delete_all" ON public.job_applications FOR DELETE USING (true);

CREATE INDEX idx_job_applications_user ON public.job_applications(user_email, created_at DESC);