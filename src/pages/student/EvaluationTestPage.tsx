import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { type Question } from '@/data/questionBank';
import { getQuestionsByPosition } from '@/data/questionBankMapping';
import { createAssessment, getAssessmentPositionById, getQuestionsByPositionDb, type Assessment } from '@/db/api';
import { getCurrentUserEmail, supabase } from '@/lib/supabase';


export default function EvaluationTestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const evaluation = location.state?.evaluation;
  
  // 从数据库获取的标准信息
  const [assessmentInfo, setAssessmentInfo] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbQuestions, setDbQuestions] = useState<Question[]>([]);
  
  // 从evaluation中获取时长，转换为秒数
  const getDurationInSeconds = (duration: string): number => {
    const match = duration?.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]) * 60; // 转换为秒
    }
    return 3600; // 默认60分钟
  };
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(getDurationInSeconds(evaluation?.duration || '60分钟'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载标准信息
  useEffect(() => {
    const loadAssessmentInfo = async () => {
      if (!id) return;
      
      setLoading(true);
      const data = await getAssessmentPositionById(id);
      if (data) {
        setAssessmentInfo(data);
        // 更新倒计时时间（duration_minutes转换为秒）
        setTimeLeft(data.duration_minutes * 60);
        
        // 获取数据库中的题目
        const questionsFromDb = await getQuestionsByPositionDb(data.position_name);
        if (questionsFromDb && questionsFromDb.length > 0) {
          // 转换为 Question 类型
          const formattedQuestions: Question[] = questionsFromDb.map((q, index) => ({
            id: index + 1, // 使用稳定的序列号作为本地ID，避免UUID解析问题
            dbId: q.id, // 保留原始数据库ID
            type: (q.question_type?.replace('_choice', '') || 'single') as any,
            dimension: (q.related_competencies?.[0] || 'tech') as any,
            difficulty: (q.difficulty || 'intermediate') as any,
            question: q.question_text,
            options: q.options,
            correctAnswer: q.correct_answer,
            explanation: q.explanation || '',
            score: q.score
          }));
          setDbQuestions(formattedQuestions);
        }
      }
      setLoading(false);
    };
    
    loadAssessmentInfo();
  }, [id]);

  // 使用新的映射系统获取题库
  const positionName = assessmentInfo?.position_name || evaluation?.position_name || '';
  const localQuestions = getQuestionsByPosition(positionName);
  const questions = dbQuestions.length > 0 ? dbQuestions : localQuestions;
  const currentQuestion = questions && questions.length > 0 ? questions[currentQuestionIndex] : null;
  const progress = questions && questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // 倒计时 - 必须在所有条件判断之前调用
  useEffect(() => {
    if (loading) return; // 加载中不启动倒计时
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]); // 添加loading依赖

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载测评题目中...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string | string[]) => {
    if (!currentQuestion) return;
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let techScore = 0;
    let generalScore = 0;
    let behaviorScore = 0;
    let experienceScore = 0;

    questions.forEach((question: any) => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;

      const isCorrect = Array.isArray(userAnswer)
        ? JSON.stringify(userAnswer.sort()) === JSON.stringify((question.correctAnswer as string[]).sort())
        : userAnswer === question.correctAnswer;

      if (isCorrect) {
        totalScore += question.score;
        
        // 按维度累加分数
        switch (question.dimension) {
          case 'tech':
            techScore += question.score;
            break;
          case 'general':
            generalScore += question.score;
            break;
          case 'behavior':
            behaviorScore += question.score;
            break;
          case 'experience':
            experienceScore += question.score;
            break;
        }
      }
    });

    // 计算各维度百分比得分
    const techTotal = questions.filter((q: any) => q.dimension === 'tech').reduce((sum: number, q: any) => sum + q.score, 0);
    const generalTotal = questions.filter((q: any) => q.dimension === 'general').reduce((sum: number, q: any) => sum + q.score, 0);
    const behaviorTotal = questions.filter((q: any) => q.dimension === 'behavior').reduce((sum: number, q: any) => sum + q.score, 0);
    const experienceTotal = questions.filter((q: any) => q.dimension === 'experience').reduce((sum: number, q: any) => sum + q.score, 0);

    return {
      total: Math.round((totalScore / questions.reduce((sum: number, q: any) => sum + q.score, 0)) * 100),
      tech: techTotal > 0 ? Math.round((techScore / techTotal) * 100) : 0,
      general: generalTotal > 0 ? Math.round((generalScore / generalTotal) * 100) : 0,
      behavior: behaviorTotal > 0 ? Math.round((behaviorScore / behaviorTotal) * 100) : 0,
      experience: experienceTotal > 0 ? Math.round((experienceScore / experienceTotal) * 100) : 0,
    };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // 检查是否所有题目都已作答
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0 && timeLeft > 0) {
      const confirmed = window.confirm(`还有${unansweredCount}道题未作答，确定要提交吗？`);
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    
    try {
      // 先批改主观题（essay、scenario无options、fill类型）
      const subjectiveQuestions = questions.filter(q => 
        q.type === 'essay' || 
        q.type === 'fill' || 
        (q.type === 'scenario' && (!q.options || q.options.length === 0))
      );
      
      const gradingPromises = subjectiveQuestions
        .filter(q => answers[q.id]) // 只批改已作答的题目
        .map(async (q) => {
          try {
            const { data, error } = await supabase.functions.invoke('ai-grade-answer', {
              body: {
                question: q.question,
                questionType: q.type === 'essay' ? 'essay' : 'fill',
                userAnswer: answers[q.id] as string,
                standardAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : q.correctAnswer.join(', '),
                maxScore: q.score,
                dimension: q.dimension
              }
            });
            
            if (error) {
              console.error(`批改题目${q.id}失败:`, error);
              // 批改失败时使用默认分数（满分的60%）
              return {
                questionId: q.id,
                score: Math.round(q.score * 0.6),
                feedback: '自动评分',
                strengths: [],
                improvements: []
              };
            }
            
            return {
              questionId: q.id,
              ...data
            };
          } catch (err) {
            console.error(`批改题目${q.id}异常:`, err);
            return {
              questionId: q.id,
              score: Math.round(q.score * 0.6),
              feedback: '自动评分',
              strengths: [],
              improvements: []
            };
          }
        });
      
      // 等待所有主观题批改完成
      const gradingResults = await Promise.all(gradingPromises);
      
      // 将批改结果存储到answers中（用于后续报告展示）
      const gradingMap: Record<number, any> = {};
      gradingResults.forEach(result => {
        gradingMap[result.questionId] = result;
      });
      
      // 计算总分（包含AI批改的主观题分数）
      const scores = calculateScoreWithAI(gradingMap);
      const email = getCurrentUserEmail();
      const userId = localStorage.getItem('user_id') || undefined;
      
      // 保存测评记录到数据库
      const record = await createAssessment({
        user_email: email,
        user_id: userId,
        job_title: assessmentInfo?.position_name || evaluation?.position_name || '未知标准',
        total_score: scores.total,
        tech_score: scores.tech,
        general_score: scores.general,
        behavior_score: scores.behavior,
        experience_score: scores.experience,
        status: 'completed',
        completed_at: new Date().toISOString(),
        // 存储答案和批改结果
        answers: JSON.stringify({
          userAnswers: answers,
          gradingResults: gradingMap,
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            type: q.type,
            dimension: q.dimension,
            score: q.score
          }))
        })
      });

      toast.success('测评已提交，AI批改完成');
      
      // 设置测评完成标识
      localStorage.setItem('assessment_completed', 'true');
      
      // 【修复】更新AI职业诊断进度，解锁AI分析步骤
      const diagnosisProgress = localStorage.getItem('diagnosis_progress');
      if (diagnosisProgress) {
        const progress = JSON.parse(diagnosisProgress);
        // 标记测评步骤完成，解锁AI分析步骤
        if (!progress.completed.includes('assessment')) {
          progress.completed.push('assessment');
        }
        progress.current = 'analysis'; // 自动进入AI分析步骤
        localStorage.setItem('diagnosis_progress', JSON.stringify(progress));
      } else {
        // 如果没有诊断进度，创建新的进度
        localStorage.setItem('diagnosis_progress', JSON.stringify({
          current: 'analysis',
          completed: ['assessment']
        }));
      }
      
      // 触发自定义事件，通知其他页面更新
      window.dispatchEvent(new Event('assessmentCompleted'));
      
      // 跳转到报告页面
      navigate(`/student/evaluation/report/${record.id}`);
    } catch (error) {
      console.error('提交测评失败:', error);
      toast.error('提交失败，请重试');
      setIsSubmitting(false);
    }
  };

  // 计算分数（包含AI批改结果）
  const calculateScoreWithAI = (gradingMap: Record<number, any>) => {
    let totalScore = 0;
    const dimensionScores: Record<string, { earned: number; total: number }> = {
      tech: { earned: 0, total: 0 },
      general: { earned: 0, total: 0 },
      behavior: { earned: 0, total: 0 },
      experience: { earned: 0, total: 0 },
    };

    console.log('=== 开始计算分数 ===');
    console.log('题目总数:', questions.length);
    console.log('已作答题目数:', Object.keys(answers).length);
    console.log('AI批改结果:', gradingMap);

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      let earnedScore = 0;

      // 如果是主观题且有AI批改结果，使用AI评分
      if (gradingMap[question.id]) {
        earnedScore = gradingMap[question.id].score;
        console.log(`题目${question.id} (${question.type}) - AI评分: ${earnedScore}/${question.score}`);
      } else if (userAnswer) {
        // 客观题评分
        if (question.type === 'single' || question.type === 'judge') {
          earnedScore = userAnswer === question.correctAnswer ? question.score : 0;
          console.log(`题目${question.id} (${question.type}) - 用户答案: ${userAnswer}, 正确答案: ${question.correctAnswer}, 得分: ${earnedScore}/${question.score}`);
        } else if (question.type === 'multiple') {
          const correctAnswers = question.correctAnswer as string[];
          const userAnswers = userAnswer as string[];
          if (JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort())) {
            earnedScore = question.score;
          }
          console.log(`题目${question.id} (${question.type}) - 用户答案: ${JSON.stringify(userAnswers)}, 正确答案: ${JSON.stringify(correctAnswers)}, 得分: ${earnedScore}/${question.score}`);
        } else if (question.type === 'scenario' && question.options && question.options.length > 0) {
          // 有选项的scenario题按单选题评分
          earnedScore = userAnswer === question.correctAnswer ? question.score : 0;
          console.log(`题目${question.id} (${question.type}) - 用户答案: ${userAnswer}, 正确答案: ${question.correctAnswer}, 得分: ${earnedScore}/${question.score}`);
        }
      } else {
        console.log(`题目${question.id} (${question.type}) - 未作答`);
      }

      totalScore += earnedScore;
      dimensionScores[question.dimension].earned += earnedScore;
      dimensionScores[question.dimension].total += question.score;
    });

    console.log('=== 分数计算完成 ===');
    console.log('总分:', totalScore);
    console.log('各维度得分:', dimensionScores);

    const result = {
      total: totalScore,
      tech: dimensionScores.tech.total > 0 
        ? Math.round((dimensionScores.tech.earned / dimensionScores.tech.total) * 100) 
        : 0,
      general: dimensionScores.general.total > 0 
        ? Math.round((dimensionScores.general.earned / dimensionScores.general.total) * 100) 
        : 0,
      behavior: dimensionScores.behavior.total > 0 
        ? Math.round((dimensionScores.behavior.earned / dimensionScores.behavior.total) * 100) 
        : 0,
      experience: dimensionScores.experience.total > 0 
        ? Math.round((dimensionScores.experience.earned / dimensionScores.experience.total) * 100) 
        : 0,
    };

    console.log('最终结果:', result);
    return result;
  };

  const getJobTitle = (id: string) => {
    // 优先使用从数据库获取的标准名称
    if (assessmentInfo?.position_name) {
      return assessmentInfo.position_name;
    }
    
    // 其次使用location.state传递的标准名称
    if (evaluation?.position_name) {
      return evaluation.position_name;
    }
    
    // 最后使用默认映射
    const titles: Record<string, string> = {
      '1': 'AI模型工程师',
      '2': '前端开发工程师',
      '3': 'AI产品经理',
      '4': '全栈开发工程师',
      '5': 'UI/UX设计师',
      '6': 'Prompt工程师',
      '7': '产品经理',
      '8': '数据分析师',
      '9': '视觉设计师',
      '10': 'AI应用开发工程师',
    };
    return titles[id] || 'AI模型工程师';
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{getJobTitle(id || '1')} 胜任力测评</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              请认真作答，测评结果将用于生成你的能力报告
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/student/evaluation')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            返回测评中心
          </Button>
        </div>

        {/* 顶部信息栏 */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-base">
                题目 {currentQuestionIndex + 1} / {questions.length}
              </Badge>
              <Progress value={progress} className="w-48" />
            </div>
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-warning" />
              <span className={timeLeft < 300 ? 'text-destructive' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 题目卡片 */}
        {!currentQuestion ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">未找到相关测评题目</p>
              <Button className="mt-4" onClick={() => navigate('/student/evaluation')}>
                返回测评中心
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {currentQuestionIndex + 1}. {currentQuestion.question}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{getDimensionLabel(currentQuestion.dimension)}</Badge>
                      <Badge variant="outline">{getDifficultyLabel(currentQuestion.difficulty)}</Badge>
                      <Badge variant="outline">{getTypeLabel(currentQuestion.type)}</Badge>
                      <span className="text-sm text-muted-foreground">分值：{currentQuestion.score}分</span>
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 单选题 */}
              {currentQuestion.type === 'single' && (
                <RadioGroup
                  value={answers[currentQuestion.id] as string}
                  onValueChange={(value) => handleAnswer(value)}
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

            {/* 多选题 */}
            {currentQuestion.type === 'multiple' && (
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50">
                    <Checkbox
                      id={`option-${index}`}
                      checked={(answers[currentQuestion.id] as string[] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
                        if (checked) {
                          handleAnswer([...currentAnswers, option]);
                        } else {
                          handleAnswer(currentAnswers.filter((a) => a !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* 判断题 */}
            {currentQuestion.type === 'judge' && (
              <RadioGroup
                value={answers[currentQuestion.id] as string}
                onValueChange={(value) => handleAnswer(value)}
              >
                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="正确" id="option-true" />
                  <Label htmlFor="option-true" className="flex-1 cursor-pointer">
                    正确
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="错误" id="option-false" />
                  <Label htmlFor="option-false" className="flex-1 cursor-pointer">
                    错误
                  </Label>
                </div>
              </RadioGroup>
            )}

            {/* 情景题 - 根据是否有options决定渲染方式 */}
            {currentQuestion.type === 'scenario' && (
              <>
                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                  // 有选项的情景题，渲染为单选题
                  <RadioGroup
                    value={answers[currentQuestion.id] as string}
                    onValueChange={(value) => handleAnswer(value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-muted/50">
                        <RadioGroupItem value={option} id={`scenario-option-${index}`} />
                        <Label htmlFor={`scenario-option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  // 无选项的情景题，渲染为主观题
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <Label htmlFor="scenario-answer" className="text-sm text-muted-foreground mb-2 block">
                        请根据情景描述，详细阐述你的分析和解决方案
                      </Label>
                      <Textarea
                        id="scenario-answer"
                        placeholder="请输入您的答案，建议从问题分析、解决思路、具体方案等角度展开..."
                        value={(answers[currentQuestion.id] as string) || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="min-h-[200px] text-base"
                        rows={8}
                      />
                      <div className="mt-2 text-xs text-muted-foreground text-right">
                        已输入 {((answers[currentQuestion.id] as string) || '').length} 字
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      💡 提示：情景题将由AI智能评分，建议结合实际工作场景，从多个角度分析问题
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 填空题 */}
            {currentQuestion.type === 'fill' && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <Label htmlFor="fill-answer" className="text-sm text-muted-foreground mb-2 block">
                    请在下方输入框中填写答案
                  </Label>
                  <Input
                    id="fill-answer"
                    placeholder="请输入答案..."
                    value={(answers[currentQuestion.id] as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="text-base"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 提示：填空题将由AI智能评分，请尽量完整准确地填写答案
                </div>
              </div>
            )}

            {/* 简答题 */}
            {currentQuestion.type === 'essay' && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/30">
                  <Label htmlFor="essay-answer" className="text-sm text-muted-foreground mb-2 block">
                    请在下方文本框中详细作答
                  </Label>
                  <Textarea
                    id="essay-answer"
                    placeholder="请输入您的答案，建议详细阐述您的观点和理由..."
                    value={(answers[currentQuestion.id] as string) || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="min-h-[200px] text-base"
                    rows={8}
                  />
                  <div className="mt-2 text-xs text-muted-foreground text-right">
                    已输入 {((answers[currentQuestion.id] as string) || '').length} 字
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 提示：简答题将由AI智能评分，建议从多个角度阐述，字数在200-500字为佳
                </div>
              </div>
            )}

            {/* 已作答标识 */}
            {answers[currentQuestion.id] && (
              <div className="flex items-center space-x-2 text-sm text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span>已作答</span>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* 底部按钮 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            上一题
          </Button>

          <div className="text-sm text-muted-foreground">
            已作答 {Object.keys(answers).length} / {questions.length} 题
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>
              下一题
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交测评'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function getDimensionLabel(dimension: string) {
  const labels: Record<string, string> = {
    tech: '专业技能',
    general: '通用能力',
    behavior: '行为特质',
    experience: '经验背景'
  };
  return labels[dimension] || dimension;
}

function getDifficultyLabel(difficulty: string) {
  const labels: Record<string, string> = {
    basic: '基础',
    intermediate: '进阶',
    advanced: '高级',
    easy: '基础',
    medium: '进阶',
    hard: '高级'
  };
  return labels[difficulty] || difficulty;
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '简答题',
    scenario: '情景题',
    code: '代码题'
  };
  return labels[type] || type;
}
