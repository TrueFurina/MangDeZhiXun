import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, CheckCircle2, Award, BookOpen, FileText, MessageSquare, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Checkin {
  id: string;
  checkin_date: string;
  note: string | null;
}

interface Achievement {
  key: string;
  label: string;
  icon: any;
  desc: string;
  unlocked: boolean;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(dates: string[]) {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  // 如果今天没打卡，从昨天开始算
  if (!set.has(todayStr())) {
    d.setDate(d.getDate() - 1);
  }
  while (set.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function StudyCheckinPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayChecked, setTodayChecked] = useState(false);
  const [note, setNote] = useState('');
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ total: 0, courses: 0, resumes: 0, interviews: 0 });

  const userEmail = user?.email || localStorage.getItem('student_email') || '';

  const load = useCallback(async () => {
    if (!userEmail) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('study_checkins')
      .select('id, checkin_date, note')
      .eq('user_email', userEmail)
      .order('checkin_date', { ascending: false })
      .limit(365);
    const list = (data as Checkin[]) || [];
    setCheckins(list);
    setTodayChecked(list.some(c => c.checkin_date === todayStr()));
    setStreak(calcStreak(list.map(c => c.checkin_date)));
    setStats(prev => ({ ...prev, total: list.length }));

    // 统计课程/简历/面试
    const [c, r, i] = await Promise.all([
      supabase.from('course_progress').select('id', { count: 'exact', head: true }).eq('user_email', userEmail).eq('status', 'completed'),
      supabase.from('resume_optimizations').select('id', { count: 'exact', head: true }).eq('user_email', userEmail),
      supabase.from('interview_reports').select('id', { count: 'exact', head: true }).eq('user_email', userEmail),
    ]);
    setStats(prev => ({
      ...prev,
      courses: c.count || 0,
      resumes: r.count || 0,
      interviews: i.count || 0,
    }));
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { load(); }, [load]);

  const handleCheckin = async () => {
    if (todayChecked) return;
    const { error } = await supabase.from('study_checkins').insert({
      user_email: userEmail,
      checkin_date: todayStr(),
      note: note.trim() || null,
    });
    if (error) { toast.error('打卡失败'); return; }
    toast.success('打卡成功，继续保持！');
    setNote('');
    load();
  };

  const achievements: Achievement[] = [
    { key: 'first_resume', label: '首份简历', icon: FileText, desc: '完成首次简历优化', unlocked: stats.resumes > 0 },
    { key: 'first_interview', label: '首次面试', icon: MessageSquare, desc: '完成首次AI面试', unlocked: stats.interviews > 0 },
    { key: 'first_course', label: '首个课程', icon: BookOpen, desc: '完成首个课程学习', unlocked: stats.courses > 0 },
    { key: 'streak_7', label: '坚持7天', icon: Flame, desc: '连续打卡7天', unlocked: streak >= 7 },
    { key: 'streak_30', label: '坚持30天', icon: Trophy, desc: '连续打卡30天', unlocked: streak >= 30 },
    { key: 'checkin_50', label: '勤学之星', icon: Award, desc: '累计打卡50天', unlocked: stats.total >= 50 },
  ];
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // 日历热力图数据（最近30天）
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const ds = d.toISOString().slice(0, 10);
    return { date: ds, checked: checkins.some(c => c.checkin_date === ds) };
  });

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">学习打卡</h1>
          <p className="text-muted-foreground text-sm mt-1">每日打卡，积累连续学习天数，解锁成就徽章</p>
        </div>
      </div>

      {/* 打卡卡片 */}
      <Card className="mb-6 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Flame className={`h-8 w-8 ${streak > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{streak}</span>
                  <span className="text-muted-foreground text-sm">天连续打卡</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">累计打卡 {stats.total} 天</p>
              </div>
            </div>
            <Button size="lg" disabled={todayChecked || loading} onClick={handleCheckin}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {todayChecked ? '今日已打卡' : '今日打卡'}
            </Button>
          </div>
          {!todayChecked && (
            <div className="mt-4">
              <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="记录今天的学习收获（选填）" rows={2} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 30天热力图 */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">最近30天打卡记录</CardTitle>
          <CardDescription>绿色方块表示当天已打卡</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1.5">
            {calendarDays.map(d => (
              <div
                key={d.date}
                className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${
                  d.checked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
                title={`${d.date} ${d.checked ? '已打卡' : '未打卡'}`}
              >
                {Number(d.date.slice(8, 10))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 成就徽章 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />成就徽章
              </CardTitle>
              <CardDescription>已解锁 {unlockedCount}/{achievements.length} 个成就</CardDescription>
            </div>
            <Badge variant="outline">{unlockedCount}/{achievements.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map(a => {
              const Icon = a.icon;
              return (
                <div
                  key={a.key}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    a.unlocked ? 'border-primary/30 bg-primary/5' : 'border-dashed opacity-50 grayscale'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full mx-auto mb-2 flex items-center justify-center ${a.unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${a.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}