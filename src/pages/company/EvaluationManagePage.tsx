import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Download,
  Eye,
  Play,
  Pause,
  StopCircle,
  Copy,
  FileText,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

// 类型定义
interface AssessmentTemplate {
  id: number;
  template_name: string;
  applicable_positions: string[];
  questions: any[];
  status: string;
}

interface AssessmentTask {
  id: number;
  template_id: number;
  task_name: string;
  deadline: string;
  target_position: string;
  status: string;
  link: string;
  participants_count: number;
  completed_count: number;
  created_at: string;
  template?: AssessmentTemplate;
}

interface AssessmentResult {
  id: number;
  task_id: number;
  user_name: string;
  user_email: string;
  total_score: number;
  dimension_scores: Record<string, number>;
  status: string;
  completed_at: string;
}

export default function EvaluationManagePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<AssessmentTask[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // 新增测评表单数据
  const [newTask, setNewTask] = useState({
    template_id: '',
    task_name: '',
    deadline: '',
    target_position: '',
  });

  // 统计数据
  const [stats, setStats] = useState({
    totalTasks: 0,
    publishedTasks: 0,
    totalParticipants: 0,
    totalCompleted: 0,
    avgCompletionRate: 0,
    avgScore: 0,
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载模板
      const { data: templatesData, error: templatesError } = await supabase
        .from('assessment_templates')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // 加载任务
      const { data: tasksData, error: tasksError } = await supabase
        .from('assessment_tasks')
        .select(`
          *,
          template:assessment_templates(*)
        `)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // 计算统计数据
      if (tasksData) {
        const totalTasks = tasksData.length;
        const publishedTasks = tasksData.filter((t: AssessmentTask) => t.status === 'published').length;
        const totalParticipants = tasksData.reduce((sum: number, t: AssessmentTask) => sum + (t.participants_count || 0), 0);
        const totalCompleted = tasksData.reduce((sum: number, t: AssessmentTask) => sum + (t.completed_count || 0), 0);
        const avgCompletionRate = totalParticipants > 0 
          ? Math.round((totalCompleted / totalParticipants) * 100) 
          : 0;

        // 获取平均分
        const { data: resultsData } = await supabase
          .from('assessment_results')
          .select('total_score')
          .eq('status', 'completed');

        const avgScore = resultsData && resultsData.length > 0
          ? Math.round(resultsData.reduce((sum: number, r: AssessmentResult) => sum + (r.total_score || 0), 0) / resultsData.length)
          : 0;

        setStats({
          totalTasks,
          publishedTasks,
          totalParticipants,
          totalCompleted,
          avgCompletionRate,
          avgScore,
        });
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 筛选任务
  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       task.target_position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // 创建测评任务
  const handleCreateTask = async () => {
    if (!newTask.template_id || !newTask.task_name || !newTask.deadline) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      // 生成测评链接
      const taskId = `task-${Date.now()}`;
      const link = `${window.location.origin}/assessment/${taskId}`;

      const { error } = await supabase
        .from('assessment_tasks')
        .insert([{
          company_id: 1,
          template_id: parseInt(newTask.template_id),
          task_name: newTask.task_name,
          deadline: newTask.deadline,
          target_position: newTask.target_position || '全部标准',
          status: 'published',
          link: link,
          participants_count: 0,
          completed_count: 0,
        }] as any);

      if (error) throw error;

      toast.success('测评任务创建成功');
      setShowCreateDialog(false);
      setNewTask({
        template_id: '',
        task_name: '',
        deadline: '',
        target_position: '',
      });
      loadData();
    } catch (error) {
      console.error('创建任务失败:', error);
      toast.error('创建任务失败');
    }
  };

  // 复制测评链接
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('测评链接已复制到剪贴板');
  };

  // 更新任务状态
  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('assessment_tasks')
        // @ts-ignore - Supabase类型推断问题
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('状态更新成功');
      loadData();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 获取所有已完成的测评结果
      const { data: results, error } = await supabase
        .from('assessment_results')
        .select(`
          *,
          task:assessment_tasks(task_name, target_position)
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (!results || results.length === 0) {
        toast.error('暂无数据可导出');
        return;
      }

      // 构建CSV数据
      const headers = ['任务名称', '目标标准', '姓名', '邮箱', '总分', '知识技能', '能力素质', '价值观', '动机驱动', '完成时间'];
      const rows = results.map((r: any) => [
        r.task?.task_name || '',
        r.task?.target_position || '',
        r.user_name,
        r.user_email || '',
        r.total_score,
        r.dimension_scores?.['知识技能'] || 0,
        r.dimension_scores?.['能力素质'] || 0,
        r.dimension_scores?.['价值观'] || 0,
        r.dimension_scores?.['动机驱动'] || 0,
        new Date(r.completed_at).toLocaleString('zh-CN'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 下载CSV文件
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `测评数据导出_${new Date().toLocaleDateString('zh-CN')}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('数据导出成功');
      setShowExportDialog(false);
    } catch (error) {
      console.error('导出数据失败:', error);
      toast.error('导出数据失败');
    }
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      draft: { label: '草稿', variant: 'outline' },
      published: { label: '进行中', variant: 'default' },
      paused: { label: '已暂停', variant: 'secondary' },
      ended: { label: '已结束', variant: 'destructive' },
    };
    const config = statusMap[status] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">测评管理</h1>
          <p className="mt-1 text-muted-foreground">基于冰山模型的企业测评全流程管理</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新增测评
          </Button>
        </div>
      </div>

      {/* 数据概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              总测评数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Play className="mr-2 h-4 w-4" />
              进行中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.publishedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="mr-2 h-4 w-4" />
              参与人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              完成人数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.totalCompleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              完成率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletionRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              平均分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选搜索区 */}
      <Card>
        <CardHeader>
          <CardTitle>测评任务列表</CardTitle>
          <CardDescription>管理和查看所有测评任务</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务名称或标准..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="筛选状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="published">进行中</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="ended">已结束</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 任务列表 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>任务名称</TableHead>
                  <TableHead>目标标准</TableHead>
                  <TableHead>使用模板</TableHead>
                  <TableHead>截止时间</TableHead>
                  <TableHead>参与/完成</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      暂无测评任务
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.task_name}</TableCell>
                      <TableCell>{task.target_position}</TableCell>
                      <TableCell>{task.template?.template_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(task.deadline).toLocaleDateString('zh-CN')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {task.participants_count} / {task.completed_count}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/company/evaluation/${task.id}`)}
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(task.link)}
                            title="复制链接"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {task.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(task.id, 'published')}
                              title="发布"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {task.status === 'published' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(task.id, 'paused')}
                              title="暂停"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {task.status === 'paused' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(task.id, 'published')}
                              title="继续"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {(task.status === 'published' || task.status === 'paused') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(task.id, 'ended')}
                              title="结束"
                            >
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 新增测评对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增测评任务</DialogTitle>
            <DialogDescription>
              选择测评模板并配置任务参数，系统将自动生成测评链接
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">测评模板 *</Label>
              <Select
                value={newTask.template_id}
                onValueChange={(value) => setNewTask({ ...newTask, template_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择测评模板" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.template_name}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({template.applicable_positions.join(', ')})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task_name">任务名称 *</Label>
              <Input
                id="task_name"
                placeholder="例如：2026年春季校招综合测评"
                value={newTask.task_name}
                onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">截止时间 *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_position">目标标准</Label>
              <Input
                id="target_position"
                placeholder="例如：前端工程师（留空则为全部标准）"
                value={newTask.target_position}
                onChange={(e) => setNewTask({ ...newTask, target_position: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTask}>
              创建并发布
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 导出数据对话框 */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出测评数据</DialogTitle>
            <DialogDescription>
              将导出所有已完成的测评结果数据为CSV格式
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              导出内容包括：任务名称、目标标准、姓名、邮箱、总分、各维度得分、完成时间等信息
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              取消
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              确认导出
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
