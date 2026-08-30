import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // 模拟能力档案数据
  const resume = {
    id: id || '1',
    name: '张三',
    gender: '男',
    age: 24,
    phone: '138****5678',
    email: 'zhangsan@example.com',
    location: '北京市朝阳区',
    education: '本科',
    major: '计算机科学与技术',
    school: '北京大学',
    graduationYear: '2024',
    position: 'AI算法工程师',
    matchScore: 92,
    workExperience: [
      {
        company: '字节跳动',
        position: '算法实习生',
        duration: '2023.06 - 2023.12',
        description: '负责推荐算法优化，提升用户点击率15%',
      },
      {
        company: '腾讯科技',
        position: '研发实习生',
        duration: '2022.07 - 2022.12',
        description: '参与AI模型训练和部署，优化模型推理性能',
      },
    ],
    projectExperience: [
      {
        name: '基于深度学习的图像识别系统',
        role: '项目负责人',
        duration: '2023.03 - 2023.06',
        description: '使用PyTorch实现ResNet模型，准确率达到95%',
      },
    ],
    skills: ['Python', 'PyTorch', 'TensorFlow', '深度学习', '机器学习', 'SQL'],
    certificates: ['CET-6', 'PMP项目管理认证'],
    selfIntroduction:
      '热爱AI技术，有扎实的算法基础和丰富的项目经验。善于团队协作，具备良好的沟通能力和学习能力。',
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">能力档案详情</h1>
          <p className="mt-1 text-muted-foreground">查看学员的详细信息</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/company/resumes')}>
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
                {resume.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-2xl">{resume.name}</CardTitle>
                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{resume.gender}</span>
                  <span>·</span>
                  <span>{resume.age}岁</span>
                  <span>·</span>
                  <span>{resume.education}</span>
                </div>
              </div>
            </div>
            <Badge variant="default" className="text-lg">
              匹配度 {resume.matchScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{resume.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{resume.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{resume.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">应聘：{resume.position}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 教育背景 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>教育背景</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{resume.school}</p>
                <p className="text-sm text-muted-foreground">
                  {resume.major} · {resume.education}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {resume.graduationYear}届
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 工作经历 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>工作经历</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.workExperience.map((exp, index) => (
            <div key={index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{exp.company}</p>
                  <span className="text-sm text-muted-foreground">{exp.duration}</span>
                </div>
                <p className="text-sm text-muted-foreground">{exp.position}</p>
                <p className="text-sm">{exp.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 项目经验 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>项目经验</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resume.projectExperience.map((project, index) => (
            <div key={index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{project.name}</p>
                  <span className="text-sm text-muted-foreground">{project.duration}</span>
                </div>
                <p className="text-sm text-muted-foreground">{project.role}</p>
                <p className="text-sm">{project.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 技能特长 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>技能特长</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 证书 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>证书</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {resume.certificates.map((cert, index) => (
              <Badge key={index} variant="outline">
                {cert}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 自我介绍 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>自我介绍</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{resume.selfIntroduction}</p>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline"
          onClick={() => setShowRejectDialog(true)}
        >
          拒绝
        </Button>
        <Button onClick={() => {
          setShowInterviewDialog(true);
          toast.success('已发送测评邀请');
        }}>
          邀请测评
        </Button>
      </div>

      {/* 测评邀请详情对话框 */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>测评邀请详情</DialogTitle>
            <DialogDescription>
              查看发送给学员的测评邀请内容
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">测评邀请函</h3>
              <div className="space-y-3 text-sm">
                <p>尊敬的 {resume.name} 先生/女士：</p>
                
                <p className="leading-relaxed">
                  您好！感谢您应聘我公司的 <span className="font-medium text-primary">{resume.position}</span> 标准。
                  经过初步筛选，您的能力档案给我们留下了深刻的印象，我们诚挚地邀请您参加测评。
                </p>
                
                <div className="space-y-2 bg-background rounded p-3">
                  <p><span className="font-medium">测评时间：</span>2026年3月15日（周五）14:00</p>
                  <p><span className="font-medium">测评地点：</span>北京市朝阳区建国路88号SOHO现代城A座15层</p>
                  <p><span className="font-medium">测评形式：</span>线下测评（技术测评 + 管理员测评）</p>
                  <p><span className="font-medium">预计时长：</span>1-2小时</p>
                </div>
                
                <p className="leading-relaxed">
                  请您提前准备好相关作品或项目案例，并携带身份证件和学历证明原件。
                  如有任何疑问或需要调整测评时间，请及时与我们联系。
                </p>
                
                <div className="space-y-1">
                  <p><span className="font-medium">联系人：</span>管理员部 王经理</p>
                  <p><span className="font-medium">联系电话：</span>176-9309-1102</p>
                  <p><span className="font-medium">邮箱：</span>1937975940@qq.com</p>
                </div>
                
                <p className="mt-4">期待与您的会面！</p>
                
                <p className="text-right mt-2">
                  芒得很职平台<br/>
                  人力资源部<br/>
                  {new Date().toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>
                关闭
              </Button>
              <Button onClick={() => {
                toast.success('测评邀请已复制到剪贴板');
              }}>
                复制内容
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 拒绝信详情对话框 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>拒绝信详情</DialogTitle>
            <DialogDescription>
              查看发送给学员的拒绝信内容
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">应聘回复函</h3>
              <div className="space-y-3 text-sm">
                <p>尊敬的 {resume.name} 先生/女士：</p>
                
                <p className="leading-relaxed">
                  您好！非常感谢您对我公司的关注，以及应聘 <span className="font-medium">{resume.position}</span> 标准的热情。
                </p>
                
                <p className="leading-relaxed">
                  我们已经仔细审阅了您的能力档案，您的教育背景和工作经历都很优秀。
                  经过综合评估，我们认为您的专业方向与当前标准的核心需求存在一定差异。
                  考虑到为您提供更合适的职业发展机会，我们暂时无法为您提供此标准的测评机会。
                </p>
                
                <p className="leading-relaxed">
                  这个决定并不代表对您能力的否定，只是当前标准与您的职业规划可能不够匹配。
                  我们会将您的能力档案保留在人才库中，如果未来有更适合您的标准机会，我们会第一时间与您联系。
                </p>
                
                <p className="leading-relaxed">
                  再次感谢您对我公司的信任与支持，祝您早日找到理想的工作！
                </p>
                
                <div className="space-y-1 mt-4">
                  <p><span className="font-medium">如有疑问，欢迎联系：</span></p>
                  <p><span className="font-medium">联系电话：</span>176-9309-1102</p>
                  <p><span className="font-medium">邮箱：</span>1937975940@qq.com</p>
                </div>
                
                <p className="text-right mt-4">
                  芒得很职平台<br/>
                  人力资源部<br/>
                  {new Date().toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                关闭
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  toast.info('已发送拒绝信给学员');
                  setShowRejectDialog(false);
                }}
              >
                确认发送
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
