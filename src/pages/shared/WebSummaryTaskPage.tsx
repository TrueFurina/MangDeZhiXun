import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, Copy, CheckCircle2, XCircle, Loader2, ExternalLink,
  ChevronDown, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getSummaryTask, updateSummaryTask, summarizeWebPage,
  parseKeyPoints, extractTitle, extractSummaryText,
  type WebSummaryTask, type SummaryItem,
} from '@/db/webSummary';
import { ErrorState, LoadingState } from '@/components/common/StateViews';

interface Props {
  basePath: string;
}

export default function WebSummaryTaskPage({ basePath }: Props) {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<WebSummaryTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const processingRef = useRef(false);

  // 加载任务
  const loadTask = useCallback(async () => {
    if (!taskId) return;
    const t = await getSummaryTask(taskId);
    if (t) { setTask(t); setError(false); }
    else setError(true);
    setLoading(false);
  }, [taskId]);

  useEffect(() => { loadTask(); }, [loadTask]);

  // 处理生成（逐条调用）
  const processTask = useCallback(async (current: WebSummaryTask) => {
    if (processingRef.current) return;
    if (current.status === 2 || current.status === 3) return;
    processingRef.current = true;

    const results: SummaryItem[] = Array.isArray(current.summary_result) ? [...current.summary_result] : [];
    const urls: string[] = Array.isArray(current.url_list) ? current.url_list : [];
    const logs: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      if (results[i]?.status === 'success') continue;
      const url = urls[i];
      const progress = Math.round(((i) / urls.length) * 100);
      await updateSummaryTask(current.task_id, {
        current_url: url,
        progress,
        generation_log: [...logs, `正在处理第 ${i + 1}/${urls.length} 条链接：${url.slice(0, 60)}`].join('\n'),
      });
      setTask(prev => prev ? { ...prev, current_url: url, progress } : prev);

      const res = await summarizeWebPage(url);
      if (res.error) {
        results[i] = { url, title: extractTitle('', url), summary: '', keyPoints: [], status: 'error', error: res.error };
        logs.push(`✗ 第 ${i + 1} 条处理失败：${res.error}`);
      } else {
        const summary = res.summary;
        results[i] = {
          url,
          title: extractTitle(summary, url),
          summary: extractSummaryText(summary),
          keyPoints: parseKeyPoints(summary),
          status: 'success',
        };
        logs.push(`✓ 第 ${i + 1} 条处理完成`);
      }
      const newProgress = Math.round(((i + 1) / urls.length) * 100);
      await updateSummaryTask(current.task_id, {
        summary_result: results,
        progress: newProgress,
        generation_log: logs.join('\n'),
      });
      setTask(prev => prev ? { ...prev, summary_result: [...results], progress: newProgress, generation_log: logs.join('\n') } : prev);
    }

    const hasError = results.some(r => r.status === 'error');
    const finalStatus = hasError ? 3 : 2;
    await updateSummaryTask(current.task_id, { status: finalStatus, progress: 100, current_url: null });
    setTask(prev => prev ? { ...prev, status: finalStatus, progress: 100, current_url: null } : prev);
    processingRef.current = false;
  }, []);

  // 自动触发处理
  useEffect(() => {
    if (task && task.status === 1 && !processingRef.current) {
      processTask(task);
    }
  }, [task, processTask]);

  const copyItem = async (item: SummaryItem, index: number) => {
    const text = `【${item.title}】\n链接：${item.url}\n摘要：${item.summary}\n核心要点：\n${item.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(`${index}`);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const copyAll = async () => {
    if (!task) return;
    const items = task.summary_result.filter(r => r.status === 'success');
    const text = items.map((item, i) =>
      `【${i + 1}. ${item.title}】\n链接：${item.url}\n摘要：${item.summary}\n核心要点：\n${item.keyPoints.map((p, j) => `  ${j + 1}. ${p}`).join('\n')}`
    ).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`已复制 ${items.length} 条摘要`);
    } catch {
      toast.error('复制失败');
    }
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card><CardContent className="p-6"><LoadingState rows={4} /></CardContent></Card>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(basePath)}><ArrowLeft className="mr-2 h-4 w-4" />返回列表</Button>
        <Card><CardContent className="p-0"><ErrorState title="任务不存在" description="该总结任务可能已被删除" onRetry={() => navigate(basePath)} /></CardContent></Card>
      </div>
    );
  }

  const isGenerating = task.status === 1;
  const items = Array.isArray(task.summary_result) ? task.summary_result : [];
  const successCount = items.filter(r => r.status === 'success').length;
  const errorCount = items.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* 返回 + 标题 */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(basePath)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold md:text-2xl">{task.task_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(task.create_time).toLocaleString('zh-CN')} · 共 {items.length} 条链接
          </p>
        </div>
        {!isGenerating && successCount > 0 && (
          <Button variant="outline" size="sm" className="shrink-0" onClick={copyAll}>
            <Copy className="mr-2 h-4 w-4" />批量复制
          </Button>
        )}
      </div>

      {/* 生成进度 */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="font-medium">正在生成摘要...</span>
              <span className="ml-auto text-sm text-muted-foreground">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="mb-4" />
            {task.current_url && (
              <p className="mb-2 truncate text-sm text-muted-foreground">当前处理：{task.current_url}</p>
            )}
            {task.generation_log && (
              <div className="max-h-32 overflow-y-auto rounded bg-muted p-3">
                {task.generation_log.split('\n').map((line, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{line}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 完成统计 */}
      {!isGenerating && (
        <div className="flex flex-wrap gap-3">
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />成功 {successCount}
          </Badge>
          {errorCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3.5 w-3.5" />失败 {errorCount}
            </Badge>
          )}
        </div>
      )}

      {/* 摘要结果 */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isOpen = openItems.has(index) || isGenerating;
          return (
            <Collapsible key={index} open={isOpen} onOpenChange={() => !isGenerating && toggleItem(index)}>
              <Card className={item.status === 'error' ? 'border-destructive/40' : ''}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {item.status === 'success' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : item.status === 'error' ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title || item.url}</p>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary" onClick={e => e.stopPropagation()}>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.url}</span>
                        </a>
                      </div>
                      {!isGenerating && (
                        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <CardContent className="p-4">
                    {item.status === 'error' ? (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{item.error || '摘要生成失败'}</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {item.summary && (
                          <div>
                            <p className="mb-1 text-sm font-medium text-muted-foreground">精简摘要</p>
                            <p className="text-sm leading-relaxed">{item.summary}</p>
                          </div>
                        )}
                        {item.keyPoints.length > 0 && (
                          <div>
                            <p className="mb-2 text-sm font-medium text-muted-foreground">核心要点</p>
                            <ul className="space-y-1.5">
                              {item.keyPoints.map((p, i) => (
                                <li key={i} className="flex gap-2 text-sm">
                                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                                  <span className="min-w-0 flex-1">{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.status === 'success' && (
                          <Button variant="outline" size="sm" onClick={() => copyItem(item, index)}>
                            {copiedId === `${index}` ? <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copiedId === `${index}` ? '已复制' : '复制摘要'}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* 空状态 */}
      {!isGenerating && items.length === 0 && (
        <Card>
          <CardContent className="p-0">
            <ErrorState title="暂无摘要结果" description="该任务未生成任何摘要" onRetry={() => navigate(basePath)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}