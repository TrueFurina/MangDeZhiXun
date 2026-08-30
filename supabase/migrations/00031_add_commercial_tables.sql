-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  package_type text NOT NULL,
  package_duration text NOT NULL,
  original_price numeric(10,2) NOT NULL,
  actual_price numeric(10,2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'wechat',
  payment_status smallint NOT NULL DEFAULT 0,
  transaction_id text,
  create_time timestamptz NOT NULL DEFAULT now(),
  pay_time timestamptz,
  expire_time timestamptz NOT NULL
);

-- Modify courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration int DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status smallint DEFAULT 1;

-- Create course_study table
CREATE TABLE IF NOT EXISTS course_study (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  course_id bigint REFERENCES courses(id) NOT NULL,
  study_status smallint NOT NULL DEFAULT 0,
  study_time int NOT NULL DEFAULT 0,
  progress_percent int NOT NULL DEFAULT 0,
  complete_time timestamptz,
  create_time timestamptz NOT NULL DEFAULT now(),
  update_time timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create question_bank table
CREATE TABLE IF NOT EXISTS question_bank (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  type text NOT NULL,
  options jsonb,
  correct_answer text,
  score int NOT NULL DEFAULT 5,
  difficulty text NOT NULL DEFAULT 'medium',
  dimension text NOT NULL,
  create_time timestamptz NOT NULL DEFAULT now(),
  update_time timestamptz NOT NULL DEFAULT now()
);

-- Create assessment_record
CREATE TABLE IF NOT EXISTS assessment_record (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  status smallint NOT NULL DEFAULT 0,
  total_score numeric(5,2),
  dimension_scores jsonb,
  answer_data jsonb,
  start_time timestamptz DEFAULT now(),
  submit_time timestamptz
);