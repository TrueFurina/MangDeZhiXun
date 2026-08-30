import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save,
  History,
  Award,
  TrendingUp,
  Calendar,
  Eye,
  Crown,
  Check,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUserEmail } from '@/lib/supabase';
import { getUserProfile, updateUserProfile, getUserAssessments, type UserProfile, type AssessmentRecord } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout, updateUser } = useAuth();
  
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [vipLevel, setVipLevel] = useState<'free' | 'premium' | 'enterprise'>('free');
  const [isVipDialogOpen, setIsVipDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);

  // 加载用户信息
  useEffect(() => {
    loadUserProfile();
    loadAssessments();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userEmail = getCurrentUserEmail();
      const profile = await getUserProfile(userEmail);
      
      if (profile) {
        setNickname(profile.nickname);
        setEmail(profile.email);
        setPhone(profile.phone || '');
        setAvatarUrl(profile.avatar_url || '');
        setVipLevel(profile.vip_level);
      } else {
        // 如果数据库中没有用户信息，从localStorage获取
        const storedNickname = localStorage.getItem('user_nickname');
        const storedEmail = localStorage.getItem('user_email');
        const storedPhone = localStorage.getItem('user_phone');
        const storedAvatar = localStorage.getItem('user_avatar_url');
        const storedVipLevel = localStorage.getItem('user_vip_level') as 'free' | 'premium' | 'enterprise';
        
        if (storedNickname) setNickname(storedNickname);
        if (storedEmail) setEmail(storedEmail);
        if (storedPhone) setPhone(storedPhone);
        if (storedAvatar) setAvatarUrl(storedAvatar);
        if (storedVipLevel) setVipLevel(storedVipLevel);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      toast.error('加载用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssessments = async () => {
    try {
      const userEmail = getCurrentUserEmail();
      const records = await getUserAssessments(userEmail);
      // 按时间排序（从旧到新）
      records.sort((a, b) => new Date(a.completed_at || '').getTime() - new Date(b.completed_at || '').getTime());
      setAssessments(records);
    } catch (error) {
      console.error('加载测评记录失败:', error);
    }
  };
  
  // 计算能力成长趋势数据
  const getGrowthTrendData = () => {
    if (assessments.length === 0) return [];
    
    // 取最多5次测评记录
    const recentAssessments = assessments.slice(-5);
    
    return [
      {
        name: '专业技能',
        scores: recentAssessments.map(a => a.tech_score || 0),
        trend: recentAssessments.length >= 2 
          ? (recentAssessments[recentAssessments.length - 1].tech_score || 0) - (recentAssessments[0].tech_score || 0)
          : 0
      },
      {
        name: '通用能力',
        scores: recentAssessments.map(a => a.general_score || 0),
        trend: recentAssessments.length >= 2
          ? (recentAssessments[recentAssessments.length - 1].general_score || 0) - (recentAssessments[0].general_score || 0)
          : 0
      },
      {
        name: '行为特质',
        scores: recentAssessments.map(a => a.behavior_score || 0),
        trend: recentAssessments.length >= 2
          ? (recentAssessments[recentAssessments.length - 1].behavior_score || 0) - (recentAssessments[0].behavior_score || 0)
          : 0
      },
      {
        name: '经验背景',
        scores: recentAssessments.map(a => a.experience_score || 0),
        trend: recentAssessments.length >= 2
          ? (recentAssessments[recentAssessments.length - 1].experience_score || 0) - (recentAssessments[0].experience_score || 0)
          : 0
      },
    ];
  };

  const handleSaveProfile = async () => {
    if (!nickname.trim()) {
      toast.error('昵称不能为空');
      return;
    }

    if (!email.trim()) {
      toast.error('邮箱不能为空');
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('请输入有效的邮箱地址');
      return;
    }

    setIsSaving(true);
    try {
      const userEmail = getCurrentUserEmail();
      await updateUserProfile(userEmail, {
        nickname: nickname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl
      });

      // 更新localStorage
      localStorage.setItem('user_nickname', nickname.trim());
      localStorage.setItem('user_email', email.trim());
      if (phone.trim()) {
        localStorage.setItem('user_phone', phone.trim());
      }
      if (avatarUrl) {
        localStorage.setItem('user_avatar_url', avatarUrl);
      }

      // 触发自定义事件，通知其他组件昵称已更新
      window.dispatchEvent(new Event('nicknameUpdated'));

      // 更新AuthContext
      updateUser({
        nickname: nickname.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl
      });

      toast.success('个人信息已保存');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/login', { replace: true });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('密码修改功能开发中');
  };

  const handleUploadAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件大小（最大1MB）
    if (file.size > 1024 * 1024) {
      toast.error('图片大小不能超过1MB');
      return;
    }
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('只能上传图片文件');
      return;
    }

    try {
      // 显示加载提示
      toast.loading('正在上传头像...');

      // 生成唯一文件名
      const userEmail = getCurrentUserEmail();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 上传到Supabase Storage
      const { supabase } = await import('@/lib/supabase');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('上传失败:', uploadError);
        toast.dismiss();
        toast.error('上传失败，请重试');
        return;
      }

      // 获取公开URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setAvatarUrl(publicUrl);
      
      toast.dismiss();
      toast.success('头像已更新，请点击保存按钮');
    } catch (error) {
      console.error('上传头像失败:', error);
      toast.dismiss();
      toast.error('上传失败，请重试');
    }
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/student/evaluation/report/${reportId}`);
  };

  // 获取会员等级标签
  const getVipLabel = (level: string) => {
    const labels: Record<string, string> = {
      free: '普通会员',
      premium: '高级会员',
      enterprise: '企业会员'
    };
    return labels[level] || '普通会员';
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge variant="default">已完成</Badge>;
    }
    return <Badge variant="secondary">进行中</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 75) return 'text-primary';
    return 'text-warning';
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">个人中心</h1>
        <p className="mt-1 text-muted-foreground">
          管理您的个人信息和账号设置
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：个人信息卡片 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>个人信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={nickname} />}
                  <AvatarFallback className="bg-primary text-2xl text-white">
                    {nickname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={handleUploadAvatar}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{nickname}</div>
                <div className="text-sm text-muted-foreground">{email}</div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">会员等级</span>
                <Badge 
                  variant="outline" 
                  className="border-warning text-warning cursor-pointer hover:bg-warning/10"
                  onClick={() => setIsVipDialogOpen(true)}
                >
                  <Award className="mr-1 h-3 w-3" />
                  {getVipLabel(vipLevel)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">完成测评</span>
                <span className="text-sm font-semibold text-primary">
                  {assessments.length} 次
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">能力提升进度</span>
                <span className="font-semibold text-success">+18%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* 右侧：详细设置 */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">基本信息</TabsTrigger>
                <TabsTrigger value="security">账号安全</TabsTrigger>
                <TabsTrigger value="history">测评历史</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="profile" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">昵称</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="请输入昵称"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="请输入邮箱"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号</Label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="请输入手机号"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? '保存中...' : '保存修改'}
                  </Button>
                </div>
              </TabsContent>

              {/* 账号安全 */}
              <TabsContent value="security" className="space-y-4">
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old-password">当前密码</Label>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="old-password"
                        type="password"
                        placeholder="请输入当前密码"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">新密码</Label>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="请输入新密码"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认新密码</Label>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="请再次输入新密码"
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-sm font-medium">密码要求</div>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <li>• 至少8个字符</li>
                      <li>• 包含大小写字母</li>
                      <li>• 包含数字和特殊字符</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full">
                    <Lock className="mr-2 h-4 w-4" />
                    修改密码
                  </Button>
                </form>

                {/* 退出登录 */}
                <div className="pt-4 border-t">
                  <div className="rounded-lg bg-destructive/10 p-4">
                    <div className="text-sm font-medium text-destructive">退出登录</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      退出后需要重新登录才能使用平台功能
                    </p>
                    <Button 
                      variant="destructive" 
                      className="mt-3 w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      退出登录
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* 测评历史 */}
              <TabsContent value="history" className="space-y-4">
                {assessments.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <History className="h-16 w-16 text-muted-foreground/50" />
                      <p className="mt-4 text-lg font-medium text-muted-foreground">暂无测评记录</p>
                      <p className="mt-2 text-sm text-muted-foreground">完成测评后，记录将显示在这里</p>
                      <Button 
                        className="mt-6" 
                        onClick={() => navigate('/student/evaluation')}
                      >
                        开始测评
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {assessments.map((assessment) => (
                      <Card key={assessment.id} className="transition-shadow hover:shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{assessment.job_title}</CardTitle>
                              <CardDescription className="flex items-center space-x-4">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(assessment.completed_at)}</span>
                                </span>
                                <Badge variant="secondary">已完成</Badge>
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(assessment.total_score)}`}>
                                {assessment.total_score}
                              </div>
                              <div className="text-xs text-muted-foreground">综合得分</div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">专业技能</span>
                                  <span className="font-semibold">{assessment.tech_score}分</span>
                                </div>
                                <Progress value={assessment.tech_score} className="h-1.5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">通用能力</span>
                                  <span className="font-semibold">{assessment.general_score}分</span>
                                </div>
                                <Progress value={assessment.general_score} className="h-1.5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">行为特质</span>
                                  <span className="font-semibold">{assessment.behavior_score}分</span>
                                </div>
                                <Progress value={assessment.behavior_score} className="h-1.5" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">经验背景</span>
                                  <span className="font-semibold">{assessment.experience_score}分</span>
                                </div>
                                <Progress value={assessment.experience_score} className="h-1.5" />
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full" 
                              onClick={() => handleViewReport(assessment.id)}
                            >
                              <Eye className="mr-2 h-3 w-3" />
                              查看详细报告
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* 能力成长趋势 */}
      {assessments.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>能力成长趋势</CardTitle>
                <CardDescription>近期测评成绩变化</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  // 跳转到最新的测评报告
                  if (assessments.length > 0) {
                    navigate(`/student/evaluation/report/${assessments[0].id}`);
                  } else {
                    toast.info('暂无测评记录，请先完成测评');
                    navigate('/student/evaluation');
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                查看详细数据
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getGrowthTrendData().map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.name}</span>
                      {item.trend !== 0 && (
                        <Badge 
                          variant="outline" 
                          className={item.trend > 0 ? 'border-success text-success' : 'border-destructive text-destructive'}
                        >
                          <TrendingUp className="mr-1 h-3 w-3" />
                          {item.trend > 0 ? '+' : ''}{item.trend}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {item.scores[item.scores.length - 1]}分
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.scores.map((score, idx) => (
                      <div key={idx} className="flex-1">
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">暂无能力成长数据</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              完成测评后，这里将展示你的能力成长趋势
            </p>
            <Button onClick={() => navigate('/student/evaluation')}>
              开始测评
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 会员功能弹窗 */}
      <Dialog open={isVipDialogOpen} onOpenChange={setIsVipDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-warning" />
              <span>会员权益</span>
            </DialogTitle>
            <DialogDescription>
              升级会员，解锁更多专属功能和服务
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3">
            {/* 普通会员 */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-center">普通会员</CardTitle>
                <div className="text-center text-3xl font-bold">免费</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">基础测评功能</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">查看标准推荐</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">基础学习资源</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">每月3次测评</span>
                </div>
                <Button variant="outline" className="w-full" disabled onClick={() => {}}>
                  当前方案
                </Button>
              </CardContent>
            </Card>

            {/* 高级会员 */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="mx-auto w-fit">推荐</Badge>
                <CardTitle className="text-center">高级会员</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">¥99</span>
                  <span className="text-muted-foreground">/月</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">所有基础功能</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">无限次测评</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">AI深度分析报告</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">专属学习资源</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">优先标准推荐</span>
                </div>
                <Button className="w-full" onClick={() => {
                  setIsVipDialogOpen(false);
                  navigate('/student/vip');
                }}>
                  立即升级
                </Button>
              </CardContent>
            </Card>

            {/* 企业会员 */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-center">企业会员</CardTitle>
                <div className="text-center">
                  <span className="text-3xl font-bold">¥999</span>
                  <span className="text-muted-foreground">/年</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">所有高级功能</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">专属职业规划师</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">名企项目实训机会</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">线下培训活动</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-sm">优先客服支持</span>
                </div>
                <Button variant="outline" className="w-full" onClick={() => {
                  setIsVipDialogOpen(false);
                  navigate('/student/vip');
                }}>
                  了解详情
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
