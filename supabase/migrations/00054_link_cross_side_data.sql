-- 1) candidates 关联真实平台学员
ALTER TABLE public.candidates
  ADD COLUMN student_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN student_email text;

-- 2) assessment_records 补充 user_id，便于跨端按学员查询
ALTER TABLE public.assessment_records
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 回填已有 assessment_records 的 user_id（通过 user_profiles.email 关联）
UPDATE public.assessment_records ar
SET user_id = up.user_id
FROM public.user_profiles up
WHERE ar.user_email = up.email AND ar.user_id IS NULL;

CREATE INDEX idx_assessment_records_user_id ON public.assessment_records(user_id);

-- 3) job_applications 关联具体岗位（positions 主键为 position_id）
ALTER TABLE public.job_applications
  ADD COLUMN position_id integer REFERENCES public.positions(position_id) ON DELETE SET NULL;

-- 4) 平台人才库视图：学员 + 最新测评得分，供企业端发现真实学员
CREATE OR REPLACE VIEW public.student_talent AS
SELECT
  up.user_id,
  up.email,
  up.nickname,
  up.phone,
  up.university_name,
  up.college_name,
  up.job_intent,
  up.graduation_year,
  up.avatar_url,
  latest.job_title,
  latest.total_score,
  latest.tech_score,
  latest.general_score,
  latest.behavior_score,
  latest.experience_score,
  latest.completed_at AS assessment_at
FROM public.user_profiles up
LEFT JOIN LATERAL (
  SELECT *
  FROM public.assessment_records ar
  WHERE ar.user_id = up.user_id
  ORDER BY ar.completed_at DESC
  LIMIT 1
) latest ON true
WHERE up.user_role = 'student' AND up.user_id IS NOT NULL;