-- Create Enterprise Competency Model table
CREATE TABLE IF NOT EXISTS enterprise_competency_model (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    job_name VARCHAR(200) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    dimension_config JSONB NOT NULL DEFAULT '{}',
    question_ids JSONB NOT NULL DEFAULT '[]',
    status TINYINT NOT NULL DEFAULT 1,
    create_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    update_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Candidate Assessment Account table
CREATE TABLE IF NOT EXISTS candidate_assessment_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    model_id UUID REFERENCES enterprise_competency_model(id) ON DELETE CASCADE,
    candidate_name VARCHAR(100) NOT NULL,
    candidate_phone VARCHAR(20) NOT NULL,
    account_code VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    expire_time TIMESTAMPTZ NOT NULL,
    create_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    use_time TIMESTAMPTZ
);
