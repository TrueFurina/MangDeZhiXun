import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Breadcrumb from '@/components/ui/breadcrumb';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Target,
  CheckCircle2,
  Play,
  Download,
  Star,
  RefreshCw,
  Lock,
  Unlock,
  Trophy,
  Zap,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getAllCourses, 
  getUserStats, 
  getAllUserCourseProgress,
  getUserAchievements,
  getGrowthPath,
  updateCourseProgress,
  recordLearningTime,
  checkAndUnlockAchievements,
  generateGrowthPath,
  getUserAssessments,
  type Course,
  type UserStats,
  type CourseProgress,
  type UserAchievement,
  type AssessmentRecord,
} from '@/db/api';
import { getCurrentUserEmail } from '@/lib/supabase';
import { achievements } from '@/data/achievements';

// 将测评最弱维度映射为成长中心维度名
const WEAK_DIM_MAP: Record<string, string> = {
  tech_score: '专业技能提升',
  general_score: '通用能力培养',
  behavior_score: '行为特质塑造',
  experience_score: '项目实战经验',
};

const WEAK_DIM_LABEL: Record<string, string> = {
  tech_score: '专业技能',
  general_score: '通用能力',
  behavior_score: '行为特质',
  experience_score: '实践经验',
};

const WEAK_DIM_ADVICE: Record<string, string> = {
  tech_score: '建议优先攻克专业技能课程，夯实核心技术栈，提升硬实力竞争力。',
  general_score: '建议重点强化结构化表达、逻辑思维与跨部门协作等职场通用能力。',
  behavior_score: '建议通过情景模拟和压力测试类课程，提升执行力与行为特质稳定性。',
  experience_score: '建议重点参与项目实战模拟课程，积累真实业务场景下的问题解决经验。',
};

export default function GrowthCenterPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');
  const [stats, setStats] = useState<UserStats>({
    total_learning_minutes: 0,
    completed_courses: 0,
    ability_improvement_percent: 0,
    ranking_percent: 100,
    last_updated: new Date().toISOString(),
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [growthPath, setGrowthPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState<'all' | 'video' | 'document' | 'course'>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // 最新测评短板智能推荐
  const [latestAssessment, setLatestAssessment] = useState<AssessmentRecord | null>(null);
  const [weakDimKey, setWeakDimKey] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const email = getCurrentUserEmail();
      if (!email) {
        toast.error('请先登录');
        return;
      }
      setUserEmail(email);

      // 并行加载所有数据（含最新测评）
      const [statsData, coursesData, progressData, achievementsData, pathData, assessments] = await Promise.all([
        getUserStats(email),
        getAllCourses(),
        getAllUserCourseProgress(email),
        getUserAchievements(email),
        getGrowthPath(email),
        getUserAssessments(email),
      ]);

      setStats(statsData);
      setCourses(coursesData);
      setProgress(progressData);
      setUserAchievements(achievementsData);
      setGrowthPath(pathData);

      // 解析最新测评短板
      if (assessments.length > 0) {
        const latest = assessments[0]; // 降序，第一条为最新
        setLatestAssessment(latest);
        const dims: Record<string, number> = {
          tech_score: latest.tech_score ?? 0,
          general_score: latest.general_score ?? 0,
          behavior_score: latest.behavior_score ?? 0,
          experience_score: latest.experience_score ?? 0,
        };
        const weakKey = Object.entries(dims).reduce((a, b) => a[1] <= b[1] ? a : b)[0];
        setWeakDimKey(weakKey);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const refreshData = async () => {
    toast.info('正在刷新数据...');
    await loadData();
    toast.success('数据已更新');
  };

  // 生成成长路径
  const handleGenerateGrowthPath = async () => {
    if (!userEmail) return;
    
    const success = await generateGrowthPath(userEmail);
    if (success) {
      toast.success('成长路径已生成');
      await loadData();
    } else {
      toast.error('请先完成综合能力测评', {
        action: {
          label: '去测评',
          onClick: () => navigate('/student/evaluation')
        }
      });
      // 2秒后自动跳转到测评中心
      setTimeout(() => {
        navigate('/student/evaluation');
      }, 2000);
    }
  };

  // 开始学习课程
  const handleStartCourse = async (course: Course) => {
    if (!userEmail) {
      toast.error('请先登录');
      return;
    }

    // 跳转到内嵌播放器
    navigate(`/student/course-player/${course.id}`);
  };

  // 确认学习完成（进度变为100%）
  const handleConfirmComplete = async (course: Course) => {
    if (!userEmail) {
      toast.error('请先登录');
      return;
    }

    // 检查是否已完成
    const existingProgress = progress.find(p => p.course_id === course.id);
    if (existingProgress && existingProgress.is_completed) {
      toast.warning('该课程已完成，无需重复确认');
      return;
    }

    // 更新进度为100%并标记为已完成
    const progressSuccess = await updateCourseProgress(userEmail, course.id, 100, true);
    
    if (progressSuccess) {
      // 记录学习时长（使用课程标准时长）
      await recordLearningTime(userEmail, course.id, course.duration_minutes);
      
      // 检查成就
      const newAchievements = await checkAndUnlockAchievements(userEmail);
      if (newAchievements.length > 0) {
        toast.success(`🎉 恭喜解锁成就：${newAchievements.join('、')}`);
      }

      toast.success(`学习完成已确认，时长与进度已更新（+${course.duration_minutes}分钟）`);
      
      // 刷新数据
      await loadData();
    } else {
      toast.error('确认失败，请稍后重试');
    }
  };

  // 导出学习报告
  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // 模拟导出过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('学习报告已生成，正在下载...');
      
      const reportContent = `
芒得很职 - 个人学习报告

姓名：${userEmail}
生成时间：${new Date().toLocaleString('zh-CN')}

一、学习统计
- 总学习时长：${Math.floor(stats.total_learning_minutes / 60)}小时${stats.total_learning_minutes % 60}分钟
- 完成课程：${stats.completed_courses}门
- 能力提升：${stats.ability_improvement_percent > 0 ? '+' : ''}${stats.ability_improvement_percent}%
- 学习排名：全站Top ${stats.ranking_percent}%

二、成长路径
${growthPath ? '已生成个性化成长路径' : '暂未生成成长路径'}

三、已解锁成就
${userAchievements.map(a => `- ${a.achievement_name}`).join('\n') || '暂无'}

四、学习建议
继续保持学习热情，完成更多课程，提升职业竞争力！
      `;

      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `学习报告_${new Date().getTime()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 计算维度进度
  const calculateDimensionProgress = (dimension: string) => {
    const dimensionCourses = courses.filter(c => c.dimension === dimension);
    const completedCount = progress.filter(p => 
      p.is_completed && dimensionCourses.some(c => c.id === p.course_id)
    ).length;
    
    return {
      total: dimensionCourses.length,
      completed: completedCount,
      progress: dimensionCourses.length > 0 ? Math.round((completedCount / dimensionCourses.length) * 100) : 0,
    };
  };

  // 获取课程进度
  const getCourseProgress = (courseId: number) => {
    return progress.find(p => p.course_id === courseId);
  };

  // 筛选课程
  const filteredCourses = resourceFilter === 'all' 
    ? courses.filter(c => c.dimension === '推荐资源')
    : courses.filter(c => c.dimension === '推荐资源' && c.type === resourceFilter);

  // 格式化学习时长
  const formatLearningTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  // 计算本周新增时长（简化版）
  const weeklyMinutes = Math.floor(stats.total_learning_minutes * 0.3);

  // 四大维度
  const dimensions = [
    { name: '专业技能提升', description: '标准核心硬技能，适配新质生产力标准' },
    { name: '通用能力培养', description: '职场通用软技能，适配全标准需求' },
    { name: '行为特质塑造', description: '冰山模型水下隐性特质，适配长期职业发展' },
    { name: '项目实战经验', description: '真实职场项目实训，适配标准实操需求' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* 面包屑导航 */}
        <Breadcrumb />

        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">成长中心</h1>
            <p className="text-muted-foreground mt-1">个性化学习路径，助力职业成长</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新数据
            </Button>
            <Button onClick={handleExportReport} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? '导出中...' : '导出学习报告'}
            </Button>
          </div>
        </div>

        {/* ===== AI短板智能推荐Banner ===== */}
        {latestAssessment && weakDimKey && (
          <Card className="border-amber-400/50 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-amber-900">AI短板诊断 · 优先强化建议</h3>
                      <Badge className="bg-amber-500 text-white text-xs">基于最新测评</Badge>
                    </div>
                    <p className="text-sm text-amber-800">
                      岗位 <strong>{latestAssessment.job_title}</strong> 测评中，
                      你的 <strong>{WEAK_DIM_LABEL[weakDimKey]}</strong> 维度得分为{' '}
                      <strong className="text-amber-600">
                        {(latestAssessment as unknown as Record<string, number | string>)[weakDimKey] ?? 0} 分
                      </strong>，是当前最需要补强的方向。
                    </p>
                    <p className="text-xs text-amber-700 mt-1">{WEAK_DIM_ADVICE[weakDimKey]}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => {
                      // 滚动到对应维度卡片
                      const el = document.getElementById(`dim-${weakDimKey}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <ArrowRight className="mr-1 h-3.5 w-3.5" />
                    跳转到补强课程
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-400 text-amber-700 hover:bg-amber-50"
                    onClick={() => navigate('/student/ability-profile')}
                  >
                    查看完整画像
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 顶部数据统计栏 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">总学习时长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatLearningTime(stats.total_learning_minutes)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                本周新增 +{formatLearningTime(weeklyMinutes)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">完成课程</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed_courses}门</div>
              <p className="text-xs text-muted-foreground mt-1">
                进行中 {progress.filter(p => p.progress_percent > 0 && !p.is_completed).length}门
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">能力提升</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.ability_improvement_percent > 0 ? '+' : ''}{stats.ability_improvement_percent}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">较上月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">学习排名</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Top {stats.ranking_percent}%</div>
              <p className="text-xs text-muted-foreground mt-1">全站排名</p>
            </CardContent>
          </Card>
        </div>

        {/* 我的成长路径 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>我的成长路径</CardTitle>
                <CardDescription>基于综合能力测评的个性化学习路径</CardDescription>
              </div>
              {!growthPath && (
                <Button onClick={handleGenerateGrowthPath}>
                  <Target className="w-4 h-4 mr-2" />
                  生成成长路径
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!growthPath ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">暂未生成成长路径</h3>
                <p className="text-muted-foreground mb-4">
                  请先完成综合能力测评，获取专属成长路径
                </p>
                <Button onClick={handleGenerateGrowthPath}>
                  立即生成
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dimensions.map((dim) => {
                  const dimProgress = calculateDimensionProgress(dim.name);
                  const dimCourses = courses.filter(c => c.dimension === dim.name);
                  const isWeakDim = !!(weakDimKey && WEAK_DIM_MAP[weakDimKey] === dim.name);
                  const dimId = weakDimKey && WEAK_DIM_MAP[weakDimKey] === dim.name ? `dim-${weakDimKey}` : `dim-${dim.name}`;

                  return (
                    <Card
                      key={dim.name}
                      id={dimId}
                      className={isWeakDim ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-md' : ''}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {isWeakDim && (
                                <Badge className="bg-amber-500 text-white text-xs">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  优先补强
                                </Badge>
                              )}
                              {dim.name}
                            </CardTitle>
                            <CardDescription>{dim.description}</CardDescription>
                          </div>
                          <Badge variant={dimProgress.progress >= 80 ? 'default' : 'secondary'}>
                            {dimProgress.completed}/{dimProgress.total} 已完成
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">完成度</span>
                            <span className="font-medium">{dimProgress.progress}%</span>
                          </div>
                          <Progress value={dimProgress.progress} className="h-2" />
                          
                          {/* 课程列表 */}
                          <div className="mt-4 space-y-2">
                            {dimCourses.slice(0, 3).map((course) => {
                              const courseProgress = getCourseProgress(course.id);
                              return (
                                <div key={course.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{course.title}</span>
                                      {courseProgress?.is_completed && (
                                        <Badge variant="default" className="text-xs">已完成</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {course.duration} · {course.difficulty} · {course.instructor}
                                    </p>
                                  </div>
                                  {/* 三段式按钮状态 */}
                                  {courseProgress?.is_completed ? (
                                    // 已完成（100%）：置灰按钮
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      disabled
                                      onClick={() => {}}
                                    >
                                      <CheckCircle2 className="mr-1 h-4 w-4" />
                                      已完成
                                    </Button>
                                  ) : courseProgress && courseProgress.progress_percent === 50 ? (
                                    // 学习中（50%）：确认完成按钮
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleConfirmComplete(course)}
                                      variant="default"
                                    >
                                      确认学习完成
                                    </Button>
                                  ) : (
                                    // 未学习（0%）：开始学习按钮
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleStartCourse(course)}
                                      variant="default"
                                    >
                                      <Play className="mr-1 h-4 w-4" />
                                      开始学习
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 推荐学习资源 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>推荐学习资源</CardTitle>
                <CardDescription>基于您的学习路径和能力短板推荐</CardDescription>
              </div>
              <Tabs value={resourceFilter} onValueChange={(v) => setResourceFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="video">视频</TabsTrigger>
                  <TabsTrigger value="document">文档</TabsTrigger>
                  <TabsTrigger value="course">课程</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => {
                const courseProgress = getCourseProgress(course.id);
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {course.type === 'video' && <Video className="w-4 h-4 text-primary" />}
                            {course.type === 'document' && <FileText className="w-4 h-4 text-primary" />}
                            {course.type === 'course' && <BookOpen className="w-4 h-4 text-primary" />}
                            <Badge variant="outline">{course.type === 'video' ? '视频' : course.type === 'document' ? '文档' : '课程'}</Badge>
                          </div>
                          <CardTitle className="text-base">{course.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{course.duration}</span>
                          <Badge variant="secondary">{course.difficulty}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{course.instructor}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{course.rating}</span>
                          </div>
                        </div>
                        {courseProgress && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">学习进度</span>
                              <span className="font-medium">{courseProgress.progress_percent}%</span>
                            </div>
                            <Progress value={courseProgress.progress_percent} className="h-1" />
                          </div>
                        )}
                        {/* 三段式按钮状态 */}
                        {courseProgress?.is_completed ? (
                          // 已完成（100%）：置灰按钮
                          <Button 
                            className="w-full" 
                            variant="outline"
                            disabled
                            onClick={() => {}}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            已完成
                          </Button>
                        ) : courseProgress && courseProgress.progress_percent === 50 ? (
                          // 学习中（50%）：确认完成按钮
                          <Button 
                            className="w-full" 
                            onClick={() => handleConfirmComplete(course)}
                            variant="default"
                          >
                            确认学习完成
                          </Button>
                        ) : (
                          // 未学习（0%）：开始学习按钮
                          <Button 
                            className="w-full" 
                            onClick={() => handleStartCourse(course)}
                            variant="default"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            开始学习
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 学习成就 */}
        <Card>
          <CardHeader>
            <CardTitle>学习成就</CardTitle>
            <CardDescription>完成任务解锁成就，获取专属权益</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => {
                const isUnlocked = userAchievements.some(ua => ua.achievement_id === achievement.id);
                return (
                  <Card 
                    key={achievement.id} 
                    className={`relative ${isUnlocked ? 'border-primary' : 'opacity-60'}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="text-3xl">{achievement.icon}</div>
                        {isUnlocked ? (
                          <Unlock className="w-5 h-5 text-primary" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="text-base">{achievement.name}</CardTitle>
                      <CardDescription className="text-xs">{achievement.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          {achievement.reward}
                        </div>
                        {isUnlocked && (
                          <Badge variant="default" className="w-full justify-center">
                            已解锁
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
