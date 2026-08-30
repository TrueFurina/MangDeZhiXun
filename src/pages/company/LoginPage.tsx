import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Sparkles, Target, TrendingUp, Users, Zap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/db/api';

export default function CompanyLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const demoUser: UserProfile = {
        id: '12345678-1234-1234-1234-123456789012',
        email: 'demo@company.com',
        nickname: '阿里巴巴集团HR',
        phone: '138****0001',
        avatar_url: '',
        vip_level: 'enterprise',
        user_role: 'company_hr',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      login(demoUser);
      toast.success('演示账号登录成功');
      navigate('/company/dashboard');
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // 清理其他端残留登录态，并写入企业端角色，避免 AuthGuard 跳错端
      localStorage.setItem('user_role', 'company_hr');
      toast.success('登录成功');
      navigate('/company/dashboard');
    }, 1000);
  };

  return (
    <div className="relative flex min-h-screen w-full">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 z-10"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> 返回门户
      </Button>
      <div className="hidden w-1/2 bg-gradient-to-br from-success/10 via-success/5 to-background p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="mx-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">企业端</h1>
                <p className="text-lg text-muted-foreground">AI能力评估与个性化学习中心</p>
              </div>
            </div>
            <p className="text-xl font-medium text-success">
              轻量化人力资源外包服务，降本增效
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Sparkles className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">10分钟快速建模</h3>
                <p className="text-sm text-muted-foreground">
                  AI自动生成标准胜任力模型，对比传统咨询1-2周周期
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">智能能力档案筛选</h3>
                <p className="text-sm text-muted-foreground">
                  AI自动解析能力档案，按人标准匹配度排序，提升标准推介效率
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">数据驱动决策</h3>
                <p className="text-sm text-muted-foreground">
                  标准推介漏斗图、匹配度分析，全流程数据可视化
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Users className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <h3 className="font-semibold">订阅制灵活付费</h3>
                <p className="text-sm text-muted-foreground">
                  基础版980元/年起，按需选择，无隐藏费用
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-xl border bg-card p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">500+</div>
              <div className="text-xs text-muted-foreground">企业用户</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10分钟</div>
              <div className="text-xs text-muted-foreground">快速建模</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">80%</div>
              <div className="text-xs text-muted-foreground">成本节省</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">企业用户登录</CardTitle>
            <CardDescription>登录企业账号，开启智能标准推介之旅</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">企业邮箱</Label>
                    <Input id="email" type="email" placeholder="请输入企业邮箱" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input id="password" type="password" placeholder="请输入密码" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">企业名称</Label>
                    <Input id="company-name" type="text" placeholder="请输入企业名称" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">企业邮箱</Label>
                    <Input id="reg-email" type="email" placeholder="请输入企业邮箱" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">演示模式</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-success text-success hover:bg-success hover:text-white"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <Zap className="mr-2 h-4 w-4" />
                演示账号一键登录
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                个人用户？{' '}
                <button type="button" className="text-primary hover:underline" onClick={() => navigate('/student/login')}>
                  用户端（学员端）登录
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
