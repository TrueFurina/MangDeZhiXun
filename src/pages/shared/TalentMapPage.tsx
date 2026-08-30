import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, TrendingUp, Briefcase, BarChart3, ArrowLeft, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Treemap, PieChart, Pie,
} from 'recharts';
import { INDUSTRY_TALENT_DATA, type IndustryTalentData } from '@/lib/industry-data';
import { Reveal, StaggerReveal } from '@/components/animations/Reveal';

const REGION_COLORS = [
  'hsl(243, 75%, 59%)', 'hsl(262, 60%, 55%)', 'hsl(280, 50%, 55%)',
  'hsl(200, 70%, 55%)', 'hsl(170, 60%, 45%)', 'hsl(35, 80%, 55%)',
  'hsl(15, 70%, 55%)', 'hsl(330, 55%, 55%)',
];

const SALARY_COLORS = [
  'hsl(210, 60%, 65%)', 'hsl(200, 65%, 60%)', 'hsl(190, 70%, 55%)',
  'hsl(260, 60%, 58%)', 'hsl(280, 55%, 55%)', 'hsl(300, 50%, 55%)',
];

function formatNum(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString('zh-CN');
}

function RegionChart({ data }: { data: IndustryTalentData }) {
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data.regions} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={formatNum} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="region" tick={{ fontSize: 12 }} width={48} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [formatNum(v) + ' 岗位', '招聘量']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.regions.map((_, i) => (
              <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SalaryChart({ data }: { data: IndustryTalentData }) {
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data.salaryBands} margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatNum} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [formatNum(v) + ' 岗位', '人数']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.salaryBands.map((_, i) => (
              <Cell key={i} fill={SALARY_COLORS[i % SALARY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SkillTreemap({ data }: { data: IndustryTalentData }) {
  const treeData = data.skills.map((s) => ({ name: s.skill, size: s.demand }));
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height={320}>
        <Treemap
          data={treeData}
          dataKey="size"
          stroke="hsl(var(--background))"
          content={<CustomTreemapCell />}
        />
      </ResponsiveContainer>
    </div>
  );
}

function CustomTreemapCell(props: any) {
  const { x, y, width, height, name, index } = props;
  if (width < 0 || height < 0) return null;
  const hue = 243 + (index % 6) * 25;
  const lightness = 42 + (index % 4) * 6;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={`hsl(${hue}, 65%, ${lightness}%)`} stroke="hsl(var(--background))" strokeWidth={2} rx={4} />
      {width > 50 && height > 24 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={12} fontWeight={600}>
          {name}
        </text>
      )}
    </g>
  );
}

export default function TalentMapPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<IndustryTalentData>(INDUSTRY_TALENT_DATA[0]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> 返回
        </Button>

        <Reveal>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-balance">行业人才地图</h1>
            </div>
            <p className="text-muted-foreground text-pretty max-w-prose">
              基于公开招聘市场数据聚合，可视化呈现各行业的地域分布、薪资水平与技能需求热度，为职业规划与行业洞察提供数据参考。
            </p>
          </div>
        </Reveal>

        {/* 行业选择 */}
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {INDUSTRY_TALENT_DATA.map((d) => (
            <Card
              key={d.key}
              className={`reveal-item cursor-pointer transition-all hover:shadow-md ${selected.key === d.key ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => setSelected(d)}
            >
              <CardContent className="p-4 text-center">
                <p className="font-semibold text-sm md:text-base">{d.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatNum(d.totalJobs)} 岗位</p>
              </CardContent>
            </Card>
          ))}
        </StaggerReveal>

        {/* 概览统计 */}
        <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Briefcase, label: '在招岗位', value: formatNum(selected.totalJobs), color: 'text-primary' },
            { icon: TrendingUp, label: '平均年薪', value: `${selected.avgSalary}万`, color: 'text-chart-2' },
            { icon: Zap, label: '同比增长', value: `+${selected.growth}%`, color: 'text-chart-3' },
            { icon: MapPin, label: '覆盖城市', value: `${selected.regions.length} 个`, color: 'text-chart-4' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="reveal-item">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </StaggerReveal>

        <Reveal delay={0.1}>
          <Card className="mb-8">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-pretty">{selected.desc}</p>
            </CardContent>
          </Card>
        </Reveal>

        {/* 图表区 */}
        <Tabs defaultValue="region" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="region"><MapPin className="h-4 w-4 mr-1" />地域分布</TabsTrigger>
            <TabsTrigger value="salary"><TrendingUp className="h-4 w-4 mr-1" />薪资分布</TabsTrigger>
            <TabsTrigger value="skill"><Zap className="h-4 w-4 mr-1" />技能热度</TabsTrigger>
          </TabsList>

          <TabsContent value="region">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{selected.name} · 岗位地域分布</CardTitle>
                <CardDescription>各城市招聘量占比，反映人才聚集区域</CardDescription>
              </CardHeader>
              <CardContent>
                <RegionChart data={selected} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salary">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{selected.name} · 薪资分布</CardTitle>
                <CardDescription>不同薪资区间的岗位数量分布</CardDescription>
              </CardHeader>
              <CardContent>
                <SalaryChart data={selected} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skill">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />{selected.name} · 技能需求热度</CardTitle>
                <CardDescription>面积越大代表市场需求越旺盛</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillTreemap data={selected} />
                <div className="flex flex-wrap gap-2 mt-4">
                  {selected.skills.map((s) => (
                    <Badge key={s.skill} variant="secondary" className="text-xs">
                      {s.skill} <span className="ml-1 text-muted-foreground">{s.demand}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Reveal delay={0.2}>
          <Card className="mt-8 bg-muted/50">
            <CardContent className="p-4 flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground text-pretty">
                数据说明：以上为基于公开招聘市场调研聚合的脱敏基准值，用于趋势参考与行业洞察，具体薪资以实际岗位为准。
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}