import { supabase } from '@/lib/supabase';

export interface SummaryItem {
  url: string;
  title: string;
  summary: string;
  keyPoints: string[];
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export interface WebSummaryTask {
  task_id: string;
  user_id: string;
  task_name: string;
  url_list: string[];
  summary_result: SummaryItem[];
  status: number; // 0未开始/1生成中/2已完成/3生成失败
  progress: number;
  current_url: string | null;
  generation_log: string | null;
  create_time: string;
  update_time: string;
}

// 创建总结任务
export async function createSummaryTask(taskName: string, urls: string[]): Promise<WebSummaryTask | null> {
  const { data, error } = await supabase
    .from('web_content_summary_task')
    .insert({
      task_name: taskName,
      url_list: urls,
      summary_result: urls.map(u => ({ url: u, title: '', summary: '', keyPoints: [], status: 'pending' })),
      status: 1,
      progress: 0,
      // user_id 由数据库默认处理，避免传入 anon 导致 UUID 类型错误
    })
    .select()
    .maybeSingle();
  if (error) { console.error('创建总结任务失败:', error); return null; }
  return data as WebSummaryTask;
}

// 获取任务列表
export async function getSummaryTasks(page = 1, pageSize = 20): Promise<{ data: WebSummaryTask[]; total: number }> {
  const { data, error, count } = await supabase
    .from('web_content_summary_task')
    .select('*', { count: 'exact' })
    .order('create_time', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error('获取总结任务列表失败:', error); return { data: [], total: 0 }; }
  return { data: (Array.isArray(data) ? data : []) as WebSummaryTask[], total: count || 0 };
}

// 获取单个任务
export async function getSummaryTask(taskId: string): Promise<WebSummaryTask | null> {
  const { data, error } = await supabase
    .from('web_content_summary_task')
    .select('*')
    .eq('task_id', taskId)
    .maybeSingle();
  if (error) { console.error('获取总结任务失败:', error); return null; }
  return data as WebSummaryTask;
}

// 更新任务
export async function updateSummaryTask(
  taskId: string,
  updates: Partial<Pick<WebSummaryTask, 'summary_result' | 'status' | 'progress' | 'current_url' | 'generation_log'>>,
): Promise<boolean> {
  const { error } = await supabase
    .from('web_content_summary_task')
    .update({ ...updates, update_time: new Date().toISOString() })
    .eq('task_id', taskId);
  if (error) { console.error('更新总结任务失败:', error); return false; }
  return true;
}

// 删除任务
export async function deleteSummaryTask(taskId: string): Promise<boolean> {
  const { error } = await supabase.from('web_content_summary_task').delete().eq('task_id', taskId);
  if (error) { console.error('删除总结任务失败:', error); return false; }
  return true;
}

// 调用网页总结 Edge Function（单条链接）
export async function summarizeWebPage(url: string): Promise<{ summary: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke('webpage-summarizer', {
    body: { sysOriginQuery: '请帮我总结这个网页的主要内容，提炼核心要点，以列表形式列出3-5条关键信息', webUrl: [url] },
  });
  if (error) {
    const msg = await error?.context?.text?.();
    return { summary: '', error: msg || error.message || '总结失败' };
  }
  const event = data?.content?.[0]?.event;
  if (event?.error_code_int !== 0) {
    return { summary: '', error: `API错误: ${event?.error_message || '未知错误'}` };
  }
  // 优先从 content[0].text.data（JSON 字符串 {"output":"..."}）解析
  let output = '';
  const textData = data?.content?.[0]?.text?.data;
  if (typeof textData === 'string') {
    try {
      const parsed = JSON.parse(textData);
      output = parsed?.output || '';
    } catch {
      output = textData;
    }
  }
  // 兜底：旧结构 node_content[0].outputs.output
  if (!output) {
    output = data?.content?.[0]?.raw_data?.origin_response?.node_content?.[0]?.outputs?.output || '';
  }
  return { summary: output };
}

// 从总结文本中解析核心要点
export function parseKeyPoints(summary: string): string[] {
  const lines = summary.split('\n').map(l => l.trim()).filter(Boolean);
  const points: string[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[-*•·\d.、\s]+/, '').replace(/^【.*?】/, '').trim();
    if (cleaned && cleaned.length > 4) points.push(cleaned);
  }
  return points.slice(0, 8);
}

// 从总结文本中提取标题（第一行或首句）
export function extractTitle(summary: string, url: string): string {
  const firstLine = summary.split('\n').map(l => l.trim()).find(l => l.length > 0);
  if (firstLine) {
    const cleaned = firstLine.replace(/^#+\s*/, '').replace(/^【.*?】/, '').replace(/^网页内容分析[:：]?\s*/, '').trim();
    if (cleaned.length > 0 && cleaned.length < 80) return cleaned;
  }
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url.slice(0, 50);
  }
}

// 从总结文本中提取摘要正文（去掉要点列表部分）
export function extractSummaryText(summary: string): string {
  const lines = summary.split('\n').map(l => l.trim()).filter(Boolean);
  const proseLines = lines.filter(l => !/^[-*•·\d.、]/.test(l));
  if (proseLines.length > 0) {
    return proseLines.slice(0, 3).join(' ').slice(0, 500);
  }
  // 若整段均为要点列表（无概述句），则取首条要点作为精简摘要，避免摘要区为空
  const firstPoint = lines.find(l => l.length > 4);
  return firstPoint ? firstPoint.replace(/^[-*•·\d.、\s]+/, '').slice(0, 500) : '';
}