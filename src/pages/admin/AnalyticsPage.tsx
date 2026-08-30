import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactECharts from 'echarts-for-react';
import { TrendingUp, Building2, School } from 'lucide-react';

// 人民币图标组件
const RMBIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    <path d="M6 12h12" />
    <text x="12" y="8" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">¥</text>
  </svg>
);

export default function AnalyticsPage() {
  // 核心运营数据
  const statsCards = [
    {
      title: '企业订阅总数',
      value: '245',
      change: '+18',
      icon: Building2,
      color: 'text-blue-500',
    },
    {
      title: '合作院校数量',
      value: '68',
      change: '+5',
      icon: School,
      color: 'text-green-500',
    },
    {
      title: '月度营收',
      value: '¥458,900',
      change: '+23.5%',
      icon: RMBIcon,
      color: 'text-orange-500',
    },
    {
      title: '能力达标率',
      value: '76.3%',
      change: '+5.1%',
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ];

  // 企业订阅套餐分布
  const subscriptionDistributionOption = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '套餐分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 120, name: '基础版' },
          { value: 95, name: '专业版' },
          { value: 30, name: '企业定制版' },
        ],
      },
    ],
  };

  // 月度营收趋势
  const revenueTrendOption = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: {
      type: 'value',
      name: '营收（万元）',
    },
    series: [
      {
        name: '月度营收',
        type: 'line',
        data: [28.5, 32.8, 35.6, 39.2, 42.8, 45.9],
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
      },
    ],
  };

  // 院校合作情况
  const universityCooperationOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: ['985院校', '211院校', '双一流', '普通本科', '高职院校'],
    },
    yAxis: {
      type: 'value',
      name: '合作数量',
    },
    series: [
      {
        name: '合作院校',
        type: 'bar',
        data: [12, 18, 15, 20, 3],
        itemStyle: {
          color: '#4F46E5',
        },
      },
    ],
  };

  // 能力发展数据汇总
  const employmentDataOption = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['能力达标率', '高分达标率', '平均薪资（千元）'],
    },
    xAxis: {
      type: 'category',
      data: ['计算机', '金融', '机械', '文学', '管理', '艺术'],
    },
    yAxis: [
      {
        type: 'value',
        name: '能力达标率（%）',
        max: 100,
      },
      {
        type: 'value',
        name: '平均薪资（千元）',
      },
    ],
    series: [
      {
        name: '能力达标率',
        type: 'bar',
        data: [96, 92, 88, 78, 85, 82],
      },
      {
        name: '高分达标率',
        type: 'bar',
        data: [88, 85, 82, 65, 75, 70],
      },
      {
        name: '平均薪资（千元）',
        type: 'line',
        yAxisIndex: 1,
        data: [12.5, 10.8, 8.5, 6.2, 7.5, 7.0],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">运营分析</h1>
        <p className="mt-1 text-muted-foreground">平台运营数据分析与统计</p>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        {/* 企业订阅套餐分布 */}
        <Card>
          <CardHeader>
            <CardTitle>企业订阅套餐分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={subscriptionDistributionOption}
              style={{ height: '300px' }}
            />
          </CardContent>
        </Card>

        {/* 月度营收趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>月度营收趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts option={revenueTrendOption} style={{ height: '300px' }} />
          </CardContent>
        </Card>
      </div>

      {/* 院校合作情况 */}
      <Card>
        <CardHeader>
          <CardTitle>院校合作情况</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={universityCooperationOption} style={{ height: '300px' }} />
        </CardContent>
      </Card>

      {/* 能力发展数据汇总 */}
      <Card>
        <CardHeader>
          <CardTitle>各专业能力发展汇总</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts option={employmentDataOption} style={{ height: '350px' }} />
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
