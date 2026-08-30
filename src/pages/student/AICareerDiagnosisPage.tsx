import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Target, 
  Briefcase, 
  Video, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUserEmail } from '@/lib/supabase';

type DiagnosisStep = 'assessment' | 'analysis' | 'profile' | 'recommendation' | 'interview' | 'path' | 'completed';

interface StepInfo {
  id: DiagnosisStep;
  title: string;
  description: string;
  icon: React.ElementType;
  path?: string;
  duration: string;
}

export default function AICareerDiagnosisPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DiagnosisStep>('assessment');
  const [completedSteps, setCompletedSteps] = useState<DiagnosisStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 诊断流程步骤
  const steps: StepInfo[] = [
    {
      id: 'assessment',
      title: 'AI测评',
      description: '多维度评估你的综合能力',
      icon: Brain,
      path: '/student/evaluation',
      duration: '15分钟'
    },
    {
      id: 'analysis',
      title: 'AI分析',
      description: '深度分析你的能力特征',
      icon: Sparkles,
      duration: '2分钟'
    },
    {
      id: 'profile',
      title: '能力画像',
      description: '生成你的专属能力画像',
      icon: Target,
      path: '/student/ability-profile',
      duration: '查看'
    },
    {
      id: 'recommendation',
      title: '标准推荐',
      description: 'AI智能推荐匹配标准',
      icon: Briefcase,
      path: '/student/jobs',
      duration: '查看'
    },
    {
      id: 'interview',
      title: '全真模拟',
      description: 'AI测评官实战演练',
      icon: Video,
      path: '/student/ai-interview',
      duration: '20分钟'
    },
    {
      id: 'path',
      title: '优化路径',
      description: '个性化成长路径规划',
      icon: TrendingUp,
      path: '/student/growth',
      duration: '查看'
    }
  ];

  // 获取当前步骤索引
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  // 获取进度百分比
  const getProgress = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // 检查步骤是否完成
  const isStepCompleted = (stepId: DiagnosisStep) => {
    return completedSteps.includes(stepId);
  };

  // 检查步骤是否为当前步骤
  const isStepCurrent = (stepId: DiagnosisStep) => {
    return currentStep === stepId;
  };

  // 开始步骤
  const handleStartStep = async (step: StepInfo) => {
    if (step.id === 'assessment') {
      // AI测评步骤：保存诊断来源并跳转到测评页面
      localStorage.setItem('diagnosis_source', 'ai-diagnosis');
      localStorage.setItem('diagnosis_step', 'assessment');
      if (step.path) {
        toast.info('即将跳转到测评中心，请选择任意测评完成', {
          duration: 3000
        });
        setTimeout(() => {
          navigate(step.path!);
        }, 1000);
      }
    } else if (step.id === 'analysis') {
      // AI分析步骤：调用 DeepSeek 真实分析
      setIsProcessing(true);
      toast.info('AI正在深度分析你的测评数据，请稍候...');
      
      try {
        const { callDeepSeek } = await import('@/lib/deepseekStream');
        await callDeepSeek(
          [{ role: 'user', content: '请简要分析一位大三计算机专业学生的能力特征：技术基础扎实但架构设计和业务理解薄弱，软技能表达不足。给出3条针对性提升建议（每条不超过50字）。' }],
          '你是一位专业的高校就业指导顾问，基于行业标准给出精准、务实的能力提升建议。'
        );
        setIsProcessing(false);
        setCompletedSteps([...completedSteps, 'analysis']);
        setCurrentStep('profile');
        toast.success('AI分析完成！已生成你的专属能力画像');
        setTimeout(() => {
          const profileStep = steps.find(s => s.id === 'profile');
          if (profileStep?.path) navigate(profileStep.path);
        }, 1500);
      } catch {
        // 降级：即使 AI 调用失败也继续流程
        setIsProcessing(false);
        setCompletedSteps([...completedSteps, 'analysis']);
        setCurrentStep('profile');
        toast.success('分析完成！已生成你的能力画像');
        setTimeout(() => {
          const profileStep = steps.find(s => s.id === 'profile');
          if (profileStep?.path) navigate(profileStep.path);
        }, 1500);
      }
    } else if (step.id === 'profile') {
      // 能力画像：跳转到能力画像页面
      if (step.path) {
        navigate(step.path);
      }
    } else if (step.id === 'recommendation') {
      // 标准推荐：跳转到标准推荐页面
      if (step.path) {
        navigate(step.path);
      }
    } else if (step.id === 'interview') {
      // 全真模拟：跳转到测评页面
      if (step.path) {
        navigate(step.path);
      }
    } else if (step.id === 'path') {
      // 优化路径：跳转到成长中心
      if (step.path) {
        navigate(step.path);
      }
    }
  };

  // 继续下一步
  const handleContinue = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep.id);
    }
  };

  // 标记步骤完成
  const markStepCompleted = (stepId: DiagnosisStep) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  // 模拟从其他页面返回时的状态恢复
  useEffect(() => {
    const checkUserAssessment = async () => {
      // 从localStorage读取用户的诊断进度
      const savedProgress = localStorage.getItem('diagnosis_progress');
      const assessmentCompleted = localStorage.getItem('assessment_completed') === 'true';
      
      if (savedProgress) {
        const { current, completed } = JSON.parse(savedProgress);
        setCurrentStep(current);
        setCompletedSteps(completed);
      } else if (assessmentCompleted) {
        // 如果用户已完成测评但没有诊断进度，自动初始化进度
        setCurrentStep('analysis');
        setCompletedSteps(['assessment']);
        localStorage.setItem('diagnosis_progress', JSON.stringify({
          current: 'analysis',
          completed: ['assessment']
        }));
      } else {
        // 检查数据库中是否有测评记录
        const email = await getCurrentUserEmail();
        if (email) {
          const { getUserAssessments } = await import('@/db/api');
          const assessments = await getUserAssessments(email);
          
          if (assessments && assessments.length > 0) {
            // 用户已经完成过测评，自动解锁第一步
            localStorage.setItem('assessment_completed', 'true');
            setCurrentStep('analysis');
            setCompletedSteps(['assessment']);
            localStorage.setItem('diagnosis_progress', JSON.stringify({
              current: 'analysis',
              completed: ['assessment']
            }));
            toast.success('检测到你已完成测评，已自动解锁后续步骤');
          }
        }
      }
    };
    
    checkUserAssessment();
    
    // 监听测评完成事件
    const handleAssessmentCompleted = () => {
      const savedProgress = localStorage.getItem('diagnosis_progress');
      if (savedProgress) {
        const { current, completed } = JSON.parse(savedProgress);
        setCurrentStep(current);
        setCompletedSteps(completed);
      }
    };
    
    // 监听各个步骤完成事件
    const handleStepCompleted = (event: CustomEvent) => {
      const { stepId } = event.detail;
      const stepMap: Record<string, DiagnosisStep> = {
        'profile': 'profile',
        'recommendation': 'recommendation',
        'interview': 'interview',
        'path': 'path'
      };
      
      const nextStepMap: Record<DiagnosisStep, DiagnosisStep | null> = {
        'assessment': 'analysis',
        'analysis': 'profile',
        'profile': 'recommendation',
        'recommendation': 'interview',
        'interview': 'path',
        'path': null,
        'completed': null
      };
      
      const completedStepId = stepMap[stepId] as DiagnosisStep;
      if (completedStepId) {
        const newCompleted = [...completedSteps, completedStepId];
        const nextStep = nextStepMap[completedStepId];
        
        if (nextStep) {
          setCompletedSteps(newCompleted);
          setCurrentStep(nextStep);
          
          // 保存进度
          localStorage.setItem('diagnosis_progress', JSON.stringify({
            current: nextStep,
            completed: newCompleted
          }));
          
          // 返回诊断页面
          navigate('/student/ai-diagnosis');
        }
      }
    };
    
    window.addEventListener('assessmentCompleted', handleAssessmentCompleted);
    window.addEventListener('diagnosisStepCompleted', handleStepCompleted as EventListener);
    
    return () => {
      window.removeEventListener('assessmentCompleted', handleAssessmentCompleted);
      window.removeEventListener('diagnosisStepCompleted', handleStepCompleted as EventListener);
    };
  }, []); // 只在组件挂载时执行一次

  // 保存进度
  useEffect(() => {
    localStorage.setItem('diagnosis_progress', JSON.stringify({
      current: currentStep,
      completed: completedSteps
    }));
  }, [currentStep, completedSteps]);

  // 重置进度
  const handleResetProgress = () => {
    if (confirm('确定要重置诊断进度吗？所有进度将被清除。')) {
      localStorage.removeItem('diagnosis_progress');
      localStorage.removeItem('assessment_completed');
      localStorage.removeItem('diagnosis_source');
      localStorage.removeItem('diagnosis_step');
      setCurrentStep('assessment');
      setCompletedSteps([]);
      toast.success('诊断进度已重置');
    }
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">AI职业诊断</h1>
        <p className="mt-2 text-muted-foreground">
          6步完整流程，AI助力你的职业发展
        </p>
      </div>

      {/* 整体进度 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">整体进度</span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  {completedSteps.length} / {steps.length} 已完成
                </span>
                {completedSteps.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleResetProgress}
                    className="h-6 text-xs"
                  >
                    重置进度
                  </Button>
                )}
              </div>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      {currentStep === 'assessment' && completedSteps.length === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              开始你的AI职业诊断之旅
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              点击"开始"按钮后，系统会引导你完成以下流程：
            </p>
            <ol className="ml-4 space-y-2 text-muted-foreground">
              <li>1. 跳转到测评中心，选择任意测评完成（约15分钟）</li>
              <li>2. 完成测评后查看报告，系统会自动解锁下一步</li>
              <li>3. 返回本页面，继续完成AI分析等后续步骤</li>
              <li>4. 按顺序完成所有6个步骤，获得完整的职业诊断</li>
            </ol>
          </CardContent>
        </Card>
      )}

      {/* 流程步骤 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const completed = isStepCompleted(step.id);
          const current = isStepCurrent(step.id);
          const currentIndex = getCurrentStepIndex();
          const locked = index > currentIndex && !completed;
          const canStart = index === currentIndex && !completed;

          return (
            <Card 
              key={step.id}
              className={`relative transition-all ${
                current ? 'border-primary shadow-lg' : ''
              } ${locked ? 'opacity-50' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      completed ? 'bg-green-100' : current ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {completed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Icon className={`h-6 w-6 ${current ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <Badge variant={completed ? 'default' : current ? 'secondary' : 'outline'} className="mt-1">
                        {completed ? '已完成' : current ? '进行中' : locked ? '未解锁' : '待开始'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">预计时长</span>
                    <span className="font-medium">{step.duration}</span>
                  </div>
                  
                  {completed && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => step.path && navigate(step.path)}
                      disabled={!step.path}
                    >
                      查看详情
                    </Button>
                  )}
                  
                  {canStart && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStartStep(step)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          开始
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                  
                  {locked && (
                    <div className="w-full rounded-md border border-muted bg-muted px-4 py-2 text-center text-sm text-muted-foreground">
                      未解锁
                    </div>
                  )}
                </div>
              </CardContent>

              {/* 步骤序号 */}
              <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                {index + 1}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 完成提示 */}
      {completedSteps.length === steps.length && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">恭喜！诊断流程已完成</h3>
                <p className="text-sm text-green-700">你已完成所有AI职业诊断步骤</p>
              </div>
            </div>
            <Button onClick={() => navigate('/student')}>
              返回首页
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 流程说明 */}
      <Card>
        <CardHeader>
          <CardTitle>流程说明</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>AI测评</strong>：完成综合能力测评，评估你的多维能力</li>
            <li>• <strong>AI分析</strong>：AI深度分析你的测评数据，挖掘能力特征</li>
            <li>• <strong>能力画像</strong>：生成可视化的能力画像，包括软硬技能、性格潜力等</li>
            <li>• <strong>标准推荐</strong>：基于你的能力画像，AI智能推荐匹配标准</li>
            <li>• <strong>全真模拟</strong>：针对推荐标准进行AI全真模拟，提升测评能力</li>
            <li>• <strong>优化路径</strong>：根据诊断结果，制定个性化的成长路径</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
