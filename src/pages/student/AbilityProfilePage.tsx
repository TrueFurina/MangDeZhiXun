import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Brain, MessageSquare, Zap, Target, TrendingUp, Award, Sparkles,
  Users, Code, Database, Lightbulb, Heart, Shield, Rocket, ArrowRight,
  Loader2, ChevronLeft, AlertTriangle, History,
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getUserAssessments, type AssessmentRecord } from '@/db/api';
import { getCurrentUserEmail } from '@/lib/supabase';

// 将4维真实分数映射到6轴雷达
function toRadarData(r: AssessmentRecord) {
  const tech = r.tech_score ?? 0;
  const gen = r.general_score ?? 0;
  const beh = r.behavior_score ?? 0;
  const exp = r.experience_score ?? 0;
  return [
    { subject: '专业技能', score: tech, industry: 85, fullMark: 100 },
    { subject: '工程实践', score: Math.max(0, exp - 5), industry: 80, fullMark: 100 },
    { subject: '通用能力', score: gen, industry: 80, fullMark: 100 },
    { subject: '行为特质', score: beh, industry: 75, fullMark: 100 },
    { subject: '业务理解', score: exp, industry: 82, fullMark: 100 },
    { subject: '逻辑思维', score: Math.min(100, beh + 5), industry: 78, fullMark: 100 },
  ];
}

// 从测评分数推断软技能（基于各维度比例映射）
function deriveSoftSkills(r: AssessmentRecord) {
  const gen = r.general_score ?? 0;
  const beh = r.behavior_score ?? 0;
  const tech = r.tech_score ?? 0;
  const exp = r.experience_score ?? 0;
  return [
    { name: '沟通表达', score: Math.min(100, Math.round(gen * 1.05)), icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: '团队协作', score: Math.min(100, Math.round((gen + beh) / 2 + 5)), icon: Users, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: '执行能力', score: Math.min(100, Math.round(beh * 1.02)), icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { name: '学习能力', score: Math.min(100, Math.round((tech + gen) / 2 + 3)), icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: '问题解决', score: Math.min(100, Math.round((tech + exp) / 2)), icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { name: '抗压能力', score: Math.min(100, Math.round(beh - 2)), icon: Shield, color: 'text-red-600', bgColor: 'bg-red-100' },
  ];
}

// 从岗位名称推断硬技能标签
function deriveHardSkills(jobTitle: string) {
  const base = [
    { name: 'Git', level: '熟练', color: 'bg-gray-500' },
    { name: '文档撰写', level: '熟练', color: 'bg-slate-500' },
  ];
  const map: Record<string, { name: string; level: string; color: string }[]> = {
    '前端': [
      { name: 'JavaScript', level: '熟练', color: 'bg-yellow-500' },
      { name: 'React', level: '熟练', color: 'bg-cyan-500' },
      { name: 'CSS', level: '熟练', color: 'bg-blue-400' },
      { name: 'TypeScript', level: '了解', color: 'bg-blue-600' },
      { name: 'Webpack', level: '了解', color: 'bg-indigo-500' },
    ],
    'AI': [
      { name: 'Python', level: '熟练', color: 'bg-blue-500' },
      { name: 'PyTorch', level: '了解', color: 'bg-orange-500' },
      { name: '机器学习', level: '了解', color: 'bg-purple-500' },
      { name: '数据分析', level: '熟练', color: 'bg-indigo-500' },
    ],
    '后端': [
      { name: 'Java/Go', level: '熟练', color: 'bg-red-500' },
      { name: 'MySQL', level: '熟练', color: 'bg-blue-500' },
      { name: 'Redis', level: '了解', color: 'bg-red-600' },
      { name: 'Spring', level: '了解', color: 'bg-green-600' },
    ],
    '产品': [
      { name: 'Axure', level: '熟练', color: 'bg-blue-600' },
      { name: 'SQL', level: '了解', color: 'bg-green-500' },
      { name: '用户研究', level: '熟练', color: 'bg-purple-500' },
      { name: 'PRD', level: '精通', color: 'bg-indigo-500' },
    ],
  };
  for (const key of Object.keys(map)) {
    if (jobTitle.includes(key)) return [...map[key], ...base];
  }
  return [
    { name: 'Office套件', level: '精通', color: 'bg-blue-500' },
    { name: '数据分析', level: '熟练', color: 'bg-green-500' },
    ...base,
  ];
}

// 从分数生成优势/提升建议
function deriveStrengths(r: AssessmentRecord): string[] {
  const dims = [
    { label: '专业技能', score: r.tech_score ?? 0, text: '专业技能扎实，核心知识掌握牢固' },
    { label: '通用能力', score: r.general_score ?? 0, text: '通用职场能力突出，沟通协作表现优秀' },
    { label: '行为特质', score: r.behavior_score ?? 0, text: '行为特质积极，执行力与责任心强' },
    { label: '实践经验', score: r.experience_score ?? 0, text: '实战经验丰富，能将知识迁移到实际场景' },
  ];
  return dims.filter(d => d.score >= 75).map(d => d.text).slice(0, 3);
}

function deriveImprovements(r: AssessmentRecord): string[] {
  const dims = [
    { score: r.tech_score ?? 0, text: '专业技能深度可进一步提升，建议专注核心技术栈' },
    { score: r.general_score ?? 0, text: '通用能力有提升空间，建议加强结构化表达训练' },
    { score: r.behavior_score ?? 0, text: '行为特质需要强化，建议通过压力情景模拟提升抗压性' },
    { score: r.experience_score ?? 0, text: '项目实战经验积累不足，建议参与实际项目或实习' },
  ];
  return dims.filter(d => d.score < 75).map(d => d.text).slice(0, 3);
}

const INDUSTRY_BASELINE = 75;

export default function AbilityProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [latest, setLatest] = useState<AssessmentRecord | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const email = getCurrentUserEmail();
      if (email) {
        const data = await getUserAssessments(email);
        setAssessments(data);
        setLatest(data[0] ?? null); // 已按时间降序，第一条为最新
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">正在加载能力画像…</span>
      </div>
    );
  }

  // 没有测评记录时的引导态
  if (!latest) {
    return (
      <div className="container mx-auto max-w-2xl p-6 text-center space-y-6 pt-20">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">暂无测评数据</h2>
        <p className="text-muted-foreground">
          您还未完成任何岗位测评，能力画像基于真实测评结果生成。<br />
          请先前往测评中心完成初始诊断，系统将自动生成您的个性化能力画像。
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <Button onClick={() => navigate('/student/evaluation')}>
            <Sparkles className="mr-2 h-4 w-4" />
            立即开始测评
          </Button>
        </div>
      </div>
    );
  }

  // 基于真实数据派生的展示数据
  const radarData = toRadarData(latest);
  const softSkills = deriveSoftSkills(latest);
  const hardSkills = deriveHardSkills(latest.job_title ?? '');
  const overall = latest.total_score ?? 0;
  const strengths = deriveStrengths(latest);
  const improvements = deriveImprovements(latest);
  const weakDim = (['tech_score', 'general_score', 'behavior_score', 'experience_score'] as const)
    .map(k => ({ key: k, v: latest[k] ?? 0 }))
    .reduce((a, b) => a.v <= b.v ? a : b);
  const weakLabel: Record<string, string> = {
    tech_score: '专业技能', general_score: '通用能力',
    behavior_score: '行为特质', experience_score: '实践经验',
  };
  const isAboveBaseline = overall >= INDUSTRY_BASELINE;

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的能力画像</h1>
          <p className="mt-1 text-muted-foreground">
            基于 <span className="font-medium text-primary">{latest.job_title}</span> 测评真实数据生成 ·
            共完成 <span className="font-medium">{assessments.length}</span> 次测评
          </p>
        </div>
        <div className="flex items-center gap-3">
          {assessments.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => navigate('/student/evaluation/report/latest')}>
              <History className="mr-1 h-3.5 w-3.5" />
              历史对比
            </Button>
          )}
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="mr-1 h-3 w-3" />
            真实数据
          </Badge>
        </div>
      </div>

      {/* 综合评分卡 */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">综合能力评分</h2>
              <p className="text-muted-foreground">
                测评岗位：{latest.job_title} ·
                完成时间：{latest.completed_at ? new Date(latest.completed_at).toLocaleDateString('zh-CN') : '—'}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Badge className={isAboveBaseline ? 'bg-success' : 'bg-amber-500'}>
                  {isAboveBaseline ? '行业达标' : '有待提升'}
                </Badge>
                <span className="text-sm text-muted-foreground">行业基准线：{INDUSTRY_BASELINE}分</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{overall}</div>
              <div className="mt-1 text-sm text-muted-foreground">/ 100</div>
            </div>
          </div>
          {/* 四维分数条 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-primary/10">
            {[
              { label: '专业技能', score: latest.tech_score ?? 0 },
              { label: '通用能力', score: latest.general_score ?? 0 },
              { label: '行为特质', score: latest.behavior_score ?? 0 },
              { label: '实践经验', score: latest.experience_score ?? 0 },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-semibold">{d.score}</span>
                </div>
                <Progress value={d.score} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 能力雷达图 + 软技能 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-primary" />
              多维能力雷达图
            </CardTitle>
            <CardDescription>你的能力与行业标准的全维度对比</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ paddingTop: 12 }} />
                  <Radar name="行业标准" dataKey="industry" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                  <Radar name="我的能力" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-primary" />
              软技能评分
            </CardTitle>
            <CardDescription>基于测评各维度推算的职场通用能力</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {softSkills.map((skill) => {
              const Icon = skill.icon;
              return (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full ${skill.bgColor}`}>
                        <Icon className={`h-3.5 w-3.5 ${skill.color}`} />
                      </div>
                      <span className="font-medium text-sm">{skill.name}</span>
                    </div>
                    <span className="font-bold text-primary text-sm">{skill.score}</span>
                  </div>
                  <Progress value={skill.score} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 硬技能标签云 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-2 h-5 w-5 text-primary" />
            硬技能标签
          </CardTitle>
          <CardDescription>基于测评岗位（{latest.job_title}）推断的专业技能图谱</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hardSkills.map((skill) => (
              <Badge key={skill.name} className={`${skill.color} text-white`} variant="default">
                {skill.name}
                <span className="ml-1 text-xs opacity-80">· {skill.level}</span>
              </Badge>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              <strong>等级说明：</strong>精通（可独立攻克复杂问题）、熟练（可独立完成常规任务）、了解（有基础认知，需指导）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 冰山模型 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5 text-primary" />
            能力冰山模型
          </CardTitle>
          <CardDescription>显性能力与潜在能力的全景展示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-3 flex items-center font-semibold text-primary text-sm">
                <Rocket className="mr-2 h-4 w-4" />
                水面以上（可见部分）
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="font-medium">测评岗位</span><span className="text-muted-foreground">{latest.job_title}</span></div>
                <div className="flex justify-between"><span className="font-medium">专业技能得分</span><span className="text-muted-foreground">{latest.tech_score ?? 0} 分</span></div>
                <div className="flex justify-between"><span className="font-medium">实践经验得分</span><span className="text-muted-foreground">{latest.experience_score ?? 0} 分</span></div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dashed border-primary/30" /></div>
              <span className="relative bg-background px-4 text-sm font-medium text-muted-foreground">水面线</span>
            </div>
            <div className="rounded-lg border-2 border-primary/20 bg-muted p-4">
              <h3 className="mb-3 flex items-center font-semibold text-sm">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                水面以下（潜在部分）
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="font-medium">行为特质</span><span className="text-muted-foreground">{latest.behavior_score ?? 0 >= 80 ? '执行力强、抗压稳定' : latest.behavior_score ?? 0 >= 65 ? '较稳健、有韧性' : '需通过情景模拟强化'}</span></div>
                <div className="flex justify-between"><span className="font-medium">通用能力</span><span className="text-muted-foreground">{latest.general_score ?? 0 >= 80 ? '沟通协作出色' : '有提升空间'}</span></div>
                <div className="flex justify-between"><span className="font-medium">最弱短板</span><span className="text-muted-foreground text-amber-600">{weakLabel[weakDim.key]}（{weakDim.v}分，重点补强方向）</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 优势与改进 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <TrendingUp className="mr-2 h-5 w-5" />
              核心优势
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start text-sm text-green-800">
                    <span className="mr-2 mt-0.5 text-green-600">✓</span>{s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">完成更多测评后将展示核心优势分析</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <Target className="mr-2 h-5 w-5" />
              提升方向
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improvements.length > 0 ? (
              <ul className="space-y-2">
                {improvements.map((imp, i) => (
                  <li key={i} className="flex items-start text-sm text-orange-800">
                    <span className="mr-2 mt-0.5 text-orange-600">→</span>{imp}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">各维度均已达标，继续保持！</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 性格特质（基于行为特质分数推断） */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            潜力特质分析
          </CardTitle>
          <CardDescription>基于测评行为特质维度的性格与发展潜力评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { trait: '理性思维', score: Math.min(100, (latest.behavior_score ?? 0) + 3), icon: Brain, desc: '逻辑清晰，善于数据驱动决策，分析问题能力强' },
              { trait: '目标导向', score: latest.behavior_score ?? 0, icon: Target, desc: '注重结果，执行力强，能持续推进目标达成' },
              { trait: '学习适应', score: Math.min(100, Math.round(((latest.tech_score ?? 0) + (latest.general_score ?? 0)) / 2)), icon: Sparkles, desc: '快速掌握新技能，对新环境和新技术适应能力强' },
              { trait: '协作意识', score: Math.min(100, (latest.general_score ?? 0) + 2), icon: Heart, desc: '善于团队合作，具备良好的跨部门协调能力' },
            ].map((trait) => {
              const Icon = trait.icon;
              return (
                <div key={trait.trait} className="rounded-lg border p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{trait.trait}</h3>
                        <span className="text-sm font-bold text-primary">{trait.score}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{trait.desc}</p>
                      <Progress value={trait.score} className="h-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" onClick={() => navigate('/student/evaluation')}>
          再次测评
        </Button>
        <Button variant="outline" onClick={() => navigate('/student/diagnosis')}>
          AI职业诊断
        </Button>
        <Button onClick={() => navigate('/student/growth')}>
          开始针对性补强训练
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
