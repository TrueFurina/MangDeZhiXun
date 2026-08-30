import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, TrendingDown, BookOpen, AlertTriangle, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RADAR_DIMENSIONS, type ClassInfo, type TrainingSubmission } from '@/types/training';

// 学生真实档案（脱敏导入）
interface StudentProfile {
  student_no: string;
  name: string;
  gender?: string;
  political_status?: string;
  hometown?: string;
  major?: string;
  class_name?: string;
  mentor_name?: string;
  mentor_title?: string;
  dorm_building?: string;
  dorm_room?: string;
}

// 生效分数：教师复核覆盖优先
function effectiveScores(s: TrainingSubmission): Record<string, number> {
  const base: Record<string, number> = {};
  for (const d of RADAR_DIMENSIONS) {
    const ov = s.teacher_override?.[d.key];
    base[d.key] = typeof ov === 'number' ? ov : Number(s.scores?.[d.key] ?? 0);
  }
  return base;
}

export default function ClassPortraitPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const universityEmail = user?.email || localStorage.getItem('university_email') || '';

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [submissions, setSubmissions] = useState<TrainingSubmission[]>([]);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      if (!universityEmail) return;
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('university_email', universityEmail)
        .order('created_at', { ascending: false })
        .limit(100);
      const list = (data as ClassInfo[]) || [];
      setClasses(list);
      if (list.length > 0) setSelectedClass(list[0].id);
    };
    loadClasses();
  }, [universityEmail]);

  useEffect(() => {
    const loadData = async () => {
      if (!selectedClass) return;
      setLoading(true);
      const { data } = await supabase
        .from('training_submissions')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(500);
      setSubmissions((data as TrainingSubmission[]) || []);
      // 加载该班学生真实档案（导师/宿舍/生源地）
      const { data: pd } = await supabase
        .from('student_profiles')
        .select('student_no,name,gender,political_status,hometown,major,class_name,mentor_name,mentor_title,dorm_building,dorm_room')
        .eq('class_name', '信息安全1班')
        .order('student_no', { ascending: true })
        .limit(100);
      setProfiles((pd as StudentProfile[]) || []);
      setLoading(false);
    };
    loadData();
  }, [selectedClass]);

  const completed = submissions;

  // 班级各维度平均分
  const radarData = useMemo(() => {
    return RADAR_DIMENSIONS.map((d) => {
      const vals = completed.map((s) => effectiveScores(s)[d.key]).filter((v) => v > 0);
      const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      return { dimension: d.label, score: avg };
    });
  }, [completed]);

  const weakestDim = useMemo(() => {
    if (radarData.length === 0) return null;
    return [...radarData].sort((a, b) => a.score - b.score)[0];
  }, [radarData]);

  const strongestDim = useMemo(() => {
    if (radarData.length === 0) return null;
    return [...radarData].sort((a, b) => b.score - a.score)[0];
  }, [radarData]);

  // 薄弱学生名单（综合得分升序，低于70分视为需关注）
  const weakStudents = useMemo(() => {
    const profileMap = new Map(profiles.map((p) => [p.student_no, p]));
    return completed
      .map((s) => {
        const eff = effectiveScores(s);
        const avg = Math.round(RADAR_DIMENSIONS.reduce((a, d) => a + eff[d.key], 0) / RADAR_DIMENSIONS.length);
        const weakest = RADAR_DIMENSIONS.map((d) => ({ label: d.label, score: eff[d.key] }))
          .sort((a, b) => a.score - b.score)[0];
        // 完整学号直接匹配；兼容历史后4位提交
        const prof = profileMap.get(s.student_no) || profiles.find((p) => p.student_no.endsWith(s.student_no));
        return { student_no: s.student_no, avg, weakest, prof };
      })
      .sort((a, b) => a.avg - b.avg);
  }, [completed, profiles]);

  // 导师/宿舍分组视图
  const [groupBy, setGroupBy] = useState('none');
  const groupedStudents = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map<string, typeof weakStudents>();
    for (const s of weakStudents) {
      const key = groupBy === 'mentor' ? (s.prof?.mentor_name || '未分配导师') : (s.prof?.dorm_building ? `${s.prof.dorm_building}${s.prof.dorm_room}室` : '未安排宿舍');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [groupBy, weakStudents]);

  const studentCount = completed.length;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">班级能力画像</h1>
          <p className="text-muted-foreground text-sm mt-1">
            聚合全班实训对话证据链评估结果，识别薄弱维度与需关注的学生
          </p>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48 shrink-0"><SelectValue placeholder="选择班级" /></SelectTrigger>
          <SelectContent>
            {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">加载中...</div>
      ) : studentCount === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无画像数据</h3>
            <p className="text-muted-foreground text-sm">学生完成实训后，班级能力画像将自动生成</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 概览统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Users className="h-4 w-4" />参评学生</div>
                <div className="text-2xl font-bold">{studentCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><BookOpen className="h-4 w-4" />测评维度</div>
                <div className="text-2xl font-bold">{radarData.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><TrendingDown className="h-4 w-4" />薄弱维度</div>
                <div className="text-2xl font-bold text-destructive">{weakestDim?.dimension || '-'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Award className="h-4 w-4" />优势维度</div>
                <div className="text-2xl font-bold text-primary">{strongestDim?.dimension || '-'}</div>
              </CardContent>
            </Card>
          </div>

          {/* 班级雷达图 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" />班级整体能力雷达</CardTitle>
              <CardDescription>全班各维度平均得分（基于实训对话证据链评估）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full min-w-0 overflow-hidden" style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="70%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name="班级均值" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {radarData.map((d) => (
                  <div key={d.dimension} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground flex-1 truncate">{d.dimension}</span>
                    <Badge variant={d.score < 60 ? 'destructive' : 'secondary'} className="text-xs">{d.score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 导师/宿舍分组分析 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-row items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" />分组分析</CardTitle>
                  <CardDescription>按指导导师或宿舍分组查看学生实训表现分布</CardDescription>
                </div>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className="w-32 shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不分组</SelectItem>
                    <SelectItem value="mentor">按导师</SelectItem>
                    <SelectItem value="dorm">按宿舍</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            {groupedStudents && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedStudents.map(([key, list]) => {
                    const avgScore = Math.round(list.reduce((a, s) => a + s.avg, 0) / list.length);
                    const weakCount = list.filter((s) => s.avg < 70).length;
                    return (
                      <div key={key} className="rounded-lg border bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-medium text-sm truncate flex-1 min-w-0">{key}</span>
                          <Badge variant={avgScore < 70 ? 'destructive' : 'secondary'} className="text-xs shrink-0">均分 {avgScore}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{list.length}名学生{weakCount > 0 ? `，其中${weakCount}人需关注` : ''}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>

          {/* 薄弱学生名单 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />需关注学生</CardTitle>
              <CardDescription>按综合得分升序排列，红色标记为低于70分的学生（档案信息来自试点班级脱敏数据）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full max-w-full overflow-x-auto bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 whitespace-nowrap font-medium">姓名</th>
                      <th className="text-left py-2 px-3 whitespace-nowrap font-medium">学号</th>
                      <th className="text-left py-2 px-3 whitespace-nowrap font-medium">导师</th>
                      <th className="text-left py-2 px-3 whitespace-nowrap font-medium">宿舍</th>
                      <th className="text-left py-2 px-3 whitespace-nowrap font-medium">生源地</th>
                      <th className="text-center py-2 px-3 whitespace-nowrap font-medium">综合得分</th>
                      <th className="text-center py-2 px-3 whitespace-nowrap font-medium">最薄弱维度</th>
                      <th className="text-center py-2 px-3 whitespace-nowrap font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weakStudents.map((s) => (
                      <tr key={s.student_no} className="border-b hover:bg-muted/30">
                        <td className="py-2 px-3 whitespace-nowrap font-medium">{s.prof?.name || '-'}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">{s.prof?.student_no || s.student_no}</td>
                        <td className="py-2 px-3 whitespace-nowrap">{s.prof?.mentor_name || '-'}{s.prof?.mentor_title ? <span className="text-muted-foreground text-xs">（{s.prof.mentor_title}）</span> : null}</td>
                        <td className="py-2 px-3 whitespace-nowrap">{s.prof?.dorm_building ? `${s.prof.dorm_building} ${s.prof.dorm_room}室` : '-'}</td>
                        <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">{s.prof?.hometown || '-'}</td>
                        <td className="text-center py-2 px-3 whitespace-nowrap font-semibold">{s.avg}</td>
                        <td className="text-center py-2 px-3 whitespace-nowrap">{s.weakest?.label || '-'}（{s.weakest?.score ?? '-'}）</td>
                        <td className="text-center py-2 px-3 whitespace-nowrap">
                          <Badge variant={s.avg < 70 ? 'destructive' : 'secondary'} className="text-xs">
                            {s.avg < 70 ? '需关注' : '正常'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 预警提示 */}
          {weakestDim && weakestDim.score < 60 && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-destructive">能力预警</p>
                    <p className="text-sm text-muted-foreground mt-1 text-pretty">
                      班级在「{weakestDim.dimension}」维度平均仅 {weakestDim.score} 分，低于及格线。建议针对性安排专项对抗训练，并重点关注该维度长期停滞的学生。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
