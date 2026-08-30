import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileCheck, AlertCircle } from 'lucide-react';
import { getCooperationAgreements } from '@/db/cooperation-api';
import { toast } from 'sonner';

// 合作协议档案管理Tab
export default function AgreementsTab() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAgreements();
  }, []);

  const loadAgreements = async () => {
    setIsLoading(true);
    try {
      const data = await getCooperationAgreements();
      setAgreements(data);
    } catch (error) {
      console.error('加载协议列表失败:', error);
      toast.error('加载协议列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgreements = agreements.filter(agr =>
    agr.agreement_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 计算即将到期的协议
  const expiringAgreements = agreements.filter(agr => {
    if (agr.agreement_status !== '生效中') return false;
    const endDate = new Date(agr.effective_end_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  const stats = {
    total: agreements.length,
    active: agreements.filter(a => a.agreement_status === '生效中').length,
    expiring: expiringAgreements.length
  };

  return (
    <div className="space-y-6">
      {/* 到期提醒 */}
      {expiringAgreements.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <span className="font-medium">
                有 {expiringAgreements.length} 份协议即将在30天内到期，请及时跟进续签事宜
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">协议总数</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生效中协议</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.expiring}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索协议名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => toast.info('新增协议功能开发中')}>
              <Plus className="mr-2 h-4 w-4" />
              新增协议
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredAgreements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无协议数据</div>
          ) : (
            <div className="space-y-4">
              {filteredAgreements.map((agreement) => (
                <Card key={agreement.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{agreement.agreement_name}</h3>
                          <Badge>{agreement.agreement_status}</Badge>
                          <Badge variant="outline">{agreement.agreement_type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>合作企业: {agreement.cooperation_companies?.company_name || '未知'}</p>
                          <p>有效期: {agreement.effective_start_date} 至 {agreement.effective_end_date}</p>
                          <p>签署主体: {agreement.signing_entity}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info('查看详情功能开发中')}>
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toast.info('下载功能开发中')}>
                          下载
                        </Button>
                      </div>
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
