CREATE TABLE public.study_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  checkin_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_email, checkin_date)
);

ALTER TABLE public.study_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_checkins_select_all" ON public.study_checkins FOR SELECT USING (true);
CREATE POLICY "study_checkins_insert_all" ON public.study_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "study_checkins_update_all" ON public.study_checkins FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "study_checkins_delete_all" ON public.study_checkins FOR DELETE USING (true);

CREATE INDEX idx_study_checkins_user ON public.study_checkins(user_email, checkin_date DESC);