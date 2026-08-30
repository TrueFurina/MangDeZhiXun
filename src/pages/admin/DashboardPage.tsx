import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactECharts from 'echarts-for-react';
import { Users, Briefcase, School, TrendingUp, Activity, CheckCircle, BookOpen, FileQuestion, Loader2 } from 'lucide-react';
import { getAdminDashboardStats, type AdminDashboardStats } from '@/db/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const data = await getAdminDashboardStats();
      setStats(data);
      setLoading(false);
    };
    loadStats();
  }, []);

  // 核心数据卡片
  const statsCards = stats ? [
    {
      title: '总营业额',
      value: `¥${(stats.total_revenue || 0).toLocaleString()}`,
      change: '+15.2%',
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: '总用户数',
      value: stats.total_users.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: '标准库',
      value: stats.total_positions.toLocaleString(),
      change: '+18',
      icon: Briefcase,
      color: 'text-orange-500',
    },
    {
      title: '测评题库',
      value: stats.total_questions.toLocaleString(),
      change: '+5.1%',
      icon: FileQuestion,
      color: 'text-purple-500',
    },
    {
      title: '学习资源',
      value: stats.total_resources.toLocaleString(),
      change: '+8.2%',
      icon: BookOpen,
      color: 'text-green-500',
    },
    {
      title: '标准综合能力模型',
      value: stats.total_competency_models.toLocaleString(),
      change: '+5',
      icon: Activity,
      color: 'text-pink-500',
    },
    {
      title: '累计测评',
      value: stats.total_assessments.toLocaleString(),
      change: '+23.4%',
      icon: CheckCircle,
      color: 'text-cyan-500',
    },
  ] : [];

  // 用户增长趋势图
  const userGrowthOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['学员用户', '企业用户', '院校用户'],
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '学员用户',
        type: 'line',
        data: [1200, 1800, 2400, 3200, 4100, 5200],
        smooth: true,
      },
      {
        name: '企业用户',
        type: 'line',
        data: [50, 80, 120, 160, 200, 245],
        smooth: true,
      },
      {
        name: '院校用户',
        type: 'line',
        data: [20, 30, 42, 55, 63, 68],
        smooth: true,
      },
    ],
  };

  // 标准匹配分布图
  const positionDistributionOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '标准分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: 'AI算法工程师' },
          { value: 735, name: '前端开发工程师' },
          { value: 580, name: '产品经理' },
          { value: 484, name: '数据分析师' },
          { value: 300, name: '运营专员' },
          { value: 420, name: '其他标准' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  // 测评完成情况
  const evaluationCompletionOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['已完成', '进行中', '未开始'],
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '已完成',
        type: 'bar',
        stack: 'total',
        data: [120, 132, 101, 134, 90, 230, 210],
      },
      {
        name: '进行中',
        type: 'bar',
        stack: 'total',
        data: [20, 32, 21, 34, 20, 30, 40],
      },
      {
        name: '未开始',
        type: 'bar',
        stack: 'total',
        data: [10, 12, 11, 14, 10, 20, 15],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">数据看板</h1>
        <p className="mt-1 text-muted-foreground">平台核心数据概览</p>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={cn('h-5 w-5', card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  较上月 <span className="text-green-500">{card.change}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 用户增长趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>用户增长趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={userGrowthOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>

        {/* 标准匹配分布 */}
        <Card>
          <CardHeader>
            <CardTitle>标准匹配分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={positionDistributionOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>
      </div>

      {/* 测评完成情况 */}
      <Card>
        <CardHeader>
          <CardTitle>测评完成情况</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={evaluationCompletionOption} style={{ height: '300px' }} />
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
