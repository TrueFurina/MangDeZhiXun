-- 创建清理函数：删除超过30天的监控数据
CREATE OR REPLACE FUNCTION public.cleanup_old_monitoring_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.error_log WHERE create_time < now() - interval '30 days';
  DELETE FROM public.performance_monitor WHERE create_time < now() - interval '30 days';
END;
$$;

-- 允许 service_role 执行清理函数
GRANT EXECUTE ON FUNCTION public.cleanup_old_monitoring_data() TO service_role;