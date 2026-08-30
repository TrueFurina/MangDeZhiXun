CREATE TABLE IF NOT EXISTS user_portrait (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  basic_info JSONB DEFAULT '{}'::jsonb,
  job_target JSONB DEFAULT '{}'::jsonb,
  assessment_history JSONB DEFAULT '[]'::jsonb,
  learning_behavior JSONB DEFAULT '{}'::jsonb,
  resume_experience JSONB DEFAULT '{}'::jsonb,
  competency_model JSONB DEFAULT '{}'::jsonb,
  ability_portrait JSONB DEFAULT '{}'::jsonb,
  interview_history JSONB DEFAULT '[]'::jsonb,
  recommended_learning JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_interview_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_id UUID,
  enterprise_id UUID,
  interview_type TEXT DEFAULT 'voice',
  status INTEGER DEFAULT 0,
  total_score DECIMAL(5,2),
  round_count INTEGER DEFAULT 0,
  round_data JSONB DEFAULT '[]'::jsonb,
  voice_features JSONB DEFAULT '{}'::jsonb,
  logic_score DECIMAL(5,2),
  pressure_score DECIMAL(5,2),
  ai_comment TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_portrait ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_portrait_select" ON user_portrait FOR SELECT USING (true);
CREATE POLICY "user_portrait_insert" ON user_portrait FOR INSERT WITH CHECK (true);
CREATE POLICY "user_portrait_update" ON user_portrait FOR UPDATE USING (true);

ALTER TABLE ai_interview_record ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_interview_record_select" ON ai_interview_record FOR SELECT USING (true);
CREATE POLICY "ai_interview_record_insert" ON ai_interview_record FOR INSERT WITH CHECK (true);
CREATE POLICY "ai_interview_record_update" ON ai_interview_record FOR UPDATE USING (true);