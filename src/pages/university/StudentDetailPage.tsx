import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Home,
  AlertCircle,
  TrendingDown,
  Lightbulb,
  BookOpen,
  Target,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showTutorDialog, setShowTutorDialog] = useState(false);

  // 技能提升建议数据
  const skillImprovementSuggestions: Record<string, any> = {
    '缺乏办公软件高级应用能力': {
      title: '办公软件高级应用能力提升方案',
      description: '掌握Excel、PPT、Word等办公软件的高级功能，提升职场竞争力',
      courses: [
        { name: 'Excel数据分析与可视化', duration: '20课时', platform: '慕课网' },
        { name: 'PPT商务演示设计', duration: '15课时', platform: 'B站' },
        { name: 'Word排版技巧精通', duration: '10课时', platform: '腾讯课堂' },
      ],
      practices: [
        '完成3个实际案例练习（数据分析报告、商务演示、文档排版）',
        '参加办公软件应用技能认证考试',
        '在实习或项目中实际应用所学技能',
      ],
      timeline: '建议学习周期：4-6周',
      certification: 'Microsoft Office Specialist (MOS) 认证',
    },
    '新媒体运营技能不足': {
      title: '新媒体运营技能提升方案',
      description: '学习新媒体内容创作、运营推广、数据分析等核心技能',
      courses: [
        { name: '新媒体运营实战', duration: '30课时', platform: '拉勾教育' },
        { name: '短视频制作与运营', duration: '25课时', platform: 'B站' },
        { name: '公众号运营从入门到精通', duration: '20课时', platform: '网易云课堂' },
      ],
      practices: [
        '运营个人公众号或视频号，发布至少10篇原创内容',
        '参与实际新媒体项目，积累运营经验',
        '学习使用新媒体运营工具（秀米、创客贴、剪映等）',
      ],
      timeline: '建议学习周期：6-8周',
      certification: '新媒体运营师职业技能等级证书',
    },
    '缺乏数据分析能力': {
      title: '数据分析能力提升方案',
      description: '掌握数据分析基础知识和常用工具，提升数据驱动决策能力',
      courses: [
        { name: 'Python数据分析入门', duration: '40课时', platform: '慕课网' },
        { name: 'SQL数据库查询', duration: '25课时', platform: '拉勾教育' },
        { name: '数据可视化实战', duration: '20课时', platform: 'B站' },
      ],
      practices: [
        '完成5个数据分析项目案例',
        '学习使用Excel、Python、Tableau等分析工具',
        '参加数据分析竞赛或实习项目',
      ],
      timeline: '建议学习周期：8-10周',
      certification: 'CDA数据分析师认证',
    },
  };

  // 辅导老师列表
  const tutorsList = [
    {
      id: 1,
      name: '李明老师',
      title: '职业规划导师',
      expertise: ['职业规划', '能力档案优化', '测评辅导'],
      experience: '10年职业咨询经验',
      students: 156,
      rating: 4.9,
      availability: '周一至周五 14:00-18:00',
      matchScore: 95,
    },
    {
      id: 2,
      name: '王芳老师',
      title: '新媒体运营专家',
      expertise: ['新媒体运营', '内容创作', '品牌推广'],
      experience: '8年新媒体从业经验',
      students: 132,
      rating: 4.8,
      availability: '周二、周四 15:00-19:00',
      matchScore: 92,
    },
    {
      id: 3,
      name: '张伟老师',
      title: '数据分析师',
      expertise: ['数据分析', 'Python', 'SQL'],
      experience: '6年数据分析经验',
      students: 98,
      rating: 4.7,
      availability: '周三、周五 16:00-20:00',
      matchScore: 88,
    },
    {
      id: 4,
      name: '刘洋老师',
      title: '心理咨询师',
      expertise: ['能力发展心理辅导', '压力管理', '职业适应'],
      experience: '12年心理咨询经验',
      students: 203,
      rating: 4.9,
      availability: '周一至周五 10:00-12:00',
      matchScore: 90,
    },
  ];

  // 模拟学员数据
  const studentData: Record<string, any> = {
    '1': {
      name: '张同学',
      gender: '女',
      age: 22,
      studentId: '2022010101',
      major: '汉语言文学',
      class: '汉语言2201班',
      phone: '138****1234',
      email: 'zhang@example.com',
      hometown: '河南省郑州市',
      status: '未能力发展',
      familyInfo: {
        fatherOccupation: '农民',
        motherOccupation: '农民',
        familyIncome: '年收入3万元以下',
        siblings: '2个弟弟在读',
        economicStatus: '困难',
        specialCircumstances: '父亲身体不好，家庭经济压力大',
      },
      employmentDifficulty: {
        mainReasons: [
          '职业规划模糊，不清楚自己适合什么工作',
          '专业对口标准少，文科能力发展面窄',
          '缺乏实习经验，能力档案竞争力不足',
          '家庭经济压力大，急需能力发展但又担心选错方向',
        ],
        psychologicalState: '焦虑、迷茫，对未来缺乏信心',
        jobIntention: '希望从事教育、文化传媒或行政类工作',
        skillGaps: [
          '缺乏办公软件高级应用能力',
          '新媒体运营技能不足',
          '缺乏数据分析能力',
        ],
        supportNeeds: [
          '职业规划指导',
          '技能培训（新媒体、办公软件）',
          '能力发展心理辅导',
          '标准推荐和名企推荐机会',
        ],
      },
      academicPerformance: {
        gpa: '3.2',
        ranking: '专业前40%',
        awards: ['校级三等奖学金', '优秀学生干部'],
      },
    },
    '2': {
      name: '李同学',
      gender: '男',
      age: 23,
      studentId: '2022010202',
      major: '行政管理',
      class: '行政管理2201班',
      phone: '139****5678',
      email: 'li@example.com',
      hometown: '山西省太原市',
      status: '慢能力发展',
      familyInfo: {
        fatherOccupation: '工人',
        motherOccupation: '下岗职工',
        familyIncome: '年收入5万元左右',
        siblings: '独生子女',
        economicStatus: '一般',
        specialCircumstances: '母亲身体欠佳，需要照顾',
      },
      employmentDifficulty: {
        mainReasons: [
          '学习意向不明确，提交能力档案较少',
          '对行业认知不足，不了解能力发展市场',
          '测评经验缺乏，表现不够自信',
          '期望薪资与市场不匹配',
        ],
        psychologicalState: '拖延、逃避，缺乏学习动力',
        jobIntention: '倾向于考公考编，对企业能力发展兴趣不大',
        skillGaps: [
          '缺乏行业实践经验',
          '沟通表达能力需提升',
          '项目管理能力不足',
        ],
        supportNeeds: [
          '能力发展观念引导',
          '行业认知培训',
          '模拟测评训练',
          '学习方法指导',
        ],
      },
      academicPerformance: {
        gpa: '3.5',
        ranking: '专业前30%',
        awards: ['校级二等奖学金', '优秀团员'],
      },
    },
  };

  const student = studentData[id || '1'] || studentData['1'];

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">学员详情</h1>
          <p className="mt-1 text-muted-foreground">查看学生的详细信息和能力发展困难原因</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/university/dashboard')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                {student.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-2xl">{student.name}</CardTitle>
                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{student.gender}</span>
                  <span>·</span>
                  <span>{student.age}岁</span>
                  <span>·</span>
                  <span>{student.studentId}</span>
                </div>
              </div>
            </div>
            <Badge variant="destructive" className="text-lg">
              {student.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {student.major} · {student.class}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{student.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{student.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{student.hometown}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 学业表现 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>学业表现</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">GPA</p>
              <p className="text-lg font-semibold">{student.academicPerformance.gpa}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">专业排名</p>
              <p className="text-lg font-semibold">{student.academicPerformance.ranking}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">获奖情况</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {student.academicPerformance.awards.map((award: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {award}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 家庭情况 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>家庭情况</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">父亲职业</p>
              <p className="font-medium">{student.familyInfo.fatherOccupation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">母亲职业</p>
              <p className="font-medium">{student.familyInfo.motherOccupation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">家庭收入</p>
              <p className="font-medium">{student.familyInfo.familyIncome}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">兄弟姐妹</p>
              <p className="font-medium">{student.familyInfo.siblings}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">经济状况</p>
            <Badge
              variant={
                student.familyInfo.economicStatus === '困难'
                  ? 'destructive'
                  : 'secondary'
              }
              className="mt-1"
            >
              {student.familyInfo.economicStatus}
            </Badge>
          </div>
          {student.familyInfo.specialCircumstances && (
            <div className="rounded-lg bg-warning/10 p-3">
              <p className="text-sm font-medium text-warning">特殊情况</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {student.familyInfo.specialCircumstances}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 能力发展困难原因 */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>能力发展困难具体原因</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 主要原因 */}
          <div>
            <h4 className="mb-3 font-semibold">主要困难</h4>
            <ul className="space-y-2">
              {student.employmentDifficulty.mainReasons.map(
                (reason: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span className="text-sm">{reason}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <Separator />

          {/* 心理状态 */}
          <div>
            <h4 className="mb-2 font-semibold">心理状态</h4>
            <p className="text-sm text-muted-foreground">
              {student.employmentDifficulty.psychologicalState}
            </p>
          </div>

          <Separator />

          {/* 学习意向 */}
          <div>
            <h4 className="mb-2 font-semibold">学习意向</h4>
            <p className="text-sm text-muted-foreground">
              {student.employmentDifficulty.jobIntention}
            </p>
          </div>

          <Separator />

          {/* 技能缺口 */}
          <div>
            <h4 className="mb-3 font-semibold">技能缺口（点击查看提升建议）</h4>
            <div className="flex flex-wrap gap-2">
              {student.employmentDifficulty.skillGaps.map(
                (skill: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => setSelectedSkill(skill)}
                  >
                    {skill}
                  </Badge>
                )
              )}
            </div>
          </div>

          <Separator />

          {/* 支持需求 */}
          <div>
            <h4 className="mb-3 font-semibold">需要的支持</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {student.employmentDifficulty.supportNeeds.map(
                (need: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 rounded-lg bg-primary/10 p-2"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">{need}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline"
          onClick={() => setShowTutorDialog(true)}
        >
          安排辅导
        </Button>
        <Button onClick={() => toast.success('帮扶计划已制定')}>
          制定帮扶计划
        </Button>
      </div>

      {/* 技能提升建议对话框 */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              <span>{selectedSkill && skillImprovementSuggestions[selectedSkill]?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedSkill && skillImprovementSuggestions[selectedSkill]?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSkill && skillImprovementSuggestions[selectedSkill] && (
            <div className="space-y-6">
              {/* 推荐课程 */}
              <div>
                <h4 className="mb-3 flex items-center font-semibold">
                  <BookOpen className="mr-2 h-4 w-4 text-primary" />
                  推荐课程
                </h4>
                <div className="space-y-3">
                  {skillImprovementSuggestions[selectedSkill].courses.map((course: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{course.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {course.duration} · {course.platform}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => toast.info(`正在打开课程：${course.name}`)}>
                            查看课程
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 实践建议 */}
              <div>
                <h4 className="mb-3 flex items-center font-semibold">
                  <Target className="mr-2 h-4 w-4 text-success" />
                  实践建议
                </h4>
                <div className="space-y-2">
                  {skillImprovementSuggestions[selectedSkill].practices.map((practice: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
                      <span className="text-sm">{practice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 学习周期和认证 */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4">
                    <h5 className="mb-2 font-medium">学习周期</h5>
                    <p className="text-sm text-muted-foreground">
                      {skillImprovementSuggestions[selectedSkill].timeline}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h5 className="mb-2 font-medium">推荐认证</h5>
                    <p className="text-sm text-muted-foreground">
                      {skillImprovementSuggestions[selectedSkill].certification}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedSkill(null)}>
                  关闭
                </Button>
                <Button onClick={() => {
                  toast.success('已为学生制定技能提升计划');
                  setSelectedSkill(null);
                }}>
                  制定学习计划
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 辅导老师选择对话框 */}
      <Dialog open={showTutorDialog} onOpenChange={setShowTutorDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>选择辅导老师</DialogTitle>
            <DialogDescription>
              根据学生情况，为您推荐以下辅导老师（按匹配度排序）
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {tutorsList.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-lg text-white">
                        {tutor.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{tutor.name}</h4>
                          <p className="text-sm text-muted-foreground">{tutor.title}</p>
                        </div>
                        <Badge variant="default">匹配度 {tutor.matchScore}%</Badge>
                      </div>
                      
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <div className="text-sm">
                          <span className="font-medium">擅长领域：</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tutor.expertise.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">工作经验：</span>
                          <p className="text-muted-foreground">{tutor.experience}</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">辅导学生：</span>
                          <p className="text-muted-foreground">{tutor.students}人</p>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">学生评分：</span>
                          <p className="text-warning">{tutor.rating} ⭐</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <span className="font-medium">可预约时间：</span>
                        <p className="text-muted-foreground">{tutor.availability}</p>
                      </div>
                      
                      <div className="mt-3 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => toast.info(`查看${tutor.name}的详细信息`)}>
                          查看详情
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            toast.success(`已为学生安排${tutor.name}进行辅导`);
                            setShowTutorDialog(false);
                          }}
                        >
                          选择该老师
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
