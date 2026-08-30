import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, FileText, MessageSquare, Target } from 'lucide-react';
import { toast } from 'sonner';
import { evaluateResume, evaluateInterview, evaluateMatch } from '@/db/api';
import AIEvaluationResult from '@/components/AIEvaluationResult';

export default function AIEvaluationDemoPage() {
  const [activeTab, setActiveTab] = useState('resume');
  const [loading, setLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // 能力档案评估表单
  const [resumeForm, setResumeForm] = useState({
    resumeContent: '',
    positionName: 'AI算法工程师',
    positionRequirements: '负责深度学习模型的研发和优化，参与AI产品的设计和实现。',
    requiredSkills: 'Python,深度学习,TensorFlow,PyTorch',
    salaryRange: '25-40K'
  });

  // 测评评估表单
  const [interviewForm, setInterviewForm] = useState({
    positionName: '前端开发工程师',
    questions: [
      {
        question: '请介绍一下React的虚拟DOM原理',
        answer: '',
        category: '技术'
      }
    ],
    interviewDuration: 60
  });

  // 人标准匹配评估表单
  const [matchForm, setMatchForm] = useState({
    candidateName: '张三',
    education: '本科',
    workExperience: '3年前端开发经验',
    skills: 'React,TypeScript,Vue,Node.js',
    techScore: 85,
    generalScore: 80,
    behaviorScore: 75,
    experienceScore: 82,
    positionName: '前端开发工程师',
    positionDesc: '负责公司前端项目开发，参与产品设计和技术选型。',
    requiredSkills: 'React,TypeScript,Vue',
    salaryRange: '18-30K',
    workLocation: '北京'
  });

  // 能力档案评估
  const handleResumeEvaluation = async () => {
    if (!resumeForm.resumeContent.trim()) {
      toast.error('请输入能力档案内容');
      return;
    }

    setLoading(true);
    setEvaluationResult(null);

    try {
      const result = await evaluateResume({
        resumeContent: resumeForm.resumeContent,
        positionName: resumeForm.positionName,
        positionRequirements: resumeForm.positionRequirements,
        requiredSkills: resumeForm.requiredSkills.split(',').map(s => s.trim()),
        salaryRange: resumeForm.salaryRange
      });

      if (result) {
        setEvaluationResult(result);
        toast.success('AI评估完成！');
      } else {
        toast.error('评估失败，请重试');
      }
    } catch (error) {
      console.error('能力档案评估失败:', error);
      toast.error('评估失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 测评评估
  const handleInterviewEvaluation = async () => {
    const hasEmptyAnswer = interviewForm.questions.some(q => !q.answer.trim());
    if (hasEmptyAnswer) {
      toast.error('请填写所有问题的答案');
      return;
    }

    setLoading(true);
    setEvaluationResult(null);

    try {
      const result = await evaluateInterview({
        positionName: interviewForm.positionName,
        interviewQuestions: interviewForm.questions,
        interviewDuration: interviewForm.interviewDuration
      });

      if (result) {
        setEvaluationResult(result);
        toast.success('AI评估完成！');
      } else {
        toast.error('评估失败，请重试');
      }
    } catch (error) {
      console.error('测评评估失败:', error);
      toast.error('评估失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 人标准匹配评估
  const handleMatchEvaluation = async () => {
    setLoading(true);
    setEvaluationResult(null);

    try {
      const result = await evaluateMatch({
        candidateProfile: {
          name: matchForm.candidateName,
          education: matchForm.education,
          workExperience: matchForm.workExperience,
          skills: matchForm.skills.split(',').map(s => s.trim()),
          assessmentScores: {
            techScore: matchForm.techScore,
            generalScore: matchForm.generalScore,
            behaviorScore: matchForm.behaviorScore,
            experienceScore: matchForm.experienceScore
          }
        },
        positionInfo: {
          positionName: matchForm.positionName,
          positionDesc: matchForm.positionDesc,
          requiredSkills: matchForm.requiredSkills.split(',').map(s => s.trim()),
          salaryRange: matchForm.salaryRange,
          workLocation: matchForm.workLocation
        }
      });

      if (result) {
        setEvaluationResult(result);
        toast.success('AI评估完成！');
      } else {
        toast.error('评估失败，请重试');
      }
    } catch (error) {
      console.error('人标准匹配评估失败:', error);
      toast.error('评估失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div>
        <h1 className="flex items-center space-x-2 text-3xl font-bold">
          <Sparkles className="h-8 w-8 text-primary" />
          <span>AI智能评估演示</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          体验AI驱动的多维度智能评估系统
        </p>
      </div>

      {/* 评估类型选择 */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setEvaluationResult(null);
      }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>能力档案评估</span>
          </TabsTrigger>
          <TabsTrigger value="interview" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>测评评估</span>
          </TabsTrigger>
          <TabsTrigger value="match" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>人标准匹配</span>
          </TabsTrigger>
        </TabsList>

        {/* 能力档案评估 */}
        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>能力档案评估</CardTitle>
              <CardDescription>
                评估候选人能力档案与标准的匹配度，提供多维度分析和风险提示
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>标准名称</Label>
                  <Input
                    value={resumeForm.positionName}
                    onChange={(e) => setResumeForm({ ...resumeForm, positionName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>薪资范围</Label>
                  <Input
                    value={resumeForm.salaryRange}
                    onChange={(e) => setResumeForm({ ...resumeForm, salaryRange: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>标准要求</Label>
                <Textarea
                  value={resumeForm.positionRequirements}
                  onChange={(e) => setResumeForm({ ...resumeForm, positionRequirements: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>必备技能（逗号分隔）</Label>
                <Input
                  value={resumeForm.requiredSkills}
                  onChange={(e) => setResumeForm({ ...resumeForm, requiredSkills: e.target.value })}
                  placeholder="如：Python,深度学习,TensorFlow"
                />
              </div>

              <div className="space-y-2">
                <Label>能力档案内容</Label>
                <Textarea
                  value={resumeForm.resumeContent}
                  onChange={(e) => setResumeForm({ ...resumeForm, resumeContent: e.target.value })}
                  rows={10}
                  placeholder="请粘贴候选人的能力档案内容..."
                />
              </div>

              <Button
                onClick={handleResumeEvaluation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI评估中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始AI评估
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 测评评估 */}
        <TabsContent value="interview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>测评评估</CardTitle>
              <CardDescription>
                评估候选人的测评表现，提供逐题反馈和学习建议
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>标准名称</Label>
                  <Input
                    value={interviewForm.positionName}
                    onChange={(e) => setInterviewForm({ ...interviewForm, positionName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>测评时长（分钟）</Label>
                  <Input
                    type="number"
                    value={interviewForm.interviewDuration}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewDuration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {interviewForm.questions.map((q, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <div className="space-y-2">
                    <Label>问题 {index + 1}</Label>
                    <Input
                      value={q.question}
                      onChange={(e) => {
                        const newQuestions = [...interviewForm.questions];
                        newQuestions[index].question = e.target.value;
                        setInterviewForm({ ...interviewForm, questions: newQuestions });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>候选人回答</Label>
                    <Textarea
                      value={q.answer}
                      onChange={(e) => {
                        const newQuestions = [...interviewForm.questions];
                        newQuestions[index].answer = e.target.value;
                        setInterviewForm({ ...interviewForm, questions: newQuestions });
                      }}
                      rows={4}
                      placeholder="请输入候选人的回答..."
                    />
                  </div>
                </div>
              ))}

              <Button
                onClick={handleInterviewEvaluation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI评估中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始AI评估
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 人标准匹配评估 */}
        <TabsContent value="match" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>人标准匹配评估</CardTitle>
              <CardDescription>
                评估候选人与标准的综合匹配度，提供风险评估和发展建议
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">候选人信息</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>姓名</Label>
                    <Input
                      value={matchForm.candidateName}
                      onChange={(e) => setMatchForm({ ...matchForm, candidateName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>学历</Label>
                    <Input
                      value={matchForm.education}
                      onChange={(e) => setMatchForm({ ...matchForm, education: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>工作经验</Label>
                  <Input
                    value={matchForm.workExperience}
                    onChange={(e) => setMatchForm({ ...matchForm, workExperience: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>技能（逗号分隔）</Label>
                  <Input
                    value={matchForm.skills}
                    onChange={(e) => setMatchForm({ ...matchForm, skills: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>专业技能分</Label>
                    <Input
                      type="number"
                      value={matchForm.techScore}
                      onChange={(e) => setMatchForm({ ...matchForm, techScore: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>通用能力分</Label>
                    <Input
                      type="number"
                      value={matchForm.generalScore}
                      onChange={(e) => setMatchForm({ ...matchForm, generalScore: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>行为特质分</Label>
                    <Input
                      type="number"
                      value={matchForm.behaviorScore}
                      onChange={(e) => setMatchForm({ ...matchForm, behaviorScore: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>经验背景分</Label>
                    <Input
                      type="number"
                      value={matchForm.experienceScore}
                      onChange={(e) => setMatchForm({ ...matchForm, experienceScore: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">标准信息</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>标准名称</Label>
                    <Input
                      value={matchForm.positionName}
                      onChange={(e) => setMatchForm({ ...matchForm, positionName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>薪资范围</Label>
                    <Input
                      value={matchForm.salaryRange}
                      onChange={(e) => setMatchForm({ ...matchForm, salaryRange: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>标准描述</Label>
                  <Textarea
                    value={matchForm.positionDesc}
                    onChange={(e) => setMatchForm({ ...matchForm, positionDesc: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>技能要求（逗号分隔）</Label>
                    <Input
                      value={matchForm.requiredSkills}
                      onChange={(e) => setMatchForm({ ...matchForm, requiredSkills: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>工作地点</Label>
                    <Input
                      value={matchForm.workLocation}
                      onChange={(e) => setMatchForm({ ...matchForm, workLocation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleMatchEvaluation}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI评估中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始AI评估
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 评估结果 */}
      {evaluationResult && (
        <AIEvaluationResult
          type={activeTab as 'resume' | 'interview' | 'match'}
          result={evaluationResult}
        />
      )}
    </div>
  );
}
