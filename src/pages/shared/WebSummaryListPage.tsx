import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Plus, Trash2, ExternalLink, Loader2, Link2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getSummaryTasks, createSummaryTask, deleteSummaryTask, type WebSummaryTask } from '@/db/webSummary';
import { EmptyState, LoadingState } from '@/components/common/StateViews';

const STATUS_MAP: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  0: { label: '未开始', variant: 'outline' },
  1: { label: '生成中', variant: 'secondary' },
  2: { label: '已完成', variant: 'default' },
  3: { label: '失败', variant: 'destructive' },
};

interface Props {
  basePath: string;
}

export default function WebSummaryListPage({ basePath }: Props) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<WebSummaryTask[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [urlText, setUrlText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const res = await getSummaryTasks(page);
    setTasks(res.data);
    setTotal(res.total);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const parseUrls = (text: string): string[] => {
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  };

  const validateUrls = (urls: string[]): { valid: string[]; invalid: string[] } => {
    const valid: string[] = [];
    const invalid: string[] = [];
    for (const u of urls) {
      try { new URL(u); valid.push(u); }
      catch { invalid.push(u); }
    }
    return { valid, invalid };
  };

  const handleCreate = async () => {
    const urls = parseUrls(urlText);
    if (!taskName.trim()) { toast.error('请输入任务名称'); return; }
    if (urls.length === 0) { toast.error('请输入至少一条网页链接'); return; }
    const { valid, invalid } = validateUrls(urls);
    if (valid.length === 0) { toast.error('链接格式均不正确，请检查后重试'); return; }
    if (invalid.length > 0) toast.warning(`${invalid.length}条链接格式不正确，已自动忽略`);

    setSubmitting(true);
    const task = await createSummaryTask(taskName.trim(), valid);
    setSubmitting(false);
    if (task) {
      toast.success('总结任务已创建');
      setCreateOpen(false);
      setTaskName('');
      setUrlText('');
      navigate(`${basePath}/${task.task_id}`);
    } else {
      toast.error('任务创建失败，请稍后重试');
    }
  };

  const handleDelete = async (taskId: string) => {
    const ok = await deleteSummaryTask(taskId);
    if (ok) { toast.success('已删除'); fetchTasks(); }
    else toast.error('删除失败');
  };

  const urlCount = (t: WebSummaryTask) => Array.isArray(t.url_list) ? t.url_list.length : 0;

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">网页内容总结</h1>
          <p className="mt-1 text-sm text-muted-foreground">粘贴网页链接，一键生成精简摘要与核心要点</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />创建总结任务
        </Button>
      </div>

      {/* 任务列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6"><LoadingState rows={5} /></div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="暂无总结任务"
              description="点击右上角「创建总结任务」，粘贴网页链接即可生成摘要"
              action={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />创建总结任务</Button>}
            />
          ) : (
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">任务名称</TableHead>
                    <TableHead className="whitespace-nowrap">链接数</TableHead>
                    <TableHead className="whitespace-nowrap">状态</TableHead>
                    <TableHead className="whitespace-nowrap">创建时间</TableHead>
                    <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map(t => {
                    const st = STATUS_MAP[t.status] || STATUS_MAP[0];
                    return (
                      <TableRow key={t.task_id}>
                        <TableCell className="whitespace-nowrap font-medium">{t.task_name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="gap-1"><Link2 className="h-3 w-3" />{urlCount(t)}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(t.create_time).toLocaleString('zh-CN')}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`${basePath}/${t.task_id}`)}>
                              查看
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>删除后无法恢复，确定要删除「{t.task_name}」吗？</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(t.task_id)}>删除</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
          <span className="text-sm text-muted-foreground">第 {page} 页</span>
          <Button variant="outline" size="sm" disabled={tasks.length < 20} onClick={() => setPage(p => p + 1)}>下一页</Button>
        </div>
      )}

      {/* 创建任务弹窗 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>创建总结任务</DialogTitle>
            <DialogDescription>输入任务名称与网页链接（每行一条），系统将自动提取正文并生成摘要</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">任务名称</label>
              <Input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="如：职场干货整理、求职面经汇总" className="px-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">网页链接</label>
              <Textarea
                value={urlText}
                onChange={e => setUrlText(e.target.value)}
                placeholder="每行一条链接，例如：&#10;https://example.com/article1&#10;https://example.com/article2"
                className="min-h-[140px] px-3"
              />
              {urlText.trim() && (
                <p className="text-xs text-muted-foreground">已识别 {parseUrls(urlText).length} 条链接</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              开始总结
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}