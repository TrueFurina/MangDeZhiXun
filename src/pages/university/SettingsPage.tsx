import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Lock, Bell, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('清华大学');
  const [email, setEmail] = useState('career@tsinghua.edu.cn');
  const [phone, setPhone] = useState('13800138000');
  const [address, setAddress] = useState('北京市海淀区清华园1号');
  const [description, setDescription] = useState('清华大学是一家以电子商务为核心的科技公司');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    toast.success('个人信息已保存');
  };

  const handleSaveCompany = () => {
    toast.success('院校信息已保存');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('请填写完整信息');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次密码输入不一致');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('密码至少8位');
      return;
    }
    toast.success('密码修改成功');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUploadAvatar = () => {
    toast.info('头像上传功能开发中');
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">账号设置</h1>
        <p className="mt-2 text-muted-foreground">
          管理您的账号信息和安全设置
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            个人信息
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="mr-2 h-4 w-4" />
            院校信息
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            安全设置
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            通知设置
          </TabsTrigger>
        </TabsList>

        {/* 个人信息 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>个人信息</CardTitle>
              <CardDescription>更新您的个人资料和联系方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像 */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-2xl text-white">企</AvatarFallback>
                </Avatar>
                <div>
                  <Button onClick={handleUploadAvatar}>
                    <Upload className="mr-2 h-4 w-4" />
                    上传头像
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    支持JPG、PNG格式，文件大小不超过2MB
                  </p>
                </div>
              </div>

              {/* 邮箱 */}
              <div className="grid gap-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* 手机号 */}
              <div className="grid gap-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveProfile}>保存更改</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 院校信息 */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>院校信息</CardTitle>
              <CardDescription>更新您的院校资料</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 院校名称 */}
              <div className="grid gap-2">
                <Label htmlFor="company-name">院校名称</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* 院校地址 */}
              <div className="grid gap-2">
                <Label htmlFor="address">院校地址</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* 院校简介 */}
              <div className="grid gap-2">
                <Label htmlFor="description">院校简介</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleSaveCompany}>保存更改</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>修改密码和管理账号安全</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 当前密码 */}
              <div className="grid gap-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                />
              </div>

              {/* 新密码 */}
              <div className="grid gap-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少8位）"
                />
              </div>

              {/* 确认密码 */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">确认密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                />
              </div>

              <Button onClick={handleChangePassword}>修改密码</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>管理您的通知偏好</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">能力档案提交通知</p>
                    <p className="text-sm text-muted-foreground">
                      当有候选人提交能力档案时接收通知
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('通知设置功能开发中')}
                  >
                    已开启
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">系统消息通知</p>
                    <p className="text-sm text-muted-foreground">
                      接收系统重要消息和更新通知
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('通知设置功能开发中')}
                  >
                    已开启
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">邮件通知</p>
                    <p className="text-sm text-muted-foreground">
                      通过邮件接收重要通知
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('通知设置功能开发中')}
                  >
                    已开启
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">短信通知</p>
                    <p className="text-sm text-muted-foreground">
                      通过短信接收紧急通知
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('通知设置功能开发中')}
                  >
                    已关闭
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
