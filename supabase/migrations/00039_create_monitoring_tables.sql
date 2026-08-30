-- 错误日志表
CREATE TABLE public.error_log (
  log_id varchar(64) PRIMARY KEY,
  error_time timestamptz NOT NULL,
  error_type varchar(100) NOT NULL,
  error_message text,
  function_name varchar(255) NOT NULL,
  request_params jsonb,
  user_id varchar(64),
  create_time timestamptz NOT NULL DEFAULT now()
);

-- 性能监控表
CREATE TABLE public.performance_monitor (
  monitor_id varchar(64) PRIMARY KEY,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration integer NOT NULL,
  function_name varchar(255) NOT NULL,
  request_params jsonb,
  create_time timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_error_log_function ON public.error_log(function_name);
CREATE INDEX idx_error_log_time ON public.error_log(error_time DESC);
CREATE INDEX idx_perf_monitor_function ON public.performance_monitor(function_name);
CREATE INDEX idx_perf_monitor_time ON public.performance_monitor(create_time DESC);

-- RLS: 仅 service_role 可写，anon 不可读（敏感数据）
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_monitor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_error_log" ON public.error_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_perf_monitor" ON public.performance_monitor FOR ALL TO service_role USING (true) WITH CHECK (true);