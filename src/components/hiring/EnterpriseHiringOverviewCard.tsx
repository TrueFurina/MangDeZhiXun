import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Briefcase, DollarSign, Calendar, TrendingUp } from 'lucide-react';

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

interface EnterpriseHiringOverviewCardProps {
  data: EnterpriseHiringOverview;
  fromCache?: boolean;
}

export default function EnterpriseHiringOverviewCard({ data, fromCache }: EnterpriseHiringOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            标准应用概况
          </CardTitle>
          {fromCache && (
            <Badge variant="outline" className="text-xs">
              缓存数据
            </Badge>
          )}
        </div>
        <CardDescription>企业标准应用基本信息概览</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">应用标准数</p>
              <p className="text-2xl font-bold">{data.titleCnt || 0}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">平均薪资</p>
              <p className="text-2xl font-bold">{data.avgSal || '暂无数据'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">应用城市</p>
              <p className="text-sm font-medium">{data.city || '暂无数据'}</p>
              {data.cityCnt > 0 && (
                <p className="text-xs text-muted-foreground">共 {data.cityCnt} 个城市</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">标准级别</p>
              <p className="text-sm font-medium">{data.titleLevel || '暂无数据'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">标准关键词</span>
            <span className="text-sm font-medium">{data.titleKw || '暂无数据'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">标准类型</span>
            <span className="text-sm font-medium">{data.titleType || '暂无数据'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">标准来源</span>
            <span className="text-sm font-medium">{data.src || '暂无数据'}</span>
          </div>
          {data.titleModifyDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <Calendar className="mr-1 inline h-3 w-3" />
                更新时间
              </span>
              <span className="text-sm font-medium">{data.titleModifyDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
