import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';

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

interface EnterpriseHiringStatisticsCardProps {
  data: EnterpriseHiringStatistics;
  fromCache?: boolean;
}

export default function EnterpriseHiringStatisticsCard({ data, fromCache }: EnterpriseHiringStatisticsCardProps) {
  return (
    <div className="space-y-4">
      {/* 基本统计 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              标准统计数据
            </CardTitle>
            {fromCache && (
              <Badge variant="outline" className="text-xs">
                缓存数据
              </Badge>
            )}
          </div>
          <CardDescription>{data.companyName || '企业标准应用数据统计'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">总标准数量</p>
                <p className="text-2xl font-bold">{data.zpnumber || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">平均薪资</p>
                <p className="text-2xl font-bold">{data.avgSalStr || '暂无数据'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <PieChart className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">本科学历占比</p>
                <p className="text-2xl font-bold">{data.bkEducation || '暂无数据'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">主要省份</span>
              <span className="text-sm font-medium">{data.priProvince || '暂无数据'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">3-5年工作经验占比</span>
              <span className="text-sm font-medium">{data.btw3and5Years || '暂无数据'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 学历分布 */}
      {data.educationList && data.educationList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">学历分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.educationList.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.key}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min((item.value / data.zpnumber) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 主要应用标准 */}
      {data.recruitPosition && data.recruitPosition.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">主要应用标准 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recruitPosition.slice(0, 5).map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 w-6 rounded-full p-0 text-xs">
                        {index + 1}
                      </Badge>
                      {item.key}
                    </span>
                    <span className="font-medium">{item.value} 个标准</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${Math.min((item.value / data.zpnumber) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
