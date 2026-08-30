-- 【高危漏洞修复 H-2】增强课程进度防重复提交逻辑

-- 创建触发器函数：防止已完成课程被重复更新
CREATE OR REPLACE FUNCTION prevent_completed_course_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果旧记录已完成（progress_percent = 100 且 is_completed = true）
  IF OLD.progress_percent = 100 AND OLD.is_completed = true THEN
    -- 如果新记录试图修改进度或完成状态，拒绝更新
    IF NEW.progress_percent != 100 OR NEW.is_completed != true THEN
      RAISE EXCEPTION '该课程已完成，无法修改进度';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 绑定触发器到 course_progress 表
DROP TRIGGER IF EXISTS check_completed_before_update ON course_progress;
CREATE TRIGGER check_completed_before_update
  BEFORE UPDATE ON course_progress
  FOR EACH ROW
  EXECUTE FUNCTION prevent_completed_course_update();

-- 添加注释
COMMENT ON FUNCTION prevent_completed_course_update() IS '防止已完成课程被重复更新的触发器函数';
