import { useState } from 'react';
// Force Vite HMR
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, TrendingUp, Users, Building2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function UniversityLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('演示账号登录成功');
      navigate('/university/dashboard');
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('登录成功');
      navigate('/university/dashboard');
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden w-1/2 bg-gradient-to-br from-warning/10 via-warning/5 to-background p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="mx-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">院校端</h1>
                <p className="text-lg text-muted-foreground">就业办管理平台</p>
              </div>
            </div>
            <p className="text-xl font-medium text-warning">
              数据驱动就业工作，产教融合新模式
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">就业数据可视化</h3>
                <p className="text-sm text-muted-foreground">
                  多维度就业数据分析，支持教育部课题研究
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">学员能力画像</h3>
                <p className="text-sm text-muted-foreground">
                  全面掌握学员胜任力水平，精准就业指导
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Building2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">校企合作对接</h3>
                <p className="text-sm text-muted-foreground">
                  企业需求与培养方案对接，产教融合落地
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-xl border bg-card p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">95%</div>
              <div className="text-xs text-muted-foreground">就业率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground">合作企业</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">3000+</div>
              <div className="text-xs text-muted-foreground">在校学员</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">院校端登录</CardTitle>
            <CardDescription>登录就业办账号，管理学员就业数据</CardDescription>
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
                    <Label htmlFor="email">学校邮箱</Label>
                    <Input id="email" type="email" placeholder="请输入学校邮箱" required />
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
                    <Label htmlFor="university-name">学校名称</Label>
                    <Input id="university-name" type="text" placeholder="请输入学校名称" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">学校邮箱</Label>
                    <Input id="reg-email" type="email" placeholder="请输入学校邮箱" required />
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
                className="w-full border-warning text-warning hover:bg-warning hover:text-white"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <Zap className="mr-2 h-4 w-4" />
                演示账号一键登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
