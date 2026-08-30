import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import EnterpriseHiringSearch from '@/components/hiring/EnterpriseHiringSearch';
import EnterpriseHiringOverviewCard from '@/components/hiring/EnterpriseHiringOverviewCard';
import EnterpriseHiringStatisticsCard from '@/components/hiring/EnterpriseHiringStatisticsCard';

interface EnterpriseHiringOverview {
  titleKw: string;
  titleType: string;
  city: string;
  src: string;
  titleLevel: string;
  avgSal: string;
  titleCnt: number;
  titleModifyDate: string;
  cityCnt: number;
}

interface EnterpriseHiringStatistics {
  avgSalStr: string;
  avgSal: number;
  bkEducation: string;
  educationList: Array<{ key: string; value: number }>;
  priProvince: string;
  companyName: string;
  zpnumberList: Array<{ key: string; value: number }>;
  salaryList: Array<{ key: string; value: number }>;
  btw3and5Years: string;
  recruitPosition: Array<{ key: string; value: number }>;
  yearsList: Array<{ key: string; value: number }>;
  zpnumber: number;
  ssNumHisList: Array<{ key: string; value: number }>;
}

export default function EnterpriseHiringQueryPage() {
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<EnterpriseHiringOverview | null>(null);
  const [statisticsData, setStatisticsData] = useState<EnterpriseHiringStatistics | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (keyword: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setOverviewData(null);
    setStatisticsData(null);

    try {
      // 获取当前用户的 session
      const { data: { session } } = await supabase.auth.getSession();

      // 查询标准应用概况
      const { data: overviewResult, error: overviewError } = await supabase.functions.invoke('hire-overview', {
        body: { keyword, forceRefresh },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {},
      });

      if (overviewError) {
        throw new Error(overviewError.message);
      }

      if (overviewResult.error) {
        throw new Error(overviewResult.error);
      }

      if (overviewResult.success && overviewResult.data) {
        setOverviewData(overviewResult.data);
        setFromCache(overviewResult.fromCache || false);
      }

      // 查询标准统计
      const { data: statisticsResult, error: statisticsError } = await supabase.functions.invoke('hire-statistics', {
        body: { keyword, forceRefresh },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {},
      });

      if (statisticsError) {
        throw new Error(statisticsError.message);
      }

      if (statisticsResult.error) {
        throw new Error(statisticsResult.error);
      }

      if (statisticsResult.success && statisticsResult.data) {
        setStatisticsData(statisticsResult.data);
      }

      toast.success(forceRefresh ? '数据已刷新' : '查询成功');
    } catch (err: any) {
      console.error('查询企业标准应用数据失败:', err);
      const errorMsg = err.message || '查询失败，请稍后重试';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">企业标准应用数据查询</h1>
        <p className="mt-2 text-muted-foreground">
          查询企业标准应用概况、历史统计数据，了解企业人才需求趋势
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            查询企业人才需求信息
          </CardTitle>
          <CardDescription>
            输入企业名称、统一信用代码、注册号或企业历史名称进行查询
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnterpriseHiringSearch onSearch={handleSearch} loading={loading} />
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">正在查询企业标准应用数据...</span>
        </div>
      )}

      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && (overviewData || statisticsData) && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">标准应用概况</TabsTrigger>
            <TabsTrigger value="statistics">详细统计</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {overviewData ? (
              <EnterpriseHiringOverviewCard data={overviewData} fromCache={fromCache} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>暂无标准应用概况数据</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            {statisticsData ? (
              <EnterpriseHiringStatisticsCard data={statisticsData} fromCache={fromCache} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>暂无标准统计数据</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
