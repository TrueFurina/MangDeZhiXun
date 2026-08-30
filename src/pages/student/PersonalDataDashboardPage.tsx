import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, BookOpen, FileText, MessageSquare, TrendingUp, Target, Award, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StaggerReveal, CountUp } from '@/components/animations/Reveal';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function PersonalDataDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    studyHours: 0, courses: 0, resumes: 0, interviews: 0, checkins: 0, streak: 0,
  });
  const [radarData, setRadarData] = useState<{ dimension: string; score: number }[]>([]);
  const [jobStats, setJobStats] = useState({ total: 0, interviewing: 0, offers: 0 });

  const userEmail = user?.email || localStorage.getItem('student_email') || '';

  useEffect(() => {
    const load = async () => {
      if (!userEmail) { setLoading(false); return; }
      setLoading(true);
      const [cp, r, i, sc, jd] = await Promise.all([
        supabase.from('course_progress').select('id, completed_at').eq('user_email', userEmail).eq('status', 'completed'),
        supabase.from('resume_optimizations').select('id', { count: 'exact', head: true }).eq('user_email', userEmail),
        supabase.from('interview_reports').select('id', { count: 'exact', head: true }).eq('user_email', userEmail),
        supabase.from('study_checkins').select('checkin_date').eq('user_email', userEmail).order('checkin_date', { ascending: false }),
        supabase.from('job_applications').select('status').eq('user_email', userEmail),
      ]);

      const completedCourses = (cp.data as { completed_at: string }[]) || [];
      setStats(prev => ({
        ...prev,
        courses: completedCourses.length,
        studyHours: completedCourses.length * 3, // 估算每门课3小时
        resumes: r.count || 0,
        interviews: i.count || 0,
        checkins: (sc.data as { checkin_date: string }[])?.length || 0,
      }));

      // 连续打卡天数
      const dates = ((sc.data as { checkin_date: string }[]) || []).map(d => d.checkin_date);
      let streak = 0;
      const set = new Set(dates);
      const d = new Date();
      if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
      while (set.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
      setStats(prev => ({ ...prev, streak }));

      // 求职统计
      const jobs = (jd.data as { status: string }[]) || [];
      setJobStats({
        total: jobs.length,
        interviewing: jobs.filter(j => j.status === 'interview').length,
        offers: jobs.filter(j => j.status === 'offer').length,
      });

      // 能力雷达（从最近的测评）
      const { data: evalData } = await supabase
        .from('evaluations')
        .select('dimension, score')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(20);
      const dimMap = new Map<string, { sum: number; count: number }>();
      (evalData as { dimension: string; score: number }[] || []).forEach(e => {
        const cur = dimMap.get(e.dimension) || { sum: 0, count: 0 };
        cur.sum += e.score || 0;
        cur.count += 1;
        dimMap.set(e.dimension, cur);
      });
      setRadarData(Array.from(dimMap.entries()).map(([dim, v]) => ({ dimension: dim, score: Math.round(v.sum / v.count) })));

      setLoading(false);
    };
    load();
  }, [userEmail]);

  const statCards = [
    { label: '累计学习时长', value: `${stats.studyHours}h`, icon: Clock, color: 'text-primary' },
    { label: '完成课程', value: stats.courses, icon: BookOpen, color: 'text-chart-2' },
    { label: '简历优化', value: stats.resumes, icon: FileText, color: 'text-chart-3' },
    { label: 'AI面试', value: stats.interviews, icon: MessageSquare, color: 'text-chart-4' },
    { label: '打卡天数', value: stats.checkins, icon: Flame, color: 'text-chart-5' },
    { label: '连续打卡', value: `${stats.streak}天`, icon: TrendingUp, color: 'text-primary' },
  ];

  const overallProgress = stats.courses > 0 ? Math.min(100, Math.round((stats.courses / 20) * 100)) : 0;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的数据</h1>
          <p className="text-muted-foreground text-sm mt-1">学习时长、能力变化与求职进度的全景看板</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">加载中...</div>
      ) : (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <StaggerReveal className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="reveal-item">
                  <CardContent className="pt-5 pb-4 text-center">
                    <Icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </StaggerReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 能力雷达 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />能力分布</CardTitle>
                <CardDescription>各维度平均得分</CardDescription>
              </CardHeader>
              <CardContent>
                {radarData.length > 0 ? (
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={radarData} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis type="category" dataKey="dimension" width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={24}>
                          {radarData.map((_, i) => (
                            <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">暂无测评数据</div>
                )}
              </CardContent>
            </Card>

            {/* 求职进度 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" />求职进度</CardTitle>
                <CardDescription>投递与面试转化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">{jobStats.total}</div>
                      <p className="text-xs text-muted-foreground">投递</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-chart-3">{jobStats.interviewing}</div>
                      <p className="text-xs text-muted-foreground">面试中</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-chart-4">{jobStats.offers}</div>
                      <p className="text-xs text-muted-foreground">Offer</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>面试转化率</span>
                      <span>{jobStats.total > 0 ? Math.round(((jobStats.interviewing + jobStats.offers) / jobStats.total) * 100) : 0}%</span>
                    </div>
                    <Progress value={jobStats.total > 0 ? Math.round(((jobStats.interviewing + jobStats.offers) / jobStats.total) * 100) : 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 成长进度 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">成长进度</CardTitle>
              <CardDescription>以完成 20 门课程为目标的成长曲线</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>已完成 {stats.courses} / 20 门</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                </div>
                <Badge variant="outline" className="shrink-0">{overallProgress}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}