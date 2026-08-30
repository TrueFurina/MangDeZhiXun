-- 添加answers字段用于存储答案和AI批改结果
ALTER TABLE assessment_records 
ADD COLUMN IF NOT EXISTS answers jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN assessment_records.answers IS '存储用户答案、AI批改结果和题目信息的JSON数据';