import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Loader2, Calendar, Clock, Target, BookOpen, ArrowRight, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PlanTask {
  course_id: number;
  course_title: string;
  dimension: string;
  type: string;
  estimated_hours: number;
  milestone: string;
}

interface PlanWeek {
  week: number;
  theme: string;
  goal: string;
  estimated_hours: number;
  tasks: PlanTask[];
}

interface PlanData {
  summary: string;
  total_weeks: number;
  weeks: PlanWeek[];
}

interface SavedPlan {
  id: string;
  target_company: string | null;
  target_position: string | null;
  plan_data: PlanData;
  status: string;
  created_at: string;
}

export default function LearningPlanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [targetInfo, setTargetInfo] = useState<{ company?: string; position?: string; radar_data?: any[]; shortcomings?: string[] }>({});
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 读取 JD 分析数据
        let analysis: any = null;
        try {
          const raw = localStorage.getItem('target_jd_analysis');
          if (raw) analysis = JSON.parse(raw);
        } catch { /* 忽略 */ }

        if (analysis?.radar_data && analysis.radar_data.length > 0) {
          setHasAnalysis(true);
          setTargetInfo({
            company: analysis.company,
            position: analysis.jobTitle,
            radar_data: analysis.radar_data,
            shortcomings: analysis.shortcomings,
          });
        }

        // 读取已保存的学习计划
        const userEmail = user?.email || localStorage.getItem('student_email') || '';
        if (userEmail) {
          const { data } = await supabase
            .from('learning_plans')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (data) setPlan(data as SavedPlan);
        }
      } catch (e) {
        console.error('加载学习计划失败', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const generatePlan = useCallback(async () => {
    if (!hasAnalysis) {
      toast.error('请先完成 JD 拆解分析以获取能力数据');
      return;
    }
    setGenerating(true);
    try {
      const userEmail = user?.email || localStorage.getItem('student_email') || '';
      const { data, error } = await supabase.functions.invoke('ai-learning-plan', {
        body: {
          targetCompany: targetInfo.company,
          targetPosition: targetInfo.position,
          radarData: targetInfo.radar_data,
          shortcomings: targetInfo.shortcomings,
          userEmail,
        },
      });

      if (error) {
        let msg = '生成学习计划失败';
        try {
          const errJson = JSON.parse(await error.context?.text?.() || '{}');
          msg = errJson.error || msg;
        } catch { /* 忽略 */ }
        throw new Error(msg);
      }

      if (data?.success && data.data) {
        // 重新拉取最新计划
        if (userEmail) {
          const { data: latest } = await supabase
            .from('learning_plans')
            .select('*')
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (latest) setPlan(latest as SavedPlan);
        }
        setCompletedTasks(new Set());
        toast.success('智能学习计划已生成');
      } else {
        throw new Error(data?.error || '生成失败');
      }
    } catch (err: any) {
      toast.error(err?.message || '生成学习计划失败');
    } finally {
      setGenerating(false);
    }
  }, [hasAnalysis, targetInfo, user]);

  const toggleTask = (week: number, courseId: number) => {
    const key = `${week}-${courseId}`;
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalTasks = plan?.plan_data?.weeks?.reduce((s, w) => s + (w.tasks?.length || 0), 0) || 0;
  const doneTasks = plan ? Array.from(completedTasks).filter(k => k.startsWith('')).length : 0;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

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
          <h1 className="text-2xl font-bold tracking-tight">智能学习计划</h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI 基于你的能力缺口自动生成多周学习路径，逐周攻克目标岗位
          </p>
        </div>
      </div>

      {/* 目标信息 */}
      {hasAnalysis && (
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">目标岗位</p>
                  <p className="font-semibold">
                    {targetInfo.position || '目标岗位'}
                    {targetInfo.company && <span className="text-muted-foreground font-normal"> · {targetInfo.company}</span>}
                  </p>
                </div>
              </div>
              <Button onClick={generatePlan} disabled={generating} variant="default">
                {generating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI 正在规划...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />{plan ? '重新生成计划' : '生成学习计划'}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasAnalysis && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">尚未具备生成条件</h3>
            <p className="text-muted-foreground text-sm mb-6 text-pretty max-w-md mx-auto">
              请先完成一次 JD 拆解分析，系统将基于你的能力雷达图生成专属学习计划。
            </p>
            <Button onClick={() => navigate('/student/jd-analysis')}>
              <Sparkles className="h-4 w-4 mr-2" />
              前往 JD 拆解分析
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 已有计划 */}
      {hasAnalysis && plan && plan.plan_data && (
        <div className="space-y-6">
          {/* 进度概览 */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">学习进度</p>
                  <p className="text-2xl font-bold text-primary">{progressPct}%</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>已完成 {doneTasks} / {totalTasks} 个任务</p>
                  <p>共 {plan.plan_data.total_weeks} 周 · 约 {plan.plan_data.weeks?.reduce((s, w) => s + (w.estimated_hours || 0), 0)} 小时</p>
                </div>
              </div>
              <Progress value={progressPct} className="h-3" />
              {plan.plan_data.summary && (
                <p className="text-sm text-muted-foreground mt-3 text-pretty">{plan.plan_data.summary}</p>
              )}
            </CardContent>
          </Card>

          {/* 每周计划 */}
          <div className="space-y-4">
            {plan.plan_data.weeks?.map((week) => {
              const weekTasks = week.tasks || [];
              const weekDone = weekTasks.filter(t => completedTasks.has(`${week.week}-${t.course_id}`)).length;
              return (
                <Card key={week.week}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                            {week.week}
                          </div>
                          <CardTitle className="text-base">第 {week.week} 周 · {week.theme}</CardTitle>
                        </div>
                        <CardDescription className="text-pretty">{week.goal}</CardDescription>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{week.estimated_hours}h
                        </div>
                        <div className="flex items-center gap-1 text-xs text-primary mt-1">
                          <CheckCircle2 className="h-3 w-3" />{weekDone}/{weekTasks.length}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {weekTasks.map((task) => {
                        const key = `${week.week}-${task.course_id}`;
                        const done = completedTasks.has(key);
                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${done ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-muted/50'}`}
                            onClick={() => toggleTask(week.week, task.course_id)}
                          >
                            <button className="shrink-0" type="button">
                              {done ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={`text-sm font-medium truncate ${done ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.course_title}
                                </p>
                                <Badge variant="outline" className="text-xs shrink-0">{task.dimension}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 text-pretty">{task.milestone}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />{task.estimated_hours}h
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => { e.stopPropagation(); navigate(`/student/course/${task.course_id}`); }}
                              >
                                去学习 <ArrowRight className="h-3 w-3 ml-0.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={generatePlan} disabled={generating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新生成计划
            </Button>
          </div>
        </div>
      )}

      {/* 有分析但无计划 */}
      {hasAnalysis && !plan && !generating && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">尚未生成学习计划</h3>
            <p className="text-muted-foreground text-sm mb-6 text-pretty max-w-md mx-auto">
              点击上方「生成学习计划」按钮，AI 将基于你的能力缺口自动规划多周学习路径。
            </p>
            <Button onClick={generatePlan}>
              <Sparkles className="h-4 w-4 mr-2" />
              立即生成
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}