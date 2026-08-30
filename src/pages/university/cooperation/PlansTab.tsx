import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText } from 'lucide-react';
import { getCooperationPlans, type CooperationPlan } from '@/db/cooperation-api';
import { toast } from 'sonner';

// 校企合作方案管理Tab
export default function PlansTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await getCooperationPlans();
      setPlans(data);
    } catch (error) {
      console.error('加载方案列表失败:', error);
      toast.error('加载方案列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      '意向沟通': { label: '意向沟通', variant: 'outline' },
      '方案洽谈': { label: '方案洽谈', variant: 'secondary' },
      '推进中': { label: '推进中', variant: 'default' },
      '已落地': { label: '已落地', variant: 'default' },
      '已终止': { label: '已终止', variant: 'destructive' }
    };
    const config = statusConfig[status] || statusConfig['意向沟通'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: plans.length,
    landed: plans.filter(p => p.plan_status === '已落地').length,
    inProgress: plans.filter(p => p.plan_status === '推进中').length
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">方案总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推进中方案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已落地方案</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.landed}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索方案名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => toast.info('新增方案功能开发中')}>
              <Plus className="mr-2 h-4 w-4" />
              新增方案
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无方案数据</div>
          ) : (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{plan.plan_name}</h3>
                          {getStatusBadge(plan.plan_status)}
                          <Badge variant="outline">{plan.plan_type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>合作企业: {plan.cooperation_companies?.company_name || '未知'}</p>
                          <p>负责人: {plan.responsible_person} | {plan.responsible_phone}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.info('查看详情功能开发中')}>
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
