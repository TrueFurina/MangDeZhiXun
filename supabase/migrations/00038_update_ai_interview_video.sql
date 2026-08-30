ALTER TABLE ai_interview_record ADD COLUMN IF NOT EXISTS video_features JSONB DEFAULT '{}'::jsonb;
ALTER TABLE ai_interview_record ADD COLUMN IF NOT EXISTS scenario_score DECIMAL(5,2);
ALTER TABLE ai_interview_record ADD COLUMN IF NOT EXISTS skill_score DECIMAL(5,2);
