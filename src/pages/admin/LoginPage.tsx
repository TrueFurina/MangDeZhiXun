import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // 清理其他端残留登录态，避免 AuthGuard 读到旧角色跳错端
      localStorage.removeItem('university_token');
      localStorage.setItem('user_id', 'admin-demo');
      localStorage.setItem('user_email', 'admin@system.com');
      localStorage.setItem('user_nickname', '系统管理员');
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_vip_level', 'free');
      toast.success('登录成功');
      navigate('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-chart-4/10 via-background to-chart-4/5 p-8">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 z-10"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> 返回门户
      </Button>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-4">
            <Settings className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">系统管理后台</CardTitle>
            <CardDescription>请使用管理员账号登录</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">管理员账号</Label>
              <Input id="username" type="text" placeholder="请输入管理员账号" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" placeholder="请输入密码" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-chart-4" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">安全提示</p>
                <p className="mt-1">请妥善保管管理员账号密码，不要泄露给他人</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
