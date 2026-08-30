import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  Zap, Map, Swords, TrendingUp, CheckCircle2, Lock, Play,
  Target, Star, Clock, ChevronRight, Loader2,
  Sparkles, Trophy, AlertTriangle, BarChart3, Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { getUserAssessments, type AssessmentRecord } from '@/db/api';
import { getCurrentUserEmail } from '@/lib/supabase';

// ─── 常量配置 ───────────────────────────────────────────────────
const RADAR_DIMS = [
  { key: 'tech_score',       label: '专业技能', fullMark: 100 },
  { key: 'general_score',    label: '通用能力', fullMark: 100 },
  { key: 'behavior_score',   label: '行为特质', fullMark: 100 },
  { key: 'experience_score', label: '实践经验', fullMark: 100 },
];

const TARGET_BENCHMARKS: Record<string, Record<string, number>> = {
  '前端开发工程师': { tech_score: 80, general_score: 65, behavior_score: 70, experience_score: 75 },
  '数据分析师':     { tech_score: 75, general_score: 75, behavior_score: 65, experience_score: 70 },
  '产品经理':       { tech_score: 60, general_score: 85, behavior_score: 80, experience_score: 75 },
  '运营专员':       { tech_score: 55, general_score: 80, behavior_score: 82, experience_score: 68 },
  '后端工程师':     { tech_score: 85, general_score: 65, behavior_score: 68, experience_score: 78 },
};

const PRACTICE_SCENARIOS = [
  {
    id: 1, icon: '📊', title: '数据透视分析实战',
    desc: '给定真实业务数据集，完成从数据清洗到洞察报告的全流程任务',
    difficulty: '中级', duration: '45分钟', tags: ['Excel', 'Python', '数据分析'],
    locked: false,
  },
  {
    id: 2, icon: '🎯', title: '产品需求拆解沙盘',
    desc: '基于真实用户反馈，提炼核心痛点并输出PRD文档初稿',
    difficulty: '中级', duration: '60分钟', tags: ['产品思维', 'PRD', '用户研究'],
    locked: false,
  },
  {
    id: 3, icon: '🤝', title: '跨部门协作压力测试',
    desc: '模拟项目deadline紧张时的多方沟通与优先级决策情景',
    difficulty: '高级', duration: '30分钟', tags: ['软技能', '沟通', '优先级'],
    locked: false,
  },
  {
    id: 4, icon: '💻', title: 'API接口设计挑战',
    desc: '设计一套RESTful API，满足给定业务需求，并考虑安全与扩展性',
    difficulty: '高级', duration: '90分钟', tags: ['后端', 'RESTful', '系统设计'],
    locked: true,
  },
  {
    id: 5, icon: '📣', title: '新媒体内容增长策略',
    desc: '为一家初创公司制定三个月内容矩阵与投放策略',
    difficulty: '中级', duration: '50分钟', tags: ['运营', '内容策略', '增长'],
    locked: true,
  },
];

const GROWTH_FEED = [
  { date: '3天前', type: 'achievement', content: '完成「数据透视分析实战」场景挑战，获得 +12 经验值' },
  { date: '1周前', type: 'milestone',   content: '实践经验维度提升至 68 分，突破历史最高' },
  { date: '2周前', type: 'course',      content: '完成「Python数据分析实战」课程，学习时长 4.5h' },
  { date: '3周前', type: 'assessment',  content: '参加 AI岗位胜任力测评（前端工程师），综合得分 72 分' },
  { date: '1月前', type: 'join',        content: '加入「芒得职训」AI实习培养计划，开启成长旅程 🚀' },
];

const FEED_ICON: Record<string, { icon: typeof Star; color: string }> = {
  achievement: { icon: Trophy,      color: 'text-amber-500'  },
  milestone:   { icon: TrendingUp,  color: 'text-green-500'  },
  course:      { icon: BarChart3,   color: 'text-blue-500'   },
  assessment:  { icon: BarChart3,   color: 'text-purple-500' },
  join:        { icon: Sparkles,    color: 'text-primary'    },
};

// ─── 工具函数 ────────────────────────────────────────────────────
function getDimScore(rec: AssessmentRecord, key: string): number {
  return (rec as unknown as Record<string, number>)[key] ?? 0;
}

function getGapLabel(gap: number): { label: string; color: string } {
  if (gap <= -20) return { label: '急需补强', color: 'text-destructive' };
  if (gap <= -8)  return { label: '需要提升', color: 'text-amber-500' };
  if (gap >= 10)  return { label: '超出基准', color: 'text-green-500' };
  return { label: '基本达标', color: 'text-muted-foreground' };
}

// ─── 子组件：能力全息图 ──────────────────────────────────────────
function AbilityHologramTab({
  assessments,
  navigate,
}: {
  assessments: AssessmentRecord[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [targetRole, setTargetRole] = useState('前端开发工程师');

  const latest = assessments[0];
  const benchmark = TARGET_BENCHMARKS[targetRole] ?? TARGET_BENCHMARKS['前端开发工程师'];

  const radarData = RADAR_DIMS.map(d => ({
    subject: d.label,
    current: latest ? getDimScore(latest, d.key) : 0,
    target: benchmark[d.key],
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* 角色选择 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> 能力全息图
              </CardTitle>
              <CardDescription>当前能力 vs 目标岗位基准——精准定位差距</CardDescription>
            </div>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TARGET_BENCHMARKS).map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!latest ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">暂无测评记录，请先完成岗位胜任力测评</p>
              <Button className="mt-4" onClick={() => navigate('/student/evaluation')}>
                前往测评
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
                  <Radar name="当前能力" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                  <Radar name="目标基准" dataKey="target" stroke="hsl(var(--chart-2, 160 60% 45%))" fill="hsl(var(--chart-2, 160 60% 45%))" fillOpacity={0.15} strokeDasharray="5 4" />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                <p className="text-sm font-semibold">各维度差距分析</p>
                {RADAR_DIMS.map(d => {
                  const cur = latest ? getDimScore(latest, d.key) : 0;
                  const tgt = benchmark[d.key];
                  const gap = cur - tgt;
                  const { label, color } = getGapLabel(gap);
                  return (
                    <div key={d.key} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{d.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{cur} / {tgt}</span>
                          <Badge variant="outline" className={`text-xs ${color}`}>{label}</Badge>
                        </div>
                      </div>
                      <Progress value={(cur / 100) * 100} className="h-2" />
                    </div>
                  );
                })}
                <p className="pt-2 text-xs text-muted-foreground">
                  测评时间：{latest ? new Date(latest.created_at).toLocaleDateString('zh-CN') : '—'} · 岗位：{latest?.job_title ?? '—'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 子组件：专属实习路径 ────────────────────────────────────────
function InternshipPathTab({ assessments }: { assessments: AssessmentRecord[] }) {
  const latest = assessments[0];

  const phases = [
    {
      phase: '第一阶段', title: '能力底座夯实（1-4周）',
      status: 'done', color: 'bg-green-500',
      steps: ['完成AI岗位胜任力基础测评', '阅读行业标准白皮书', '完成专业技能入门课程 × 3'],
    },
    {
      phase: '第二阶段', title: '硬技能专项突破（5-10周）',
      status: latest ? 'active' : 'locked', color: 'bg-primary',
      steps: ['完成专项技能进阶课程 × 5', '参与虚拟练兵场实战挑战 × 2', '输出项目作品初稿'],
    },
    {
      phase: '第三阶段', title: '软实力全面进阶（11-16周）',
      status: 'locked', color: 'bg-muted-foreground',
      steps: ['完成跨部门协作情景模拟', 'AI模拟面试评估 × 3轮', '修订完善项目作品集'],
    },
    {
      phase: '第四阶段', title: '综合能力验收（17-20周）',
      status: 'locked', color: 'bg-muted-foreground',
      steps: ['参加综合能力终测', '获取「AI岗位胜任力」认证证书', '对接企业推荐绿色通道'],
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" /> 专属实习路径
          </CardTitle>
          <CardDescription>基于你的测评结果，AI为你定制的20周成长路线图</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((ph, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                    ph.status === 'done' ? 'bg-green-500' :
                    ph.status === 'active' ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {ph.status === 'done' ? <CheckCircle2 className="h-5 w-5" /> :
                     ph.status === 'active' ? <Play className="h-4 w-4 ml-0.5" /> :
                     <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  {i < phases.length - 1 && (
                    <div className={`mt-1 w-0.5 flex-1 ${ph.status === 'done' ? 'bg-green-300' : 'bg-border'}`} style={{ minHeight: 32 }} />
                  )}
                </div>
                <Card className={`mb-2 flex-1 ${ph.status === 'active' ? 'border-primary/50 shadow-sm' : ph.status === 'locked' ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{ph.phase}：{ph.title}</CardTitle>
                      <Badge variant={ph.status === 'done' ? 'default' : ph.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
                        {ph.status === 'done' ? '已完成' : ph.status === 'active' ? '进行中' : '待解锁'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <ul className="space-y-1.5">
                      {ph.steps.map((s, si) => (
                        <li key={si} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 子组件：虚拟练兵场 ──────────────────────────────────────────
function PracticeGroundTab() {
  const [activePractice, setActivePractice] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim()) { toast.error('请输入你的解题思路'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    setSubmitted(activePractice);
    setActivePractice(null);
    setAnswer('');
    toast.success('已提交！AI正在评估，结果将在1-2分钟内反馈');
  };

  const active = PRACTICE_SCENARIOS.find(s => s.id === activePractice);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" /> 虚拟练兵场
          </CardTitle>
          <CardDescription>真实业务场景模拟，用「做」来强化学习效果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PRACTICE_SCENARIOS.map(sc => (
              <Card key={sc.id} className={`transition-shadow ${sc.locked ? 'opacity-60' : 'hover:shadow-md cursor-pointer'} ${submitted === sc.id ? 'border-green-400' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{sc.icon}</span>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={sc.difficulty === '高级' ? 'destructive' : 'secondary'} className="text-xs">{sc.difficulty}</Badge>
                      {submitted === sc.id && <Badge className="text-xs bg-green-500">已提交</Badge>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{sc.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sc.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {sc.duration}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sc.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                  </div>
                  {sc.locked ? (
                    <Button size="sm" variant="outline" disabled onClick={() => {}} className="w-full">
                      <Lock className="mr-1 h-3 w-3" /> 待解锁
                    </Button>
                  ) : submitted === sc.id ? (
                    <Button size="sm" variant="outline" disabled onClick={() => {}} className="w-full text-green-600 border-green-400">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> 已提交评估
                    </Button>
                  ) : (
                    // 未学习（0%）：开始挑战按钮
                    <Button size="sm" className="w-full" onClick={() => { setActivePractice(sc.id); setAnswer(''); }}>
                      <Play className="mr-1 h-3 w-3" /> 开始挑战
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 挑战答题区 */}
      {active && (
        <Card className="border-primary/40 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="text-2xl">{active.icon}</span> {active.title}
            </CardTitle>
            <CardDescription>{active.desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
              <p className="font-medium mb-2">任务说明</p>
              <p className="text-muted-foreground">请根据以上场景描述，输出你的解题思路、方案框架或具体操作步骤。AI将从逻辑性、完整性、专业度三个维度为你评分并给出详细反馈。</p>
            </div>
            <Textarea
              placeholder="请输入你的解题思路和方案..."
              rows={8}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI评估中...</> : <><Sparkles className="mr-2 h-4 w-4" />提交AI评估</>}
              </Button>
              <Button variant="outline" onClick={() => { setActivePractice(null); setAnswer(''); }}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── 子组件：成长动态反馈 ────────────────────────────────────────
function GrowthFeedTab({ assessments }: { assessments: AssessmentRecord[] }) {
  const latest = assessments[0];

  const totalScore = latest?.total_score ?? 0;
  const level = totalScore >= 85 ? '优秀' : totalScore >= 70 ? '良好' : totalScore >= 55 ? '进阶中' : '成长中';
  const levelColor = totalScore >= 85 ? 'text-amber-500' : totalScore >= 70 ? 'text-green-500' : 'text-primary';

  return (
    <div className="space-y-6">
      {/* 成长概览 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">综合评分</p>
              <p className={`text-3xl font-bold ${levelColor}`}>{totalScore > 0 ? totalScore : '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">成长阶段</p>
              <p className={`text-2xl font-bold ${levelColor}`}>{level}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">测评次数</p>
              <p className="text-3xl font-bold">{assessments.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 动态时间线 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> 成长动态反馈
          </CardTitle>
          <CardDescription>AI记录你每一步的成长轨迹</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {GROWTH_FEED.map((item, i) => {
              const FeedIcon = FEED_ICON[item.type]?.icon ?? Star;
              const iconColor = FEED_ICON[item.type]?.color ?? 'text-primary';
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted`}>
                    <FeedIcon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{item.content}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI成长建议 */}
      <Card className="border-primary/30 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" /> AI成长建议
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            '继续保持每周学习节奏，建议每次学习时长不少于45分钟',
            '重点攻克当前最弱维度，每周完成1-2个对应方向的练兵场挑战',
            '建议在完成第二阶段后申请AI模拟面试，以检验综合能力',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────────
export default function AIInternshipTrainingPage() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);

  useEffect(() => {
    (async () => {
      const email = getCurrentUserEmail();
      if (!email) return;
      try {
        const data = await getUserAssessments(email);
        setAssessments(data);
      } catch (e) {
        console.error('加载测评数据失败', e);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* 页头 */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Swords className="h-8 w-8 text-primary" />
            AI个性化岗位实习培养
          </h1>
          <p className="mt-1 text-muted-foreground">
            能力全息诊断 × 专属成长路径 × 虚拟实战场景 × 动态反馈闭环
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white text-sm px-3 py-1">
          AI驱动 · 全程陪伴
        </Badge>
      </div>

      {/* 四大模块 */}
      <Tabs defaultValue="hologram">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1 p-1">
          <TabsTrigger value="hologram" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <Zap className="h-4 w-4 shrink-0" /><span>能力全息图</span>
          </TabsTrigger>
          <TabsTrigger value="path" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <Map className="h-4 w-4 shrink-0" /><span>专属实习路径</span>
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <Swords className="h-4 w-4 shrink-0" /><span>虚拟练兵场</span>
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <TrendingUp className="h-4 w-4 shrink-0" /><span>成长动态反馈</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hologram">
          <AbilityHologramTab assessments={assessments} navigate={navigate} />
        </TabsContent>
        <TabsContent value="path">
          <InternshipPathTab assessments={assessments} />
        </TabsContent>
        <TabsContent value="practice">
          <PracticeGroundTab />
        </TabsContent>
        <TabsContent value="growth">
          <GrowthFeedTab assessments={assessments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
