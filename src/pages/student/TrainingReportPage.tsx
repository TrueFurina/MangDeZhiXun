import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Bot, User, MessageSquare, UserCircle, TrendingDown, Loader2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { getSubmission, getTrainingTask, invokeOrchestrator } from '@/db/training';
import { RADAR_DIMENSIONS, type TrainingSubmission, type TrainingTask } from '@/types/training';

interface PortraitDimension {
  name: string;
  score: number;
  weakness: string;
}

export default function TrainingReportPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<TrainingSubmission | null>(null);
  const [task, setTask] = useState<TrainingTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [portrait, setPortrait] = useState<PortraitDimension[] | null>(null);
  const [portraitLoading, setPortraitLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!submissionId) return;
      try {
        const sub = await getSubmission(submissionId);
        setSubmission(sub);
        if (sub?.task_id) {
          const t = await getTrainingTask(sub.task_id);
          setTask(t);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '加载失败';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [submissionId]);

  // 基于本次对话证据链生成学生软能力画像
  useEffect(() => {
    const buildPortrait = async () => {
      if (!submission?.evidence_chain?.length) return;
      setPortraitLoading(true);
      try {
        const res = await invokeOrchestrator({
          action: 'portrait',
          portrait: { assessment: {}, history: [submission.evidence_chain] },
        });
        const dims = (res.portrait as { dimensions?: PortraitDimension[] })?.dimensions;
        setPortrait(Array.isArray(dims) && dims.length > 0 ? dims : null);
      } catch {
        setPortrait(null);
      } finally {
        setPortraitLoading(false);
      }
    };
    buildPortrait();
  }, [submission]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">加载中...</div>;
  if (!submission) return <div className="p-8 text-center text-muted-foreground">报告不存在</div>;

  const radarData = RADAR_DIMENSIONS.map((d) => ({
    subject: d.label,
    score: Number(submission.scores?.[d.key] ?? 0),
    fullMark: d.fullMark,
  }));

  const avg = Math.round(radarData.reduce((s, r) => s + r.score, 0) / radarData.length);
  const rounds = submission.evidence_chain?.filter((m) => m.role === 'user').length ?? 0;

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/student/training-tasks')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">实训评估报告</h1>
          <p className="text-muted-foreground text-sm">{task?.title || '实训任务'}</p>
        </div>
      </div>

      {/* 概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">综合得分</p>
            <p className="text-3xl font-bold text-primary">{avg}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">对话轮次</p>
            <p className="text-3xl font-bold">{rounds}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">完成状态</p>
            <Badge variant="secondary" className="mt-1">{submission.status === 'completed' ? '已完成' : submission.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">完成时间</p>
            <p className="text-sm font-medium mt-2">{submission.completed_at ? new Date(submission.completed_at).toLocaleString('zh-CN') : '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* 雷达图 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> 个人能力雷达</CardTitle>
          <CardDescription>基于完整对话证据链的多维评估（非随机评分）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full min-w-0 overflow-hidden h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="得分" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 学生软能力画像 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> 学生软能力画像</CardTitle>
          <CardDescription>由画像Agent基于本次对话证据链生成的多维能力画像与短板分析</CardDescription>
        </CardHeader>
        <CardContent>
          {portraitLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> 正在生成能力画像...
            </div>
          ) : portrait && portrait.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="w-full min-w-0 overflow-hidden" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={portrait.map((d) => ({ subject: d.name, score: d.score, fullMark: 100 }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="画像得分" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {[...portrait].sort((a, b) => a.score - b.score).map((d) => (
                  <div key={d.name} className="flex items-start gap-3">
                    <TrendingDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{d.name}</span>
                        <Badge variant={d.score < 60 ? 'destructive' : 'secondary'} className="text-xs">{d.score}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-pretty">{d.weakness || '暂无短板描述'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">画像暂未生成，可稍后刷新重试。</p>
          )}
        </CardContent>
      </Card>

      {/* AI 点评 */}
      {submission.ai_comment && (
        <Card>
          <CardHeader>
            <CardTitle>AI 综合点评</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{submission.ai_comment}</p>
          </CardContent>
        </Card>
      )}

      {/* 对话证据链 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> 完整对话证据链</CardTitle>
          <CardDescription>已完整持久化保存，可作为课程过程性考核依据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {submission.evidence_chain?.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary/10' : 'bg-muted'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}