import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Eye,
  Download,
  Copy,
  Calendar,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import ReactECharts from 'echarts-for-react';

// 类型定义
interface AssessmentTask {
  id: number;
  task_name: string;
  deadline: string;
  target_position: string;
  status: string;
  link: string;
  participants_count: number;
  completed_count: number;
  created_at: string;
  template?: {
    template_name: string;
    questions: any[];
  };
}

interface AssessmentResult {
  id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  total_score: number;
  dimension_scores: Record<string, number>;
  answers: any[];
  status: string;
  completed_at: string;
}

export default function EvaluationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState<AssessmentTask | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);

  // 加载数据
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // 加载任务详情
      const { data: taskData, error: taskError } = await supabase
        .from('assessment_tasks')
        .select(`
          *,
          template:assessment_templates(*)
        `)
        .eq('id', id)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // 加载测评结果
      const { data: resultsData, error: resultsError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('task_id', id)
        .order('completed_at', { ascending: false });

      if (resultsError) throw resultsError;
      setResults(resultsData || []);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 复制测评链接
  const handleCopyLink = () => {
    if (task) {
      navigator.clipboard.writeText(task.link);
      toast.success('测评链接已复制到剪贴板');
    }
  };

  // 查看用户报告
  const handleViewReport = (result: AssessmentResult) => {
    setSelectedResult(result);
    setShowReportDialog(true);
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      in_progress: { label: '进行中', variant: 'outline' },
      completed: { label: '已完成', variant: 'default' },
    };
    const config = statusMap[status] || statusMap.in_progress;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 冰山模型雷达图配置
  const getRadarChartOption = (dimensionScores: Record<string, number>) => {
    return {
      title: {
        text: '冰山模型能力雷达图',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
      },
      radar: {
        indicator: [
          { name: '知识技能', max: 100 },
          { name: '能力素质', max: 100 },
          { name: '价值观', max: 100 },
          { name: '动机驱动', max: 100 },
        ],
        shape: 'polygon',
        splitNumber: 5,
        axisName: {
          color: '#666',
        },
        splitLine: {
          lineStyle: {
            color: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb'],
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)'],
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [
                dimensionScores['知识技能'] || 0,
                dimensionScores['能力素质'] || 0,
                dimensionScores['价值观'] || 0,
                dimensionScores['动机驱动'] || 0,
              ],
              name: '能力评分',
              areaStyle: {
                color: 'rgba(59, 130, 246, 0.3)',
              },
              lineStyle: {
                color: 'rgb(59, 130, 246)',
                width: 2,
              },
              itemStyle: {
                color: 'rgb(59, 130, 246)',
              },
            },
          ],
        },
      ],
    };
  };

  // 分数分布柱状图配置
  const getScoreDistributionOption = () => {
    const scoreRanges = ['0-60', '60-70', '70-80', '80-90', '90-100'];
    const distribution = scoreRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      return results.filter(r => r.total_score >= min && r.total_score < max).length;
    });

    return {
      title: {
        text: '分数分布',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: scoreRanges,
        axisLabel: {
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        name: '人数',
      },
      series: [
        {
          data: distribution,
          type: 'bar',
          itemStyle: {
            color: 'rgb(59, 130, 246)',
          },
          label: {
            show: true,
            position: 'top',
          },
        },
      ],
    };
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

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">测评任务不存在</p>
          <Button className="mt-4" onClick={() => navigate('/company/evaluations')}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const completionRate = task.participants_count > 0
    ? Math.round((task.completed_count / task.participants_count) * 100)
    : 0;

  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.total_score, 0) / results.length)
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => navigate('/company/evaluations')}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        返回列表
      </Button>

      {/* 任务基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{task.task_name}</CardTitle>
              <CardDescription className="mt-2">
                使用模板：{task.template?.template_name || '-'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              复制链接
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                截止时间
              </p>
              <p className="text-lg font-medium">
                {new Date(task.deadline).toLocaleString('zh-CN')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                目标标准
              </p>
              <p className="text-lg font-medium">{task.target_position}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center">
                <Users className="mr-2 h-4 w-4" />
                参与人数
              </p>
              <p className="text-lg font-medium">{task.participants_count}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                完成人数
              </p>
              <p className="text-lg font-medium text-success">{task.completed_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              完成进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">完成率</span>
                <span className="text-2xl font-bold">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>已完成 {task.completed_count} 人</span>
                <span>共 {task.participants_count} 人</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              平均分数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">总体平均分</span>
                <span className="text-2xl font-bold">{avgScore}</span>
              </div>
              <Progress value={avgScore} className="h-2" />
              <div className="text-sm text-muted-foreground">
                基于 {results.length} 份已完成测评
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据可视化 */}
      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <ReactECharts option={getScoreDistributionOption()} style={{ height: '300px' }} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ReactECharts
                option={getRadarChartOption(
                  results.length > 0
                    ? {
                        知识技能: Math.round(
                          results.reduce((sum, r) => sum + (r.dimension_scores['知识技能'] || 0), 0) / results.length
                        ),
                        能力素质: Math.round(
                          results.reduce((sum, r) => sum + (r.dimension_scores['能力素质'] || 0), 0) / results.length
                        ),
                        价值观: Math.round(
                          results.reduce((sum, r) => sum + (r.dimension_scores['价值观'] || 0), 0) / results.length
                        ),
                        动机驱动: Math.round(
                          results.reduce((sum, r) => sum + (r.dimension_scores['动机驱动'] || 0), 0) / results.length
                        ),
                      }
                    : {}
                )}
                style={{ height: '300px' }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 参与用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>参与用户列表</CardTitle>
          <CardDescription>查看所有参与测评的用户及其成绩</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>总分</TableHead>
                  <TableHead>知识技能</TableHead>
                  <TableHead>能力素质</TableHead>
                  <TableHead>价值观</TableHead>
                  <TableHead>动机驱动</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>完成时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      暂无参与数据
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.user_name}</TableCell>
                      <TableCell>{result.user_email || '-'}</TableCell>
                      <TableCell>{result.user_phone || '-'}</TableCell>
                      <TableCell>
                        <span className="font-bold text-primary">{result.total_score}</span>
                      </TableCell>
                      <TableCell>{result.dimension_scores['知识技能'] || 0}</TableCell>
                      <TableCell>{result.dimension_scores['能力素质'] || 0}</TableCell>
                      <TableCell>{result.dimension_scores['价值观'] || 0}</TableCell>
                      <TableCell>{result.dimension_scores['动机驱动'] || 0}</TableCell>
                      <TableCell>{getStatusBadge(result.status)}</TableCell>
                      <TableCell>
                        {result.completed_at
                          ? new Date(result.completed_at).toLocaleString('zh-CN')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReport(result)}
                          disabled={result.status !== 'completed'}
                          title="查看报告"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 用户报告对话框 */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>测评报告 - {selectedResult?.user_name}</DialogTitle>
            <DialogDescription>
              基于冰山模型的综合能力评估报告
            </DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">基本信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">姓名</p>
                      <p className="font-medium">{selectedResult.user_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">邮箱</p>
                      <p className="font-medium">{selectedResult.user_email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">电话</p>
                      <p className="font-medium">{selectedResult.user_phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">完成时间</p>
                      <p className="font-medium">
                        {new Date(selectedResult.completed_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 总分 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">综合评分</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-primary">
                        {selectedResult.total_score}
                      </div>
                      <p className="mt-2 text-muted-foreground">总分</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 冰山模型各维度得分 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">冰山模型各维度得分</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(selectedResult.dimension_scores).map(([dimension, score]) => (
                      <div key={dimension} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dimension}</span>
                          <span className="text-lg font-bold text-primary">{score}</span>
                        </div>
                        <Progress value={score as number} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 雷达图 */}
              <Card>
                <CardContent className="pt-6">
                  <ReactECharts
                    option={getRadarChartOption(selectedResult.dimension_scores)}
                    style={{ height: '400px' }}
                  />
                </CardContent>
              </Card>

              {/* 能力分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">能力分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">优势能力</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedResult.dimension_scores)
                          .filter(([, score]) => score >= 85)
                          .map(([dimension]) => (
                            <Badge key={dimension} variant="default">
                              {dimension}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">待提升能力</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedResult.dimension_scores)
                          .filter(([, score]) => score < 75)
                          .map(([dimension]) => (
                            <Badge key={dimension} variant="outline">
                              {dimension}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              关闭
            </Button>
            <Button onClick={() => toast.success('报告导出功能开发中')}>
              <Download className="mr-2 h-4 w-4" />
              导出报告
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}