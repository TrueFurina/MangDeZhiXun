import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Users, ClipboardList, Target, MessageSquare, Star, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Reveal } from '@/components/animations/Reveal';

interface InterviewResult {
  objective: string;
  duration: number;
  competencies: { name: string; weight: number; description: string }[];
  questions: { competency: string; mainQuestion: string; followUps: string[]; positiveSignals: string[]; riskSignals: string[]; scoring: string }[];
  scorecard: { competency: string; levels: string[] }[];
  opening: string;
  closing: string;
  tips: string[];
}

const INTERVIEW_TYPES = [
  { value: 'behavioral', label: '行为面试（STAR 法）' },
  { value: 'technical', label: '技术面试' },
  { value: 'case', label: '案例面试' },
  { value: 'manager', label: '管理者面试' },
];

export default function InterviewDesignerPage() {
  const navigate = useNavigate();
  const [position, setPosition] = useState('');
  const [jd, setJd] = useState('');
  const [interviewType, setInterviewType] = useState('behavioral');
  const [duration, setDuration] = useState('60');
  const [candidateInfo, setCandidateInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);

  const handleGenerate = async () => {
    if (!position.trim()) {
      toast.error('请输入岗位名称');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('interview-designer', {
        body: { position, jd, interviewType, duration: Number(duration), candidateInfo },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success('面试方案已生成');
    } catch (err: any) {
      toast.error(err?.message || '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> 返回
        </Button>

        <Reveal>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-balance">结构化面试设计</h1>
            </div>
            <p className="text-muted-foreground text-pretty max-w-prose">
              基于岗位与候选人信息，调用文本生成大模型，生成结构化面试方案、问题集与评分卡，帮助企业端高效招聘。
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 输入区 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" />面试配置</CardTitle>
              <CardDescription>填写岗位与候选人信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>岗位名称 *</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="如：高级前端工程师" className="px-3" />
              </div>
              <div className="space-y-2">
                <Label>面试类型</Label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>面试时长（分钟）</Label>
                <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="px-3" />
              </div>
              <div className="space-y-2">
                <Label>职位描述（JD）</Label>
                <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="粘贴岗位 JD、职责与任职要求..." className="min-h-[120px] resize-none px-3" />
              </div>
              <div className="space-y-2">
                <Label>候选人背景（可选）</Label>
                <Textarea value={candidateInfo} onChange={(e) => setCandidateInfo(e.target.value)} placeholder="候选人简历要点、项目经历等..." className="min-h-[100px] resize-none px-3" />
              </div>
              <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {loading ? '生成中...' : '生成面试方案'}
              </Button>
            </CardContent>
          </Card>

          {/* 结果区 */}
          <div className="lg:col-span-3">
            {result ? (
              <Tabs defaultValue="guide" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="guide"><ClipboardList className="h-4 w-4 mr-1" />方案</TabsTrigger>
                  <TabsTrigger value="questions"><MessageSquare className="h-4 w-4 mr-1" />问题集</TabsTrigger>
                  <TabsTrigger value="scorecard"><Star className="h-4 w-4 mr-1" />评分卡</TabsTrigger>
                  <TabsTrigger value="script"><Target className="h-4 w-4 mr-1" />话术</TabsTrigger>
                </TabsList>

                <TabsContent value="guide" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">面试目标</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-pretty">{result.objective}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary">时长 {result.duration} 分钟</Badge>
                        {result.competencies.map((c) => (
                          <Badge key={c.name} variant="outline">{c.name} {c.weight}%</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">评估能力项</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.competencies.map((c) => (
                        <div key={c.name} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{c.name}</span>
                            <Badge variant="secondary">{c.weight}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground text-pretty">{c.description}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                  {result.questions.map((q, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{q.competency}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm font-medium text-pretty">Q{i + 1}. {q.mainQuestion}</p>
                        {q.followUps?.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">追问：</p>
                            <ul className="space-y-1">
                              {q.followUps.map((f, j) => (
                                <li key={j} className="text-xs text-muted-foreground pl-3 border-l-2 border-primary/30">{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-2 rounded bg-chart-2/10">
                            <p className="text-xs font-medium text-chart-2 mb-1">正向信号</p>
                            <ul className="space-y-0.5">
                              {q.positiveSignals?.map((s, j) => (
                                <li key={j} className="text-xs text-muted-foreground">✓ {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-2 rounded bg-destructive/10">
                            <p className="text-xs font-medium text-destructive mb-1">风险信号</p>
                            <ul className="space-y-0.5">
                              {q.riskSignals?.map((s, j) => (
                                <li key={j} className="text-xs text-muted-foreground">✗ {s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-pretty">评分：{q.scoring}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="scorecard" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">候选人评分卡</CardTitle>
                      <CardDescription>按统一标准评价候选人</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.scorecard.map((s, i) => (
                        <div key={i} className="p-3 rounded-lg border">
                          <p className="text-sm font-medium mb-2">{s.competency}</p>
                          <div className="space-y-1.5">
                            {s.levels?.map((lv, j) => (
                              <div key={j} className="flex items-start gap-2">
                                <Badge variant={j === 0 ? 'destructive' : j === s.levels.length - 1 ? 'default' : 'secondary'} className="shrink-0 text-xs">
                                  {j === 0 ? '1分' : j === 1 ? '3分' : '5分'}
                                </Badge>
                                <p className="text-xs text-muted-foreground text-pretty">{lv}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="script" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">开场话术</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-pretty">{result.opening}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">收尾话术</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-pretty">{result.closing}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">面试官提示</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.tips?.map((t, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />{t}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center py-16">
                  <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground">填写左侧信息后生成结构化面试方案</p>
                  <p className="text-xs text-muted-foreground mt-1">包含能力项、问题集、评分卡与话术</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}