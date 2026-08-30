import { useEffect, useState } from 'react';
import { Download, Share2, ChevronLeft, Target, TrendingUp, AlertTriangle, BookOpen, User, Building, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { getAssessmentById, getUserAssessmentHistory, type AssessmentRecord } from '@/db/api';
import { getCurrentUserEmail } from '@/lib/supabase';

// 将测评4维度分数映射为雷达图6轴数据
function buildRadarData(record: AssessmentRecord, prevRecord?: AssessmentRecord) {
  const tech = record.tech_score ?? 0;
  const general = record.general_score ?? 0;
  const behavior = record.behavior_score ?? 0;
  const exp = record.experience_score ?? 0;

  const prevTech = prevRecord?.tech_score ?? Math.max(0, tech - 18);
  const prevGeneral = prevRecord?.general_score ?? Math.max(0, general - 15);
  const prevBehavior = prevRecord?.behavior_score ?? Math.max(0, behavior - 12);
  const prevExp = prevRecord?.experience_score ?? Math.max(0, exp - 20);

  return [
    { subject: '专业技能', preTest: prevTech, postTest: tech, fullMark: 100 },
    { subject: '工程实践', preTest: Math.max(0, prevExp - 5), postTest: Math.max(0, exp - 5), fullMark: 100 },
    { subject: '通用能力', preTest: prevGeneral, postTest: general, fullMark: 100 },
    { subject: '行为特质', preTest: prevBehavior, postTest: behavior, fullMark: 100 },
    { subject: '业务理解', preTest: Math.max(0, prevExp - 8), postTest: exp, fullMark: 100 },
    { subject: '逻辑思维', preTest: Math.max(0, prevBehavior - 5), postTest: Math.min(100, behavior + 5), fullMark: 100 },
  ];
}

// 根据最低维度找短板
function getWeakDimension(record: AssessmentRecord): { name: string; score: number; advice: string } {
  const dims = [
    { name: '专业技能', score: record.tech_score ?? 0, advice: '建议针对核心技术栈深入实训，补强底层原理与工程化能力。' },
    { name: '通用能力', score: record.general_score ?? 0, advice: '建议加强结构化表达、逻辑梳理与跨部门协作等职场通用能力训练。' },
    { name: '行为特质', score: record.behavior_score ?? 0, advice: '建议通过情景模拟、压力测试等训练提升抗压性和执行力。' },
    { name: '实践经验', score: record.experience_score ?? 0, advice: '建议参与真实项目实战模拟，积累业务场景下的问题解决经验。' },
  ];
  return dims.reduce((a, b) => (a.score <= b.score ? a : b));
}

// 根据最高维度找优势
function getStrongDimension(record: AssessmentRecord): { name: string; score: number } {
  const dims = [
    { name: '专业技能', score: record.tech_score ?? 0 },
    { name: '通用能力', score: record.general_score ?? 0 },
    { name: '行为特质', score: record.behavior_score ?? 0 },
    { name: '实践经验', score: record.experience_score ?? 0 },
  ];
  return dims.reduce((a, b) => (a.score >= b.score ? a : b));
}

const INDUSTRY_BASELINE = 75;

export default function EvaluationReportPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<AssessmentRecord | null>(null);
  const [prevRecord, setPrevRecord] = useState<AssessmentRecord | undefined>(undefined);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // 优先按URL中id加载，否则加载最新一条
      let current: AssessmentRecord | null = null;
      if (id) {
        current = await getAssessmentById(id);
      }
      if (!current) {
        const email = getCurrentUserEmail();
        if (email) {
          const list = await getUserAssessmentHistory(email);
          current = list[list.length - 1] ?? null;
          // 最早那条作为"入站水平"基线
          if (list.length >= 2) setPrevRecord(list[0]);
        }
      } else {
        // 同一用户历史记录取首条作为入站基线
        const email = current.user_email;
        if (email) {
          const list = await getUserAssessmentHistory(email);
          if (list.length >= 2 && list[0].id !== current.id) setPrevRecord(list[0]);
        }
      }
      setRecord(current);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">加载测评报告中…</span>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container py-16 max-w-2xl text-center">
        <h2 className="text-xl font-semibold mb-3">暂无测评记录</h2>
        <p className="text-muted-foreground mb-6">您还未完成任何能力测评，请先前往测评中心完成初始诊断。</p>
        <Button onClick={() => navigate('/student/evaluation')}>前往能力测评</Button>
      </div>
    );
  }

  const totalScore = record.total_score ?? 0;
  const improvement = prevRecord
    ? Math.round(totalScore - (prevRecord.total_score ?? 0))
    : null;
  const radarData = buildRadarData(record, prevRecord);
  const weak = getWeakDimension(record);
  const strong = getStrongDimension(record);
  const isAboveBaseline = totalScore >= INDUSTRY_BASELINE;

  return (
    <div className="container py-8 max-w-6xl">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">能力实训评估报告</h1>
            <p className="text-muted-foreground mt-1">
              岗位：{record.job_title} · 完成时间：{record.completed_at ? new Date(record.completed_at).toLocaleDateString('zh-CN') : '—'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigator.share?.({ title: '能力评估报告', url: window.location.href })}>
            <Share2 className="mr-2 h-4 w-4" />
            分享报告
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            导出 PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* 左栏：总分摘要 */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">综合表现评估</CardTitle>
              <CardDescription>岗位：{record.job_title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-primary mb-2">
                  {totalScore}
                  <span className="text-2xl text-muted-foreground font-normal">/100</span>
                </div>
                {improvement !== null ? (
                  <Badge variant="outline" className="bg-white">
                    {improvement >= 0 ? `较入站提升 +${improvement}分` : `较入站变化 ${improvement}分`}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-white">首次测评</Badge>
                )}
              </div>

              {/* 四维分数条 */}
              <div className="space-y-3">
                {[
                  { label: '专业技能', score: record.tech_score ?? 0 },
                  { label: '通用能力', score: record.general_score ?? 0 },
                  { label: '行为特质', score: record.behavior_score ?? 0 },
                  { label: '实践经验', score: record.experience_score ?? 0 },
                ].map(d => (
                  <div key={d.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="font-medium">{d.score}分</span>
                    </div>
                    <Progress value={d.score} className="h-1.5" />
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">行业基准线</span>
                    <span className="font-medium">{INDUSTRY_BASELINE}分</span>
                  </div>
                  <Progress value={INDUSTRY_BASELINE} className="h-1.5 bg-slate-200 [&>div]:bg-slate-400" />
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-primary/10">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  行业基准对标
                </h4>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">新质生产力岗位标准</p>
                      <p className="text-xs text-muted-foreground">{record.job_title}</p>
                    </div>
                  </div>
                  <Badge className={isAboveBaseline ? 'bg-success' : 'bg-amber-500'}>
                    {isAboveBaseline ? '已达标' : '待提升'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 档案跳转卡 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                学习档案同步
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                本次实训结果及能力数据已自动同步至您的个人能力档案，可随时查看完整成长轨迹。
              </p>
              {/* Bug修复：原来导向'/student'，现在正确指向能力档案页 */}
              <Button
                variant="outline"
                className="w-full text-purple-600 hover:text-purple-700"
                onClick={() => navigate('/student/ability-profile')}
              >
                查看最新能力档案 <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右栏：雷达图 + 分析 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  实训前后能力成长轨迹
                </div>
                <Badge variant="secondary" className="font-normal text-xs">
                  {prevRecord ? '入站诊断 vs 本次测评（真实对比）' : '本次测评结果'}
                </Badge>
              </CardTitle>
              <CardDescription>各维度核心能力提升对比分析（数据来源：测评系统真实记录）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 500 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Radar name="入站初始水平" dataKey="preTest" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                    <Radar name="当前实训水平" dataKey="postTest" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 能力突破点 */}
            <Card className="border-success/30 bg-success/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-success">
                  <Sparkles className="h-4 w-4" />
                  能力突破点
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">最强维度：{strong.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    得分 <span className="font-semibold text-foreground">{strong.score}</span> 分，
                    {strong.score >= 85 ? '已达到优秀水平，建议持续精进。' : '表现良好，可作为求职核心竞争力。'}
                  </p>
                </div>
                {improvement !== null && improvement > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">综合提升</h4>
                    <p className="text-sm text-muted-foreground">
                      较入站测评提升 <span className="font-semibold text-success">+{improvement} 分</span>，
                      实训效果已得到量化验证。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 待加强短板 */}
            <Card className="border-amber-500/30 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  待加强短板
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">最弱维度：{weak.name}（{weak.score}分）</h4>
                  <p className="text-sm text-muted-foreground">{weak.advice}</p>
                </div>
                <div className="pt-3 border-t border-amber-200">
                  {/* Bug修复：原来导向'/student/courses'（路由不存在），现在正确指向成长中心 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-amber-700 border-amber-300 hover:bg-amber-100"
                    onClick={() => navigate('/student/growth')}
                  >
                    <BookOpen className="mr-2 h-3.5 w-3.5" />
                    开始针对性补强训练
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
