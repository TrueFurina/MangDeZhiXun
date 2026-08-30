import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactECharts from 'echarts-for-react';
import { ArrowLeft, Users, FileText, TrendingUp, Target } from 'lucide-react';

export default function PositionAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 模拟标准数据
  const positionData = {
    id,
    title: 'AI模型工程师',
    totalApplicants: 156,
    qualified: 89,
    interviewed: 34,
    offered: 8
  };

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => setLoading(false), 500);
  }, [id]);

  // 学员来源分布
  const sourceOption = {
    title: {
      text: '学员来源分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        data: [
          { value: 65, name: 'Boss直聘', itemStyle: { color: '#165DFF' } },
          { value: 42, name: '智联标准推介', itemStyle: { color: '#00B42A' } },
          { value: 28, name: '前程无忧', itemStyle: { color: '#FF7D00' } },
          { value: 21, name: '名企推荐', itemStyle: { color: '#722ED1' } }
        ]
      }
    ]
  };

  // 学员学历分布
  const educationOption = {
    title: {
      text: '学员学历分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: ['专科', '本科', '硕士', '博士']
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '学员数量',
        type: 'bar',
        data: [12, 78, 54, 12],
        itemStyle: {
          color: '#165DFF',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  // 标准推介进度趋势
  const trendOption = {
    title: {
      text: '标准推介进度趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['能力档案投递', '测评邀约', '认证发放'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周']
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '能力档案投递',
        type: 'line',
        data: [23, 45, 56, 32],
        smooth: true,
        itemStyle: { color: '#165DFF' }
      },
      {
        name: '测评邀约',
        type: 'line',
        data: [8, 15, 21, 12],
        smooth: true,
        itemStyle: { color: '#00B42A' }
      },
      {
        name: '认证发放',
        type: 'line',
        data: [2, 3, 5, 2],
        smooth: true,
        itemStyle: { color: '#FF7D00' }
      }
    ]
  };

  // 技能匹配度分布
  const skillMatchOption = {
    title: {
      text: '技能匹配度分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%']
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '学员数量',
        type: 'bar',
        data: [5, 18, 42, 67, 24],
        itemStyle: {
          color: '#165DFF',
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/company/positions')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{positionData.title}</h1>
            <p className="mt-1 text-muted-foreground">标准数据可视化分析</p>
          </div>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          标准推介中
        </Badge>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">能力档案总数</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positionData.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+23</span> 本周新增
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">合格学员</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positionData.qualified}</div>
            <p className="text-xs text-muted-foreground">
              合格率 {Math.round((positionData.qualified / positionData.totalApplicants) * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">测评人数</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positionData.interviewed}</div>
            <p className="text-xs text-muted-foreground">
              测评率 {Math.round((positionData.interviewed / positionData.totalApplicants) * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">认证发放</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positionData.offered}</div>
            <p className="text-xs text-muted-foreground">
              认证率 {Math.round((positionData.offered / positionData.totalApplicants) * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <ReactECharts option={sourceOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ReactECharts option={educationOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ReactECharts option={trendOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ReactECharts option={skillMatchOption} style={{ height: '350px' }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
