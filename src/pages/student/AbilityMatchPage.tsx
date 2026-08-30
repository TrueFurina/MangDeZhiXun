import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronLeft, BookOpen, GraduationCap, Loader2, Target, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface RadarPoint {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

interface CourseItem {
  id: number;
  title: string;
  type: string;
  dimension: string;
  difficulty: string;
  duration: string;
  rating: number;
  description: string;
}

// 能力维度 -> 课程 dimension 映射
const DIMENSION_MAP: Record<string, string[]> = {
  '核心技能': ['专业技能提升', '项目实战经验'],
  '软素质': ['行为特质塑造', '通用能力培养'],
  '项目经验': ['项目实战经验', '专业技能提升'],
  '学历背景': ['通用能力培养', '专业技能提升'],
  '综合竞争力': ['通用能力培养', '行为特质塑造'],
};

export default function AbilityMatchPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [radarData, setRadarData] = useState<RadarPoint[]>([]);
  const [shortcomings, setShortcomings] = useState<string[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [hasAnalysis, setHasAnalysis] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 读取最近一次 JD 拆解结果（由 JDAnalysisPage 持久化到 localStorage）
        let analysis: { radar_data?: RadarPoint[]; shortcomings?: string[] } | null = null;
        try {
          const raw = localStorage.getItem('target_jd_analysis');
          if (raw) analysis = JSON.parse(raw);
        } catch { /* 忽略解析异常 */ }

        if (analysis?.radar_data && Array.isArray(analysis.radar_data) && analysis.radar_data.length > 0) {
          setRadarData(analysis.radar_data);
          setShortcomings(Array.isArray(analysis.shortcomings) ? analysis.shortcomings : []);
          setHasAnalysis(true);
          await loadCourses(analysis.radar_data);
        } else {
          setHasAnalysis(false);
        }
      } catch (e) {
        console.error('加载能力分析失败', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadCourses = async (radar: RadarPoint[]) => {
    // 找出能力缺口最大的维度（B - A 最大）
    const gaps = radar
      .map(r => ({ subject: r.subject, gap: (r.B || 0) - (r.A || 0) }))
      .sort((a, b) => b.gap - a.gap)
      .filter(g => g.gap > 0);

    const targetDimensions = new Set<string>();
    gaps.slice(0, 3).forEach(g => {
      const dims = DIMENSION_MAP[g.subject] || ['专业技能提升'];
      dims.forEach(d => targetDimensions.add(d));
    });

    if (targetDimensions.size === 0) {
      targetDimensions.add('专业技能提升');
      targetDimensions.add('通用能力培养');
    }

    const { data: courseData } = await supabase
      .from('courses')
      .select('id, title, type, dimension, difficulty, duration, rating, description')
      .in('dimension', Array.from(targetDimensions))
      .eq('status', 1)
      .order('rating', { ascending: false })
      .limit(8);

    setCourses((courseData as CourseItem[]) || []);
  };

  const matchScore = radarData.length > 0
    ? Math.round(radarData.reduce((sum, r) => sum + Math.min(r.A / (r.B || 1), 1) * 100, 0) / radarData.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <h1 className="text-2xl font-bold tracking-tight">能力需求匹配分析</h1>
          <p className="text-muted-foreground text-sm mt-1">
            基于你的 JD 拆解结果，定位能力缺口并推荐站内对应提升课程
          </p>
        </div>
      </div>

      {!hasAnalysis ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无能力分析数据</h3>
            <p className="text-muted-foreground text-sm mb-6 text-pretty max-w-md mx-auto">
              请先完成一次 JD 拆解分析，系统将自动生成你的能力雷达图并推荐匹配的提升课程。
            </p>
            <Button onClick={() => navigate('/student/jd-analysis')}>
              <Sparkles className="h-4 w-4 mr-2" />
              前往 JD 拆解分析
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 匹配得分 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-1">{matchScore}%</div>
                <p className="text-sm text-muted-foreground">综合岗位匹配度</p>
                <Progress value={matchScore} className="mt-3" />
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardContent className="pt-6">
                <div className="w-full min-w-0 overflow-hidden h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="75%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="我的能力" dataKey="A" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.3} />
                      <Radar name="岗位要求" dataKey="B" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.2} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 能力缺口 */}
          {shortcomings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-destructive" />
                  关键能力缺口
                </CardTitle>
                <CardDescription>以下是你与目标岗位的主要差距，建议优先补强</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shortcomings.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5">
                      <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-destructive">{i + 1}</span>
                      </div>
                      <p className="text-sm text-foreground text-pretty">{s}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 推荐课程 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                推荐提升课程
              </CardTitle>
              <CardDescription>根据你的能力缺口，为你匹配以下站内课程</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">暂无匹配课程，请稍后再试</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map(c => (
                    <div key={c.id} className="flex flex-col p-4 rounded-lg border bg-card hover:shadow-md transition-shadow h-full">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm leading-snug line-clamp-2 flex-1 min-w-0">{c.title}</h4>
                        <Badge variant="outline" className="shrink-0 text-xs">{c.dimension}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1 text-pretty">{c.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{c.difficulty || '入门'}</span>
                        <span>⏱ {c.duration || '-'}</span>
                        <span>★ {Number(c.rating || 0).toFixed(1)}</span>
                      </div>
                      <Button size="sm" variant="secondary" className="w-full mt-auto" onClick={() => navigate(`/student/course/${c.id}`)}>
                        开始学习
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}