-- 为courses表添加duration_minutes字段，存储课程标准学习时长（分钟）
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;

-- 根据课程类型和难度设置合理的标准学习时长
-- 视频课程：根据难度设置时长
UPDATE courses SET duration_minutes = 
  CASE 
    WHEN type = 'video' AND difficulty = '初级' THEN 20
    WHEN type = 'video' AND difficulty = '中级' THEN 30
    WHEN type = 'video' AND difficulty = '高级' THEN 45
    WHEN type = 'document' AND difficulty = '初级' THEN 15
    WHEN type = 'document' AND difficulty = '中级' THEN 25
    WHEN type = 'document' AND difficulty = '高级' THEN 35
    WHEN type = 'course' AND difficulty = '初级' THEN 40
    WHEN type = 'course' AND difficulty = '中级' THEN 60
    WHEN type = 'course' AND difficulty = '高级' THEN 90
    ELSE 30
  END
WHERE duration_minutes = 30;

-- 添加注释
COMMENT ON COLUMN courses.duration_minutes IS '课程标准学习时长（分钟），用于计算用户总学习时长';
