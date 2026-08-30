-- 插入时自动清理超过30天的记录（每次插入触发，轻量级批量删除）
CREATE OR REPLACE FUNCTION public.auto_cleanup_monitoring()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.error_log WHERE create_time < now() - interval '30 days';
  DELETE FROM public.performance_monitor WHERE create_time < now() - interval '30 days';
  RETURN NEW;
END;
$$;

-- 在 performance_monitor 上创建触发器（最频繁写入的表）
CREATE TRIGGER trg_auto_cleanup_monitoring
AFTER INSERT ON public.performance_monitor
FOR EACH STATEMENT
EXECUTE FUNCTION public.auto_cleanup_monitoring();