import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { Search, Loader2, Users, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';
import { getAllAssessmentRecordsAdmin, type AdminAssessmentRecord } from '@/db/api';
import { toast } from 'sonner';

// 4维→6轴雷达映射（与学生端一致）
function buildRadar(r: AdminAssessmentRecord) {
  const t = r.tech_score ?? 0;
  const g = r.general_score ?? 0;
  const b = r.behavior_score ?? 0;
  const e = r.experience_score ?? 0;
  return [
    { subject: '专业技能', value: t, fullMark: 100 },
    { subject: '工程实践', value: Math.max(0, e - 5), fullMark: 100 },
    { subject: '通用能力', value: g, fullMark: 100 },
    { subject: '行为特质', value: b, fullMark: 100 },
    { subject: '业务理解', value: e, fullMark: 100 },
    { subject: '逻辑思维', value: Math.min(100, b + 5), fullMark: 100 },
  ];
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 85) return <Badge className="bg-success text-white">{score} 优秀</Badge>;
  if (score >= 75) return <Badge className="bg-blue-500 text-white">{score} 达标</Badge>;
  if (score >= 60) return <Badge variant="secondary">{score} 待提升</Badge>;
  return <Badge variant="destructive">{score} 需补强</Badge>;
}

export default function StudentEvaluationsPage() {
  const [records, setRecords] = useState<AdminAssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminAssessmentRecord | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAllAssessmentRecordsAdmin();
      if (!data.length) toast.info('暂无测评数据');
      setRecords(data);
      setLoading(false);
    })();
  }, []);

  const filtered = records.filter(r =>
    r.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    r.job_title?.toLowerCase().includes(search.toLowerCase())
  );

  // 统计卡
  const completed = records.filter(r => r.status === 'completed');
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, r) => s + (r.total_score ?? 0), 0) / completed.length)
    : 0;
  const aboveBaseline = completed.filter(r => (r.total_score ?? 0) >= 75).length;

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-3xl font-bold">学员测评总览</h1>
        <p className="mt-1 text-muted-foreground">所有学员的测评记录与能力数据一览（实时同步测评系统）</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: '测评总记录', value: records.length, icon: BarChart2, color: 'text-blue-500' },
          { title: '已完成测评', value: completed.length, icon: CheckCircle2, color: 'text-success' },
          { title: '平均综合分', value: avgScore ? `${avgScore}分` : '—', icon: TrendingUp, color: 'text-purple-500' },
          { title: '达标人数（≥75分）', value: aboveBaseline, icon: Users, color: 'text-orange-500' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 搜索 */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索邮箱或岗位名称…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* 数据表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              正在加载学员测评数据…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['学员邮箱', '测评岗位', '综合得分', '专业技能', '通用能力', '行为特质', '实践经验', '状态', '完成时间', '操作'].map(h => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-muted-foreground">暂无符合条件的测评记录</td>
                    </tr>
                  ) : filtered.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{r.user_email}</td>
                      <td className="whitespace-nowrap px-4 py-3">{r.job_title}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <ScoreBadge score={r.total_score ?? 0} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Progress value={r.tech_score ?? 0} className="h-1.5 w-14" />
                          <span className="text-xs">{r.tech_score ?? 0}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Progress value={r.general_score ?? 0} className="h-1.5 w-14" />
                          <span className="text-xs">{r.general_score ?? 0}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Progress value={r.behavior_score ?? 0} className="h-1.5 w-14" />
                          <span className="text-xs">{r.behavior_score ?? 0}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Progress value={r.experience_score ?? 0} className="h-1.5 w-14" />
                          <span className="text-xs">{r.experience_score ?? 0}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {r.status === 'completed'
                          ? <Badge className="bg-success text-white">已完成</Badge>
                          : <Badge variant="secondary">进行中</Badge>
                        }
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground text-xs">
                        {r.completed_at ? new Date(r.completed_at).toLocaleDateString('zh-CN') : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                          查看详情
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗：能力雷达图 */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              能力雷达详情 — {selected?.job_title}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="text-muted-foreground">学员：</span>
                <span className="font-mono">{selected.user_email}</span>
                <span className="text-muted-foreground ml-4">综合得分：</span>
                <ScoreBadge score={selected.total_score ?? 0} />
                <span className="text-muted-foreground ml-4">完成时间：</span>
                <span>{selected.completed_at ? new Date(selected.completed_at).toLocaleString('zh-CN') : '—'}</span>
              </div>

              {/* 雷达图 */}
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={buildRadar(selected)}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ paddingTop: 12 }} />
                    <Radar name="能力得分" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 四维分数条 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '专业技能', score: selected.tech_score ?? 0 },
                  { label: '通用能力', score: selected.general_score ?? 0 },
                  { label: '行为特质', score: selected.behavior_score ?? 0 },
                  { label: '实践经验', score: selected.experience_score ?? 0 },
                ].map(d => (
                  <div key={d.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-semibold">{d.score}</span>
                    </div>
                    <Progress value={d.score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
