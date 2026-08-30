import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Trophy, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Evaluation {
  dimension: string;
  score: number;
}

interface Candidate {
  id: string;
  name: string;
  position: string | null;
  tags: string[];
  evaluations: Evaluation[];
}

const COLORS = [
  'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))',
  'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
];

export default function CandidateComparePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const companyEmail = user?.email || localStorage.getItem('company_email') || '';
  const ids = params.get('ids')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    const load = async () => {
      if (ids.length < 2 || !companyEmail) { setLoading(false); return; }
      const { data } = await supabase
        .from('candidates')
        .select('id, name, position, tags, evaluations')
        .eq('company_email', companyEmail)
        .in('id', ids)
        .order('created_at', { ascending: false });
      setCandidates((data as Candidate[]) || []);
      setLoading(false);
    };
    load();
  }, [ids.join(','), companyEmail]);

  // 收集所有维度
  const allDimensions = Array.from(new Set(candidates.flatMap(c => (c.evaluations || []).map(e => e.dimension))));

  const radarData = allDimensions.map(dim => {
    const row: Record<string, string | number> = { dimension: dim };
    candidates.forEach(c => {
      const ev = (c.evaluations || []).find(e => e.dimension === dim);
      row[c.name] = ev ? ev.score : 0;
    });
    return row;
  });

  const avgScore = (c: Candidate) => {
    if (!c.evaluations || c.evaluations.length === 0) return 0;
    return Math.round(c.evaluations.reduce((s, e) => s + (e.score || 0), 0) / c.evaluations.length);
  };

  const ranked = [...candidates].sort((a, b) => avgScore(b) - avgScore(a));

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div>;
  }

  if (candidates.length < 2) {
    return (
      <div className="container py-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold">候选人对比</h1>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">需要至少 2 位候选人</h3>
            <p className="text-muted-foreground text-sm mb-6">请返回人才池选择候选人进行对比</p>
            <Button onClick={() => navigate('/company/candidate-pool')}>
              <ArrowRight className="h-4 w-4 mr-1" />返回人才池
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">候选人对比</h1>
          <p className="text-muted-foreground text-sm mt-1">
            横向对比 {candidates.length} 位候选人的能力雷达图，辅助招聘决策
          </p>
        </div>
      </div>

      {/* 排名报告 */}
      <Card className="mb-6 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-primary" />候选人排名</CardTitle>
          <CardDescription>按综合平均分从高到低排序</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ranked.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  i === 0 ? 'bg-chart-4 text-primary-foreground' : i === 1 ? 'bg-muted-foreground text-background' : i === 2 ? 'bg-chart-3 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.position || '未指定岗位'}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-primary">{avgScore(c)}</div>
                  <p className="text-xs text-muted-foreground">综合分</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 雷达图对比 */}
      {allDimensions.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">能力雷达对比</CardTitle>
            <CardDescription>多维度横向对比候选人能力</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full min-w-0 overflow-hidden" style={{ height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  {candidates.map((c, i) => (
                    <Radar
                      key={c.id}
                      name={c.name}
                      dataKey={c.name}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">所选候选人暂无评估数据，请先通过胜任力评估生成能力雷达。</p>
          </CardContent>
        </Card>
      )}

      {/* 候选人详情卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {candidates.map((c, i) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <p className="font-semibold">{c.name}</p>
                <Badge variant="outline" className="text-xs ml-auto">{avgScore(c)}分</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{c.position || '未指定岗位'}</p>
              {c.evaluations && c.evaluations.length > 0 ? (
                <div className="space-y-1.5">
                  {c.evaluations.map(ev => (
                    <div key={ev.dimension} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{ev.dimension}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${ev.score}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs font-medium w-8 text-right">{ev.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">暂无评估数据</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}