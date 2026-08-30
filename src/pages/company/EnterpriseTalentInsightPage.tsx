import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Award, TrendingUp, Target, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function EnterpriseTalentInsightPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, evaluated: 0, favorites: 0, avgScore: 0 });
  const [tagDist, setTagDist] = useState<{ tag: string; count: number }[]>([]);
  const [positionDist, setPositionDist] = useState<{ position: string; count: number }[]>([]);

  const companyEmail = user?.email || localStorage.getItem('company_email') || '';

  useEffect(() => {
    const load = async () => {
      if (!companyEmail) { setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase
        .from('candidates')
        .select('id, position, tags, favorite, evaluations')
        .eq('company_email', companyEmail)
        .order('created_at', { ascending: false });
      const list = (data as { id: string; position: string | null; tags: string[]; favorite: boolean; evaluations: { score: number }[] }[]) || [];

      const evaluated = list.filter(c => (c.evaluations || []).length > 0);
      const allScores = list.flatMap(c => (c.evaluations || []).map(e => e.score || 0));
      const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : 0;

      setStats({
        total: list.length,
        evaluated: evaluated.length,
        favorites: list.filter(c => c.favorite).length,
        avgScore,
      });

      // 标签分布
      const tagMap = new Map<string, number>();
      list.forEach(c => (c.tags || []).forEach(t => tagMap.set(t, (tagMap.get(t) || 0) + 1)));
      setTagDist(Array.from(tagMap.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 8));

      // 岗位分布
      const posMap = new Map<string, number>();
      list.forEach(c => {
        const p = c.position || '未指定';
        posMap.set(p, (posMap.get(p) || 0) + 1);
      });
      setPositionDist(Array.from(posMap.entries()).map(([position, count]) => ({ position, count })).sort((a, b) => b.count - a.count).slice(0, 8));

      setLoading(false);
    };
    load();
  }, [companyEmail]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">人才洞察</h1>
          <p className="text-muted-foreground text-sm mt-1">候选人画像分布、评估覆盖与招聘效率全景</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">加载中...</div>
      ) : (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Users className="h-4 w-4" />人才池规模</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Target className="h-4 w-4" />已评估</div>
                <div className="text-2xl font-bold text-chart-2">{stats.evaluated}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Award className="h-4 w-4" />收藏人才</div>
                <div className="text-2xl font-bold text-chart-4">{stats.favorites}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><TrendingUp className="h-4 w-4" />平均分</div>
                <div className="text-2xl font-bold text-primary">{stats.avgScore}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 岗位分布 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">候选人岗位分布</CardTitle>
                <CardDescription>按投递岗位统计人数</CardDescription>
              </CardHeader>
              <CardContent>
                {positionDist.length > 0 ? (
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={positionDist} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis type="category" dataKey="position" width={90} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip />
                        <Bar dataKey="count" name="人数" radius={[0, 4, 4, 0]} maxBarSize={24}>
                          {positionDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="text-center py-8 text-muted-foreground text-sm">暂无数据</div>}
              </CardContent>
            </Card>

            {/* 标签分布 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">人才标签分布</CardTitle>
                <CardDescription>候选人标签 Top 8</CardDescription>
              </CardHeader>
              <CardContent>
                {tagDist.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {tagDist.map((t, i) => {
                      const maxCount = tagDist[0].count || 1;
                      return (
                        <div key={t.tag} className="flex items-center gap-3">
                          <span className="text-sm w-20 shrink-0 truncate">{t.tag}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(t.count / maxCount) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{t.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="text-center py-8 text-muted-foreground text-sm">暂无标签数据</div>}
              </CardContent>
            </Card>
          </div>

          {/* 评估覆盖率 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">评估覆盖率</CardTitle>
              <CardDescription>已评估候选人占人才池比例</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>已评估 {stats.evaluated} / {stats.total}</span>
                    <span>{stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0}%</span>
                  </div>
                  <Progress value={stats.total > 0 ? Math.round((stats.evaluated / stats.total) * 100) : 0} className="h-3" />
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/company/candidate-pool')}>
                  <GitCompare className="h-3.5 w-3.5 mr-1" />前往人才池
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}