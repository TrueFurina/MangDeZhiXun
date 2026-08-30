import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, FileText, Briefcase, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { getCooperationStats } from '@/db/cooperation-api';

// 校企合作数据看板Tab
export default function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getCooperationStats();
      setStats(data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-muted-foreground">暂无数据</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">校企合作数据看板</h2>
        <p className="text-muted-foreground mt-1">实时展示校企合作核心数据指标</p>
      </div>

      {/* 核心指标卡 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">合作企业总数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已审核 {stats.approvedCompanies} | 待审核 {stats.pendingCompanies}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已落地合作方案</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.landedPlans}</div>
            <p className="text-xs text-muted-foreground mt-1">
              总方案数 {stats.totalPlans} | 推进中 {stats.inProgressPlans}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在推进合作项目</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              总项目数 {stats.totalProjects} | 已完成 {stats.completedProjects}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">有效应用标准</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePositions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              总标准数 {stats.totalPositions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学生提交总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已结业 {stats.hiredApplications}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生效中协议</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgreements}</div>
            <p className="text-xs text-muted-foreground mt-1">
              总协议数 {stats.totalAgreements} | 即将到期 {stats.expiringAgreements}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 数据趋势图表区域（预留） */}
      <Card>
        <CardHeader>
          <CardTitle>数据趋势分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            图表功能开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
