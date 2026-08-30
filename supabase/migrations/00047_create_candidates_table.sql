CREATE TABLE public.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_email text NOT NULL,
  name text NOT NULL,
  email text,
  position text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  favorite boolean NOT NULL DEFAULT false,
  evaluations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "candidates_select_all" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "candidates_insert_all" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "candidates_update_all" ON public.candidates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "candidates_delete_all" ON public.candidates FOR DELETE USING (true);

CREATE INDEX idx_candidates_company ON public.candidates(company_email, created_at DESC);
CREATE INDEX idx_candidates_favorite ON public.candidates(company_email, favorite);