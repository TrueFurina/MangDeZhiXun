import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Search, Loader2, Building2, Users, DollarSign, MapPin, Briefcase,
  TrendingUp, BarChart3, Clock, Plus, X, FileDown, FileSpreadsheet,
  Target, GraduationCap, Lightbulb, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  fetchHireOverview, fetchHireStatistics, splitToList,
  type HireOverviewData, type HireStatisticsData, type KeyValueItem,
} from '@/db/hiringData';
import { getUserAssessments, type AssessmentRecord } from '@/db/api';
import { getCurrentUserEmail } from '@/lib/supabase';
import { exportToExcel, exportToPDF } from '@/lib/exportUtils';
import { ErrorState, EmptyState } from '@/components/common/StateViews';

const PIE_COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--chart-6))',
];

interface CompanyResult {
  keyword: string;
  overview: HireOverviewData | null;
  statistics: HireStatisticsData | null;
  error?: string;
}

interface Props {
  basePath: string;
  pageTitle: string;
  pageDesc: string;
}

export default function HiringDataPage({ pageTitle, pageDesc }: Props) {
  const [inputVal, setInputVal] = useState('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [activeTab, setActiveTab] = useState('detail');
  const printRef = useRef<HTMLDivElement>(null);

  // 用户素养画像
  const [profile, setProfile] = useState<AssessmentRecord | null>(null);

  useEffect(() => {
    (async () => {
      const email = getCurrentUserEmail();
      if (email) {
        const data = await getUserAssessments(email);
        setProfile(data[0] ?? null);
      }
    })();
  }, []);

  const addCompany = useCallback(() => {
    const v = inputVal.trim();
    if (!v) { toast.error('请输入企业名称'); return; }
    if (companies.includes(v)) { toast.error('该企业已添加'); return; }
    if (companies.length >= 5) { toast.error('最多支持对比 5 家企业'); return; }
    setCompanies(prev => [...prev, v]);
    setInputVal('');
  }, [inputVal, companies]);

  const removeCompany = useCallback((name: string) => {
    setCompanies(prev => prev.filter(c => c !== name));
    setResults(prev => prev.filter(r => r.keyword !== name));
  }, []);

  const handleSearch = useCallback(async () => {
    if (companies.length === 0) { toast.error('请先添加至少一家企业'); return; }
    setLoading(true);
    setResults([]);
    const data: CompanyResult[] = await Promise.all(
      companies.map(async (kw) => {
        try {
          const [ov, st] = await Promise.all([
            fetchHireOverview(kw).catch(() => null),
            fetchHireStatistics(kw).catch(() => null),
          ]);
          if (!ov && !st) return { keyword: kw, overview: null, statistics: null, error: '未查询到该企业的招聘数据' };
          return { keyword: kw, overview: ov, statistics: st };
        } catch (e: any) {
          return { keyword: kw, overview: null, statistics: null, error: e?.message || '查询失败' };
        }
      }),
    );
    setResults(data);
    setLoading(false);
    setActiveTab(data.length > 1 ? 'compare' : 'detail');
  }, [companies]);

  const single = results.length === 1 ? results[0] : null;
  const isCompare = results.length > 1;

  // 导出单企业数据为 Excel
  const exportSingleExcel = () => {
    if (!single?.statistics) return;
    const s = single.statistics;
    const rows: (string | number)[][] = [
      ['企业名称', s.companyName || single.keyword],
      ['总招聘数量', s.zpnumber ?? '-'],
      ['平均薪资', s.avgSalStr || '-'],
      ['主要招聘省份', s.priProvince || '-'],
      ['本科占比', s.bkEducation || '-'],
      ['3-5年经验占比', s.btw3and5Years || '-'],
      ['', ''],
      ['学历分布', '数量'],
      ...(s.educationList || []).map(i => [i.key, i.value]),
      ['', ''],
      ['薪资区间', '数量'],
      ...(s.salaryList || []).map(i => [i.key, i.value]),
      ['', ''],
      ['工作年限', '数量'],
      ...(s.yearsList || []).map(i => [i.key, i.value]),
    ];
    exportToExcel(['指标', '数值'], rows, `${single.keyword}_招聘数据`);
    toast.success('Excel 已导出');
  };

  // 导出对比数据为 Excel
  const exportCompareExcel = () => {
    const headers = ['对比维度', ...results.map(r => r.keyword)];
    const get = (r: CompanyResult, fn: (s: HireStatisticsData) => string | number) =>
      r.statistics ? fn(r.statistics) : '-';
    const rows: (string | number)[][] = [
      ['总招聘数量', ...results.map(r => get(r, s => s.zpnumber ?? '-'))],
      ['平均薪资', ...results.map(r => get(r, s => s.avgSalStr || '-'))],
      ['主要招聘省份', ...results.map(r => get(r, s => s.priProvince || '-'))],
      ['本科占比', ...results.map(r => get(r, s => s.bkEducation || '-'))],
      ['3-5年经验占比', ...results.map(r => get(r, s => s.btw3and5Years || '-'))],
    ];
    exportToExcel(headers, rows, '多企业招聘数据对比');
    toast.success('Excel 已导出');
  };

  const handlePDF = () => {
    if (!printRef.current) return;
    exportToPDF(printRef.current, '招聘数据报告', '招聘数据报告');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">{pageTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{pageDesc}</p>
      </div>

      {/* 搜索区 */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCompany()}
                placeholder="输入企业名称、统一信用代码或注册号"
                className="pl-9 pr-3"
              />
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" onClick={addCompany} disabled={loading}>
                <Plus className="mr-1 h-4 w-4" />添加
              </Button>
              <Button onClick={handleSearch} disabled={loading || companies.length === 0}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {companies.length > 1 ? '对比查询' : '查询'}
              </Button>
            </div>
          </div>
          {companies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {companies.map(c => (
                <Badge key={c} variant="secondary" className="gap-1 pr-1">
                  <Building2 className="h-3 w-3" />{c}
                  <button onClick={() => removeCompany(c)} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            支持添加 2-5 家企业进行对比；数据仅作行业能力对标与人才培养参考，不提供岗位投递入口
          </p>
        </CardContent>
      </Card>

      {/* 加载 */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在查询企业招聘数据...</p>
          </CardContent>
        </Card>
      )}

      {/* 空状态 */}
      {!loading && results.length === 0 && (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Building2}
              title="添加企业开始查询"
              description="添加 1 家企业查看招聘详情，或添加多家企业进行对比分析"
            />
          </CardContent>
        </Card>
      )}

      {/* 结果区 */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {/* 导出工具栏 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              共查询到 <span className="font-semibold text-foreground">{results.length}</span> 家企业数据
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={isCompare ? exportCompareExcel : exportSingleExcel}>
                <FileSpreadsheet className="mr-1 h-4 w-4" />导出 Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handlePDF}>
                <FileDown className="mr-1 h-4 w-4" />导出 PDF
              </Button>
            </div>
          </div>

          <div ref={printRef} className="space-y-4">
            {/* 单企业详情 */}
            {!isCompare && single && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="detail">招聘详情</TabsTrigger>
                  <TabsTrigger value="match">能力匹配分析</TabsTrigger>
                </TabsList>
                <TabsContent value="detail" className="mt-4 space-y-4">
                  <SingleDetail result={single} />
                </TabsContent>
                <TabsContent value="match" className="mt-4">
                  <MatchAnalysis result={single} profile={profile} />
                </TabsContent>
              </Tabs>
            )}

            {/* 多企业对比 */}
            {isCompare && <CompareView results={results} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ 单企业详情 ============ */
function SingleDetail({ result }: { result: CompanyResult }) {
  const { overview, statistics } = result;
  if (result.error || (!overview && !statistics)) {
    return (
      <Card>
        <CardContent className="p-0">
          <ErrorState title="查询失败" description={result.error || '未获取到数据'} />
        </CardContent>
      </Card>
    );
  }

  const cities = splitToList(overview?.city);
  const sources = splitToList(overview?.src);
  const levels = splitToList(overview?.titleLevel);
  const jobTypes = splitToList(overview?.titleType);

  return (
    <div className="space-y-4">
      {overview && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Briefcase} label="招聘职位数" value={overview.titleCnt?.toString() || '-'} />
            <StatCard icon={DollarSign} label="平均薪资" value={overview.avgSal ? `¥${Number(overview.avgSal).toLocaleString('zh-CN')}` : '-'} />
            <StatCard icon={MapPin} label="招聘城市数" value={overview.cityCnt?.toString() || '-'} />
            <StatCard icon={Clock} label="职位更新" value={overview.titleModifyDate || '-'} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard title="城市分布" icon={MapPin} items={cities} />
            <InfoCard title="招聘来源" icon={TrendingUp} items={sources} />
            <InfoCard title="职位级别" icon={BarChart3} items={levels} />
            <InfoCard title="职位类型" icon={Briefcase} items={jobTypes} />
          </div>
        </>
      )}

      {statistics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={Users} label="总招聘数量" value={statistics.zpnumber?.toLocaleString('zh-CN') || '-'} />
            <StatCard icon={DollarSign} label="平均薪资" value={statistics.avgSalStr || '-'} />
            <StatCard icon={MapPin} label="主要省份" value={statistics.priProvince || '-'} />
            <StatCard icon={GraduationCap} label="本科占比" value={statistics.bkEducation || '-'} />
          </div>

          {statistics.educationList?.length > 0 && (
            <ChartCard title="学历要求分布" description={`本科占比 ${statistics.bkEducation || '-'}`}>
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statistics.educationList} dataKey="value" nameKey="key" cx="50%" cy="50%" outerRadius={90} label={({ key, percent }) => `${key} ${(percent * 100).toFixed(0)}%`}>
                      {statistics.educationList.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {statistics.salaryList?.length > 0 && (
            <ChartCard title="薪资区间分布" description="各薪资区间招聘职位数量">
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.salaryList} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="职位数" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {statistics.yearsList?.length > 0 && (
            <ChartCard title="工作年限要求分布" description={`3-5年经验占比 ${statistics.btw3and5Years || '-'}`}>
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statistics.yearsList} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="key" tick={{ fontSize: 12 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="value" name="职位数" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {statistics.zpnumberList?.length > 0 && (
            <ChartCard title="月度招聘数量趋势" description="企业近期招聘职位数量变化">
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={statistics.zpnumberList} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: 8 }} />
                    <Line type="monotone" dataKey="value" name="招聘数量" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {statistics.recruitPosition?.length > 0 && (
            <ChartCard title="主要招聘职位" description="企业近期招聘的职位名称">
              <div className="flex flex-wrap gap-2">
                {statistics.recruitPosition.map((p, i) => (
                  <Badge key={i} variant="secondary" className="gap-1"><Briefcase className="h-3 w-3" />{p}</Badge>
                ))}
              </div>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}

/* ============ 多企业对比 ============ */
function CompareView({ results }: { results: CompanyResult[] }) {
  const validResults = results.filter(r => r.statistics);
  const compareBarData = validResults.map(r => ({
    name: r.keyword.length > 8 ? `${r.keyword.slice(0, 8)}…` : r.keyword,
    职位数: r.statistics!.zpnumber ?? 0,
    平均薪资: Math.round(r.statistics!.avgSal ?? 0),
  }));

  return (
    <div className="space-y-4">
      {/* 对比表格 */}
      <ChartCard title="多企业招聘数据对比" description="横向对比各企业核心招聘指标">
        <div className="w-full max-w-full overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">对比维度</th>
                {results.map(r => (
                  <th key={r.keyword} className="whitespace-nowrap px-3 py-2 text-right font-medium">{r.keyword}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="总招聘数量" results={results} fn={s => s.zpnumber?.toLocaleString('zh-CN') ?? '-'} />
              <CompareRow label="平均薪资" results={results} fn={s => s.avgSalStr || '-'} />
              <CompareRow label="主要招聘省份" results={results} fn={s => s.priProvince || '-'} />
              <CompareRow label="本科占比" results={results} fn={s => s.bkEducation || '-'} />
              <CompareRow label="3-5年经验占比" results={results} fn={s => s.btw3and5Years || '-'} />
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* 职位数对比 */}
      {compareBarData.length > 0 && (
        <ChartCard title="招聘职位数量对比" description="各企业近期招聘职位总数">
          <div className="w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={compareBarData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="职位数" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* 平均薪资对比 */}
      {compareBarData.length > 0 && (
        <ChartCard title="平均薪资对比" description="各企业平均月薪（元）">
          <div className="w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={compareBarData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="平均薪资" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* 各企业学历分布 */}
      {validResults.length > 0 && (
        <ChartCard title="学历要求分布对比" description="各企业学历要求占比">
          <div className="space-y-6">
            {validResults.map(r => (
              <div key={r.keyword}>
                <p className="mb-2 text-sm font-medium">{r.keyword}</p>
                <div className="w-full min-w-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={r.statistics!.educationList} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="key" tick={{ fontSize: 12 }} width={70} />
                      <Tooltip />
                      <Bar dataKey="value" name="数量" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

function CompareRow({ label, results, fn }: { label: string; results: CompanyResult[]; fn: (s: HireStatisticsData) => string }) {
  return (
    <tr className="border-b last:border-0">
      <td className="whitespace-nowrap px-3 py-2 text-left text-muted-foreground">{label}</td>
      {results.map(r => (
        <td key={r.keyword} className="whitespace-nowrap px-3 py-2 text-right">
          {r.statistics ? fn(r.statistics) : <span className="text-muted-foreground">-</span>}
        </td>
      ))}
    </tr>
  );
}

/* ============ 能力需求匹配分析 ============ */
function MatchAnalysis({ result, profile }: { result: CompanyResult; profile: AssessmentRecord | null }) {
  const s = result.statistics;

  // 推断企业要求
  const dominantEdu = s?.educationList?.length
    ? [...s.educationList].sort((a, b) => b.value - a.value)[0]?.key
    : '未明确';
  const dominantYears = s?.yearsList?.length
    ? [...s.yearsList].sort((a, b) => b.value - a.value)[0]?.key
    : '未明确';

  // 用户画像雷达数据
  const radarData = profile
    ? [
        { subject: '专业技能', score: profile.tech_score ?? 0, industry: 85 },
        { subject: '工程实践', score: Math.max(0, (profile.experience_score ?? 0) - 5), industry: 80 },
        { subject: '通用能力', score: profile.general_score ?? 0, industry: 80 },
        { subject: '行为特质', score: profile.behavior_score ?? 0, industry: 75 },
        { subject: '业务理解', score: profile.experience_score ?? 0, industry: 82 },
        { subject: '逻辑思维', score: Math.min(100, (profile.behavior_score ?? 0) + 5), industry: 78 },
      ]
    : [];

  // 差距分析
  const gaps = profile
    ? [
        { dim: '专业技能', score: profile.tech_score ?? 0, baseline: 85, tip: '专业技能深度可进一步提升，建议专注核心技术栈' },
        { dim: '通用能力', score: profile.general_score ?? 0, baseline: 80, tip: '通用能力有提升空间，建议加强结构化表达训练' },
        { dim: '行为特质', score: profile.behavior_score ?? 0, baseline: 75, tip: '行为特质需要强化，建议通过压力情景模拟提升抗压性' },
        { dim: '实践经验', score: profile.experience_score ?? 0, baseline: 82, tip: '项目实战经验积累不足，建议参与实际项目或实习' },
      ].filter(g => g.score < g.baseline)
    : [];

  // 提升建议
  const suggestions: string[] = [];
  if (s) {
    if (dominantEdu && dominantEdu.includes('本科')) suggestions.push(`该企业以${dominantEdu}为主，建议夯实专业基础与学历背景`);
    if (dominantYears && dominantYears.includes('3-5')) suggestions.push(`企业偏好${dominantYears}经验，建议通过虚拟练兵场或实习积累项目实战`);
    if (s.avgSal && s.avgSal > 20000) suggestions.push('该企业薪资水平较高，对综合能力要求严格，建议全面提升核心竞争力');
    if (s.recruitPosition?.length) suggestions.push(`重点岗位：${s.recruitPosition.slice(0, 3).join('、')}，建议针对性准备相关技能`);
  }
  if (gaps.length > 0) {
    suggestions.push(...gaps.map(g => g.tip));
  }

  return (
    <div className="space-y-4">
      {/* 企业用人要求 */}
      <ChartCard title="企业用人要求" description="基于招聘数据推断的核心要求">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <ReqCard icon={GraduationCap} label="学历要求" value={dominantEdu || '-'} />
          <ReqCard icon={Clock} label="经验要求" value={dominantYears || '-'} />
          <ReqCard icon={DollarSign} label="平均薪资" value={s?.avgSalStr || '-'} />
          <ReqCard icon={Briefcase} label="招聘规模" value={s?.zpnumber ? `${s.zpnumber} 个职位` : '-'} />
        </div>
      </ChartCard>

      {/* 用户画像雷达 */}
      {profile ? (
        <>
          <ChartCard title="能力匹配雷达" description="蓝色为您的画像，灰色为行业基准">
            <div className="w-full min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="行业基准" dataKey="industry" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.15} />
                  <Radar name="我的画像" dataKey="score" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.35} />
                  <Legend wrapperStyle={{ paddingTop: 8 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* 差距标注 */}
          <ChartCard title="能力差距分析" description="低于行业基准的维度">
            {gaps.length > 0 ? (
              <div className="space-y-3">
                {gaps.map(g => (
                  <div key={g.dim} className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{g.dim}：当前 {g.score} 分 / 基准 {g.baseline} 分</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{g.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm">恭喜！您的各维度能力均达到或超过行业基准，竞争力较强。</p>
              </div>
            )}
          </ChartCard>
        </>
      ) : (
        <ChartCard title="能力匹配雷达" description="暂无素养画像">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Target className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">您还未完成岗位测评，暂无素养画像</p>
            <p className="text-xs text-muted-foreground">完成测评后，系统将自动对标您的画像并给出提升建议</p>
          </div>
        </ChartCard>
      )}

      {/* 提升建议 */}
      <ChartCard title="能力提升建议" description="基于企业要求与画像差距生成">
        <div className="space-y-3">
          {suggestions.length > 0 ? suggestions.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-chart-4" />
              <p className="min-w-0 text-sm">{tip}</p>
            </div>
          )) : (
            <p className="py-4 text-center text-sm text-muted-foreground">暂无建议</p>
          )}
        </div>
      </ChartCard>
    </div>
  );
}

/* ============ 通用子组件 ============ */
function StatCard({ icon: Icon, label, value, small }: { icon: any; label: string; value: string; small?: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`font-bold ${small ? 'truncate text-sm' : 'text-lg'}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCard({ title, icon: Icon, items }: { title: string; icon: any; items: string[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">{items.map((item, i) => <Badge key={i} variant="outline">{item}</Badge>)}</div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无数据</p>
        )}
      </CardContent>
    </Card>
  );
}

function ReqCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <Separator />
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}