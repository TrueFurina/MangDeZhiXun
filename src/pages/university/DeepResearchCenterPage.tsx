import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, BookOpen, Clock, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DeepResearchCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deep_research_task')
        .select('*')
        .eq('user_id', user?.id)
        .order('create_time', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('获取研究任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">未开始</Badge>;
      case 1:
        return <Badge variant="default" className="bg-blue-500">生成中</Badge>;
      case 2:
        return <Badge variant="default" className="bg-green-500">已完成</Badge>;
      case 3:
        return <Badge variant="destructive">生成失败</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            深度研究中心
          </h1>
          <p className="text-muted-foreground mt-1">
            高阶行业研究与报告生成工具，快速生成深度调研与分析报告
          </p>
        </div>
        <Button onClick={() => navigate('create')} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          创建研究任务
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">暂无研究任务</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              输入研究主题，系统将自动拆解任务，多轮检索全网信息，为您生成结构化深度报告。
            </p>
            <Button onClick={() => navigate('create')}>
              立即创建第一份报告
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <Card key={task.task_id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="mb-2">
                    {task.report_type}
                  </Badge>
                  {getStatusBadge(task.status)}
                </div>
                <CardTitle className="text-lg line-clamp-1" title={task.task_name}>
                  {task.task_name}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-1" title={task.research_topic}>
                  {task.research_topic}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between mt-auto pt-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {format(new Date(task.create_time), 'yyyy-MM-dd HH:mm')}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onClick={() => navigate(task.status === 1 ? `progress/${task.task_id}` : `report/${task.task_id}`)}
                >
                  {task.status === 1 ? '查看进度' : '查看报告'}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}