CREATE TABLE public.resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  name text NOT NULL,
  target_company text,
  target_position text,
  original_content text NOT NULL DEFAULT '',
  optimized_content text NOT NULL DEFAULT '',
  ats_score integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_versions_select_all" ON public.resume_versions FOR SELECT USING (true);
CREATE POLICY "resume_versions_insert_all" ON public.resume_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "resume_versions_update_all" ON public.resume_versions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "resume_versions_delete_all" ON public.resume_versions FOR DELETE USING (true);

CREATE INDEX idx_resume_versions_user ON public.resume_versions(user_email, created_at DESC);