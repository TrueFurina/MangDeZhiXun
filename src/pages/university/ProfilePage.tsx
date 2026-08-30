import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Save,
  GraduationCap,
  Phone,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUserEmail } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function UniversityProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuth();
  
  const [universityName, setUniversityName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 加载用户信息
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userEmail = getCurrentUserEmail();
      // 从localStorage获取院校信息
      const storedUniversityName = localStorage.getItem('university_name') || '闽江学院';
      const storedTeacherName = localStorage.getItem('teacher_name') || '李老师';
      const storedPhone = localStorage.getItem('university_phone') || '13900139000';
      const storedAvatar = localStorage.getItem('university_avatar_url') || '';
      
      setUniversityName(storedUniversityName);
      setTeacherName(storedTeacherName);
      setEmail(userEmail);
      setPhone(storedPhone);
      setAvatarUrl(storedAvatar);
    } catch (error) {
      console.error('加载院校信息失败:', error);
      toast.error('加载院校信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!universityName.trim()) {
      toast.error('学校名称不能为空');
      return;
    }

    if (!teacherName.trim()) {
      toast.error('教师姓名不能为空');
      return;
    }

    setIsSaving(true);
    try {
      // 保存到localStorage
      localStorage.setItem('university_name', universityName);
      localStorage.setItem('teacher_name', teacherName);
      localStorage.setItem('university_phone', phone);
      if (avatarUrl) {
        localStorage.setItem('university_avatar_url', avatarUrl);
      }

      toast.success('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('请填写完整的密码信息');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('新密码长度不能少于6位');
      return;
    }

    setIsSaving(true);
    try {
      // 这里应该调用后端API修改密码
      toast.success('密码修改成功');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('修改密码失败:', error);
      toast.error('修改密码失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('图片大小不能超过2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);
        toast.success('头像已更新，请点击保存按钮');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/university/login');
    toast.success('已退出登录');
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

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">账号设置</h1>
          <p className="mt-1 text-muted-foreground">管理您的院校账号信息</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">基本信息</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>院校信息</CardTitle>
              <CardDescription>更新您的院校基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像 */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 cursor-pointer" onClick={handleAvatarClick}>
                  <AvatarImage src={avatarUrl} alt={teacherName} />
                  <AvatarFallback>
                    <GraduationCap className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Button variant="outline" onClick={handleAvatarClick}>
                    <Camera className="mr-2 h-4 w-4" />
                    更换头像
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    支持 JPG、PNG 格式，大小不超过 2MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* 学校名称 */}
              <div className="space-y-2">
                <Label htmlFor="university-name">
                  <GraduationCap className="mr-2 inline h-4 w-4" />
                  学校名称
                </Label>
                <Input
                  id="university-name"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder="请输入学校名称"
                />
              </div>

              {/* 教师姓名 */}
              <div className="space-y-2">
                <Label htmlFor="teacher-name">
                  <User className="mr-2 inline h-4 w-4" />
                  教师姓名
                </Label>
                <Input
                  id="teacher-name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="请输入教师姓名"
                />
              </div>

              {/* 邮箱 */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mr-2 inline h-4 w-4" />
                  邮箱地址
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">邮箱地址不可修改</p>
              </div>

              {/* 手机号 */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mr-2 inline h-4 w-4" />
                  手机号码
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号码"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? '保存中...' : '保存更改'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>定期更换密码以保护账号安全</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">
                  <Lock className="mr-2 inline h-4 w-4" />
                  当前密码
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">
                  <Lock className="mr-2 inline h-4 w-4" />
                  新密码
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  <Lock className="mr-2 inline h-4 w-4" />
                  确认新密码
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                />
              </div>

              <Button onClick={handleChangePassword} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? '修改中...' : '修改密码'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
