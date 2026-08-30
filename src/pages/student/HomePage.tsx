import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Video,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Clock,
  Users,
  Star,
  Target,
  Sparkles,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Brain,
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { toast } from 'sonner';
import { getCurrentUserEmail } from '@/lib/supabase';
import { getUserAssessments, getUserProfile, type AssessmentRecord } from '@/db/api';
import { OnboardingDialog } from '@/components/auth/OnboardingDialog';

// 标准详情类型
interface PositionDetail {
  id: string;
  name: string;
  company: string;
  salary: string;
  match: number;
  tags: string[];
  recruitCount: number;
  location: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  workTime: string;
  contact: {
    phone: string;
    email: string;
  };
}

// 学习资源类型
interface LearningResource {
  id: string;
  title: string;
  type: string;
  duration: string;
  difficulty: string;
  provider: string;
  bilibiliUrl: string;
}

export default function StudentHomePage() {
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState<PositionDetail | null>(null);
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  
  // 用户昵称状态
  const [userNickname, setUserNickname] = useState<string>('');
  
  // 用户是否完成测评（用于判断是否显示达标率）
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean>(false);
  
  // 测评统计数据
  const [assessmentCount, setAssessmentCount] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRecord | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // 新用户引导：资料补全弹窗
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingInitial, setOnboardingInitial] = useState<{
    nickname?: string;
    university_name?: string;
    job_intent?: string;
    graduation_year?: string;
  }>({});

  // 从localStorage读取用户昵称和测评状态
  useEffect(() => {
    const loadUserNickname = () => {
      const nickname = localStorage.getItem('user_nickname');
      setUserNickname(nickname || '');
    };
    
    const loadAssessmentStatus = () => {
      // 检查用户是否完成过测评
      const assessmentCompleted = localStorage.getItem('assessment_completed');
      setHasCompletedAssessment(assessmentCompleted === 'true');
    };

    // 加载用户资料，判断是否需要引导补全
    const loadProfileAndOnboard = async () => {
      try {
        const userEmail = getCurrentUserEmail();
        const profile = await getUserProfile(userEmail);
        if (profile) {
          setUserNickname(profile.nickname || '');
          setOnboardingInitial({
            nickname: profile.nickname,
            university_name: profile.university_name,
            job_intent: profile.job_intent,
            graduation_year: profile.graduation_year,
          });
          // 资料不完整（未填求职方向）且本次会话未关闭过引导 → 自动弹出
          const incomplete = !profile.job_intent;
          if (incomplete && !sessionStorage.getItem('onboarding_dismissed')) {
            setOnboardingOpen(true);
          }
        }
      } catch (error) {
        console.error('加载用户资料失败:', error);
      }
    };
    
    const loadAssessmentData = async () => {
      try {
        const userEmail = getCurrentUserEmail();
        const assessments = await getUserAssessments(userEmail);
        
        // 更新测评次数
        setAssessmentCount(assessments.length);
        
        // 计算平均分
        if (assessments.length > 0) {
          const totalScore = assessments.reduce((sum, a) => sum + (a.total_score || 0), 0);
          const avg = Math.round(totalScore / assessments.length);
          setAverageScore(avg);
          // 最新一条用于迷你雷达图（api按时间降序，第一条为最新）
          setLatestAssessment(assessments[0]);
          
          // 如果有测评记录，设置已完成标识
          if (!localStorage.getItem('assessment_completed')) {
            localStorage.setItem('assessment_completed', 'true');
            setHasCompletedAssessment(true);
          }
        }
      } catch (error) {
        console.error('加载测评数据失败:', error);
      } finally {
        setDataLoading(false);
      }
    };

    // 初始加载
    loadUserNickname();
    loadAssessmentStatus();
    loadAssessmentData();
    loadProfileAndOnboard();

    // 监听storage事件（跨标签页同步）
    window.addEventListener('storage', loadUserNickname);
    window.addEventListener('storage', loadAssessmentStatus);

    // 监听自定义事件（同一页面内同步）
    window.addEventListener('nicknameUpdated', loadUserNickname);
    window.addEventListener('assessmentCompleted', () => {
      loadAssessmentStatus();
      loadAssessmentData();
    });
    window.addEventListener('app-auth-change', loadProfileAndOnboard);

    return () => {
      window.removeEventListener('storage', loadUserNickname);
      window.removeEventListener('storage', loadAssessmentStatus);
      window.removeEventListener('nicknameUpdated', loadUserNickname);
      window.removeEventListener('assessmentCompleted', loadAssessmentData);
      window.removeEventListener('app-auth-change', loadProfileAndOnboard);
    };
  }, []);

  // 获取欢迎语
  const getWelcomeMessage = () => {
    if (userNickname) {
      return `嗨，${userNickname}，今天也要为职业目标加油呀 👋`;
    }
    return '嗨，新同学，今天也要为职业目标加油呀 👋';
  };

  // 4大核心功能入口
  const coreFeatures = [
    {
      icon: FileText,
      title: '综合能力测评',
      desc: '多维度评估你的行业标准达标率',
      color: 'bg-primary',
      path: '/student/evaluation',
      badge: '推荐',
    },
    {
      icon: Video,
      title: 'AI沉浸式实训',
      desc: '单面/群面/答辩/JD靶向特训',
      color: 'bg-success',
      path: '/student/ai-interview',
      badge: '热门',
    },
    {
      icon: TrendingUp,
      title: '成长路径规划',
      desc: '个性化能力提升方案',
      color: 'bg-warning',
      path: '/student/growth',
      badge: '新功能',
    },
    {
      icon: Briefcase,
      title: '能力对标验证',
      desc: '精准对标目标行业技能要求',
      color: 'bg-chart-4',
      path: '/student/jobs',
      badge: '',
    },
  ];

  // 行业标准推荐（完整数据）
  const hotPositions: PositionDetail[] = [
    {
      id: '1',
      name: 'AI模型工程师',
      company: '字节跳动',
      salary: '25-45K',
      match: 92,
      tags: ['深度学习', 'PyTorch', 'Python'],
      recruitCount: 5,
      location: '北京·朝阳区',
      responsibilities: [
        '负责大模型训练和优化，提升模型性能和效率',
        '参与AI算法研发，解决实际业务问题',
        '优化模型推理性能，降低计算成本',
        '跟踪前沿技术，探索创新应用场景',
      ],
      requirements: [
        '计算机、人工智能等相关专业本科及以上学历',
        '熟练掌握Python，熟悉PyTorch/TensorFlow框架',
        '深入理解深度学习原理，有大模型训练经验优先',
        '良好的编程能力和算法基础',
        '优秀的团队协作和沟通能力',
      ],
      benefits: [
        '五险一金，补充商业保险',
        '年度体检，健身房免费使用',
        '弹性工作制，远程办公支持',
        '股票期权，年终奖金',
        '技术培训，学习成长机会',
      ],
      workTime: '弹性工作制，9:30-18:30（可远程）',
      contact: {
        phone: '010-12345678',
        email: 'hr@bytedance.com',
      },
    },
    {
      id: '2',
      name: 'AI应用开发工程师',
      company: '阿里巴巴',
      salary: '20-40K',
      match: 88,
      tags: ['大模型', 'Agent', 'API'],
      recruitCount: 3,
      location: '杭州·余杭区',
      responsibilities: [
        '基于大模型开发AI应用产品，提升用户体验',
        '设计和实现Agent系统，实现智能化交互',
        '对接各类API接口，构建完整的应用生态',
        '优化应用性能，保障系统稳定运行',
      ],
      requirements: [
        '计算机相关专业本科及以上学历',
        '熟练掌握Python/Java，有Web开发经验',
        '了解大模型应用开发，熟悉LangChain等框架',
        '有Agent开发经验者优先',
        '良好的产品思维和用户体验意识',
      ],
      benefits: [
        '六险一金，带薪年假',
        '免费三餐，下午茶',
        '住房补贴，交通补贴',
        '年度旅游，团建活动',
        '内部培训，职业发展通道',
      ],
      workTime: '标准工时，9:00-18:00',
      contact: {
        phone: '0571-87654321',
        email: 'recruit@alibaba.com',
      },
    },
    {
      id: '3',
      name: 'AI产品经理',
      company: '腾讯科技',
      salary: '22-38K',
      match: 85,
      tags: ['产品设计', 'AI应用', '需求分析'],
      recruitCount: 2,
      location: '深圳·南山区',
      responsibilities: [
        '负责AI产品规划和设计，制定产品路线图',
        '深入理解用户需求，设计产品功能和交互',
        '协调技术团队，推动产品落地实施',
        '跟踪产品数据，持续优化产品体验',
      ],
      requirements: [
        '本科及以上学历，3年以上产品经验',
        '深入理解AI技术，有AI产品经验优先',
        '优秀的需求分析和产品设计能力',
        '良好的沟通协调和项目管理能力',
        '数据驱动思维，关注用户体验',
      ],
      benefits: [
        '五险一金，年度体检',
        '弹性福利，员工关怀',
        '免费班车，健身房',
        '股票激励，绩效奖金',
        '培训学习，晋升机会',
      ],
      workTime: '弹性工作，10:00-19:00',
      contact: {
        phone: '0755-86013388',
        email: 'hr@tencent.com',
      },
    },
  ];

  // 推荐学习资源（带B站链接）
  const recommendResources: LearningResource[] = [
    {
      id: '1',
      title: '深度学习入门课程',
      type: '课程',
      duration: '20小时',
      difficulty: '初级',
      provider: 'Coursera',
      bilibiliUrl: 'https://www.bilibili.com/video/BV1Y7411d7Ys',
    },
    {
      id: '2',
      title: 'PyTorch官方教程',
      type: '教程',
      duration: '30小时',
      difficulty: '中级',
      provider: 'PyTorch官方',
      bilibiliUrl: 'https://www.bilibili.com/video/BV1hE411t7RN',
    },
    {
      id: '3',
      title: '机器学习实战项目',
      type: '项目',
      duration: '15小时',
      difficulty: '中级',
      provider: 'Kaggle',
      bilibiliUrl: 'https://www.bilibili.com/video/BV1FT4y1E74V',
    },
  ];

  // 打开标准详情弹窗（跳转到BOSS直聘）
  const handleViewPositionDetail = (position: PositionDetail) => {
    // 构建BOSS直聘搜索URL
    const searchQuery = encodeURIComponent(`${position.name} ${position.company}`);
    const bossUrl = `https://www.zhipin.com/web/geek/job?query=${searchQuery}`;
    window.open(bossUrl, '_blank');
  };

  // 跳转到B站学习
  const handleStartLearning = (resource: LearningResource) => {
    window.open(resource.bilibiliUrl, '_blank');
  };

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* 实训任务入口横幅 */}
      <Card
        className="cursor-pointer border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background hover:shadow-lg transition-all"
        onClick={() => navigate('/student/training-tasks')}
      >
        <CardContent className="flex items-center gap-5 p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Target className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">软素养对话式对抗实训</h2>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              基于你的能力画像生成个性化对抗脚本，多轮动态追问完整留存对话证据链，生成雷达评估报告
            </p>
          </div>
          <Button className="shrink-0" onClick={(e) => { e.stopPropagation(); navigate('/student/training-tasks'); }}>
            进入实训 <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* 欢迎区域 */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="hidden md:block">
              <img 
                src="https://miaoda-conversation-file.cdn.bcebos.com/user-6m37scl45nuo/conv-a7lm1eejtyps/20260402/file-ao6xs4b87ytd.jpg@w_1536" 
                alt="芒小橘欢迎你" 
                className="h-32 w-32 rounded-2xl object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{getWelcomeMessage()}</h1>
              <p className="mt-2 text-muted-foreground">
                {userNickname ? '继续你的职业发展之旅' : '开启你的职业发展之旅'}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            {hasCompletedAssessment && latestAssessment ? (
              /* 已完成测评：展示迷你能力雷达图 */
              <div
                className="cursor-pointer rounded-xl border border-primary/20 bg-white/60 p-3 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate('/student/ability-profile')}
                title="查看完整能力画像"
              >
                <p className="mb-1 text-center text-xs font-medium text-muted-foreground">
                  最新能力快照 · {latestAssessment.job_title}
                </p>
                <ResponsiveContainer width={200} height={160}>
                  <RadarChart
                    cx="50%" cy="50%" outerRadius="60%"
                    data={[
                      { s: '专业技能', v: latestAssessment.tech_score ?? 0 },
                      { s: '工程实践', v: Math.max(0, (latestAssessment.experience_score ?? 0) - 5) },
                      { s: '通用能力', v: latestAssessment.general_score ?? 0 },
                      { s: '行为特质', v: latestAssessment.behavior_score ?? 0 },
                      { s: '业务理解', v: latestAssessment.experience_score ?? 0 },
                      { s: '逻辑思维', v: Math.min(100, (latestAssessment.behavior_score ?? 0) + 5) },
                    ]}
                  >
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="s" tick={{ fill: '#64748b', fontSize: 9 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0' }}
                      formatter={(v: number) => [`${v}分`, '']}
                    />
                    <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.45} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="mt-1 text-center text-xs text-primary font-medium">
                  综合得分 {latestAssessment.total_score ?? 0} 分 · 点击查看详情
                </p>
              </div>
            ) : (
              /* 未完成测评：展示文字统计 */
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <button
                  onClick={() => navigate('/student/profile')}
                  className="text-center transition-opacity hover:opacity-80 min-w-[80px]"
                >
                  <div className="text-2xl font-bold text-primary whitespace-nowrap">{dataLoading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-muted" /> : assessmentCount}</div>
                  <div className="text-sm text-muted-foreground underline whitespace-nowrap">已完成测评</div>
                </button>
                <button
                  onClick={() => navigate('/student/growth')}
                  className="text-center transition-opacity hover:opacity-80 min-w-[80px]"
                >
                  <div className="text-2xl font-bold text-success whitespace-nowrap">{dataLoading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted" /> : `${averageScore}分`}</div>
                  <div className="text-sm text-muted-foreground underline whitespace-nowrap">平均得分</div>
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('recommended-positions');
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="text-center transition-opacity hover:opacity-80 min-w-[80px]"
                >
                  <div className="text-2xl font-bold text-warning whitespace-nowrap">12</div>
                  <div className="text-sm text-muted-foreground underline whitespace-nowrap">对标方案</div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 新手激活任务清单 */}
      {!hasCompletedAssessment && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">新手任务 · 三步开启职业之旅</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">完成以下任务，解锁个性化岗位推荐与能力画像。</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <button
                onClick={() => setOnboardingOpen(true)}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">1</div>
                <div className="min-w-0">
                  <p className="font-medium">完善资料</p>
                  <p className="text-sm text-muted-foreground">填写求职方向，精准匹配岗位</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/student/evaluation')}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">2</div>
                <div className="min-w-0">
                  <p className="font-medium">完成首次测评</p>
                  <p className="text-sm text-muted-foreground">生成你的专属能力画像</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/student/jobs')}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">3</div>
                <div className="min-w-0">
                  <p className="font-medium">查看推荐岗位</p>
                  <p className="text-sm text-muted-foreground">投递心仪的职位</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI职业诊断核心入口 */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6 md:flex-row md:justify-between md:space-y-0">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center space-x-2 md:justify-start">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">AI职业诊断</h2>
                <Badge variant="default" className="animate-pulse">
                  推荐
                </Badge>
              </div>
              <p className="text-muted-foreground">
                6步完整流程：AI测评 → AI分析 → 能力画像 → 行业对标 → 模拟答疑 → 优化路径
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 md:justify-start">
                <Badge variant="outline" className="text-xs">
                  <Target className="mr-1 h-3 w-3" />
                  精准匹配
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Brain className="mr-1 h-3 w-3" />
                  AI分析
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  个性化路径
                </Badge>
              </div>
            </div>
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg shadow-lg"
              onClick={() => navigate('/student/diagnosis')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              开始AI职业诊断
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4大核心功能入口 */}
      <div>
        <h2 className="mb-4 text-xl font-bold">快速入口</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate(feature.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-primary group-hover:text-white"
                    onClick={() => {}}
                  >
                    立即体验
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 行业标准推荐 */}
      <div id="recommended-positions">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {hasCompletedAssessment ? '为你推荐的目标能力画像' : '热门行业能力对标'}
          </h2>
          <Button variant="ghost" onClick={() => navigate('/student/jobs')}>
            查看更多
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {hotPositions.map((position) => (
            <Card key={position.name} className="hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{position.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {position.company}
                    </CardDescription>
                  </div>
                  {hasCompletedAssessment ? (
                    <Badge
                      variant={position.match >= 90 ? 'default' : 'secondary'}
                      className="shrink-0"
                    >
                      {position.match}% 匹配
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0">
                      热门
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">薪资范围</span>
                  <span className="font-semibold text-primary">
                    {position.salary}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {position.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewPositionDetail(position)}
                >
                  查看详情
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 推荐学习资源 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">推荐学习资源</h2>
          <Button variant="ghost" onClick={() => navigate('/student/growth')}>
            查看更多
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendResources.map((resource) => (
            <Card key={resource.title} className="hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary">{resource.type}</Badge>
                  <Badge variant="outline">{resource.difficulty}</Badge>
                </div>
                <CardTitle className="mt-3 text-base">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {resource.duration}
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4" />
                    {resource.provider}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStartLearning(resource)}
                >
                  开始学习
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 快速操作提示 */}
      {!hasCompletedAssessment && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">还没有完成测评？</h3>
                <p className="text-sm text-muted-foreground">
                  立即开始测评，获取你的专属能力报告和行业对标数据
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5" onClick={() => navigate('/student/evaluation/report/1')}>
                查看最近雷达报告
              </Button>
              <Button onClick={() => navigate('/student/evaluation')}>
                开始测评
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 标准详情弹窗 */}
      <Dialog open={isPositionDialogOpen} onOpenChange={setIsPositionDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          {selectedPosition && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPosition.name}</DialogTitle>
                <DialogDescription className="flex items-center space-x-4 text-base">
                  <span className="font-medium text-foreground">
                    {selectedPosition.company}
                  </span>
                  <Badge variant="default">{selectedPosition.match}% 匹配</Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">薪资范围</div>
                      <div className="font-semibold text-primary">
                        {selectedPosition.salary}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">适用人数</div>
                      <div className="font-semibold">{selectedPosition.recruitCount}人</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">工作地点</div>
                      <div className="font-semibold">{selectedPosition.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">工作时间</div>
                      <div className="font-semibold">{selectedPosition.workTime}</div>
                    </div>
                  </div>
                </div>

                {/* 技能标签 */}
                <div>
                  <h4 className="mb-2 font-semibold">技能要求</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPosition.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 能力要求 */}
                <div>
                  <h4 className="mb-2 font-semibold">能力要求</h4>
                  <ul className="space-y-2">
                    {selectedPosition.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 任职要求 */}
                <div>
                  <h4 className="mb-2 font-semibold">任职要求</h4>
                  <ul className="space-y-2">
                    {selectedPosition.requirements.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 福利待遇 */}
                <div>
                  <h4 className="mb-2 font-semibold">福利待遇</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedPosition.benefits.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 rounded-lg bg-success/10 p-2"
                      >
                        <Star className="h-4 w-4 text-success" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 联系方式 */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="mb-3 font-semibold">联系方式</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedPosition.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedPosition.contact.email}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      toast.success('学习档案生成成功');
                      setIsPositionDialogOpen(false);
                    }}
                  >
                    立即验证
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => {
                      toast.success('标准已收藏');
                      setIsPositionDialogOpen(false);
                    }}
                  >
                    收藏标准
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 新用户引导：资料补全 */}
      <OnboardingDialog
        open={onboardingOpen}
        onOpenChange={(open) => {
          if (!open) sessionStorage.setItem('onboarding_dismissed', '1');
          setOnboardingOpen(open);
        }}
        initial={onboardingInitial}
      />
    </div>
  );
}
