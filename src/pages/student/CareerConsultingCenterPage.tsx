import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Users,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Briefcase,
  Brain,
  Scale,
  MapPin,
  ChevronRight,
  Building2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { careerConsult, optimizeResume, interviewCoach } from '@/db/api';
import AgreementCheckbox from '@/components/auth/AgreementCheckbox';

export default function CareerConsultingCenterPage() {
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 简历智能优化
  const [resumeText, setResumeText] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [resumeResult, setResumeResult] = useState<any>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [agreed, setAgreed] = useState(false);

  // 岗位精准匹配
  const [matchKeywords, setMatchKeywords] = useState('');
  const [matchRole, setMatchRole] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);

  // AI模拟面试
  const [interviewPosition, setInterviewPosition] = useState('');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'case' | 'comprehensive'>('comprehensive');
  const [interviewQuestions, setInterviewQuestions] = useState([{ question: '', userAnswer: '' }]);
  const [interviewResult, setInterviewResult] = useState<any>(null);

  // 就业政策问答
  const [policyQuestion, setPolicyQuestion] = useState('');
  const [policyResult, setPolicyResult] = useState<any>(null);

  // 职业规划建议
  const [planGoal, setPlanGoal] = useState('');
  const [planBackground, setPlanBackground] = useState('');
  const [planResult, setPlanResult] = useState<any>(null);

  const resetResults = () => {
    setResumeResult(null);
    setMatchResult(null);
    setInterviewResult(null); setPolicyResult(null); setPlanResult(null);
  };

  // ── PDF / Word 文件解析 ────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext ?? '')) {
      toast.error('仅支持 PDF、DOC、DOCX 格式');
      return;
    }
    setFileLoading(true);
    setFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      let text = '';
      if (ext === 'pdf') {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).href;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((it: any) => it.str).join(' '));
        }
        text = pages.join('\n');
      } else {
        const mammoth = (await import('mammoth')).default;
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      }
      if (!text.trim()) {
        toast.error('未能提取到文字内容，请尝试复制粘贴简历文本');
        setFileName('');
        return;
      }
      setResumeText(text.trim());
      toast.success(`已成功解析「${file.name}」，共提取 ${text.trim().length} 字`);
    } catch (err) {
      console.error('文件解析失败', err);
      toast.error('文件解析失败，请尝试复制粘贴简历文本');
      setFileName('');
    } finally {
      setFileLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };



  const handleResumeOptimize = async () => {
    if (!resumeText.trim()) { toast.error('请输入简历内容'); return; }
    setLoading(true); setResumeResult(null);
    try {
      const result = await optimizeResume({ resumeText, targetPosition: targetPosition || undefined, targetIndustry: targetIndustry || undefined });
      result ? setResumeResult(result) : toast.error('分析失败，请重试');
      if (result) toast.success('简历分析完成！');
    } catch { toast.error('分析失败，请重试'); } finally { setLoading(false); }
  };

  const handleJobMatch = async () => {
    if (!matchKeywords.trim()) { toast.error('请输入技能关键词'); return; }
    setLoading(true); setMatchResult(null);
    try {
      const q = `我的技能特长：${matchKeywords}。目标岗位方向：${matchRole || '不限'}。请为我推荐3-5个最匹配的具体岗位，并分析每个岗位的匹配度（百分比）、核心要求和提升建议。`;
      const result = await careerConsult({ question: q });
      result ? setMatchResult(result) : toast.error('匹配失败，请重试');
      if (result) toast.success('岗位匹配完成！');
    } catch { toast.error('匹配失败，请重试'); } finally { setLoading(false); }
  };

  const handleInterviewCoach = async () => {
    const hasEmpty = interviewQuestions.some(q => !q.question.trim() || !q.userAnswer.trim());
    if (!interviewPosition.trim() || hasEmpty) { toast.error('请填写完整的面试信息'); return; }
    setLoading(true); setInterviewResult(null);
    try {
      const result = await interviewCoach({ positionName: interviewPosition, interviewType, questionsAndAnswers: interviewQuestions });
      result ? setInterviewResult(result) : toast.error('评估失败，请重试');
      if (result) toast.success('面试评估完成！');
    } catch { toast.error('评估失败，请重试'); } finally { setLoading(false); }
  };

  const handlePolicyConsult = async () => {
    if (!policyQuestion.trim()) { toast.error('请输入问题'); return; }
    setLoading(true); setPolicyResult(null);
    try {
      const result = await careerConsult({ question: policyQuestion });
      result ? setPolicyResult(result) : toast.error('咨询失败，请重试');
      if (result) toast.success('AI咨询完成！');
    } catch { toast.error('咨询失败，请重试'); } finally { setLoading(false); }
  };

  const handleCareerPlan = async () => {
    if (!planGoal.trim()) { toast.error('请输入目标岗位'); return; }
    setLoading(true); setPlanResult(null);
    try {
      const q = `我的目标岗位：${planGoal}。个人背景：${planBackground || '大学应届生，新文科专业'}。请为我制定一份详细的6-12个月职业规划，包括：① 现状差距分析 ② 分阶段行动计划 ③ 关键里程碑 ④ 风险预警和应对策略。`;
      const result = await careerConsult({ question: q });
      result ? setPlanResult(result) : toast.error('规划失败，请重试');
      if (result) toast.success('职业规划生成完成！');
    } catch { toast.error('规划失败，请重试'); } finally { setLoading(false); }
  };

  const addInterviewQuestion = () => setInterviewQuestions([...interviewQuestions, { question: '', userAnswer: '' }]);
  const removeInterviewQuestion = (i: number) => { if (interviewQuestions.length > 1) setInterviewQuestions(interviewQuestions.filter((_, idx) => idx !== i)); };
  const updateInterviewQuestion = (i: number, field: 'question' | 'userAnswer', val: string) => {
    const q = [...interviewQuestions]; q[i][field] = val; setInterviewQuestions(q);
  };

  // ── 通用结果渲染 ──────────────────────────────────────────────
  const renderConsultResult = (result: any) => (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI回答</CardTitle></CardHeader>
        <CardContent><p className="whitespace-pre-wrap text-sm leading-relaxed">{result.answer}</p></CardContent>
      </Card>
      {result.keyPoints?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />关键要点</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">{result.keyPoints.map((p: string, i: number) => (
              <li key={i} className="flex items-start gap-2"><div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span className="text-sm">{p}</span></li>
            ))}</ul>
          </CardContent>
        </Card>
      )}
      {result.actionSteps?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />行动步骤</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2">{result.actionSteps.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2"><span className="shrink-0 font-semibold text-primary">{i + 1}.</span><span className="text-sm">{s}</span></li>
            ))}</ol>
          </CardContent>
        </Card>
      )}
      {result.tips?.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-primary"><Lightbulb className="h-5 w-5" />温馨提示</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">{result.tips.map((t: string, i: number) => (
              <li key={i} className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-sm">{t}</span></li>
            ))}</ul>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ── 模拟岗位匹配卡片数据（当API无结构化时展示） ────────────────
  const MOCK_JOBS = [
    { title: '新媒体运营专员', match: 92, company: '字节跳动', salary: '8-12K', tags: ['内容创作', '数据分析', '用户增长'] },
    { title: '产品运营助理', match: 87, company: '腾讯', salary: '7-10K', tags: ['产品思维', '用户调研', 'B端运营'] },
    { title: 'UI/UX设计师', match: 78, company: '美团', salary: '9-14K', tags: ['Figma', '用户体验', '交互设计'] },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Sparkles className="h-8 w-8 text-primary" />
          AI智能就业咨询
        </h1>
        <p className="mt-1 text-muted-foreground">
          简历优化 · 岗位匹配 · 模拟面试 · 政策问答 · 职业规划，全链路AI就业增效
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetResults(); }}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1 p-1">
          <TabsTrigger value="resume" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <FileText className="h-4 w-4 shrink-0" /><span>简历优化</span>
          </TabsTrigger>
          <TabsTrigger value="match" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <Briefcase className="h-4 w-4 shrink-0" /><span>岗位匹配</span>
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <Users className="h-4 w-4 shrink-0" /><span>模拟面试</span>
          </TabsTrigger>
          <TabsTrigger value="policy" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <Scale className="h-4 w-4 shrink-0" /><span>政策问答</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-1.5 text-xs md:text-sm py-2">
            <Brain className="h-4 w-4 shrink-0" /><span>职业规划</span>
          </TabsTrigger>
        </TabsList>

        {/* ① 简历智能优化 */}
        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />简历智能优化</CardTitle>
              <CardDescription>基于NLP技术深度分析简历，输出专业优化建议，帮你打造高通过率简历</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>目标岗位（选填）</Label>
                  <Input value={targetPosition} onChange={e => setTargetPosition(e.target.value)} placeholder="如：产品运营专员" />
                </div>
                <div className="space-y-2">
                  <Label>目标行业（选填）</Label>
                  <Input value={targetIndustry} onChange={e => setTargetIndustry(e.target.value)} placeholder="如：互联网、新媒体" />
                </div>
              </div>

              {/* 文件上传区域 */}
              <div className="space-y-2">
                <Label>上传简历文件（PDF / DOC / DOCX）</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary hover:bg-primary/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {fileLoading ? (
                    <><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">正在解析文件...</p></>
                  ) : fileName ? (
                    <div className="flex items-center gap-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">{fileName}</span>
                      <button
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        onClick={e => { e.stopPropagation(); setFileName(''); setResumeText(''); }}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">点击上传或拖入简历文件</p>
                      <p className="text-xs text-muted-foreground">支持 PDF、DOC、DOCX，AI 自动识别提取文字</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
              </div>

              <div className="space-y-2">
                <Label>简历内容 <span className="text-destructive">*</span><span className="ml-1 text-xs text-muted-foreground">（上传文件后自动填入，也可直接粘贴）</span></Label>
                <Textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={10} placeholder="请上传简历文件，或直接粘贴简历文字内容..." />
              </div>

              <AgreementCheckbox checked={agreed} onCheckedChange={setAgreed} />

              <Button onClick={handleResumeOptimize} disabled={loading || fileLoading || !agreed} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI分析中...</> : <><Sparkles className="mr-2 h-4 w-4" />开始智能优化</>}
              </Button>
            </CardContent>
          </Card>

          {resumeResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>综合评分</CardTitle>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary">{resumeResult.overallScore}</div>
                      <div className="text-xs text-muted-foreground">/ 100</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent><p className="text-sm leading-relaxed">{resumeResult.summary}</p></CardContent>
              </Card>
              {resumeResult.analysisResult && (
                <Card>
                  <CardHeader><CardTitle>五维分析</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: '格式规范', val: resumeResult.analysisResult.formatScore },
                      { label: '内容完整', val: resumeResult.analysisResult.contentScore },
                      { label: '亮点突出', val: resumeResult.analysisResult.highlightScore },
                      { label: '语言专业', val: resumeResult.analysisResult.languageScore },
                      { label: '行业对标', val: resumeResult.analysisResult.matchScore },
                    ].map(({ label, val }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-sm"><span>{label}</span><span className="font-medium">{val}</span></div>
                        <Progress value={val} className="h-1.5" />
                      </div>
                    ))}
                    {resumeResult.analysisResult.strengthAreas?.length > 0 && (
                      <div className="pt-2">
                        <p className="mb-2 text-sm font-semibold text-green-600">✅ 优势领域</p>
                        <ul className="space-y-1">{resumeResult.analysisResult.strengthAreas.map((a: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />{a}</li>
                        ))}</ul>
                      </div>
                    )}
                    {resumeResult.analysisResult.formatIssues?.length > 0 && (
                      <div className="pt-2">
                        <p className="mb-2 text-sm font-semibold text-amber-600">⚠️ 待优化项</p>
                        <ul className="space-y-1">{resumeResult.analysisResult.formatIssues.map((iss: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />{iss}</li>
                        ))}</ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ② 岗位精准匹配 */}
        <TabsContent value="match" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />岗位精准匹配</CardTitle>
              <CardDescription>输入你的技能特长，AI为你智能推荐最匹配的岗位方向，告别盲目海投</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>技能关键词 <span className="text-destructive">*</span></Label>
                <Textarea value={matchKeywords} onChange={e => setMatchKeywords(e.target.value)} rows={4} placeholder="例如：Python数据分析、Excel、用户研究、文案写作、短视频运营..." />
              </div>
              <div className="space-y-2">
                <Label>偏好岗位方向（选填）</Label>
                <Input value={matchRole} onChange={e => setMatchRole(e.target.value)} placeholder="如：互联网运营、新媒体、数据分析师" />
              </div>
              <Button onClick={handleJobMatch} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI匹配中...</> : <><Sparkles className="mr-2 h-4 w-4" />开始智能匹配</>}
              </Button>
            </CardContent>
          </Card>

          {/* 默认展示示例匹配卡片 */}
          {!matchResult && (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">💡 热门匹配岗位参考（输入技能后获取个性化结果）</p>
              <div className="grid gap-4 md:grid-cols-3">
                {MOCK_JOBS.map((job, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Building2 className="h-3 w-3" />{job.company}
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white text-xs">{job.match}% 匹配</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <MapPin className="h-3.5 w-3.5" />{job.salary}/月
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {}} className="w-full">
                        <ChevronRight className="mr-1 h-3 w-3" />查看详情
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {matchResult && renderConsultResult(matchResult)}
        </TabsContent>

        {/* ③ AI模拟面试 */}
        <TabsContent value="interview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />AI模拟面试</CardTitle>
              <CardDescription>输入面试问题和你的回答，AI从专业性、逻辑性、表达力三维度给出评分与指导</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>目标岗位 <span className="text-destructive">*</span></Label>
                  <Input value={interviewPosition} onChange={e => setInterviewPosition(e.target.value)} placeholder="如：新媒体运营专员" />
                </div>
                <div className="space-y-2">
                  <Label>面试类型</Label>
                  <Select value={interviewType} onValueChange={v => setInterviewType(v as typeof interviewType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">综合面试</SelectItem>
                      <SelectItem value="technical">技术面试</SelectItem>
                      <SelectItem value="behavioral">行为面试（STAR）</SelectItem>
                      <SelectItem value="case">案例分析面试</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                {interviewQuestions.map((q, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label>第 {i + 1} 题</Label>
                      {interviewQuestions.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeInterviewQuestion(i)} className="h-7 text-xs text-destructive">删除</Button>
                      )}
                    </div>
                    <Input value={q.question} onChange={e => updateInterviewQuestion(i, 'question', e.target.value)} placeholder="面试题目" />
                    <Textarea value={q.userAnswer} onChange={e => updateInterviewQuestion(i, 'userAnswer', e.target.value)} rows={3} placeholder="你的回答..." />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={addInterviewQuestion} className="flex-1">添加题目</Button>
                <Button onClick={handleInterviewCoach} disabled={loading} className="flex-1">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI评估中...</> : <><Sparkles className="mr-2 h-4 w-4" />开始AI评估</>}
                </Button>
              </div>
            </CardContent>
          </Card>
          {interviewResult && renderConsultResult(interviewResult)}
        </TabsContent>

        {/* ④ 就业政策问答 */}
        <TabsContent value="policy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-primary" />就业政策问答</CardTitle>
              <CardDescription>解答社保转移、落户政策、应届生权益、毕业生就业补贴等就业政策疑问</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 常用问题快捷入口 */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">常见问题快捷选择</Label>
                <div className="flex flex-wrap gap-2">
                  {['应届生落户政策有哪些？', '社保如何跨城市转移？', '毕业后就业补贴怎么申领？', '试用期权益保障有哪些？', '劳动合同必须签几年？'].map(q => (
                    <Badge key={q} variant="outline" className="cursor-pointer hover:bg-muted text-xs" onClick={() => setPolicyQuestion(q)}>{q}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>你的问题 <span className="text-destructive">*</span></Label>
                <Textarea value={policyQuestion} onChange={e => setPolicyQuestion(e.target.value)} rows={5} placeholder="例如：异地求职社保如何转移？应届生落户政策有哪些？" />
              </div>
              <Button onClick={handlePolicyConsult} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />查询中...</> : <><Sparkles className="mr-2 h-4 w-4" />AI政策解读</>}
              </Button>
            </CardContent>
          </Card>
          {policyResult && renderConsultResult(policyResult)}
        </TabsContent>

        {/* ⑤ 职业规划建议 */}
        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />职业规划建议</CardTitle>
              <CardDescription>基于你的目标与背景，AI制定6-12个月分阶段成长路线图与行动计划</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>目标岗位/方向 <span className="text-destructive">*</span></Label>
                <Input value={planGoal} onChange={e => setPlanGoal(e.target.value)} placeholder="如：1年内拿到互联网运营岗offer" />
              </div>
              <div className="space-y-2">
                <Label>个人背景（选填）</Label>
                <Textarea value={planBackground} onChange={e => setPlanBackground(e.target.value)} rows={4}
                  placeholder="如：新文科大三在读，有新媒体实习经历，熟悉Excel和Python基础，目标字节/腾讯运营岗..." />
              </div>
              <Button onClick={handleCareerPlan} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />规划生成中...</> : <><Sparkles className="mr-2 h-4 w-4" />生成职业规划</>}
              </Button>
            </CardContent>
          </Card>
          {planResult && renderConsultResult(planResult)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

