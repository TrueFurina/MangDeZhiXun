import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Loader2, MessageSquare, TrendingUp, Target, Brain,
  Activity, Award, FileText, Sparkles, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';

interface InterviewRecord {
  id: string;
  user_id: string;
  interview_type: string;
  status: number;
  total_score: number | null;
  logic_score: number | null;
  pressure_score: number | null;
  round_count: number;
  ai_comment: string | null;
  create_time: string;
}

interface TrendDimension {
  name: string;
  trend: string;
  change: string;
  comment: string;
}

interface TrendData {
  summary: string;
  dimensions: TrendDimension[];
}

const DIMENSION_COLORS: Record<string, string> = {
  '综合表现': 'hsl(var(--chart-1))',
  '表达逻辑': 'hsl(var(--chart-2))',
  '抗压应变': 'hsl(var(--chart-3))',
};

const TREND_STYLE: Record<string, { label: string; cls: string }> = {
  '上升': { label: '上升', cls: 'text-chart-2' },
  '下降': { label: '下降', cls: 'text-destructive' },
  '持平': { label: '持平', cls: 'text-muted-foreground' },
};

const INTERVIEW_TYPE_LABEL: Record<string, string> = {
  voice: '语音面试',
  text: '文字面试',
  video: '视频面试',
};

export default function InterviewReviewLibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [generating, setGenerating] = useState(false);

  const userEmail = user?.email || localStorage.getItem('user_email') || '';

  const loadRecords = useCallback(async () => {
    if (!userEmail) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (!profile?.id) { setRecords([]); return; }

      const { data } = await supabase
        .from('ai_interview_record')
        .select('id, user_id, interview_type, status, total_score, logic_score, pressure_score, round_count, ai_comment, create_time')
        .eq('user_id', profile.id)
        .order('create_time', { ascending: false })
        .limit(50);

      setRecords((data as InterviewRecord[]) || []);
    } catch (e) {
      console.error('加载面试记录失败', e);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const generateTrend = useCallback(async () => {
    const scored = records.filter(r => r.total_score !== null);
    if (scored.length < 2) {
      toast.error('至少需要 2 次有效面试记录才能生成趋势分析');
      return;
    }
    setGenerating(true);
    try {
      const payload = scored.map(r => ({
        date: r.create_time,
        total_score: r.total_score,
        logic_score: r.logic_score,
        pressure_score: r.pressure_score,
      }));
      const { data, error } = await supabase.functions.invoke('ai-interview-trend', {
        body: { records: payload },
      });
      if (error) {
        let msg = '趋势分析生成失败';
        try {
          const errJson = JSON.parse(await error.context?.text?.() || '{}');
          msg = errJson.error || msg;
        } catch { /* 忽略 */ }
        throw new Error(msg);
      }
      if (data?.success && data.data) {
        setTrendData(data.data as TrendData);
        toast.success('趋势分析已生成');
      } else {
        throw new Error(data?.error || '生成失败');
      }
    } catch (err: any) {
      toast.error(err?.message || '趋势分析生成失败');
    } finally {
      setGenerating(false);
    }
  }, [records]);

  const scoredRecords = records.filter(r => r.total_score !== null);
  const chartData = [...scoredRecords]
    .sort((a, b) => new Date(a.create_time).getTime() - new Date(b.create_time).getTime())
    .map((r, i) => ({
      index: `第${i + 1}次`,
      date: r.create_time.slice(0, 10),
      '综合表现': r.total_score,
      '表达逻辑': r.logic_score,
      '抗压应变': r.pressure_score,
    }));

  const avgScore = scoredRecords.length > 0
    ? Math.round(scoredRecords.reduce((s, r) => s + (r.total_score || 0), 0) / scoredRecords.length)
    : 0;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">面试复盘库</h1>
          <p className="text-muted-foreground text-sm mt-1 text-pretty">
            回顾历次 AI 深度面试，追踪各维度能力的成长曲线
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : records.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暂无面试记录</h3>
            <p className="text-muted-foreground text-sm mb-6 text-pretty max-w-md mx-auto">
              完成一次 AI 深度特训后，记录会自动收录到这里，便于复盘与对比进步。
            </p>
            <Button onClick={() => navigate('/student/ai-interview')}>
              <Sparkles className="h-4 w-4 mr-2" />
              前往 AI 深度特训
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 概览统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><MessageSquare className="h-4 w-4" />面试次数</div>
                <div className="text-2xl font-bold">{records.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Award className="h-4 w-4" />平均得分</div>
                <div className="text-2xl font-bold text-primary">{avgScore}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Target className="h-4 w-4" />最高得分</div>
                <div className="text-2xl font-bold text-chart-2">
                  {scoredRecords.length > 0 ? Math.max(...scoredRecords.map(r => r.total_score || 0)) : '-'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Activity className="h-4 w-4" />有效记录</div>
                <div className="text-2xl font-bold">{scoredRecords.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* 趋势分析 */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />面试能力趋势分析
                  </CardTitle>
                  <CardDescription className="text-pretty">横向对比多次面试的进步曲线，识别提升与薄弱维度</CardDescription>
                </div>
                <Button onClick={generateTrend} disabled={generating} className="shrink-0">
                  {generating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />AI 分析中...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" />{trendData ? '重新分析' : '生成趋势分析'}</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {scoredRecords.length < 2 ? (
                <p className="text-sm text-muted-foreground text-center py-8">至少需要 2 次有效面试记录才能生成趋势分析</p>
              ) : (
                <div className="space-y-4">
                  {/* 折线图 */}
                  <div className="w-full min-w-0 overflow-hidden">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="index" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip
                          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                          labelFormatter={(_, p) => p?.[0]?.payload?.date || ''}
                        />
                        <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                        {Object.entries(DIMENSION_COLORS).map(([name, color]) => (
                          <Line key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* AI 总结 */}
                  {trendData && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">AI 进步趋势总结</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-pretty">{trendData.summary}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {trendData.dimensions.map((d) => {
                          const style = TREND_STYLE[d.trend] || TREND_STYLE['持平'];
                          return (
                            <div key={d.name} className="p-3 rounded-lg border bg-card">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{d.name}</span>
                                <Badge variant="outline" className={`text-xs ${style.cls}`}>{style.label} {d.change}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground text-pretty">{d.comment}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 面试记录列表 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">面试记录</h2>
            <div className="space-y-3">
              {records.map((r) => (
                <Card key={r.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {INTERVIEW_TYPE_LABEL[r.interview_type] || r.interview_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{r.create_time.slice(0, 16).replace('T', ' ')}</span>
                          {r.round_count > 0 && (
                            <Badge variant="outline" className="text-xs">{r.round_count} 轮</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <ScoreItem label="综合" value={r.total_score} />
                          <ScoreItem label="表达逻辑" value={r.logic_score} />
                          <ScoreItem label="抗压应变" value={r.pressure_score} />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => navigate(`/student/ai-interview/report/${r.id}`)}>
                        <FileText className="h-4 w-4 mr-1" />查看报告 <ArrowRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${value === null ? 'text-muted-foreground' : 'text-foreground'}`}>
        {value === null ? '-' : value}
      </p>
    </div>
  );
}