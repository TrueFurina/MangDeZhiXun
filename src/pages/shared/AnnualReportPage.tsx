import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, TrendingUp, Users, Target, Zap, Award, Download } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import { YEAR_TRENDS, DIMENSION_GROWTH, HOT_SKILLS, REPORT_STATS } from '@/lib/annual-report-data';
import { Reveal, StaggerReveal, CountUp } from '@/components/animations/Reveal';
import { toast } from 'sonner';

function formatNum(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString('zh-CN');
}

export default function AnnualReportPage() {
  const navigate = useNavigate();

  const handleDownload = () => {
    toast.info('年度报告正在生成中，完成后将提供下载');
  };

  const stats = [
    { icon: Users, label: '覆盖学生', value: REPORT_STATS.totalStudents, suffix: '', color: 'text-primary' },
    { icon: FileText, label: '累计测评', value: REPORT_STATS.totalEvaluations, suffix: '', color: 'text-chart-2' },
    { icon: TrendingUp, label: '平均提升', value: REPORT_STATS.avgImprovement, suffix: '%', color: 'text-chart-3' },
    { icon: Award, label: '热门方向', value: 0, suffix: '', text: REPORT_STATS.topIndustry, color: 'text-chart-4' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> 返回
        </Button>

        <Reveal>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-balance">大学生能力画像年度报告</h1>
            </div>
            <p className="text-muted-foreground text-pretty max-w-prose">
              跨用户聚合能力测评数据，呈现年度行业能力画像趋势、维度成长与热门技能，为院校与企业提供宏观洞察。
            </p>
          </div>
        </Reveal>

        {/* 概览统计 */}
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="reveal-item">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="min-w-0">
                    {s.text ? (
                      <p className={`text-lg font-bold ${s.color}`}>{s.text}</p>
                    ) : (
                      <p className={`text-lg font-bold ${s.color}`}>
                        <CountUp value={s.value} />{s.suffix}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </StaggerReveal>

        {/* 趋势图 */}
        <Reveal delay={0.1}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />年度能力趋势</CardTitle>
              <CardDescription>近五年平均综合能力分与能力覆盖率变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={YEAR_TRENDS} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="avgScore" name="平均能力分" stroke="hsl(243, 70%, 58%)" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="coverage" name="能力覆盖率(%)" stroke="hsl(35, 80%, 55%)" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* 维度成长 */}
        <Reveal delay={0.15}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" />能力维度年度成长</CardTitle>
              <CardDescription>各能力维度去年 vs 今年的平均掌握度对比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={DIMENSION_GROWTH} margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="dimension" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="lastYear" name="去年" fill="hsl(200, 60%, 65%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="thisYear" name="今年" fill="hsl(243, 70%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        {/* 热门技能 */}
        <Reveal delay={0.2}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />年度热门技能</CardTitle>
              <CardDescription>需求同比增长最快的技能方向</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={HOT_SKILLS} layout="vertical" margin={{ left: 8, right: 32 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} unit="%" stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="skill" tick={{ fontSize: 11 }} width={80} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`+${v}%`, '同比增长']} />
                    <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                      {HOT_SKILLS.map((_, i) => (
                        <Cell key={i} fill={`hsl(${243 + i * 20}, 65%, ${52 + (i % 3) * 6}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {HOT_SKILLS.map((s) => (
                  <Badge key={s.skill} variant="secondary" className="text-xs">
                    {s.skill} <span className="ml-1 text-muted-foreground">掌握度 {s.mastery}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.25}>
          <Card className="bg-muted/50">
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">下载完整年度报告</p>
                <p className="text-xs text-muted-foreground text-pretty mt-1">包含详细行业分析、院校对比与技能趋势的 Word 版报告</p>
              </div>
              <Button onClick={handleDownload} className="shrink-0">
                <Download className="h-4 w-4 mr-1" /> 生成报告
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}