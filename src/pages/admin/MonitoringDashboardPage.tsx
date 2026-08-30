import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, AlertTriangle, Clock, TrendingUp, RefreshCw, Inbox } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import {
  getErrorLogs, getPerformanceMonitor, getDurationTrend,
  getErrorStats, getFunctionNames,
  type ErrorLog, type PerformanceMonitor,
} from '@/db/monitoring';

type TimeRange = '24h' | '7d' | '30d';

function getTimeRange(range: TimeRange): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  if (range === '24h') start.setHours(start.getHours() - 24);
  else if (range === '7d') start.setDate(start.getDate() - 7);
  else start.setDate(start.getDate() - 30);
  return { start: start.toISOString(), end: end.toISOString() };
}

export default function MonitoringDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [functionName, setFunctionName] = useState<string>('all');
  const [functionNames, setFunctionNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [errorTotal, setErrorTotal] = useState(0);
  const [perf, setPerf] = useState<PerformanceMonitor[]>([]);
  const [perfTotal, setPerfTotal] = useState(0);
  const [trend, setTrend] = useState<{ time: string; avgDuration: number; count: number }[]>([]);
  const [errorStats, setErrorStats] = useState<{ errorType: string; count: number }[]>([]);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('errors');
  const [detail, setDetail] = useState<ErrorLog | PerformanceMonitor | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { start, end } = getTimeRange(timeRange);
    const fn = functionName === 'all' ? undefined : functionName;

    const [errRes, perfRes, trendRes, statsRes, namesRes] = await Promise.all([
      getErrorLogs({ functionName: fn, startTime: start, endTime: end, page, pageSize: 20 }),
      getPerformanceMonitor({ functionName: fn, startTime: start, endTime: end, page, pageSize: 20 }),
      getDurationTrend({ startTime: start, endTime: end, functionName: fn }),
      getErrorStats({ startTime: start, endTime: end }),
      getFunctionNames(),
    ]);

    setErrors(errRes.data);
    setErrorTotal(errRes.total);
    setPerf(perfRes.data);
    setPerfTotal(perfRes.total);
    setTrend(trendRes);
    setErrorStats(statsRes);
    if (namesRes.length > 0 && functionNames.length === 0) setFunctionNames(namesRes);
    setLoading(false);
  }, [timeRange, functionName, page, functionNames.length]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const avgDuration = perf.length > 0
    ? Math.round(perf.reduce((s, p) => s + p.duration, 0) / perf.length)
    : 0;

  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: trend.map(t => t.time.slice(5, 16)), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', name: '耗时(ms)', axisLabel: { fontSize: 11 } },
    series: [{
      name: '平均耗时',
      type: 'line',
      smooth: true,
      data: trend.map(t => t.avgDuration),
      itemStyle: { color: '#6366f1' },
      areaStyle: { color: 'rgba(99,102,241,0.15)' },
    }],
  };

  const errorStatsOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: errorStats.map(e => ({ name: e.errorType, value: e.count })),
      label: { fontSize: 12 },
    }],
  };

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">监控看板</h1>
          <p className="mt-1 text-sm text-muted-foreground">Edge Function 调用耗时趋势与错误统计</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => { setTimeRange(v as TimeRange); setPage(1); }}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">最近24小时</SelectItem>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
            </SelectContent>
          </Select>
          <Select value={functionName} onValueChange={(v) => { setFunctionName(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="全部函数" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部函数</SelectItem>
              {functionNames.map(fn => <SelectItem key={fn} value={fn}>{fn}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">错误总数</p>
              <p className="text-lg font-bold">{errorTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">调用次数</p>
              <p className="text-lg font-bold">{perfTotal}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">平均耗时</p>
              <p className="text-lg font-bold">{avgDuration}ms</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">错误类型数</p>
              <p className="text-lg font-bold">{errorStats.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">调用耗时趋势</CardTitle></CardHeader>
          <CardContent>
            {trend.length > 0 ? (
              <div className="w-full min-w-0 overflow-hidden">
                <ReactECharts option={trendOption} style={{ height: 280 }} />
              </div>
            ) : (
              <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
                <Inbox className="mb-2 h-10 w-10 opacity-40" />
                <p className="text-sm">暂无性能数据</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">错误类型分布</CardTitle></CardHeader>
          <CardContent>
            {errorStats.length > 0 ? (
              <div className="w-full min-w-0 overflow-hidden">
                <ReactECharts option={errorStatsOption} style={{ height: 280 }} />
              </div>
            ) : (
              <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
                <Inbox className="mb-2 h-10 w-10 opacity-40" />
                <p className="text-sm">暂无错误数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 数据列表 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
            <TabsList>
              <TabsTrigger value="errors">错误日志 ({errorTotal})</TabsTrigger>
              <TabsTrigger value="performance">性能监控 ({perfTotal})</TabsTrigger>
            </TabsList>
            <TabsContent value="errors" className="mt-4">
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">错误时间</TableHead>
                      <TableHead className="whitespace-nowrap">函数名称</TableHead>
                      <TableHead className="whitespace-nowrap">错误类型</TableHead>
                      <TableHead className="whitespace-nowrap">错误信息</TableHead>
                      <TableHead className="whitespace-nowrap">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">暂无错误日志</TableCell>
                      </TableRow>
                    ) : errors.map(e => (
                      <TableRow key={e.log_id}>
                        <TableCell className="whitespace-nowrap text-xs">{new Date(e.error_time).toLocaleString('zh-CN')}</TableCell>
                        <TableCell className="whitespace-nowrap"><Badge variant="secondary">{e.function_name}</Badge></TableCell>
                        <TableCell className="whitespace-nowrap"><Badge variant="destructive">{e.error_type}</Badge></TableCell>
                        <TableCell className="max-w-[300px] truncate text-xs">{e.error_message}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => setDetail(e)}>详情</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="performance" className="mt-4">
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">调用时间</TableHead>
                      <TableHead className="whitespace-nowrap">函数名称</TableHead>
                      <TableHead className="whitespace-nowrap">耗时</TableHead>
                      <TableHead className="whitespace-nowrap">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perf.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">暂无性能数据</TableCell>
                      </TableRow>
                    ) : perf.map(p => (
                      <TableRow key={p.monitor_id}>
                        <TableCell className="whitespace-nowrap text-xs">{new Date(p.start_time).toLocaleString('zh-CN')}</TableCell>
                        <TableCell className="whitespace-nowrap"><Badge variant="secondary">{p.function_name}</Badge></TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className={p.duration > 3000 ? 'text-destructive font-medium' : p.duration > 1000 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
                            {p.duration}ms
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => setDetail(p)}>详情</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* 分页 */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
        <span className="text-sm text-muted-foreground">第 {page} 页</span>
        <Button variant="outline" size="sm" disabled={(activeTab === 'errors' ? errors : perf).length < 20} onClick={() => setPage(p => p + 1)}>下一页</Button>
      </div>

      {/* 详情弹窗 */}
      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>详情信息</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              {('error_time' in detail) ? (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">错误时间</span><span>{new Date(detail.error_time).toLocaleString('zh-CN')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">函数名称</span><span>{detail.function_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">错误类型</span><Badge variant="destructive">{detail.error_type}</Badge></div>
                  <div><span className="text-muted-foreground">错误信息</span><pre className="mt-1 max-h-40 overflow-y-auto rounded bg-muted p-2 text-xs">{detail.error_message}</pre></div>
                  {detail.request_params && <div><span className="text-muted-foreground">请求参数</span><pre className="mt-1 max-h-40 overflow-y-auto rounded bg-muted p-2 text-xs">{JSON.stringify(detail.request_params, null, 2)}</pre></div>}
                  {detail.user_id && <div className="flex justify-between"><span className="text-muted-foreground">用户ID</span><span className="text-xs">{detail.user_id}</span></div>}
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">开始时间</span><span>{new Date(detail.start_time).toLocaleString('zh-CN')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">结束时间</span><span>{new Date(detail.end_time).toLocaleString('zh-CN')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">函数名称</span><span>{detail.function_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">总耗时</span><span className="font-medium">{detail.duration}ms</span></div>
                  {detail.request_params && <div><span className="text-muted-foreground">调用参数</span><pre className="mt-1 max-h-40 overflow-y-auto rounded bg-muted p-2 text-xs">{JSON.stringify(detail.request_params, null, 2)}</pre></div>}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}