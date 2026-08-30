import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DeepResearchProgressPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTask();

    // 订阅数据库变更
    const channel = supabase
      .channel(`task_progress_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deep_research_task',
          filter: `task_id=eq.${id}`,
        },
        (payload) => {
          setTask(payload.new);
          if (payload.new.status === 2 || payload.new.status === 3) {
            // 已完成或失败，跳转或提示
            if (payload.new.status === 2) {
              toast.success('研究报告生成完毕！');
              navigate(`../report/${id}`, { replace: true });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    // 自动滚动到底部
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [task?.generation_log]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deep_research_task')
        .select('*')
        .eq('task_id', id)
        .single();

      if (error) throw error;
      setTask(data);

      if (data.status === 2) {
        navigate(`../report/${id}`, { replace: true });
      }
    } catch (error: any) {
      console.error('Error fetching task:', error);
      toast.error('获取任务信息失败');
    } finally {
      setLoading(false);
    }
  };

  const parseLog = (logStr: string) => {
    if (!logStr) return [];
    return logStr.split('\n').filter(line => line.trim().length > 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-20">
          <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">任务不存在</h2>
          <Button onClick={() => navigate('..')}>返回列表</Button>
        </div>
      </div>
    );
  }

  const logs = parseLog(task.generation_log);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('..')} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回列表
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl mb-2">{task.task_name}</CardTitle>
              <CardDescription>
                创建时间: {format(new Date(task.create_time), 'yyyy-MM-dd HH:mm:ss')}
              </CardDescription>
            </div>
            {task.status === 1 ? (
              <Badge variant="default" className="bg-blue-500">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 生成中
              </Badge>
            ) : task.status === 3 ? (
              <Badge variant="destructive">生成失败</Badge>
            ) : (
              <Badge variant="default" className="bg-green-500">已完成</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2 text-sm font-medium">
                <span>当前阶段: <span className="text-primary">{task.current_stage || '初始化任务...'}</span></span>
                <span>{task.progress || 0}%</span>
              </div>
              <Progress value={task.progress || 0} className="h-2" />
            </div>

            <div className="rounded-lg border bg-muted/30">
              <div className="px-4 py-3 border-b bg-card rounded-t-lg flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">系统日志 (实时执行过程)</span>
              </div>
              <ScrollArea className="h-[400px] w-full p-4" ref={scrollRef}>
                {logs.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic">暂无日志信息...</div>
                ) : (
                  <div className="space-y-3 font-mono text-sm">
                    {logs.map((log, index) => {
                      const isError = log.toLowerCase().includes('error') || log.toLowerCase().includes('失败');
                      const isSuccess = log.toLowerCase().includes('完成') || log.toLowerCase().includes('成功');
                      
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground shrink-0 select-none">
                            [{String(index + 1).padStart(3, '0')}]
                          </span>
                          <span className={
                            isError ? 'text-destructive' : 
                            isSuccess ? 'text-green-500' : 'text-foreground'
                          }>
                            {log}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {task.status === 3 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => navigate('..')}>
            返回列表重试
          </Button>
        </div>
      )}
    </div>
  );
}