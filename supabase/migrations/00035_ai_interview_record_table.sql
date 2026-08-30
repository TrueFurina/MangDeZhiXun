CREATE TABLE IF NOT EXISTS ai_interview_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    job_id VARCHAR(64),
    interview_type VARCHAR(50) NOT NULL DEFAULT 'voice',
    status SMALLINT NOT NULL DEFAULT 0,
    total_score DECIMAL(5,2),
    round_count INT NOT NULL DEFAULT 0,
    round_data JSONB NOT NULL DEFAULT '[]',
    voice_features JSONB,
    logic_score DECIMAL(5,2),
    pressure_score DECIMAL(5,2),
    ai_comment TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    create_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);