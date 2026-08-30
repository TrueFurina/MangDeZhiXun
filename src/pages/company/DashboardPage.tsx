import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ReactECharts from 'echarts-for-react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Target, 
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';
import { 
  getCompanyDashboardStats, 
  getRecruitmentFunnelData, 
  getMatchDistributionData,
  type DashboardStats 
} from '@/db/api';

export default function CompanyDashboardPage() {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPositions: 0,
    openPositions: 0,
    totalCandidates: 0,
    totalAssessments: 0,
    recentActivities: []
  });
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [matchData, setMatchData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showPositionsDialog, setShowPositionsDialog] = useState(false);

  // 处理动态点击事件
  const handleActivityClick = (activity: any) => {
    if (activity.type === 'resume') {
      // 跳转到能力档案管理页面
      navigate('/company/resumes');
    } else if (activity.type === 'assessment') {
      // 跳转到能力档案管理页面（高匹配学员）
      navigate('/company/resumes');
    } else if (activity.type === 'interview') {
      // 跳转到能力档案管理页面（测评邀约）
      navigate('/company/resumes');
    } else if (activity.type === 'offer') {
      // 跳转到能力档案管理页面（认证）
      navigate('/company/resumes');
    }
  };

  // 在招标准列表（示例数据）
  const openPositionsList = [
    { id: 1, title: '高级前端工程师', department: '技术部', applicants: 45, status: '热招中' },
    { id: 2, title: '产品经理', department: '产品部', applicants: 32, status: '热招中' },
    { id: 3, title: 'Java后端工程师', department: '技术部', applicants: 28, status: '标准推介中' },
    { id: 4, title: 'UI设计师', department: '设计部', applicants: 21, status: '标准推介中' },
    { id: 5, title: '数据分析师', department: '数据部', applicants: 18, status: '标准推介中' },
    { id: 6, title: '运营专员', department: '运营部', applicants: 15, status: '标准推介中' },
    { id: 7, title: '人力资源专员', department: '管理员部', applicants: 12, status: '标准推介中' },
  ];

  // 加载数据
  useEffect(() => {
    loadDashboardData();
    // 每30秒自动刷新一次
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [stats, funnel, match] = await Promise.all([
        getCompanyDashboardStats(),
        getRecruitmentFunnelData(),
        getMatchDistributionData()
      ]);

      setDashboardStats(stats);
      setFunnelData(funnel);
      setMatchData(match);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // 标准推介漏斗图配置 - 使用真实数据
  const funnelOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}人 ({d}%)'
    },
    series: [
      {
        name: '标准推介漏斗',
        type: 'funnel',
        left: '10%',
        width: '80%',
        label: {
          formatter: '{b}: {c}人'
        },
        labelLine: {
          show: true
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          label: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: funnelData.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { 
            color: ['#165DFF', '#00B42A', '#FF7D00', '#F53F3F', '#722ED1'][index] 
          }
        }))
      }
    ]
  };

  // 匹配度分布图 - 使用真实数据
  const matchDistributionOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      type: 'category',
      data: matchData.map(item => item.range)
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    series: [
      {
        name: '学员数量',
        type: 'bar',
        data: matchData.map(item => item.count),
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
        <div>
          <h1 className="text-3xl font-bold">数据看板</h1>
          <p className="mt-1 text-muted-foreground">实时掌握标准推介全流程数据</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '刷新中...' : '刷新数据'}
        </Button>
      </div>

      {/* 核心数据卡片 - 使用真实数据 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowPositionsDialog(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在招标准</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.openPositions || openPositionsList.length}</div>
            <p className="text-xs text-muted-foreground">
              总标准数: {dashboardStats.totalPositions || openPositionsList.length} · 点击查看详情
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-success cursor-pointer transition-all hover:shadow-md"
          onClick={() => navigate('/company/resumes')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学员总数</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">点击查看学员列表 →</span>
            </p>
          </CardContent>
        </Card>

        <Card 
          className="border-l-4 border-l-warning cursor-pointer transition-all hover:shadow-md"
          onClick={() => navigate('/company/evaluations')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">测评完成数</CardTitle>
            <FileText className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">点击查看测评详情 →</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据更新</CardTitle>
            <Clock className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">实时同步</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">每30秒自动刷新</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 标准推介漏斗图 */}
        <Card>
          <CardHeader>
            <CardTitle>标准推介漏斗分析</CardTitle>
            <CardDescription>各阶段学员转化情况</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={funnelOption} style={{ height: '400px' }} />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-primary">49.4%</div>
                <div className="text-muted-foreground">能力档案通过率</div>
              </div>
              <div>
                <div className="font-semibold text-success">44.0%</div>
                <div className="text-muted-foreground">初试通过率</div>
              </div>
              <div>
                <div className="font-semibold text-warning">36.0%</div>
                <div className="text-muted-foreground">认证接受率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 匹配度分布图 */}
        <Card>
          <CardHeader>
            <CardTitle>人标准匹配度分布</CardTitle>
            <CardDescription>学员与标准的匹配度统计</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts option={matchDistributionOption} style={{ height: '400px' }} />
            <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">高匹配度学员（≥80%）</span>
              </div>
              <div className="text-2xl font-bold text-primary">89人</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近动态 - 使用真实数据 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>最近动态</CardTitle>
              <CardDescription>实时标准推介进展</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAllActivities(true)}>
              查看全部
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardStats.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  activity.type === 'resume' ? 'bg-primary/10' :
                  activity.type === 'assessment' ? 'bg-success/10' :
                  activity.type === 'interview' ? 'bg-warning/10' :
                  'bg-chart-4/10'
                }`}>
                  {activity.type === 'resume' && <FileText className="h-5 w-5 text-primary" />}
                  {activity.type === 'assessment' && <CheckCircle2 className="h-5 w-5 text-success" />}
                  {activity.type === 'interview' && <Clock className="h-5 w-5 text-warning" />}
                  {activity.type === 'offer' && <Users className="h-5 w-5 text-chart-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{activity.content}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 查看全部动态模态窗口 */}
      <Dialog open={showAllActivities} onOpenChange={setShowAllActivities}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>全部标准推介动态</DialogTitle>
            <DialogDescription>
              查看所有标准推介流程中的实时动态信息
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex w-full flex-wrap justify-start gap-2">
              <TabsTrigger value="all" className="flex-shrink-0">全部</TabsTrigger>
              <TabsTrigger value="resume" className="flex-shrink-0">收到新能力档案</TabsTrigger>
              <TabsTrigger value="assessment" className="flex-shrink-0">高度匹配学员</TabsTrigger>
              <TabsTrigger value="interview" className="flex-shrink-0">测评待确认</TabsTrigger>
              <TabsTrigger value="offer" className="flex-shrink-0">认证已发放</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {dashboardStats.recentActivities.map((activity) => (
                <Card 
                  key={activity.id} 
                  className="transition-shadow hover:shadow-md cursor-pointer"
                  onClick={() => {
                    handleActivityClick(activity);
                    setShowAllActivities(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        activity.type === 'resume' ? 'bg-primary/10' :
                        activity.type === 'assessment' ? 'bg-success/10' :
                        activity.type === 'interview' ? 'bg-warning/10' :
                        'bg-chart-4/10'
                      }`}>
                        {activity.type === 'resume' && <FileText className="h-6 w-6 text-primary" />}
                        {activity.type === 'assessment' && <CheckCircle2 className="h-6 w-6 text-success" />}
                        {activity.type === 'interview' && <Clock className="h-6 w-6 text-warning" />}
                        {activity.type === 'offer' && <Send className="h-6 w-6 text-chart-4" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{activity.content}</p>
                          <Badge variant={
                            activity.type === 'resume' ? 'default' :
                            activity.type === 'assessment' ? 'secondary' :
                            activity.type === 'interview' ? 'outline' :
                            'default'
                          }>
                            {activity.type === 'resume' && '新能力档案'}
                            {activity.type === 'assessment' && '高匹配'}
                            {activity.type === 'interview' && '待测评'}
                            {activity.type === 'offer' && '认证'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="resume" className="space-y-4 mt-4">
              {dashboardStats.recentActivities
                .filter(activity => activity.type === 'resume')
                .map((activity) => (
                  <Card key={activity.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => { handleActivityClick(activity); setShowAllActivities(false); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{activity.content}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {dashboardStats.recentActivities.filter(a => a.type === 'resume').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无新能力档案
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assessment" className="space-y-4 mt-4">
              {dashboardStats.recentActivities
                .filter(activity => activity.type === 'assessment')
                .map((activity) => (
                  <Card key={activity.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => { handleActivityClick(activity); setShowAllActivities(false); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{activity.content}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {dashboardStats.recentActivities.filter(a => a.type === 'assessment').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无高匹配学员
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="interview" className="space-y-4 mt-4">
              {dashboardStats.recentActivities
                .filter(activity => activity.type === 'interview')
                .map((activity) => (
                  <Card key={activity.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => { handleActivityClick(activity); setShowAllActivities(false); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                          <Clock className="h-6 w-6 text-warning" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{activity.content}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {dashboardStats.recentActivities.filter(a => a.type === 'interview').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无待确认测评
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="offer" className="space-y-4 mt-4">
              {dashboardStats.recentActivities
                .filter(activity => activity.type === 'offer')
                .map((activity) => (
                  <Card key={activity.id} className="transition-shadow hover:shadow-md cursor-pointer" onClick={() => { handleActivityClick(activity); setShowAllActivities(false); }}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
                          <Send className="h-6 w-6 text-chart-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="font-medium">{activity.content}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {dashboardStats.recentActivities.filter(a => a.type === 'offer').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无已发放认证
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 在招标准详情对话框 */}
      <Dialog open={showPositionsDialog} onOpenChange={setShowPositionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>在招标准详情</DialogTitle>
            <DialogDescription>
              当前共有 {openPositionsList.length} 个标准正在标准推介中
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {openPositionsList.map((position) => (
              <Card key={position.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{position.title}</h3>
                        <Badge variant={position.status === '热招中' ? 'default' : 'secondary'}>
                          {position.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Target className="mr-1 h-4 w-4" />
                          {position.department}
                        </span>
                        <span className="flex items-center">
                          <Users className="mr-1 h-4 w-4" />
                          {position.applicants} 人投递
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/company/position/edit/${position.id}`)}
                      >
                        编辑标准
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/company/position/${position.id}/analytics`)}
                      >
                        查看详情
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => navigate('/company/positions')}>
              查看所有标准
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
