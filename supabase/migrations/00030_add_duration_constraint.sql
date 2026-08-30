-- 【低危漏洞修复 L-3】课程时长范围约束

-- 为 duration_minutes 添加范围约束
ALTER TABLE courses 
  DROP CONSTRAINT IF EXISTS courses_duration_minutes_check;

ALTER TABLE courses 
  ADD CONSTRAINT courses_duration_minutes_check 
  CHECK (duration_minutes > 0 AND duration_minutes <= 300);

-- 添加注释
COMMENT ON COLUMN courses.duration_minutes IS '课程标准学习时长（分钟），范围：1-300分钟';
