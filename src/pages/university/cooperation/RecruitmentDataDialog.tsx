import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Briefcase, DollarSign, MapPin, Users, GraduationCap, Clock, TrendingUp } from 'lucide-react';
import { getHireOverview, getHireStatistics, type HireOverviewData, type HireStatisticsData } from '@/db/cooperation-api';
import { toast } from 'sonner';

interface RecruitmentDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  creditCode?: string;
}

// 行业标准需求数据展示对话框
export default function RecruitmentDataDialog({ open, onOpenChange, companyName, creditCode }: RecruitmentDataDialogProps) {
  const [overviewData, setOverviewData] = useState<HireOverviewData | null>(null);
  const [statisticsData, setStatisticsData] = useState<HireStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadRecruitmentData();
    }
  }, [open, companyName, creditCode]);

  const loadRecruitmentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 优先使用信用代码，否则使用企业名称
      const keyword = creditCode || companyName;

      // 并行请求两个API
      const [overview, statistics] = await Promise.allSettled([
        getHireOverview(keyword),
        getHireStatistics(keyword)
      ]);

      // 处理标准应用概况数据
      if (overview.status === 'fulfilled' && overview.value) {
        setOverviewData(overview.value);
      } else if (overview.status === 'rejected') {
        console.error('标准应用概况查询失败:', overview.reason);
      }

      // 处理标准统计数据
      if (statistics.status === 'fulfilled' && statistics.value) {
        setStatisticsData(statistics.value);
      } else if (statistics.status === 'rejected') {
        console.error('标准统计查询失败:', statistics.reason);
      }

      // 如果两个都失败，显示错误
      if (overview.status === 'rejected' && statistics.status === 'rejected') {
        setError('暂无该企业的标准应用数据，请检查企业名称或信用代码是否正确');
        toast.error('查询失败');
      }

    } catch (error: any) {
      console.error('加载标准应用数据失败:', error);
      setError(error.message || '加载标准应用数据失败');
      toast.error('加载标准应用数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            行业标准需求数据查询
          </DialogTitle>
          <DialogDescription>
            {companyName} 的真实标准应用数据（近3个月）
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 标准应用概况 */}
            {overviewData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">标准应用概况</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">标准数量</p>
                        <p className="text-2xl font-bold">{overviewData.titleCnt}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">平均薪资</p>
                        <p className="text-2xl font-bold">¥{overviewData.avgSal}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">城市数量</p>
                        <p className="text-2xl font-bold">{overviewData.cityCnt || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-2">标准类型</p>
                      <div className="flex flex-wrap gap-2">
                        {overviewData.titleType.split('、').map((type, index) => (
                          <Badge key={index} variant="secondary">{type}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">标准级别</p>
                      <div className="flex flex-wrap gap-2">
                        {overviewData.titleLevel.split('、').map((level, index) => (
                          <Badge key={index} variant="outline">{level}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">应用城市</p>
                      <p className="text-sm text-muted-foreground">{overviewData.city}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">标准来源</p>
                      <p className="text-sm text-muted-foreground">{overviewData.src}</p>
                    </div>

                    {overviewData.titleKw && (
                      <div>
                        <p className="text-sm font-medium mb-2">标准关键词</p>
                        <p className="text-sm text-muted-foreground">{overviewData.titleKw}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>数据更新时间：{overviewData.titleModifyDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 标准应用数据统计 */}
            {statisticsData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">标准应用数据统计</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">总标准数量</p>
                        <p className="text-2xl font-bold">{statisticsData.zpnumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">平均薪资</p>
                        <p className="text-2xl font-bold">{statisticsData.avgSalStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">本科学历占比</p>
                        <p className="text-2xl font-bold">{statisticsData.bkEducation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">3-5年经验占比</p>
                        <p className="text-2xl font-bold">{statisticsData.btw3and5Years}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium mb-2">主要应用省份</p>
                      <p className="text-sm text-muted-foreground">{statisticsData.priProvince}</p>
                    </div>

                    {statisticsData.educationList && statisticsData.educationList.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">学历分布</p>
                        <div className="space-y-2">
                          {statisticsData.educationList.map((edu, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{edu.key}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ 
                                      width: `${(edu.value / statisticsData.zpnumber) * 100}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">{edu.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 数据来源说明 */}
            <div className="text-xs text-muted-foreground text-center py-2 border-t">
              数据来源：行业标准需求数据查询插件 | 数据仅供参考，实际以企业官方发布为准
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
