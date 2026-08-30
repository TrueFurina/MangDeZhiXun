import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Briefcase } from 'lucide-react';
import { getCompanyPositions } from '@/db/cooperation-api';
import { toast } from 'sonner';

// 实习能力发展标准对接Tab
export default function PositionsTab() {
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanyPositions();
      setPositions(data);
    } catch (error) {
      console.error('加载标准列表失败:', error);
      toast.error('加载标准列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPositions = positions.filter(pos =>
    pos.position_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: positions.length,
    active: positions.filter(p => p.position_status === '开放中').length,
    pending: positions.filter(p => p.audit_status === '待审核').length
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">有效标准总数</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">开放中标准</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核标准</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标准名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : filteredPositions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无标准数据</div>
          ) : (
            <div className="space-y-4">
              {filteredPositions.map((position) => (
                <Card key={position.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{position.position_name}</h3>
                          <Badge>{position.position_type}</Badge>
                          <Badge variant="outline">{position.audit_status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>企业: {position.cooperation_companies?.company_name || '未知'}</p>
                          <p>工作地点: {position.work_location} | 薪资: {position.salary_range}</p>
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
