-- 【中危漏洞修复 M-2】强化学习进度状态约束

-- 修改 course_progress 表，添加进度值约束（只允许 0、50、100）
ALTER TABLE course_progress 
  DROP CONSTRAINT IF EXISTS course_progress_progress_percent_check;

ALTER TABLE course_progress 
  ADD CONSTRAINT course_progress_progress_percent_check 
  CHECK (progress_percent IN (0, 50, 100));

-- 添加注释
COMMENT ON COLUMN course_progress.progress_percent IS '学习进度：0=未学习，50=学习中，100=已完成（三段式手动确认）';
