import { supabase } from '@/lib/supabase';

export interface ErrorLog {
  log_id: string;
  error_time: string;
  error_type: string;
  error_message: string | null;
  function_name: string;
  request_params: Record<string, unknown> | null;
  user_id: string | null;
  create_time: string;
}

export interface PerformanceMonitor {
  monitor_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  function_name: string;
  request_params: Record<string, unknown> | null;
  create_time: string;
}

// 获取错误日志列表
export async function getErrorLogs(params: {
  functionName?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: ErrorLog[]; total: number }> {
  const { functionName, startTime, endTime, page = 1, pageSize = 20 } = params;
  let query = supabase.from('error_log').select('*', { count: 'exact' });
  if (functionName) query = query.eq('function_name', functionName);
  if (startTime) query = query.gte('error_time', startTime);
  if (endTime) query = query.lte('error_time', endTime);
  query = query.order('error_time', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await query;
  if (error) { console.error('获取错误日志失败:', error); return { data: [], total: 0 }; }
  return { data: (data || []) as ErrorLog[], total: count || 0 };
}

// 获取性能监控列表
export async function getPerformanceMonitor(params: {
  functionName?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: PerformanceMonitor[]; total: number }> {
  const { functionName, startTime, endTime, page = 1, pageSize = 20 } = params;
  let query = supabase.from('performance_monitor').select('*', { count: 'exact' });
  if (functionName) query = query.eq('function_name', functionName);
  if (startTime) query = query.gte('start_time', startTime);
  if (endTime) query = query.lte('start_time', endTime);
  query = query.order('start_time', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);
  const { data, error, count } = await query;
  if (error) { console.error('获取性能监控失败:', error); return { data: [], total: 0 }; }
  return { data: (data || []) as PerformanceMonitor[], total: count || 0 };
}

// 获取耗时趋势（按函数名聚合平均耗时）
export async function getDurationTrend(params: {
  startTime: string;
  endTime: string;
  functionName?: string;
}): Promise<{ time: string; avgDuration: number; count: number }[]> {
  const { startTime, endTime, functionName } = params;
  let query = supabase.from('performance_monitor')
    .select('start_time, duration')
    .gte('start_time', startTime)
    .lte('start_time', endTime)
    .order('start_time', { ascending: true })
    .limit(5000);
  if (functionName) query = query.eq('function_name', functionName);
  const { data, error } = await query;
  if (error || !data) return [];
  // 按小时聚合
  const map = new Map<string, { total: number; count: number }>();
  for (const row of data as { start_time: string; duration: number }[]) {
    const d = new Date(row.start_time);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:00`;
    const cur = map.get(key) || { total: 0, count: 0 };
    cur.total += row.duration;
    cur.count += 1;
    map.set(key, cur);
  }
  return Array.from(map.entries()).map(([time, v]) => ({
    time,
    avgDuration: Math.round(v.total / v.count),
    count: v.count,
  }));
}

// 获取错误统计（按类型聚合）
export async function getErrorStats(params: {
  startTime?: string;
  endTime?: string;
}): Promise<{ errorType: string; count: number }[]> {
  const { startTime, endTime } = params;
  let query = supabase.from('error_log').select('error_type');
  if (startTime) query = query.gte('error_time', startTime);
  if (endTime) query = query.lte('error_time', endTime);
  query = query.order('error_time', { ascending: false }).limit(5000);
  const { data, error } = await query;
  if (error || !data) return [];
  const map = new Map<string, number>();
  for (const row of data as { error_type: string }[]) {
    map.set(row.error_type, (map.get(row.error_type) || 0) + 1);
  }
  return Array.from(map.entries()).map(([errorType, count]) => ({ errorType, count }));
}

// 获取所有 Edge Function 名称列表
export async function getFunctionNames(): Promise<string[]> {
  const { data } = await supabase.from('performance_monitor').select('function_name').limit(1000);
  const set = new Set<string>();
  (data || []).forEach((r: { function_name: string }) => set.add(r.function_name));
  return Array.from(set).sort();
}