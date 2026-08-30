import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Database, TrendingUp, Target, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';
import { BENCHMARK_DATA, SKILL_BENCHMARKS } from '@/lib/benchmark-data';
import { Reveal, StaggerReveal } from '@/components/animations/Reveal';

function SalaryRangeChart({ data }: { data: typeof BENCHMARK_DATA[0] }) {
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data.roles} margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="role" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} unit="万" stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v}万`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="juniorSalary" name="初级" fill="hsl(200, 70%, 60%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="midSalary" name="中级" fill="hsl(243, 70%, 58%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="seniorSalary" name="高级" fill="hsl(280, 55%, 55%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SkillRadar() {
  const radarData = SKILL_BENCHMARKS.map((s) => ({
    skill: s.skill.length > 4 ? s.skill.slice(0, 4) : s.skill,
    avg: s.avgMastery,
    importance: s.importance,
  }));
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={360}>
        <RadarChart data={radarData} outerRadius="70%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar name="行业平均掌握度" dataKey="avg" stroke="hsl(243, 70%, 58%)" fill="hsl(243, 70%, 58%)" fillOpacity={0.3} />
          <Radar name="技能重要性" dataKey="importance" stroke="hsl(35, 80%, 55%)" fill="hsl(35, 80%, 55%)" fillOpacity={0.15} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BenchmarkLibraryPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(BENCHMARK_DATA[0]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> 返回
        </Button>

        <Reveal>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-balance">行业基准库</h1>
            </div>
            <p className="text-muted-foreground text-pretty max-w-prose">
              聚合脱敏的招聘与能力数据，构建各行业岗位的薪资基准与技能标准，为能力对标与职业决策提供量化参考。
            </p>
          </div>
        </Reveal>

        {/* 行业选择 */}
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {BENCHMARK_DATA.map((d) => (
            <Card
              key={d.key}
              className={`reveal-item cursor-pointer transition-all hover:shadow-md ${selected.key === d.key ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => setSelected(d)}
            >
              <CardContent className="p-4 text-center">
                <p className="font-semibold text-sm md:text-base">{d.name}</p>
                <p className="text-xs text-muted-foreground mt-1">均薪 {d.avgSalary}万</p>
              </CardContent>
            </Card>
          ))}
        </StaggerReveal>

        <Tabs defaultValue="salary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="salary"><TrendingUp className="h-4 w-4 mr-1" />薪资基准</TabsTrigger>
            <TabsTrigger value="table"><BarChart3 className="h-4 w-4 mr-1" />岗位明细</TabsTrigger>
            <TabsTrigger value="skill"><Target className="h-4 w-4 mr-1" />技能基准</TabsTrigger>
          </TabsList>

          <TabsContent value="salary">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selected.name} · 岗位薪资基准</CardTitle>
                <CardDescription>初级 / 中级 / 高级岗位年薪对比（单位：万元）</CardDescription>
              </CardHeader>
              <CardContent>
                <SalaryRangeChart data={selected} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selected.name} · 岗位基准明细</CardTitle>
                <CardDescription>各岗位薪资区间、行业平均能力分与需求指数</CardDescription>
              </CardHeader>
              <CardContent className="p-0 md:p-6">
                <div className="w-full max-w-full overflow-x-auto bg-card">
                  <Table className="[&>div]:max-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">岗位</TableHead>
                        <TableHead className="whitespace-nowrap text-right">初级（万）</TableHead>
                        <TableHead className="whitespace-nowrap text-right">中级（万）</TableHead>
                        <TableHead className="whitespace-nowrap text-right">高级（万）</TableHead>
                        <TableHead className="whitespace-nowrap text-right">平均能力分</TableHead>
                        <TableHead className="whitespace-nowrap text-right">需求指数</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.roles.map((r) => (
                        <TableRow key={r.role}>
                          <TableCell className="whitespace-nowrap font-medium">{r.role}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{r.juniorSalary}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{r.midSalary}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">{r.seniorSalary}</TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            <Badge variant="secondary" className="font-mono">{r.avgSkillScore}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${r.demandIndex}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{r.demandIndex}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skill">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">通用技能基准</CardTitle>
                <CardDescription>行业平均掌握度与技能重要性对比雷达图</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillRadar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Reveal delay={0.2}>
          <Card className="mt-8 bg-muted/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Database className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground text-pretty">
                数据说明：基准值为基于脱敏招聘与能力测评数据聚合的行业参考值，用于能力对标与趋势洞察，不代表具体岗位的实际薪资。
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}