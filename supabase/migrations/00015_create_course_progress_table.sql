-- 课程进度表
CREATE TABLE course_progress (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  course_id BIGINT NOT NULL,
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  is_completed BOOLEAN DEFAULT FALSE,
  exam_passed BOOLEAN DEFAULT FALSE,
  last_studied_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, course_id)
);

CREATE INDEX idx_course_progress_user ON course_progress(user_email);

ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_progress_select_own" ON course_progress FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "course_progress_insert_own" ON course_progress FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "course_progress_update_own" ON course_progress FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');