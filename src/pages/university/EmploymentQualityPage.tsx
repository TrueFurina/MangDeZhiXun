import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Briefcase, TrendingUp, Award, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function EmploymentQualityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, employed: 0, avgScore: 0, matchRate: 0 });
  const [companyDist, setCompanyDist] = useState<{ company: string; count: number }[]>([]);
  const [scoreDist, setScoreDist] = useState<{ range: string; count: number }[]>([]);

  const universityEmail = user?.email || localStorage.getItem('university_email') || '';

  useEffect(() => {
    const load = async () => {
      if (!universityEmail) { setLoading(false); return; }
      setLoading(true);
      const { data: students } = await supabase
        .from('students')
        .select('id, name')
        .eq('university_email', universityEmail);
      const studentList = (students as { id: string; name: string }[]) || [];
      const studentIds = studentList.map(s => s.id);

      if (studentIds.length === 0) { setLoading(false); return; }

      const { data: evalData } = await supabase
        .from('evaluations')
        .select('student_id, dimension, score')
        .in('student_id', studentIds);

      const allScores = (evalData as { score: number }[] || []).map(e => e.score || 0);
      const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length) : 0;

      // 模拟就业数据（基于测评分数）
      const employed = studentList.filter((_, i) => i % 4 !== 0).length;
      const matchRate = avgScore > 0 ? Math.min(100, Math.round(avgScore * 0.9)) : 0;

      setStats({
        totalStudents: studentList.length,
        employed,
        avgScore,
        matchRate,
      });

      // 分数段分布
      const ranges = [
        { range: '0-40', min: 0, max: 40 },
        { range: '40-60', min: 40, max: 60 },
        { range: '60-75', min: 60, max: 75 },
        { range: '75-90', min: 75, max: 90 },
        { range: '90-100', min: 90, max: 100 },
      ];
      const studentAvgMap = new Map<string, number>();
      const studentCountMap = new Map<string, number>();
      (evalData as { student_id: string; score: number }[] || []).forEach(e => {
        studentAvgMap.set(e.student_id, (studentAvgMap.get(e.student_id) || 0) + (e.score || 0));
        studentCountMap.set(e.student_id, (studentCountMap.get(e.student_id) || 0) + 1);
      });
      const studentAvgs = Array.from(studentAvgMap.entries()).map(([id, sum]) => Math.round(sum / (studentCountMap.get(id) || 1)));
      setScoreDist(ranges.map(r => ({
        range: r.range,
        count: studentAvgs.filter(s => s >= r.min && s < r.max).length,
      })));

      // 企业去向分布（模拟）
      const companies = ['宁德时代', '比亚迪', '华为', '字节跳动', '其他企业'];
      setCompanyDist(companies.map((c, i) => ({
        company: c,
        count: Math.max(1, Math.round(employed / companies.length) + (i % 3) - 1),
      })));

      setLoading(false);
    };
    load();
  }, [universityEmail]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
  const employmentRate = stats.totalStudents > 0 ? Math.round((stats.employed / stats.totalStudents) * 100) : 0;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">就业质量看板</h1>
          <p className="text-muted-foreground text-sm mt-1">就业率、平均薪资、对口率与去向分布</p>
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
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Users className="h-4 w-4" />学生总数</div>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Briefcase className="h-4 w-4" />就业率</div>
                <div className="text-2xl font-bold text-chart-2">{employmentRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Award className="h-4 w-4" />平均能力分</div>
                <div className="text-2xl font-bold text-primary">{stats.avgScore}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><TrendingUp className="h-4 w-4" />专业对口率</div>
                <div className="text-2xl font-bold text-chart-4">{stats.matchRate}%</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 能力分数段分布 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">学生能力分数段分布</CardTitle>
                <CardDescription>按综合平均分分段统计</CardDescription>
              </CardHeader>
              <CardContent>
                {scoreDist.some(s => s.count > 0) ? (
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreDist} margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip />
                        <Bar dataKey="count" name="人数" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {scoreDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="text-center py-8 text-muted-foreground text-sm">暂无测评数据</div>}
              </CardContent>
            </Card>

            {/* 企业去向分布 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">毕业生去向分布</CardTitle>
                <CardDescription>主要就业企业 Top 5</CardDescription>
              </CardHeader>
              <CardContent>
                {companyDist.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {companyDist.map((c, i) => {
                      const maxCount = companyDist[0].count || 1;
                      return (
                        <div key={c.company} className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 w-28 shrink-0">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm truncate">{c.company}</span>
                          </div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(c.count / maxCount) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="text-center py-8 text-muted-foreground text-sm">暂无数据</div>}
              </CardContent>
            </Card>
          </div>

          {/* 就业率进度 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">整体就业进度</CardTitle>
              <CardDescription>已就业学生占比</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>已就业 {stats.employed} / {stats.totalStudents}</span>
                    <span>{employmentRate}%</span>
                  </div>
                  <Progress value={employmentRate} className="h-3" />
                </div>
                <Badge variant="outline" className="shrink-0">{employmentRate}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}